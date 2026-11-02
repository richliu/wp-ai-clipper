// background.js - Service worker: handles WordPress API communication

function escHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'sendToWordPress') {
    handleSendToWordPress(msg.payload)
      .then(result => sendResponse({ success: true, result }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; // async
  }
});

// Long-lived keepalive port from popup.js — keeps the MV3 service worker
// alive while the popup is open, preventing the 30s idle eviction that can
// kill in-flight uploads ("Receiving end does not exist").
chrome.runtime.onConnect.addListener(port => {
  if (port.name !== 'wpClipperKeepAlive') return;
  port.onDisconnect.addListener(() => { /* popup closed; nothing to clean */ });
});

// Fetch with timeout via AbortController. Without this a single hung
// image fetch could stall the worker until Chrome force-terminates it.
async function fetchWithTimeout(url, options = {}, timeoutMs = 20000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } catch (e) {
    if (e.name === 'AbortError') {
      throw new Error(`timeout after ${timeoutMs}ms: ${url}`);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

function cleanUrlParams(url, stripUrlParams, whitelist) {
  if (!stripUrlParams) return url;
  try {
    const u = new URL(url);
    if (!u.search) return url;
    const keep = whitelist.split(',').map(s => s.trim()).filter(Boolean);
    if (keep.length === 0) {
      u.search = '';
    } else {
      const kept = new URLSearchParams();
      keep.forEach(key => {
        if (u.searchParams.has(key)) kept.set(key, u.searchParams.get(key));
      });
      u.search = kept.toString() ? `?${kept.toString()}` : '';
    }
    return u.toString();
  } catch {
    return url;
  }
}

function extractImgSrcs(html) {
  const re = /<img[^>]+src="([^"]+)"/gi;
  const srcs = [];
  let m;
  while ((m = re.exec(html)) !== null) {
    if (m[1] && m[1].startsWith('http')) srcs.push(m[1]);
  }
  return [...new Set(srcs)];
}

