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
  const { wpUrl, username, appPassword, uploadInlineImages,
          includeSourceUrl, stripUrlParams, urlParamWhitelist, articleData } = payload;

  // Clean article URL before use
  articleData.url = cleanUrlParams(articleData.url, stripUrlParams !== false, urlParamWhitelist || '');
  const base = wpUrl.replace(/\/$/, '');
  const auth = btoa(`${username}:${appPassword}`);
  const headers = {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  };

  // 1. Upload featured image if available
  let featuredMediaId  = null;
  let featuredLocalUrl = null;
  if (articleData.featuredImageUrl) {
    try {
      const m = await uploadImageFromUrl(
        base, headers, articleData.featuredImageUrl, articleData.title, articleData.url
      );
      featuredMediaId  = m.id;
      featuredLocalUrl = m.sourceUrl;
    } catch (e) {
      console.warn('Featured image upload failed:', e.message);
    }
  }

  // 2. Build post content
  const featuredDisplayUrl = featuredLocalUrl || articleData.featuredImageUrl;
  const imageBlock = articleData.featuredImageUrl
    ? `<!-- wp:html -->\n<figure><img src="${escHtml(featuredDisplayUrl)}" alt="${escHtml(articleData.title)}" style="max-width:100%;height:auto;" /></figure>\n<!-- /wp:html -->\n\n`
    : '';

  let fullContent = imageBlock + articleData.content;

  // 3. Upload inline images and replace URLs in content
  if (uploadInlineImages !== false) {
    // Collect all img srcs from the article content (not the imageBlock we just built)
    const inlineSrcs = extractImgSrcs(articleData.content);
    for (const src of inlineSrcs) {
      // If this is the featured image already uploaded, just replace the URL
      if (src === articleData.featuredImageUrl && featuredLocalUrl) {
        fullContent = fullContent.replaceAll(src, featuredLocalUrl);
        continue;
      }
      try {
        const m = await uploadImageFromUrl(base, headers, src, '', articleData.url);
        fullContent = fullContent.replaceAll(src, m.sourceUrl);
      } catch (e) {
        console.warn('Inline image upload failed:', src, e.message);
      }
    }
  }

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
  return {
    postId: post.id,
    editUrl: `${base}/wp-admin/post.php?post=${post.id}&action=edit`,
    previewUrl: post.link
  };
}

async function uploadImageFromUrl(base, headers, imageUrl, altText, articleUrl) {
  // Fetch the image as blob，帶 referrer 以通過 hotlink 保護（如 udn.com）
  const imgRes = await fetch(imageUrl, {
    referrer: articleUrl || '',
    referrerPolicy: 'no-referrer-when-downgrade'
  });
  if (!imgRes.ok) throw new Error('Cannot fetch image');

  const blob = await imgRes.blob();
  const contentType = blob.type || 'image/jpeg';
  const ext = contentType.split('/')[1] || 'jpg';
  const filename = `clipped-${Date.now()}.${ext}`;

  const uploadHeaders = {
    ...headers,
    'Content-Type': contentType,
    'Content-Disposition': `attachment; filename="${filename}"`
  };
  delete uploadHeaders['Content-Type']; // will be set by blob
  uploadHeaders['Content-Type'] = contentType;

  const uploadRes = await fetch(`${base}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: {
      'Authorization': headers['Authorization'],
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`
    },
    credentials: 'omit',
    body: blob
  });

  if (!uploadRes.ok) {
    const errText = await uploadRes.text();
    throw new Error(`Media upload failed ${uploadRes.status}: ${errText}`);
  }

  const media = await uploadRes.json();
  return { id: media.id, sourceUrl: media.source_url };
}
