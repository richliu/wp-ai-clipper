// background.js - Service worker: handles WordPress API communication

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

async function handleSendToWordPress(payload) {
  const { wpUrl, username, appPassword, includeSourceUrl, stripUrlParams, urlParamWhitelist, articleData } = payload;

  // Clean article URL before use
  articleData.url = cleanUrlParams(articleData.url, stripUrlParams !== false, urlParamWhitelist || '');
  const base = wpUrl.replace(/\/$/, '');
  const auth = btoa(`${username}:${appPassword}`);
  const headers = {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/json'
  };

  // 1. Upload featured image if available
  let featuredMediaId = null;
  if (articleData.featuredImageUrl) {
    try {
      featuredMediaId = await uploadImageFromUrl(
        base, headers, articleData.featuredImageUrl, articleData.title, articleData.url
      );
    } catch (e) {
      console.warn('Featured image upload failed:', e.message);
    }
  }

  // 2. Build post content
  const imageBlock = articleData.featuredImageUrl
    ? `<figure><img src="${articleData.featuredImageUrl}" alt="${articleData.title}" style="max-width:100%;height:auto;" /></figure>\n\n`
    : '';

  let fullContent = imageBlock + articleData.content;

  // Optionally append Reference URL as a separate block
  if (includeSourceUrl !== false) {
    const refBlock =
      `\n\n<!-- wp:separator -->\n<hr class="wp-block-separator has-alpha-channel-opacity"/>\n<!-- /wp:separator -->` +
      `\n\n<!-- wp:paragraph -->\n<p><strong>Reference URL</strong> : <a href="${articleData.url}" target="_blank" rel="noopener noreferrer">${articleData.url}</a></p>\n<!-- /wp:paragraph -->`;
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
  return media.id;
}