async function handleSendToWordPress(payload) {
  const { wpUrl, username, appPassword, uploadInlineImages, attachMediaToPost,
          includeSourceUrl, stripUrlParams, urlParamWhitelist, articleData } = payload;

  // Clean article URL before use
  articleData.url = cleanUrlParams(articleData.url, stripUrlParams !== false, urlParamWhitelist || '');
  const base = wpUrl.replace(/\/$/, '');
  const auth = btoa(`${username}:${appPassword}`);
  const headers = {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  };

  // Per-call in-memory dedup cache: same image hash looked up at most once.
  // Useful when the same image appears multiple times or when this is a
  // re-clip after AI cleaning. Keyed by SHA-256 slug.
  const mediaCache = new Map();

  // Uploaded media keyed by its WP source_url, so the image-block pass can
  // add the attachment ID and the attach pass knows what to link.
  const mediaByUrl = new Map();
  const remember = m => { if (m && m.id && m.sourceUrl) mediaByUrl.set(m.sourceUrl, m); };

  // 1. Upload featured image if available
  let featuredMediaId  = null;
  let featuredLocalUrl = null;
  if (articleData.featuredImageUrl) {
    try {
      const m = await uploadImageFromUrl(
        base, headers, articleData.featuredImageUrl, articleData.title, articleData.url, mediaCache
      );
      featuredMediaId  = m.id;
      featuredLocalUrl = m.sourceUrl;
      remember(m);
    } catch (e) {
      console.warn('Featured image upload failed:', e.message);
    }
  }

  // 2. Build post content
  const featuredDisplayUrl = featuredLocalUrl || articleData.featuredImageUrl;
  const imageBlock = articleData.featuredImageUrl
    ? `<figure><img src="${escHtml(featuredDisplayUrl)}" alt="${escHtml(articleData.title)}"/></figure>\n\n`
    : '';

  // Videos first: a video that can't be uploaded falls back to its thumbnail,
  // which the inline-image pass below then uploads like any other image.
  const articleContent = await processVideos(
    base, headers, articleData.content, articleData.url, mediaCache, remember, uploadInlineImages !== false
  );

  let fullContent = imageBlock + articleContent;

  // 3. Upload inline images and replace URLs in content
  if (uploadInlineImages !== false) {
    // Collect all img srcs from the article content (not the imageBlock we just built)
    const inlineSrcs = extractImgSrcs(articleContent);
    for (const src of inlineSrcs) {
      // src is the raw attribute value: the image picker re-serializes the
      // HTML, turning & into &amp;. Decode to fetch, replace using the raw form.
      const fetchUrl = decodeAttr(src);
      // If this is the featured image already uploaded, just replace the URL
      if (fetchUrl === articleData.featuredImageUrl && featuredLocalUrl) {
        fullContent = fullContent.replaceAll(src, featuredLocalUrl);
        continue;
      }
      try {
        const m = await uploadImageFromUrl(base, headers, fetchUrl, '', articleData.url, mediaCache);
        fullContent = fullContent.replaceAll(src, m.sourceUrl);
        remember(m);
      } catch (e) {
        console.warn('Inline image upload failed:', src, e.message);
      }
    }
  }

  // Standalone images → core/image blocks (with attachment ID when uploaded)
  fullContent = toImageBlocks(fullContent, mediaByUrl);

  // Optionally append Reference URL as a separate block
  if (includeSourceUrl !== false) {
    const refBlock =
      `\n\n<!-- wp:separator -->\n<hr class="wp-block-separator has-alpha-channel-opacity"/>\n<!-- /wp:separator -->` +
      `\n\n<!-- wp:paragraph -->\n<p><strong>Reference URL</strong> : <a href="${escHtml(articleData.url)}" target="_blank" rel="noopener noreferrer">${escHtml(articleData.url)}</a></p>\n<!-- /wp:paragraph -->`;
    fullContent += refBlock;
  }

  // 3. Create the draft post
  const postBody = {
    title: articleData.title,
    content: fullContent,
    excerpt: articleData.excerpt || '',
    status: 'draft',
    meta: {
      _wp_clipper_source_url: articleData.url
    }
  };

  if (featuredMediaId) {
    postBody.featured_media = featuredMediaId;
  }

  const postRes = await fetch(`${base}/wp-json/wp/v2/posts`, {
    method: 'POST',
    headers,
    credentials: 'omit',
    body: JSON.stringify(postBody)
  });

  if (!postRes.ok) {
    const errText = await postRes.text();
    throw new Error(`WordPress API error ${postRes.status}: ${errText}`);
  }

  const post = await postRes.json();

  // Attach uploaded media to this post ("Uploaded to" in the media library).
  // Media already attached elsewhere (dedup reuse) is left alone.
  if (attachMediaToPost !== false) {
    for (const m of mediaByUrl.values()) {
      if (m.post) continue;
      try {
        const r = await fetchWithTimeout(`${base}/wp-json/wp/v2/media/${m.id}`, {
          method: 'POST',
          headers,
          credentials: 'omit',
          body: JSON.stringify({ post: post.id })
        }, MEDIA_LOOKUP_TIMEOUT_MS);
        if (!r.ok) console.warn('[WP Clipper] Attach media HTTP', r.status, m.id);
        else m.post = post.id;
      } catch (e) {
        console.warn('[WP Clipper] Attach media failed:', m.id, e.message);
      }
    }
  }
  return {
    postId: post.id,
    editUrl: `${base}/wp-admin/post.php?post=${post.id}&action=edit`,
    previewUrl: post.link
  };
}

// Rewrite each standalone image — a line holding just <figure><img></figure>
// (plus an optional <figcaption>), optionally wrapped in a wp:html / wp:image
// block — as a core/image block. Inline styles are dropped (they make the block invalid) and uploaded media
// gets its attachment ID so WP renders srcset/sizes. Images nested in other
// markup (<p>, <a>, lists, quotes, wp:html blocks) are left untouched.
const STANDALONE_IMG_RE = /(^|\n)(?:<!-- wp:(?:html|image)(?: \{[^\n]*?\})? -->\n?)?<figure\b[^>]*>\s*(<img\b[^>]*>)\s*(?:<figcaption\b[^>]*>([\s\S]*?)<\/figcaption>\s*)?<\/figure>(?:\n?<!-- \/wp:(?:html|image) -->)?(?=\n|$)/g;
const CONTAINER_TAGS = ['blockquote', 'ul', 'ol', 'table', 'div', 'details'];

