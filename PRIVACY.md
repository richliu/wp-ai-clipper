# Privacy Policy — WP Clipper

## Data Collection

WP Clipper does **not** collect, transmit, or store any user data on external servers operated by this extension's developer.

All settings (including WordPress credentials and API keys) are stored **locally on your device** using the browser's built-in storage (`browser.storage.local`) and never leave your computer except as described below.

## Data Transmitted by the Extension

### WordPress
When you clip an article, the extension sends the article content, title, and images directly to **your own WordPress site** using the credentials you provide. This connection is entirely between your browser and your own server.

### AI Cleaning (Optional Feature)
The AI cleaning feature is **entirely optional**. You are not required to configure or use it.

If you choose to use it, you must provide your own API key from a third-party AI provider (DeepSeek or OpenAI). When you trigger the AI clean action, the article's HTML content is sent directly from your browser to that provider's API endpoint using your own API key.

- The extension developer has no involvement in this transmission.
- The extension developer does not receive, store, or process any of this data.
- The data handling of the AI provider is governed by their own privacy policy:
  - DeepSeek: https://www.deepseek.com/privacy
  - OpenAI: https://openai.com/policies/privacy-policy

## Permissions

| Permission | Reason |
|---|---|
| `activeTab` | Read the current page's content when you click the extension icon |
| `storage` | Save your settings locally on your device |
| `scripting` | Inject content scripts to extract article content |
| `clipboardWrite` | Allow copying extracted content to clipboard |
| `<all_urls>` | Content extraction must work on any website you browse |

## Contact

If you have any questions, please open an issue on the [GitHub repository](https://github.com/richliu/wp-ai-clipper).
