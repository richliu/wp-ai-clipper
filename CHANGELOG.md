# Changelog

## [1.0.11] - 2026-04-29
### Added
- 聯合新聞網（udn.com）專屬提取器 `extractUdn()`
  - 精準鎖定 `.article-content__editor` 為內容容器
  - 移除 inline-ads、udn-ads、Taboola、innity 廣告區塊
  - 移除文章內 inline-styled 推薦連結區塊（如「全球熱話題」）：`div[style*="background-color"]`
  - 圖片去重（同 chinatimes）

---

## [1.0.10] - 2026-04-29
### Fixed
- 中時新聞網提取器未觸發：`isChinatimes()` regex `\d{17}` 改為 `\d{8,}`（文章 ID 為 14 碼，非 17 碼）
- 贊助區塊（`#donate-form-container`）現在正確移除，新增 `[id*="donate"]`、`[class*="donation"]` 選擇器
- 圖片重複問題：以 `seenSrcs` Set 去重，og:image 已設為 featuredImage 時不再重複加入 images 陣列

---

## [1.0.9] - 2026-04-29
### Added
- 中時新聞網（chinatimes.com）專屬提取器 `extractChinatimes()`
  - 精準鎖定 `.article-body` 為內容容器，避免 `<article>` 過寬抓到廣告、推薦文章、標籤區
  - 自動移除 dfp 廣告、related/recommend 推薦區塊、tag 標籤、author-box、社群分享、paywall 元素
  - 保留正文圖片並正確設定 featuredImage

---

## [1.0.8] - 2026-04-28
### Fixed
- Facebook permalink 頁面內容抓取完全錯誤的問題
  - 現代 Facebook 將貼文渲染在 `[role="dialog"]` overlay 內，而非 `[role="main"]`
  - 舊版只搜尋 `[role="main"]`，導致抓到廣告/推薦貼文的文字
  - 新版優先偵測含有 `[data-ad-preview="message"]` 的 dialog，以其為根容器
  - Dialog layout 中所有 `[role="article"]` 均為留言，新增 `notInCommentArticle()` 過濾器確保作者、時間、圖片不會從留言區誤抓
  - P4 fallback 原本搜尋整個 `main`（bug），修正為只在 `postScope` 內搜尋並排除留言

---


## [1.0.7] - 2026-03-25
### Added
- AI 設定頁新增「測試連線」按鈕（讀取表單目前值，不需先儲存）
- AI 清理按鈕下方加獨立 `aiCleanStatus` 狀態列，成功/失敗即時顯示於按鈕正下方
- AI 處理中同時鎖定 clip、複製 HTML、複製純文字三個按鈕，防止送出未清理內容
- AI 清理成功後 clip 按鈕顯示 `[AI]` 標記；上傳成功後自動清除

### Fixed
- AI 清理 `max_tokens` 預設值從 128000 改為 8192（DeepSeek Chat 輸出上限），修正 API 立即報錯問題
- API Key 未儲存時的錯誤提示改顯示在 `aiCleanStatus`（原本顯示在畫面底部看不到的位置）

---

## [1.0.6] - 2026-03-25
### Added
- Select text on page before opening popup → "僅匯入選取部分" toggle appears automatically
- All actions (clip to WP, copy HTML, copy text, AI clean) respect the selection toggle
- AI clean writes result back to the correct slot (selection or full content)

---

## [1.0.5] - 2026-03-24
### Added
- AI settings panel (✦ icon in header): configure DeepSeek or OpenAI/ChatGPT provider, API key, model, and max tokens
- "✦ AI 清理內容" button in clip view: sends extracted HTML to the AI and strips off-topic content while keeping the main article intact
- AI settings included in export/import JSON
- AI clean button auto-enabled after import if API key is present

### Changed
- Header now has two icon buttons: ✦ (AI settings) and ⚙ (WordPress settings)
- View toggle refactored to support 3 views (clip / WP settings / AI settings)

---

## [1.0.4] - 2026-03-22
### Added
- Export settings as JSON (download)
- Import settings via JSON paste (avoids Chrome popup focus-loss bug with file dialogs)
- Toggle: append Reference URL as a separate Gutenberg block at the end of the post
- Toggle: strip URL query params (e.g. utm_source, fbclid) before saving to WordPress — on by default
- Whitelist input: preserve specific query params (e.g. `id`, `p`) when stripping is enabled
- Reference URL block uses proper Gutenberg `wp:paragraph` / `wp:separator` format

### Changed
- Source attribution block reformatted to **Reference URL : \<url\>** style

---

## [1.0.0] - 2026-03-21
### Added
- Initial release
- Clip web articles to WordPress as drafts via REST API
- Featured image upload (with referrer header for hotlink-protected images)
- Copy content (HTML + image) and copy plain text buttons
- Application Password authentication
- Dark UI with settings panel
