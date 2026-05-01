[繁體中文](README.md) | **English**

# WP Clipper — Browser Extension

Clip articles from any website into WordPress drafts with one click, preserving the original source URL.

A handy tool for WordPress users who collect articles while browsing the web.

## Features

- Settings are stored locally on your computer — no external connections required (except to your API and WP)
- Fully Open Source

## Installation

### Chrome / Edge
1. Open `chrome://extensions/`
2. Enable **Developer mode** in the top-right corner
3. Click **Load unpacked** → select this folder

### Firefox
1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on** → select `manifest.json` inside this folder

---

## Initial Setup (one-time)

### WordPress Connection (⚙)
1. Click the ✂ icon in your browser toolbar
2. Click **⚙** in the top-right corner to open settings
3. Fill in:
   - **WordPress URL**: `https://yoursite.com`
   - **Username**: your WP account name
   - **Application Password**: see instructions below
4. Click **Save Settings** (connection will be tested automatically)

#### Generating an Application Password
1. Log in to WordPress → Users → Your Profile
2. Scroll to the **Application Passwords** section at the bottom
3. Enter a name (e.g. `WP Clipper`) → click **Add New Application Password**
4. **Copy the displayed password** (it's only shown once)
5. Paste it into the **Application Password** field in the extension settings

### AI Settings (✦)
1. Click **✦** in the top-right corner to open AI settings
2. Choose a provider: **DeepSeek** or **OpenAI / ChatGPT**
3. Enter your API Key
4. Set the model name (defaults: DeepSeek → `deepseek-v4-pro`, OpenAI → `gpt-4o`)
5. Click **Test Connection** to verify the API works
6. Click **Save AI Settings**

---

## How to Use

### Regular Articles
1. Browse to any article or news page
2. (Optional) Select the text you want to clip
3. Click the ✂ icon to open the popup
4. Review and edit the title and excerpt if needed
5. (Optional) Click **✦ AI Clean Content** to strip irrelevant content — wait until the button shows `[AI]`
6. Click **✂ Import as Draft** to upload to WordPress
7. Click the result link to jump directly to the WP editor

### Plurk Thread Backup
1. Open the Plurk post page you want to back up (`plurk.com/p/xxxxxx`)
2. Click the ✂ icon — the popup automatically enters **Plurk Backup Mode**
3. Click **Expand All Responses** to load all replies (may take a while for long threads)
4. Choose filter options (backup images, backup links, exclude emoji-only responses)
5. Click **Backup All** to import directly as a WordPress draft

### Threads Post Clipping
1. Open a single Threads post (`threads.com/@user/post/<id>`)
2. Click the ✂ icon — the popup automatically enters **Threads Post Mode**
3. **Scroll the page manually to browse the whole thread** (important: Threads uses a virtualised list — posts that scroll out of view are unmounted; the extension continuously accumulates everything you scroll past in the background)
   - Or click **Load All Replies** to auto-scroll incrementally
4. Click **✂ Import as Draft** to upload to WordPress
5. The main post, author continuations, and all replies are imported in DOM order; the author's own replies are automatically tagged with a 【作者】 prefix

---

## Features in Detail

### Imported Content
- ✅ Article title
- ✅ Body content (ads and navigation stripped)
- ✅ Featured image (og:image) uploaded to Media Library
- ✅ All inline images automatically uploaded to Media Library and URLs replaced (can be disabled, on by default)
- ✅ meta description used as excerpt
- ✅ Original source URL appended to the post (can be disabled)
- ✅ Selected text → import only the selection
- 📋 Status: Draft (requires manual review before publishing)

### AI Cleaning
- Sends the selected or full HTML to AI to remove non-article content (ads, menus, related articles, etc.)
- Main article body is preserved unchanged
- Supports DeepSeek (`deepseek-v4-pro` / `deepseek-v4-flash`) and OpenAI (`gpt-4o`)
- Upload and copy buttons are locked during AI processing to ensure the cleaned version is used
- Clip button shows `[AI]` badge after cleaning is complete

### URL Handling
- Automatically strips tracking parameters after `?` (utm_source, fbclid, etc.) — enabled by default
- Whitelist specific parameters to preserve (e.g. `id`, `p`)

### Settings Backup
- Export all settings (including AI API Key) as a JSON backup
- Paste JSON to restore settings with one click

### Interface Language
- Supports Traditional Chinese / English, follows system language by default
- Can be switched manually in settings, takes effect immediately

### Site-specific Extractors

The following sites use custom extractors that keep only the main article body:

- `www.chinatimes.com` — China Times
- `udn.com` — United Daily News
- `facebook.com` — Facebook posts (comments are preserved by default; open individual posts by middle-clicking the timestamp)
- `plurk.com/p/*` — Plurk post pages (backup mode)
- `threads.com` / `threads.net` — Threads single post pages (continuous accumulation, captures author continuations and all replies)

---

## Roadmap

- [x] Threads support (v1.2.0)
