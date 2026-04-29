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
    const toRemove = contentEl.querySelectorAll(
      'script, style, nav, header, footer, .ad, .ads, .advertisement, ' +
      '.social-share, .share-buttons, .related, .comments, .sidebar, ' +
      '[class*="promo"], [class*="subscribe"], [class*="newsletter"]'
    );
    toRemove.forEach(el => el.remove());

    contentEl.querySelectorAll('img').forEach(img => {
      const src = img.src || img.dataset.src || img.dataset.lazySrc || '';
      if (src && src.startsWith('http') && !src.includes('icon') && !src.includes('logo')) {
        result.images.push({ src, alt: img.alt || '' });
      }
    });

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

// ===== FACEBOOK SUPPORT =====================================

// Matches Facebook post permalink URLs
const FB_POST_RE = /^https?:\/\/(www\.|m\.)?facebook\.com\/([\w.%+-]+\/posts\/|permalink\.php|groups\/[^?#/]+\/posts\/|share\/p\/)/;

function isFacebookPost() {
  return FB_POST_RE.test(window.location.href);
}

// Click all "View more comments / replies" buttons, up to MAX_ROUNDS times
async function expandFbComments() {
  const EXPAND_RE = /查看更多則留言|查看\s*\d+\s*則留言|查看\s*\d+\s*則回覆|View\s+\d+\s+more\s+comment|View\s+more\s+comment|View\s+\d+\s+more\s+repl/i;
  const MAX_ROUNDS = 20;
  let totalClicked = 0;

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const btns = [];
    document.querySelectorAll('[role="button"], [role="link"]').forEach(el => {
      if (EXPAND_RE.test(el.innerText?.trim() || '')) btns.push(el);
    });
    if (btns.length === 0) break;
    btns.forEach(btn => { try { btn.click(); } catch (_) {} });
    totalClicked += btns.length;
    await new Promise(r => setTimeout(r, 1600));
  }
  return totalClicked;
}

function fbEsc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Returns true for Facebook profile/page links that should be de-linked
function isFbProfileLink(href) {
  if (!href) return false;
  // External (non-Facebook) links — keep
  if (/^https?:\/\//.test(href) && !href.includes('facebook.com')) return false;
  // Content links (posts, photos, etc.) — keep
  if (/\/(posts|permalink|photo|videos|events|reel|watch)/.test(href)) return false;
  // Everything else on Facebook (profiles, pages, groups) — de-link
  return href.startsWith('/') || href.includes('facebook.com/');
}

function extractFbPost() {
  const url = window.location.href;
  const result = {
    url, platform: 'facebook', siteName: 'Facebook',
    title: '', postAuthor: '', postTime: '',
    content: '', excerpt: '', featuredImageUrl: '',
    images: [], comments: []
  };

  // Modern Facebook permalink pages render the post inside [role="dialog"].
  // Fall back to [role="main"] for legacy/mobile layouts.
  const dialog = Array.from(document.querySelectorAll('[role="dialog"]'))
    .find(d => d.querySelector('[data-ad-preview="message"], [data-ad-comet-preview="message"]'));
  const root = dialog ?? document.querySelector('[role="main"]');
  if (!root) { result.title = document.title; return result; }

  // In dialog layout: ALL [role="article"] elements are comments (the post itself is NOT an article).
  // In legacy layout: the first top-level article is the main post.
  const allArticles = Array.from(root.querySelectorAll('[role="article"]'));
  const storyEl = root.querySelector('[role="story_message"]');

  // mainPost = the article that wraps the post body (legacy only).
  // In dialog layout storyEl is null, so mainPost will be null — that's fine,
  // we read post text directly from the caption element below.
  const topLevelArticles = allArticles.filter(a => !a.parentElement?.closest('[role="article"]'));
  const mainPost = dialog
    ? null  // dialog layout: no post article, comments are top-level articles
    : (storyEl?.closest('[role="article"]')
        ?? topLevelArticles.reduce((best, a) => {
            const len = a.innerText?.length ?? 0;
            return len > (best?.innerText?.length ?? 0) ? a : best;
          }, null)
        ?? allArticles[0]);

  // In legacy layout we need a mainPost; in dialog layout we don't.
  if (!dialog && !mainPost) { result.title = document.title; return result; }

  // Scope for searching post-level elements (excludes comment articles).
  // In dialog layout: use the dialog itself but skip comment articles.
  // In legacy layout: use mainPost.
  const postScope = mainPost ?? root;

  // --- Author ---
  // Priority 1: document.title format = "作者名 - 貼文內容..."
  const docTitle = document.title ?? '';
  const dashIdx = docTitle.indexOf(' - ');
  if (dashIdx > 0) {
    result.postAuthor = docTitle.slice(0, dashIdx).trim();
  }

  // Helper: returns true if el is NOT inside a comment article.
  // In dialog layout all [role="article"] are comments, so any el inside one is a comment element.
  // In legacy layout comments are nested articles inside mainPost.
  function notInCommentArticle(el) {
    const article = el.closest('[role="article"]');
    if (!article) return true;          // not in any article → post area
    if (mainPost && article === mainPost) return true;  // inside mainPost itself (legacy)
    return false;                        // inside a comment article
  }

  // Priority 2: [role="profile_name"] or [role="link"] b element in the post scope
  if (!result.postAuthor) {
    const els = Array.from(postScope.querySelectorAll('[role="profile_name"] b, [role="link"] b'));
    const el = els.find(notInCommentArticle);
    result.postAuthor = el?.innerText.trim() ?? '';
  }

  // Priority 3: first profile-like link in the post header (outside comment articles)
  if (!result.postAuthor) {
    const profileLink = Array.from(postScope.querySelectorAll('a[href]')).find(a => {
      if (!notInCommentArticle(a)) return false;
      const href = a.getAttribute('href') ?? '';
      const text = a.innerText.trim();
      return text.length >= 2 && text.length <= 50
        && !href.includes('/posts/') && !href.includes('/photo')
        && (href.startsWith('/') || href.includes('facebook.com/'))
        && !/^\d+$/.test(text);
    });
    result.postAuthor = profileLink?.innerText.trim() ?? '';
  }

  // --- Time + Year ---
  let postYear = new Date().getFullYear(); // fallback

  function parseTimeEl(el) {
    if (!el) return '';
    const ts = parseInt(el.getAttribute('data-utime') ?? '', 10);
    if (!isNaN(ts)) {
      const d = new Date(ts * 1000);
      postYear = d.getFullYear();
      return d.toLocaleString('zh-TW');
    }
    const dt = el.getAttribute('datetime') ?? '';
    if (dt) {
      const d = new Date(dt);
      if (!isNaN(d)) { postYear = d.getFullYear(); return d.toLocaleString('zh-TW'); }
    }
    const ariaRaw = el.getAttribute('aria-label') ?? '';
    if (ariaRaw) {
      const ym = ariaRaw.match(/\b(20\d{2})\b/);
      if (ym) postYear = parseInt(ym[1], 10);
      return ariaRaw;
    }
    const raw = el.getAttribute('title') || el.innerText?.trim() || '';
    const m = raw.match(/\b(20\d{2})\b/);
    if (m) postYear = parseInt(m[1], 10);
    return raw;
  }

  const dateRE = /\d{4}年|\d{4}\/\d|\d{1,2}月\d{1,2}日|20\d{2}|January|February|March|April|May|June|July|August|September|October|November|December/i;
  const relTimeRE = /^\d+\s*(秒|分鐘|小時|天|週|年)前$|^剛剛$|^昨天$|^just\s*now$/i;

  let timeEl = null;
  // P1: abbr[data-utime] or <time datetime> outside comment articles
  timeEl = Array.from(postScope.querySelectorAll('abbr[data-utime], time[datetime]')).find(notInCommentArticle);

  // P2: <a aria-label> with a date string outside comment articles
  if (!timeEl) {
    timeEl = Array.from(postScope.querySelectorAll('a[aria-label]')).find(a => {
      if (!notInCommentArticle(a)) return false;
      const label = a.getAttribute('aria-label') ?? '';
      return dateRE.test(label) && label.length < 80;
    });
  }

  // P3: any element with title/datetime/text containing a date
  if (!timeEl) {
    timeEl = Array.from(postScope.querySelectorAll('a[href], span[title], abbr')).find(el => {
      if (!notInCommentArticle(el)) return false;
      const candidate = el.getAttribute('title') || el.getAttribute('datetime') || el.innerText?.trim() || '';
      return dateRE.test(candidate) && candidate.length < 80;
    });
  }

  // P4: relative time (e.g. "3小時前")
  if (!timeEl) {
    timeEl = Array.from(postScope.querySelectorAll('a[href]')).find(a => {
      if (!notInCommentArticle(a)) return false;
      return relTimeRE.test(a.innerText?.trim() ?? '');
    });
  }

  result.postTime = parseTimeEl(timeEl);
  if (!result.postTime && timeEl) {
    result.postTime = timeEl.getAttribute('aria-label') || timeEl.getAttribute('title') || timeEl.innerText?.trim() || '';
  }

  // --- Post text ---
  let postText = '';
  let captionEl = null;

  // P1: caption directly in root (dialog layout has it outside any article)
  captionEl = root.querySelector('[data-ad-preview="message"], [data-ad-comet-preview="message"]');

  // P2: match by document.title hint
  if (!captionEl) {
    const fbTitle  = document.title ?? '';
    const dashIdx2 = fbTitle.indexOf(' - ');
    const pipeIdx  = fbTitle.lastIndexOf(' | ');
    const titleContent = dashIdx2 > 0
      ? (pipeIdx > dashIdx2 ? fbTitle.slice(dashIdx2 + 3, pipeIdx) : fbTitle.slice(dashIdx2 + 3))
          .replace(/[…\.]+$/, '').trim()
      : '';
    if (titleContent.length > 10) {
      const hint = titleContent.slice(0, 30);
      const allCaptions = Array.from(root.querySelectorAll('[data-ad-preview="message"], [data-ad-comet-preview="message"]'));
      captionEl = allCaptions.find(c => (c.innerText?.trim() ?? '').startsWith(hint));
    }
  }

  // P3: storyEl-based (static HTML / legacy)
  if (!captionEl && storyEl) {
    captionEl = storyEl.querySelector('[data-ad-preview="message"]')
      ?? storyEl.querySelector('[data-ad-comet-preview="message"]')
      ?? storyEl;
  }

  if (captionEl) {
    postText = captionEl.innerText?.trim() ?? '';
  } else {
    // P4: largest [dir="auto"] outside comment articles
    postScope.querySelectorAll('[dir="auto"]').forEach(el => {
      if (!notInCommentArticle(el)) return;
      const t = el.innerText?.trim() ?? '';
      if (t.length > postText.length) postText = t;
    });
  }

  // P5: fallback — largest plain div/span outside comment articles
  if (!postText) {
    let best = '';
    postScope.querySelectorAll('div, span').forEach(el => {
      if (!notInCommentArticle(el)) return;
      if (el.closest('[role="button"]') || el.closest('button') || el.closest('nav')) return;
      const t = el.innerText?.trim() ?? '';
      if (t.length > best.length) best = t;
    });
    postText = best;
  }

  // --- Images: restrict to post area (outside comment articles) ---
  const imgScope = captionEl?.closest('[role="article"]') ?? storyEl?.parentElement ?? postScope;
  imgScope.querySelectorAll('img[data-imgperflogname="feedImage"]').forEach(img => {
    if (!notInCommentArticle(img)) return;
    const src = img.src || img.getAttribute('data-src') || '';
    if (!src.startsWith('https://')) return;
    if (!result.featuredImageUrl) result.featuredImageUrl = src;
    result.images.push({ src, alt: img.alt || '' });
  });

  if (result.images.length === 0) {
    imgScope.querySelectorAll('img').forEach(img => {
      if (!notInCommentArticle(img)) return;
      const src = img.src || img.getAttribute('data-src')
        || img.getAttribute('data-lazy-src') || img.getAttribute('data-original') || '';
      if (!src.startsWith('https://')) return;
      if (src.includes('emoji') || src.includes('_s.') || src.includes('1x1')) return;
      const parentA = img.closest('a[href]');
      if (parentA && isFbProfileLink(parentA.getAttribute('href') ?? '')) return;
      if (!result.featuredImageUrl) result.featuredImageUrl = src;
      result.images.push({ src, alt: img.alt || '' });
    });
  }

  // --- Comments ---
  const commentEls = Array.from(root.querySelectorAll('[role="article"]'))
    .filter(a => {
      const label = a.getAttribute('aria-label') ?? '';
      return /的留言|'s comment/i.test(label);
    });
  result.comments = commentEls.map(extractFbComment).filter(Boolean);

  // --- Build WordPress HTML ---
  let html = '';

  // Post header
  if (result.postAuthor || result.postTime) {
    html += '<p>';
    if (result.postAuthor) html += `<strong>${fbEsc(result.postAuthor)}</strong>`;
    if (result.postAuthor && result.postTime) html += ' · ';
    if (result.postTime) html += fbEsc(result.postTime);
    html += '</p>\n';
  }

  // Post body
  postText.split('\n').filter(l => l.trim()).forEach(line => {
    html += `<p>${fbEsc(line)}</p>\n`;
  });

  // Post images (up to 8)
  result.images.slice(0, 8).forEach(({ src, alt }) => {
    html += `<figure><img src="${src}" alt="${fbEsc(alt)}" style="max-width:100%;height:auto;"/></figure>\n`;
  });

  // Comments section
  if (result.comments.length > 0) {
    html += '\n<!-- wp:separator -->\n<hr class="wp-block-separator has-alpha-channel-opacity"/>\n<!-- /wp:separator -->\n';
    html += `\n<!-- wp:heading {"level":3} -->\n<h3>留言（${result.comments.length}）</h3>\n<!-- /wp:heading -->\n`;
    result.comments.forEach(({ author, time, html: cHtml }) => {
      html += '<!-- wp:quote -->\n<blockquote class="wp-block-quote">\n';
      html += `<p><strong>${fbEsc(author)}</strong>`;
      if (time) html += ` · <small>${fbEsc(time)}</small>`;
      html += '</p>\n';
      if (cHtml) html += `<p>${cHtml}</p>\n`;
      html += '</blockquote>\n<!-- /wp:quote -->\n';
    });
  }

  result.content = html;
  result.title   = `${postYear} ${result.postAuthor || 'Unknown'} FB 貼文`;
  result.excerpt = postText.slice(0, 200).replace(/\s+/g, ' ')
    + (postText.length > 200 ? '…' : '');

  return result;
}

function extractFbComment(commentEl) {
  // --- Author + Time from aria-label (e.g. "封賢甯的留言4小時前") ---
  const ariaLabel = commentEl.getAttribute('aria-label') ?? '';
  const labelMatch = ariaLabel.match(/^(.+?)(?:的留言|'s comment)\s*(.*)$/i);
  let author = labelMatch?.[1]?.trim() ?? '';
  let time   = labelMatch?.[2]?.trim() ?? '';

  // Fallback author: first <a href> with text
  if (!author) {
    const authorLink = commentEl.querySelector('a[href]');
    author = authorLink?.innerText.trim() ?? '';
  }

  // Fallback time: abbr[data-utime]
  if (!time) {
    const timeAbbr = commentEl.querySelector('abbr[data-utime]');
    if (timeAbbr) {
      const ts = parseInt(timeAbbr.getAttribute('data-utime'), 10);
      time = isNaN(ts) ? (timeAbbr.title || '') : new Date(ts * 1000).toLocaleString('zh-TW');
    }
  }

  // --- Comment HTML ---
  const clone = commentEl.cloneNode(true);

  // 1. Remove avatars: <a> elements that contain only an image (no text)
  clone.querySelectorAll('a[href]').forEach(a => {
    if (!a.innerText.trim() && a.querySelector('img, svg, image')) a.remove();
  });

  // 2. De-link profile links → plain text; keep content/external links
  clone.querySelectorAll('a[href]').forEach(a => {
    if (isFbProfileLink(a.getAttribute('href') ?? '')) {
      a.replaceWith(document.createTextNode(a.innerText));
    }
  });

  // 3. Find comment text block (dir="auto")
  const textEl = clone.querySelector('[dir="auto"]');
  if (!textEl) {
    const raw = commentEl.innerText?.trim() ?? '';
    return (raw && raw !== author) ? { author, time, html: fbEsc(raw) } : null;
  }

  // 4. Serialize inline HTML — allow <a>, <b>, <i>, <em>, <strong>, <br>
  const INLINE = new Set(['a', 'b', 'i', 'em', 'strong']);
  function ser(n) {
    if (n.nodeType === Node.TEXT_NODE) return fbEsc(n.textContent);
    if (n.nodeType !== Node.ELEMENT_NODE) return '';
    const tag = n.tagName.toLowerCase();
    if (tag === 'br') return '<br>';
    const inner = Array.from(n.childNodes).map(ser).join('');
    if (!INLINE.has(tag)) return inner;
    if (tag === 'a') {
      const href = n.getAttribute('href') ?? '';
      if (!href || href.startsWith('javascript')) return inner;
      return `<a href="${fbEsc(href)}" target="_blank" rel="noopener noreferrer">${inner}</a>`;
    }
    return `<${tag}>${inner}</${tag}>`;
  }

  const commentHtml = Array.from(textEl.childNodes).map(ser).join('').trim();
  if (!commentHtml && !author) return null;

  return { author, time, html: commentHtml };
}

// ===== UDN SUPPORT ==========================================

function isUdn() {
  return /udn\.com/.test(window.location.hostname) &&
    /\/news\/story\/\d+\/\d+/.test(window.location.pathname);
}

function extractUdn() {
  const url = window.location.href;
  const result = {
    url, siteName: '聯合新聞網',
    title: '', content: '', excerpt: '', featuredImageUrl: '', images: []
  };

  result.title =
    document.querySelector('meta[property="og:title"]')?.content ||
    document.querySelector('h1.article-content__title, h1')?.innerText ||
    document.title || '';
  result.title = result.title.trim();

  result.featuredImageUrl =
    document.querySelector('meta[property="og:image"]')?.content || '';

  result.excerpt =
    document.querySelector('meta[name="description"]')?.content ||
    document.querySelector('meta[property="og:description"]')?.content || '';

  const articleBody = document.querySelector('.article-content__editor');
  if (!articleBody) {
    result.content = '';
    return result;
  }

  const clone = articleBody.cloneNode(true);

  // Remove udn-specific noise
  clone.querySelectorAll([
    // Inline ads blocks
    '.inline-ads', '[class*="udn-ads"]',
    // Taboola / Google ad slots
    '[id*="taboola"]', '[id*="ads-"]', '[id*="underlay"]', '[id*="innity"]',
    // Inline-styled promo/related-link blocks (e.g. 全球熱話題)
    'div[style*="background-color"]',
    // Scripts / styles injected into article
    'script', 'style', 'noscript',
  ].join(', ')).forEach(el => el.remove());

  // Deduplicate images
  const seenSrcs = new Set();
  if (result.featuredImageUrl) seenSrcs.add(result.featuredImageUrl);
  clone.querySelectorAll('img').forEach(img => {
    const src = img.src || img.dataset.src || img.dataset.lazySrc || img.dataset.original || '';
    if (!src || !src.startsWith('http')) return;
    if (src.includes('icon') || src.includes('logo') || src.includes('1x1')) return;
    if (seenSrcs.has(src)) return;
    seenSrcs.add(src);
    if (!result.featuredImageUrl) result.featuredImageUrl = src;
    result.images.push({ src, alt: img.alt || '' });
  });

  result.content = buildCleanHTML(clone);
  return result;
}

// ===== CHINATIMES SUPPORT ===================================

function isChinatimes() {
  // Only match single article pages: /realtimenews/20260428004260-260410
  return /chinatimes\.com/.test(window.location.hostname) &&
    /\/\d{8,}-\d+/.test(window.location.pathname);
}

function extractChinatimes() {
  const url = window.location.href;
  const result = {
    url, siteName: '中時新聞網',
    title: '', content: '', excerpt: '', featuredImageUrl: '', images: []
  };

  // --- Title ---
  result.title =
    document.querySelector('meta[property="og:title"]')?.content ||
    document.querySelector('h1.article-title, h1')?.innerText ||
    document.title || '';
  result.title = result.title.trim();

  // --- Featured image ---
  result.featuredImageUrl =
    document.querySelector('meta[property="og:image"]')?.content || '';

  // --- Excerpt ---
  result.excerpt =
    document.querySelector('meta[name="description"]')?.content ||
    document.querySelector('meta[property="og:description"]')?.content || '';

  // --- Find article body ---
  // chinatimes puts the article text in .article-body
  // <article> is too broad (includes sidebar, tags, related news)
  const articleBody =
    document.querySelector('.article-body') ||
    document.querySelector('.article-content') ||
    document.querySelector('article .news-content') ||
    document.querySelector('article');

  if (!articleBody) {
    result.content = '';
    return result;
  }

  // Clone to avoid mutating the page
  const clone = articleBody.cloneNode(true);

  // Remove chinatimes-specific noise
  const noiseSelectors = [
    // Donation / sponsor section
    '#donate-form-container', '[id*="donate"]', '.donation', '[class*="donation"]',
    // Ads
    '[class*="dfp"]', '[class*="ad-"]', '[id*="dfp"]', '[id*="gpt"]',
    '.advertisement', '.ad-wrapper', '.ad-area',
    // Related / recommended
    '[class*="related"]', '[class*="recommend"]', '[class*="rel-news"]',
    '.more-news', '.next-article', '.prev-next',
    // Tags, keywords
    '[class*="tag"]', '[class*="keyword"]',
    // Author box (duplicate info at bottom)
    '[class*="author-box"]', '[class*="author-info"]',
    // Social share
    '[class*="social"]', '[class*="share"]',
    // Subscribe / paywall overlays
    '[class*="subscribe"]', '[class*="paywall"]', '[class*="member"]',
    // Navigation / breadcrumb
    'nav', '.breadcrumb',
    // Scripts / styles
    'script', 'style', 'noscript',
    // Newsletter / sidebar widgets injected into body
    '[class*="newsletter"]', '[class*="widget"]',
    // Video placeholder buttons
    '[class*="video-placeholder"]',
  ];
  clone.querySelectorAll(noiseSelectors.join(', ')).forEach(el => el.remove());

  // Collect images before building HTML (deduplicate by URL)
  const seenSrcs = new Set();
  if (result.featuredImageUrl) seenSrcs.add(result.featuredImageUrl);
  clone.querySelectorAll('img').forEach(img => {
    const src = img.src || img.dataset.src || img.dataset.lazySrc || img.dataset.original || '';
    if (!src || !src.startsWith('http')) return;
    if (src.includes('icon') || src.includes('logo') || src.includes('1x1')) return;
    if (seenSrcs.has(src)) return;
    seenSrcs.add(src);
    if (!result.featuredImageUrl) result.featuredImageUrl = src;
    result.images.push({ src, alt: img.alt || '' });
  });

  result.content = buildCleanHTML(clone);
  return result;
}

// ===== PLURK SUPPORT ========================================

const PLURK_POST_RE = /^https?:\/\/(www\.)?plurk\.com\/(p|m\/p)\/([a-zA-Z0-9]+)/;

function isPlurkPost() {
  return PLURK_POST_RE.test(window.location.href);
}

function plurkEsc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Content scripts run in an isolated world and cannot read window.plurk from
// the page. Inject a tiny script into the main world and pass data back via
// a document CustomEvent (document is shared between all worlds).
function getPlurkPageVars() {
  return new Promise(resolve => {
    const eid = `__wpc_${Date.now()}`;
    document.addEventListener(eid, function h(e) {
      document.removeEventListener(eid, h);
      resolve(e.detail || {});
    }, { once: true });
    const s = document.createElement('script');
    s.textContent = `document.dispatchEvent(new CustomEvent(${JSON.stringify(eid)},{detail:{id:window.plurk&&window.plurk.id,count:window.plurk&&window.plurk.response_count}}))`;
    (document.head || document.documentElement).appendChild(s);
    s.remove();
  });
}

function extractPlurkResponse(el) {
  const rid = el.getAttribute('data-rid') || el.getAttribute('data-id') || '';
  const author = el.querySelector('.name')?.innerText?.trim() || '';
  const timeEl = el.querySelector('abbr');
  const time = timeEl?.getAttribute('title') || timeEl?.innerText?.trim() || '';
  const textHolder = el.querySelector('.content .text_holder');
  const text = textHolder?.innerText?.trim() || '';

  const imgs = [];
  el.querySelectorAll('a.ex_link.pictureservices').forEach(a => {
    const src = a.href || '';
    if (src && src.startsWith('http')) {
      imgs.push({ src, alt: a.querySelector('img')?.alt || '' });
    }
  });

  const links = [];
  if (textHolder) {
    textHolder.querySelectorAll('a[href]').forEach(a => {
      if (a.classList.contains('ex_link') && a.classList.contains('pictureservices')) return;
      if (a.classList.contains('name_tag')) return;
      const href = a.getAttribute('href') || '';
      const linkText = a.innerText?.trim() || '';
      if (href && linkText && !href.startsWith('javascript')) {
        links.push({ href, text: linkText });
      }
    });
  }

  const hasEmo = Array.from(el.querySelectorAll('img')).some(img =>
    img.src && img.src.includes('emos.plurk.com')
  );
  const hasUserImg = imgs.length > 0;
  const hasLink = links.length > 0;
  const isEmpty = !text && !hasUserImg && !hasLink;
  const isPureEmo = !text.replace(/\s/g, '') && hasEmo && !hasUserImg && links.length === 0;

  return { rid, author, time, text, hasUserImg, hasEmo, hasLink, isPureEmo, isEmpty, imgs, links };
}

// Fetch ALL responses via Plurk's AJAX endpoint (works while user is logged in)
async function expandPlurkResponses() {
  // Get total count from main world (window.plurk is inaccessible in content scripts)
  const pageVars = await getPlurkPageVars();
  const totalCount = pageVars.count || null;

  // Show the load-older controls — Plurk hides them with class 'hide' by default
  const holder = document.querySelector('.load-older-holder');
  if (holder) holder.classList.remove('hide');

  let lastCount = -1;
  let stuckRounds = 0;
  const MAX_STUCK = 6;

  while (stuckRounds < MAX_STUCK) {
    const current = document.querySelectorAll('.response[data-type="response"]').length;
    if (totalCount && current >= totalCount) break;

    if (current === lastCount) {
      stuckRounds++;
    } else {
      stuckRounds = 0;
    }
    lastCount = current;

    // Wait if Plurk is currently mid-load (loading spinner visible)
    const loadingSpinner = holder && holder.querySelector('.loading:not(.hide)');
    if (loadingSpinner) {
      await new Promise(r => setTimeout(r, 1200));
      continue;
    }

    const btn = document.querySelector('.load-older-holder .button.load-older');
    if (btn) {
      btn.click();
    } else {
      stuckRounds++;
    }
    await new Promise(r => setTimeout(r, 1800));
  }

  return document.querySelectorAll('.response[data-type="response"]').length;
}

async function extractPlurkPost() {
  const url = window.location.href;
  const match = url.match(PLURK_POST_RE);
  const postId = match?.[3] || '';

  const result = {
    url, platform: 'plurk', siteName: 'Plurk',
    title: '', content: '', excerpt: '', featuredImageUrl: '', images: [],
    plurkData: null
  };

  const mainEl = document.querySelector('.plurk.bigplurk') ||
    Array.from(document.querySelectorAll('.plurk')).find(el => !el.classList.contains('response'));

  if (!mainEl) {
    result.title = document.title;
    return result;
  }

  const owner = mainEl.querySelector('.name')?.innerText?.trim() || '';
  const timeEl = mainEl.querySelector('abbr');
  const postTime = timeEl?.getAttribute('title') || timeEl?.innerText?.trim() || '';
  const mainTextHolder = mainEl.querySelector('.content .text_holder');
  const postText = mainTextHolder?.innerText?.trim() || '';

  const postImgs = [];
  mainEl.querySelectorAll('a.ex_link.pictureservices').forEach(a => {
    const src = a.href || '';
    if (src && src.startsWith('http')) {
      postImgs.push({ src, alt: a.querySelector('img')?.alt || '' });
    }
  });

  // Scrape DOM responses; get real total count from window.plurk via main-world injection
  const responseEls = Array.from(document.querySelectorAll('.response[data-type="response"]'));
  const responses = responseEls.map(extractPlurkResponse);
  const loadedCount = responses.length;
  const pageVars = await getPlurkPageVars();
  const totalResponseCount = pageVars.count || loadedCount;

  const ogImage = document.querySelector('meta[property="og:image"]')?.content || '';
  result.featuredImageUrl = postImgs[0]?.src || ogImage;
  result.images = [...postImgs, ...responses.flatMap(r => r.imgs)];

  const year = postTime?.match(/\b(20\d{2})\b/)?.[1] || new Date().getFullYear();
  result.title = `${year} ${owner} Plurk 串（${totalResponseCount} 則）`;
  result.excerpt = postText.slice(0, 200) + (postText.length > 200 ? '…' : '');

  result.plurkData = {
    postId, owner, ownerAvatar: '',
    postTime, postText, postImgs,
    responseCount: totalResponseCount, loadedCount,
    responses, hasMoreResponses: loadedCount < totalResponseCount
  };

  // Build default full-backup HTML
  let html = `<p><strong>${plurkEsc(owner)}</strong>`;
  if (postTime) html += ` · <small>${plurkEsc(postTime)}</small>`;
  html += '</p>\n';
  postText.split('\n').filter(l => l.trim()).forEach(line => {
    html += `<p>${plurkEsc(line)}</p>\n`;
  });
  postImgs.forEach(({ src, alt }) => {
    html += `<!-- wp:html -->\n<figure><img src="${plurkEsc(src)}" alt="${plurkEsc(alt)}" style="max-width:100%;height:auto;"/></figure>\n<!-- /wp:html -->\n`;
  });

  if (responses.length > 0) {
    html += '\n<!-- wp:separator -->\n<hr class="wp-block-separator has-alpha-channel-opacity"/>\n<!-- /wp:separator -->\n';
    html += `\n<!-- wp:heading {"level":3} -->\n<h3>回應（${loadedCount}${loadedCount < totalResponseCount ? ' / ' + totalResponseCount : ''}）</h3>\n<!-- /wp:heading -->\n`;
    responses.forEach(({ author, time, text, imgs, links }) => {
      html += '<!-- wp:quote -->\n<blockquote class="wp-block-quote">\n';
      html += `<p><strong>${plurkEsc(author)}</strong>`;
      if (time) html += ` · <small>${plurkEsc(time)}</small>`;
      html += '</p>\n';
      text.split('\n').filter(l => l.trim()).forEach(line => {
        html += `<p>${plurkEsc(line)}</p>\n`;
      });
      links.forEach(({ href, text: lt }) => {
        html += `<p><a href="${plurkEsc(href)}" target="_blank" rel="noopener noreferrer">${plurkEsc(lt)}</a></p>\n`;
      });
      html += '</blockquote>\n<!-- /wp:quote -->\n';
      // Images must be outside blockquote — Gutenberg wp:quote only allows <p> children
      imgs.forEach(({ src, alt }) => {
        html += `<!-- wp:html -->\n<figure><img src="${plurkEsc(src)}" alt="${plurkEsc(alt)}" style="max-width:100%;height:auto;"/></figure>\n<!-- /wp:html -->\n`;
      });
    });
  }

  result.content = html;
  return result;
}

// ===== MESSAGE LISTENER =====================================

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.action === 'extractContent') {
    if (isPlurkPost()) {
      extractPlurkPost()
        .then(data => sendResponse({ success: true, data }))
        .catch(e   => sendResponse({ success: false, error: e.message }));
    } else {
      try {
        const data = isFacebookPost() ? extractFbPost()
                  : isChinatimes()    ? extractChinatimes()
                  : isUdn()           ? extractUdn()
                  : extractContent();
        sendResponse({ success: true, data });
      } catch (e) {
        sendResponse({ success: false, error: e.message });
      }
    }
  } else if (msg.action === 'expandFbComments') {
    expandFbComments()
      .then(count => sendResponse({ success: true, count }))
      .catch(err  => sendResponse({ success: false, error: err.message }));
  } else if (msg.action === 'expandPlurkResponses') {
    expandPlurkResponses()
      .then(count => sendResponse({ success: true, count }))
      .catch(err  => sendResponse({ success: false, error: err.message }));
  }
  return true; // keep channel open for async
});