function isNested(html, offset) {
  const before = html.slice(0, offset);
  const count = re => (before.match(re) || []).length;
  if (count(/<!-- wp:html\b/g) > count(/<!-- \/wp:html -->/g)) return true;
  return CONTAINER_TAGS.some(t =>
    count(new RegExp(`<${t}\\b`, 'gi')) > count(new RegExp(`</${t}>`, 'gi')));
}

function toImageBlocks(html, mediaByUrl) {
  return html.replace(STANDALONE_IMG_RE, (whole, lead, img, caption, offset) => {
    if (isNested(html, offset + lead.length)) return whole;
    const attr = name => (img.match(new RegExp(`\\s${name}="([^"]*)"`, 'i')) || [])[1] || '';
    const src = attr('src');
    if (!src) return whole;
    const alt = attr('alt');
    const cap = caption ? `<figcaption class="wp-element-caption">${caption.trim()}</figcaption>` : '';
    const m = mediaByUrl.get(src.replace(/&amp;/g, '&'));
    if (m) {
      return `${lead}<!-- wp:image {"id":${m.id},"sizeSlug":"full","linkDestination":"none"} -->\n` +
        `<figure class="wp-block-image size-full"><img src="${src}" alt="${alt}" class="wp-image-${m.id}"/>${cap}</figure>\n` +
        `<!-- /wp:image -->`;
    }
    return `${lead}<!-- wp:image -->\n<figure class="wp-block-image"><img src="${src}" alt="${alt}"/>${cap}</figure>\n<!-- /wp:image -->`;
  });
}

// Timeouts (ms) for the three network phases. Picked to keep total work
// per image well under the SW idle limit even in pathological cases.
const IMG_FETCH_TIMEOUT_MS    = 20000;
const MEDIA_LOOKUP_TIMEOUT_MS = 10000;
const MEDIA_UPLOAD_TIMEOUT_MS = 60000;
const IMAGE_LIMITS = { fetchMs: IMG_FETCH_TIMEOUT_MS, uploadMs: MEDIA_UPLOAD_TIMEOUT_MS, maxBytes: 0 };
const VIDEO_LIMITS = { fetchMs: 180000, uploadMs: 300000, maxBytes: 200 * 1024 * 1024 };

function decodeAttr(s) {
  return String(s || '').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
}

// Each <figure><video src data-sd poster data-page></video></figure> emitted by
// an extractor becomes a core/video block pointing at the uploaded MP4 (HD,
// then SD). If upload is off or fails, keep the thumbnail plus a link to the
// original video page — the CDN URLs expire, so they're useless to keep.
const VIDEO_FIG_RE = /<figure>\s*<video\b([^>]*)>\s*<\/video>\s*<\/figure>/g;

async function processVideos(base, headers, html, articleUrl, mediaCache, remember, upload) {
  for (const [whole, attrs] of [...html.matchAll(VIDEO_FIG_RE)]) {
    const attr = name => decodeAttr((attrs.match(new RegExp(`\\s${name}="([^"]*)"`, 'i')) || [])[1]);
    let m = null;
    if (upload) {
      for (const src of [attr('src'), attr('data-sd')].filter(Boolean)) {
        try {
          m = await uploadImageFromUrl(base, headers, src, '', articleUrl, mediaCache, VIDEO_LIMITS);
          break;
        } catch (e) {
          console.warn('[WP Clipper] Video upload failed:', e.message);
        }
      }
    }
    let out;
    if (m) {
      remember(m);
      out = `<!-- wp:video {"id":${m.id}} -->\n` +
        `<figure class="wp-block-video"><video controls src="${escHtml(m.sourceUrl)}"></video></figure>\n` +
        `<!-- /wp:video -->`;
    } else {
      const poster = attr('poster');
      const page   = attr('data-page') || attr('src');
      out = (poster ? `<figure><img src="${escHtml(poster)}" alt=""/></figure>\n` : '') +
        `<p>🎬 <a href="${escHtml(page)}" target="_blank" rel="noopener">${escHtml(page)}</a></p>`;
    }
    html = html.replace(whole, () => out);
  }
  return html;
}

