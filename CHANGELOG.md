# Changelog

## [1.3.5] - 2026-10-21
### Fixed
- Facebook 留言有作者但沒有內容
  - 根因：`extractFbComment` 取留言內第一個 `[dir="auto"]` 當內文，但 FB 現在作者名、時間也都是 `[dir="auto"]`（包在 `<a>` 內），且作者連結先被 de-link 成純文字，導致內文變空
  - 修復：改取屬於本則留言、不在 `<a>` 內、最外層的 `[dir="auto"]` 作為內文；多段留言的 `<div>` 轉為 `<br>` 保留換行
- Facebook 回覆（巢狀留言）全部遺失
  - 根因：回覆的 aria-label 為「A回覆B的留言」或「X的回覆」，原本只接受「X的留言」
  - 修復：納入回覆並正確解析作者，輸出時在作者前加 `↳` 標示
- 「展開留言」每次都跑滿 20 輪（約 32 秒）
  - 根因：貼文 dialog 背後的動態牆留有隱藏的「查看N則回覆」按鈕，點了沒反應但一直被找到
  - 修復：只點擊可見（有尺寸）的按鈕

---

## [1.3.4] - 2026-10-21
### Fixed
- Facebook 多圖貼文（縮圖顯示「+N」）只抓得到前 5 張，被「+N」蓋住的其餘照片存不下來
  - 根因：FB 最多只渲染 5 格縮圖，其餘照片既不在 DOM 也不在頁面內嵌 JSON（`all_subattachments.nodes` 只帶可見的 5 張），只有打開相片檢視器才會載入
  - 修復：新增 `collectFbOverflowPhotos()`——偵測「+N」縮圖後點開相片檢視器，以「下一張相片 / Next photo」逐張前進，收集 DOM 中沒有的照片原圖；繞回第一張即停止，再用檢視器自己的關閉鈕回到貼文（每次「下一張」都會 push history，不能用 `history.back()`）
  - 結果依頁面 URL 快取，popup 多次重新擷取（展開留言、AI 整理前）不會重跑
  - FB 擷取改為非同步；貼文圖片上限由 8 張提高到 40 張（可在圖片選擇器取消勾選）

---

## [1.3.3] - 2026-06-23
### Fixed
- Facebook 群組 hoisted 貼文（`/groups/<gid>/posts/<pid>/` 與 `?multi_permalinks=<pid>`）抓不到圖
  - 根因：群組 hoisted post 把 photo gallery 渲染成 `[role="article"]` 的 sibling 而非 descendant，原本以 article 為 scope 的 `imgScope.querySelectorAll('img')` 完全掃不到
  - 修復：在 `extractFbPost` 加 post-ID-based 補抓——從 URL 解出 post ID，掃 `a[href*="pcb.<postId>"]`（FB photo collection-by-post 的穩定識別字串）拿圖；完全 additive，不影響原本能正常運作的 permalink / story.php / 個人貼文等場景

---

## [1.3.2] - 2026-06-23
### Fixed
- Facebook 貼文模式無法在 Facebook 社團 `multi_permalinks` 連結啟用
  - 例：`https://www.facebook.com/groups/<gid>/?multi_permalinks=<pid>&hoisted_section_header_type=...`
  - 根因：`FB_POST_RE` 對 groups 只匹配 `groups/<gid>/posts/<pid>` 路徑形式，未涵蓋以 query string 帶 `multi_permalinks=` 的社團貼文連結
  - 修復：`popup.js` 與 `content.js` 的 `FB_POST_RE` 新增 `groups/<gid>/?multi_permalinks=...` 分支；現在這類連結會自動進入 📘 Facebook 貼文模式並使用專屬擷取器

---

## [1.3.1] - 2026-06-12
### Fixed
- Facebook 貼文模式無法在舊式 `facebook.com/story.php?story_fbid=…&id=…` 永久連結頁面啟用
  - 根因：`FB_POST_RE` 僅匹配 `permalink.php`、`/posts/`、`groups/.../posts/`、`share/p/`，遺漏 FB 從早期沿用至今的 `story.php` 端點
  - 修復：`popup.js` 與 `content.js` 的 `FB_POST_RE` 新增 `story.php` 分支；現在開啟 `https://www.facebook.com/story.php?story_fbid=...&id=...` 會自動進入 📘 Facebook 貼文模式並使用專屬擷取器

