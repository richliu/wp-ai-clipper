# WP Clipper — Browser Extension

將新聞網站文章一鍵匯入 WordPress 草稿，並保留原始來源連結。

## 安裝方式

### Chrome / Edge
1. 開啟 `chrome://extensions/`
2. 右上角開啟「**開發人員模式**」
3. 點「**載入未封裝項目**」→ 選擇本資料夾

### Firefox
1. 開啟 `about:debugging#/runtime/this-firefox`
2. 點「**載入暫時性附加元件**」→ 選擇本資料夾內的 `manifest.json`

---

## 初次設定（只需一次）

### WordPress 連線設定（⚙）
1. 點瀏覽器右上角的 ✂ 圖示
2. 點右上角 **⚙** 進入設定
3. 填入：
   - **WordPress 網址**：`https://yoursite.com`
   - **使用者名稱**：你的 WP 帳號
   - **Application Password**：見下方說明
4. 點「儲存設定」（會自動測試連線）

#### 產生 Application Password
1. 登入 WordPress → 使用者 → 你的個人檔案
2. 捲到最下方「**Application Passwords**」區塊
3. 輸入名稱（例如 `WP Clipper`）→ 點「新增 Application Password」
4. **複製顯示的密碼**（只會顯示一次）
5. 貼到 extension 設定的「Application Password」欄位

### AI 設定（✦）
1. 點右上角 **✦** 進入 AI 設定
2. 選擇供應商：**DeepSeek** 或 **OpenAI / ChatGPT**
3. 填入 API Key
4. Model 名稱（預設：DeepSeek → `deepseek-v4-pro`，OpenAI → `gpt-4o`）
5. 點「測試連線」確認 API 正常
6. 點「儲存 AI 設定」

---

## 使用方式

1. 瀏覽任何新聞網站
2. （可選）選取要擷取的段落文字
3. 點 ✂ 圖示開啟 popup
4. 確認標題、摘要（可修改）
5. （可選）點「**✦ AI 清理內容**」移除無關內容，等按鈕顯示 `[AI]` 即完成
6. 點「**✂ 匯入為草稿**」上傳到 WordPress
7. 點結果連結直接跳到 WP 後台編輯

---

## 功能說明

### 匯入內容
- ✅ 文章標題
- ✅ 正文內容（清理廣告、導覽列後）
- ✅ 精選圖片（og:image）上傳到媒體庫
- ✅ meta description 作為摘要
- ✅ 原始來源 URL 附在文章末尾（可關閉）
- ✅ 選取文字 → 僅匯入選取部分
- 📋 狀態：草稿（需手動審閱後發佈）

### AI 清理
- 送出選取或全文 HTML 給 AI，移除非本文內容（廣告、選單、相關文章等）
- 本文內容原封不動保留
- 支援 DeepSeek（`deepseek-v4-pro` / `deepseek-v4-flash`）及 OpenAI（`gpt-4o`）
- AI 處理中自動鎖定上傳/複製按鈕，確保上傳的是清理後的版本
- 清理完成後 clip 按鈕顯示 `[AI]` 標記

### URL 處理
- 自動移除 URL `?` 後的追蹤參數（utm_source、fbclid 等），預設開啟
- 可設定白名單保留特定參數（如 `id`、`p`）

### 設定備份
- 可將所有設定（含 AI API Key）匯出為 JSON 備份
- 可貼上 JSON 一鍵匯入還原

---

## 後續計劃

- [x] 選取文字只匯入選取部分
- [x] AI 送出時，此時匯入功能應等待 AI 傳回資料再上傳
- [ ] AI 自動依 WordPress 的分類設定分類、tag 和摘要（可設定預設值，也可在按 AI 時修改）
- [ ] Facebook / Threads / Plurk 支援