async function uploadImageFromUrl(base, headers, imageUrl, altText, articleUrl, mediaCache, limits = IMAGE_LIMITS) {
  // Fetch the image as blob，帶 referrer 以通過 hotlink 保護（如 udn.com）
  const imgRes = await fetchWithTimeout(imageUrl, {
    referrer: articleUrl || '',
    referrerPolicy: 'no-referrer-when-downgrade'
  }, limits.fetchMs);
  if (!imgRes.ok) throw new Error('Cannot fetch image');
  const declared = Number(imgRes.headers.get('content-length')) || 0;
  if (limits.maxBytes && declared > limits.maxBytes) {
    throw new Error(`too large (${declared} bytes)`);
  }

  const blob = await imgRes.blob();
  const contentType = blob.type || 'image/jpeg';
  let ext = (contentType.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase();
  if (ext === 'jpeg') ext = 'jpg';
  if (!ext) ext = 'jpg';

  // Dedup: hash the blob and use it as the filename slug. If WP already
  // has media with that slug, reuse it instead of re-uploading. Big win
  // during repeated debug runs on the same article.
  const hashBuf = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
  const hash = Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
  const slug = `clip-${hash}`;
  const filename = `${slug}.${ext}`;

  // Per-call cache short-circuit (same image fetched twice in one clip)
  if (mediaCache && mediaCache.has(slug)) {
    return mediaCache.get(slug);
  }

  // Look up by search (title/filename). WP's slug filter is unreliable for
  // attachments, but title defaults to the upload filename minus extension,
  // so searching for our deterministic slug almost always finds prior runs.
  try {
    const lookupUrl = `${base}/wp-json/wp/v2/media?search=${encodeURIComponent(slug)}&per_page=10&context=edit`;
    const lookupRes = await fetchWithTimeout(lookupUrl, {
      headers: { 'Authorization': headers['Authorization'] },
      credentials: 'omit'
    }, MEDIA_LOOKUP_TIMEOUT_MS);
    if (lookupRes.ok) {
      const arr = await lookupRes.json();
      if (Array.isArray(arr)) {
        // Match: title equals slug, OR slug equals slug, OR source_url ends with slug.<ext>
        const hit = arr.find(m => {
          const t = (m.title && (m.title.rendered || m.title)) || '';
          if (t === slug) return true;
          if (m.slug === slug) return true;
          if (typeof m.source_url === 'string' && m.source_url.includes(`/${slug}.`)) return true;
          return false;
        });
        if (hit && hit.id) {
          console.log('[WP Clipper] Reusing existing media', hit.id, slug, hit.source_url);
          const result = { id: hit.id, sourceUrl: hit.source_url, post: hit.post || 0 };
          if (mediaCache) mediaCache.set(slug, result);
          return result;
        }
      }
    } else {
      console.warn('[WP Clipper] Media lookup HTTP', lookupRes.status);
    }
  } catch (e) {
    console.warn('[WP Clipper] Media dedup lookup failed, will upload:', e.message);
  }

  const uploadRes = await fetchWithTimeout(`${base}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: {
      'Authorization': headers['Authorization'],
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`
    },
    credentials: 'omit',
    body: blob
  }, limits.uploadMs);

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Media upload failed ${uploadRes.status}: ${errText}`);
  }

  const media = await uploadRes.json();
  const result = { id: media.id, sourceUrl: media.source_url, post: media.post || 0 };
  if (mediaCache) mediaCache.set(slug, result);
  return result;
}
