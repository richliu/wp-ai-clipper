# Changelog

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
