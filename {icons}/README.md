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

1. 點瀏覽器右上角的 ✂ 圖示
2. 點右上角 ⚙ 進入設定
3. 填入：
   - **WordPress 網址**：`https://poorman.org`
   - **使用者名稱**：你的 WP 帳號
   - **Application Password**：見下方說明

### 產生 Application Password
1. 登入 WordPress → 使用者 → 你的個人檔案
2. 捲到最下方「**Application Passwords**」區塊
3. 輸入名稱（例如 `WP Clipper`）→ 點「新增 Application Password」
4. **複製顯示的密碼**（只會顯示一次）
5. 貼到 extension 設定的「Application Password」欄位

---

## 使用方式

1. 瀏覽任何新聞網站
2. 點 ✂ 圖示
3. 確認標題、摘要（可修改）
4. 點「匯入為草稿」
5. 點結果連結直接跳到 WP 後台編輯

---

## 匯入內容說明

- ✅ 文章標題
- ✅ 正文內容（清理廣告、導覽列後）
- ✅ 精選圖片（og:image）上傳到媒體庫
- ✅ meta description 作為摘要
- ✅ 原始來源連結附在文章末尾
- 📋 狀態：草稿（需手動審閱後發佈）

---

## 後續計劃

- [ ] Facebook / Threads 支援
- [ ] 自訂分類/標籤
- [ ] 選取文字只匯入選取部分
