# 隱私政策 — WP Clipper

## 資料收集

WP Clipper **不會**收集、傳輸或儲存任何用戶資料至本套件開發者的伺服器。

所有設定（包含 WordPress 帳號密碼及 API Key）均**僅儲存在您的本機裝置**，使用瀏覽器內建的儲存機制（`browser.storage.local`），除以下說明情況外，不會離開您的電腦。

## 套件所產生的資料傳輸

### WordPress
當您擷取文章時，套件會將文章內容、標題及圖片直接傳送至**您自己的 WordPress 網站**，使用您提供的帳號憑證進行連線。此連線完全發生在您的瀏覽器與您自己的伺服器之間。

### AI 清理（選用功能）
AI 清理功能為**完全選用**，不需要設定或使用。

若您選擇使用，需自行填入第三方 AI 服務（DeepSeek 或 OpenAI）的 API Key。當您點擊 AI 清理時，文章 HTML 內容會從您的瀏覽器直接傳送至該服務的 API，使用您自己的 API Key。

- 本套件開發者與此傳輸**完全無關**。
- 開發者不會接收、儲存或處理任何相關資料。
- 資料的處理方式依各 AI 服務商的隱私政策為準：
  - DeepSeek：https://www.deepseek.com/privacy
  - OpenAI：https://openai.com/policies/privacy-policy

## 權限說明

| 權限 | 用途 |
|---|---|
| `activeTab` | 點擊套件圖示時讀取當前頁面內容 |
| `storage` | 將設定儲存於本機裝置 |
| `scripting` | 注入內容腳本以擷取文章內容 |
| `clipboardWrite` | 允許將擷取內容複製到剪貼簿 |
| `<all_urls>` | 文章擷取功能需在任意網站上運作 |

## 聯絡方式

如有任何問題，請至 [GitHub 儲存庫](https://github.com/richliu/wp-ai-clipper)開立 Issue。
