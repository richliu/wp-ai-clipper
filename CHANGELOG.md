# Changelog

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
