// content.js - Extracts article content from the current page

function extractContent() {
  const url = window.location.href;
  const result = {
    url: url,
    title: '',
    content: '',
    excerpt: '',
    featuredImageUrl: '',
    images: [],
    siteName: ''
  };

  // --- Title ---
  result.title =
    document.querySelector('meta[property="og:title"]')?.content ||
    document.querySelector('meta[name="twitter:title"]')?.content ||
    document.querySelector('h1')?.innerText ||
    document.title ||
    '';
  result.title = result.title.trim();

  // --- Site name ---
  result.siteName =
    document.querySelector('meta[property="og:site_name"]')?.content ||
    new URL(url).hostname.replace('www.', '') ||
    '';

  // --- Featured image ---
  result.featuredImageUrl =
    document.querySelector('meta[property="og:image"]')?.content ||
    document.querySelector('meta[name="twitter:image"]')?.content ||
    '';

  // --- Main content extraction ---
  // Try semantic article element first, then common selectors
  const contentSelectors = [
    'article',
    '[role="main"]',
    '.article-body',
    '.article-content',
    '.post-content',
    '.entry-content',
    '.story-body',
    '.news-content',
    '#article-body',
    '#content',
    'main'
  ];

  let contentEl = null;
  for (const sel of contentSelectors) {
    const el = document.querySelector(sel);
    if (el) { contentEl = el; break; }
  }

  if (!contentEl) {
    // Fallback: find the div with the most paragraph text
    let maxLen = 0;
    document.querySelectorAll('div').forEach(div => {
      const text = div.innerText || '';
      if (text.length > maxLen && div.querySelectorAll('p').length > 2) {
        maxLen = text.length;
        contentEl = div;
      }
    });
  }

  if (contentEl) {
    // Remove unwanted elements
    const toRemove = contentEl.querySelectorAll(
      'script, style, nav, header, footer, .ad, .ads, .advertisement, ' +
      '.social-share, .share-buttons, .related, .comments, .sidebar, ' +
      '[class*="promo"], [class*="subscribe"], [class*="newsletter"]'
    );
    toRemove.forEach(el => el.remove());

    // Collect images from content
    contentEl.querySelectorAll('img').forEach(img => {
      const src = img.src || img.dataset.src || img.dataset.lazySrc || '';
      if (src && src.startsWith('http') && !src.includes('icon') && !src.includes('logo')) {
        result.images.push({
          src: src,
          alt: img.alt || ''
        });
      }
    });

    // Build clean HTML
    result.content = buildCleanHTML(contentEl);
  }

  // --- Selection ---
  const sel = window.getSelection();
  if (sel && sel.rangeCount > 0 && sel.toString().trim().length > 10) {
    const range = sel.getRangeAt(0);
    const container = document.createElement('div');
    container.appendChild(range.cloneContents());
    result.selectedHtml = buildCleanHTML(container);
    result.hasSelection  = true;
  }

  // --- Excerpt from meta description ---
  result.excerpt =
    document.querySelector('meta[name="description"]')?.content ||
    document.querySelector('meta[property="og:description"]')?.content ||
    '';

  return result;
}

function buildCleanHTML(el) {
  const allowedTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                       'ul', 'ol', 'li', 'blockquote', 'strong', 'em',
                       'a', 'img', 'figure', 'figcaption'];
  let html = '';

  function processNode(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const tag = node.tagName.toLowerCase();

    if (!allowedTags.includes(tag)) {
      // Recurse into children even for disallowed tags
      let inner = '';
      node.childNodes.forEach(child => { inner += processNode(child); });
      return inner;
    }

    let attrs = '';
    if (tag === 'a') {
      const href = node.getAttribute('href');
      if (href) attrs = ` href="${href}" target="_blank" rel="noopener"`;
    }
    if (tag === 'img') {
      const src = node.src || node.dataset.src || '';
      const alt = node.alt || '';
      if (!src || !src.startsWith('http')) return '';
      return `<img src="${src}" alt="${alt}" style="max-width:100%;height:auto;" />`;
    }

    let inner = '';
    node.childNodes.forEach(child => { inner += processNode(child); });
    inner = inner.trim();
    if (!inner) return '';

    return `<${tag}${attrs}>${inner}</${tag}>`;
  }

  el.childNodes.forEach(node => { html += processNode(node); });
  return html.trim();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'extractContent') {
    try {
      const data = extractContent();
      sendResponse({ success: true, data });
    } catch (e) {
      sendResponse({ success: false, error: e.message });
    }
  }
  return true; // keep channel open for async
});