---

## [1.3.0] - 2026-05-10
### Added
- **圖片選擇器（Image Picker）**：popup 顯示文章中所有圖片的縮圖網格，使用者可逐一勾選要上傳到 WordPress 媒體庫的圖片
  - 主圖（featured）獨立成一格大尺寸顯示，內文圖片以 3 欄網格排列
  - **依檔名去重**：同檔名的圖（不同 CDN、不同 query string、縮圖／原圖路徑差異）視為同一張，只在選擇器顯示一格；縮圖右下角顯示 `×N` 標記合併數；匯入時內容也只保留每組的第一個 `<img>`，避免 picker 顯示 13 但實際送出 23 張的不一致
  - 寬度小於 120px 的圖會自動取消勾選（多半是 icon、間隔圖等）
  - 載入失敗的圖會自動取消勾選並標記
  - 提供「全選 / 全不選 / 去小圖」捷徑（去小圖：寬或高 < 150px、極端比例 1:6 以上、載入失敗者一鍵取消，主圖保留）
  - 顯示每張圖實際尺寸（width × height）
  - 在 AI 清理 / Facebook、Threads、Plurk 重新擷取後自動重建選單
  - 解決過去抓到 30+ 張圖但實際只需要 6 張的場景（例：service.taipower.com.tw 等含側欄推薦圖、相同圖多重 CDN 變體的頁面）
- **Service Worker keepalive port**：popup 開啟時透過 `chrome.runtime.connect({ name: 'wpClipperKeepAlive' })` 建立長連接，避免 MV3 的 30 秒閒置回收造成 `Receiving end does not exist` 錯誤
- **背景 fetch 全面加上超時保護**：圖片下載 20s、媒體查詢 10s、媒體上傳 60s，使用 `AbortController`，避免單一卡住的請求拖死整個流程
- **單次匯入內的媒體查詢快取**：相同 SHA-256 hash 的圖片在同一次匯入中只查 WordPress 一次

### Fixed
- 圖片很多的頁面（37+ 張）匯入失敗：`Could not establish connection. Receiving end does not exist.`
  - 根因：每張圖序列化執行 `wp-json/wp/v2/media?search=` + 下載 + 上傳，總時間超過 30 秒導致 service worker 被回收，sendResponse 無對象可送達
  - 修復：圖片選擇器讓使用者只上傳真正需要的圖；keepalive port 防回收；fetch 超時防卡死

---

## [1.2.0] - 2026-05-01
### Added
- **Threads 貼文支援**：`threads.com` / `threads.net` 單篇貼文頁面（`/@user/post/<id>`）專屬提取器
  - 主貼文 + 作者續串 + 留言全部擷取，依 DOM 順序排列
  - 自動排除「More from author」尾段（datetime 早於主貼文 12 小時以上的舊貼文）
  - 留言中作者本人回覆自動加上「【作者】」前綴
  - 內文與精選圖片自動上傳至 WordPress 媒體庫
- **持續累積式擷取（解決 Threads 虛擬列表）**：Threads 採用 React Native Web 虛擬化，捲出視窗的貼文會被卸載。新增：
  - 模組層級的持久累積器 `window.__wpClipperThreadsSnap`（依 URL 重置，依 `postId` 去重）
  - 被動式 `MutationObserver` + 捲動監聽器：使用者手動捲動瀏覽討論串時，系統會在背景悄悄累積看到的每一則貼文
  - 「載入全部回覆」按鈕改為遞增式捲動（每次 0.7 視窗高度，1.2 秒緩衝），每步都把新貼文寫入累積器，避免一次跳到底部導致中段被卸載
  - `extractThreadsPost()` 直接從累積器取資料 + 一次當前 DOM 補抓
- **媒體庫去重複（debug 加速）**：`background.js` 上傳圖片前先以 SHA-256 雜湊計算 16 字元 slug（`clip-<hash>`），透過 WP REST API `?search=` 比對 title / slug / source_url，命中即重用既有 media，不再重覆上傳

