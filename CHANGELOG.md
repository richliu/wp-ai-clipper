# Changelog

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