### Fixed
- popup.js 兩處硬編中文 fallback 字串改為 i18n key（`msg_threads_load_fail`、`msg_plurk_expand_fail`）
- Threads 擷取移除原本的 25 輪自動捲動 warmup（Threads 對 `event.isTrusted === false` 的合成捲動事件會限制懶載入觸發，徒勞耗時 30 秒以上）

---

## [1.1.0] - 2026-04-30
### Added
- 內文圖片上傳：匯入時自動將文章內所有 `<img>` 上傳至 WordPress 媒體庫並取代連結（設定面板可關閉，預設開啟）
- 超過 10 張圖片時跳出確認對話框
- Plurk 串備份模式：展開全部回應後一鍵匯入為 WordPress 草稿
  - 正確使用 `.load-older-holder .button.load-older` 觸發 Plurk 懶載入（修復舊版 scroll / API 方案）
  - 三個備份選項：備份影像、備份連結、排除純表情回應
  - 使用 `window.plurk.response_count` 取得真實總則數（透過 main-world script 注入橋接）
- AI 設定新增「批次 Context 上限（tokens）」欄位，用於推算 AI 精選的每批大小
- 介面語言支援完整更新（繁體中文 / English）

### Fixed
- Plurk 回應圖片放入 `<blockquote>` 造成 Gutenberg block 結構損壞 → 改用 `<!-- wp:html -->` 置於 blockquote 之後
- 外部圖片 URL 放入 `<!-- wp:image -->` 導致 WordPress「非預期內容」錯誤 → 改用 `<!-- wp:html -->`
- `extractPlurkPost()` 改為 async，可正確取得 `window.plurk.response_count` 並更新總則數顯示
- 匯入後再次點擊「匯入」按鈕不再送出前次 AI 精選內容（不再 mutate `extractedData.content`）

### Security
- `background.js` 修正兩處 HTML injection 風險：`articleData.title` 和 `articleData.url` 在插入 HTML 前未經 escape，現在統一透過 `escHtml()` 處理

---

## [1.0.14] - 2026-04-29
### Added
- Plurk 單噗頁面（`plurk.com/p/*`）專屬提取器 `extractPlurkPost()`
  - 自動偵測主貼文（`.plurk.bigplurk`）與所有回應（`.response[data-type="response"]`）
  - 回應物件含 `hasUserImg`、`hasEmo`、`hasLink`、`isPureEmo`、`isEmpty` 標記
  - `window.plurk.response_count` 取得總回應數，支援數千噗的超長串
- Popup 新增 Plurk 串備份模式面板（`#plurkModeSection`）：
  - 顯示已載入 / 總回應數
  - **展開全部回應** 按鈕（呼叫 `expandPlurkResponses`，滾動式懶載入）
  - 三個篩選選項：備份影像、備份連結、排除純表情回應
  - **全部備份**：依篩選選項建立 HTML，直接送 WordPress
  - **AI 精選**：分批（每批 300 則）送 LLM，回傳要保留的索引，重建 HTML 後送 WP
  - **AI 整理成文**：分批摘要後合併，請 LLM 整合為完整文章 HTML
  - **自訂 AI**：展開 prompt 輸入框，附加全部回應文字後送 LLM
- i18n 新增所有 Plurk 相關文字（繁體中文 + English）

---

## [1.0.13] - 2026-04-29
### Added
- AI 模型名稱下拉選單（`<datalist>`）：可從主流模型清單選取，也可自行輸入
  - DeepSeek：deepseek-v4-pro、deepseek-v4-flash、deepseek-chat、deepseek-reasoner
  - OpenAI：gpt-4o、gpt-4o-mini、gpt-4.1、gpt-4.1-mini、gpt-4.1-nano、o3、o4-mini
  - 切換供應商時自動更新選單內容

---

## [1.0.12] - 2026-04-29
### Added
- 介面語言支援：繁體中文 / English（i18n）
  - 預設跟隨系統語言（`auto`），可在設定頁手動切換
  - 切換語言即時生效，無需儲存
  - 所有 UI 文字、提示訊息、按鈕文字均已翻譯
  - 設定頁新增「介面語言」下拉選單（值存入 `uiLanguage` storage key）
  - 匯出／匯入 JSON 設定時一併包含語言偏好

---

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
