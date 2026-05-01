// popup.js

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── i18n ─────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  'zh-TW': {
    label_wp_url: 'WordPress 網址',
    label_wp_user: '使用者名稱',
    hint_app_password: '從 WordPress 後台 → 使用者 → 你的個人檔案 → Application Passwords 產生。<br><a id="wpAdminLink" href="#" target="_blank">直接前往 →</a>',
    label_upload_inline: '上傳內文圖片到媒體庫',
    hint_upload_inline: '將文章內所有圖片上傳至 WordPress 媒體庫並取代連結（超過 10 張時會提示確認）',
    msg_many_images: count => `文章內有 ${count} 張圖片，確定要全部上傳到媒體庫嗎？`,
    label_include_source: '將來源 URL 附加至文章',
    hint_include_source: '啟用時在文章末尾加入來源連結區塊（獨立的 block）',
    label_strip_params: '移除 URL ? 後的參數',
    hint_strip_params: '儲存至 WordPress 前清除追蹤參數（如 utm_source、fbclid 等）',
    label_whitelist: '白名單參數（保留，逗號分隔）',
    hint_whitelist: '填入不想移除的參數名稱，例如：id, p',
    btn_save_settings: '儲存設定',
    label_backup: '設定備份',
    btn_export: '↑ 匯出 JSON',
    btn_import: '↓ 匯入 JSON',
    placeholder_import_json: '將 JSON 內容貼上後按確認匯入',
    btn_import_confirm: '確認匯入',
    btn_cancel: '取消',
    label_language: '介面語言',
    label_ai_provider: 'AI 供應商',
    hint_ai_model: '可從下拉選單選取主流模型，或直接在下方輸入自訂名稱。',
    label_model_select: '選擇模型',
    hint_ai_tokens: '輸出 token 上限（非 context window）。DeepSeek Chat 最大 8192，gpt-4o 最大 16384',
    label_ai_context: '批次 Context 上限（tokens）',
    hint_ai_context: '決定 AI 精選每批塞多少 tokens。deepseek-v4 可設 300000，gpt-4o 可設 128000，小模型建議 16000',
    btn_save_ai: '儲存 AI 設定',
    btn_test_ai: '測試連線',
    title_ai_settings: 'AI 設定',
    title_wp_settings: 'WordPress 設定',
    warn_no_config: '⚠ 尚未設定 WordPress 連線，請先點右上角 ⚙ 設定。',
    badge_fb_mode: '📘 Facebook 貼文模式',
    btn_fb_expand: '↕ 展開所有留言',
    label_use_selection: '僅匯入選取部分',
    label_show_preview: '顯示圖片預覽',
    label_post_title: '文章標題（可修改）',
    placeholder_post_title: '文章標題',
    label_excerpt: '摘要（可選）',
    placeholder_excerpt: '留空則自動使用 meta description',
    btn_clip: '✂ 匯入為草稿',
    btn_copy: '⎘ 複製內容（文字＋圖）',
    btn_copy_text: '⎘ 複製純文字',
    btn_ai_clean: '✦ AI 清理內容',
    msg_loading: '載入中…',
    msg_no_title: '（無法取得標題）',
    msg_cannot_parse: '無法解析頁面',
    msg_cannot_connect: '無法連接頁面（請重新整理後再試）',
    msg_copied: '✓ 已複製',
    msg_copy_fail: '複製失敗：',
    msg_no_ai_key: '請先在 AI 設定（✦）中填入並儲存 API Key',
    msg_ai_processing: 'AI 處理中…',
    msg_ai_empty: 'AI 回傳內容為空',
    msg_ai_done: '✓ AI 清理完成',
    msg_ai_cleaned: '✓ 已清理',
    btn_clip_ai: '✂ 匯入為草稿 [AI]',
    msg_ai_fail: 'AI 失敗：',
    msg_fill_all: '請填寫所有欄位',
    msg_saving: '儲存中…',
    msg_testing_conn: '測試連線中…',
    msg_saved_conn: (name) => `✓ 已儲存，連線為 ${escHtml(name)}`,
    msg_saved_conn_fail: '設定已儲存，但連線測試失敗：',
    msg_no_api_key: '請先填入 API Key',
    msg_testing: '測試中…',
    msg_conn_ok: (model, reply) => `✓ 連線成功（${escHtml(model)}）：${escHtml(reply)}`,
    msg_conn_fail: '✗ 連線失敗：',
    msg_clip_no_config: '請先完成設定',
    msg_importing: '匯入中…',
    msg_imported: (url) => `✓ 已建立草稿！<br><a href="${url}" target="_blank">在 WordPress 編輯 →</a>`,
    msg_import_fail: '匯入失敗：',
    msg_clip_done: '✓ 已匯入',
    msg_missing_fields: '缺少必要欄位（wpUrl, wpUser）',
    msg_settings_imported: '✓ 設定已匯入並儲存',
    msg_fb_expanding: '正在點擊展開按鈕，請稍候…',
    msg_fb_expanded: '✓ 已展開，重新擷取留言…',
    msg_fb_done: (count) => `✓ 擷取完成，共 ${count} 則留言`,
    msg_fb_fail: '失敗：',
    msg_ai_saved: '✓ AI 設定已儲存',
    ai_clean_prompt: '我要擷取這篇文章，但是會同時抓到很多不相干的內容，請將本文以外的不相關內容移除，本文原封不動不修改。只回傳清理後的 HTML 內容，不要加任何解釋或 markdown 標記。\n\n以下是待清理的 HTML 內容：\n\n',
    // Threads
    badge_threads_mode: '🧵 Threads 貼文模式',
    btn_threads_expand: '↕ 載入全部回覆',
    msg_threads_expanding: '正在捲動載入回覆，請稍候…',
    msg_threads_expanded: (n) => `✓ 已載入 ${n} 則，重新擷取中…`,
    msg_threads_load_fail: '載入失敗',
    // Plurk
    badge_plurk_mode: '🐧 Plurk 串備份模式',
    btn_plurk_expand: '↕ 展開全部回應',
    label_plurk_images: '備份影像',
    label_plurk_links: '備份連結',
    label_plurk_no_emoji: '排除純表情回應',
    btn_plurk_full: '全部備份',
    btn_plurk_ai_select: 'AI 精選',
    btn_plurk_ai_rewrite: 'AI 整理成文',
    btn_plurk_ai_custom: '自訂 AI',
    btn_plurk_ai_run: '執行自訂 AI',
    placeholder_plurk_custom: '輸入自訂 AI 提示詞…（回應文字將自動附加於後）',
    msg_plurk_responses: (loaded, total) => loaded >= total ? `已載入全部 ${total} 則回應` : `已載入 ${loaded} / ${total} 則回應（尚有未展開）`,
    msg_plurk_expanding: '正在展開回應，請稍候…',
    msg_plurk_expand_fail: '展開失敗',
    msg_plurk_expanded: (loaded, total) => `✓ 已載入 ${loaded} / ${total} 則`,
    msg_plurk_need_prompt: '請輸入自訂提示詞',
    msg_plurk_ai_select: (batch, total) => `AI 精選中… 第 ${batch}/${total} 批`,
    msg_plurk_ai_select_done: (kept) => `✓ AI 精選完成，保留 ${kept} 則回應`,
    msg_plurk_ai_rewrite: (batch, total) => `AI 整理中… 第 ${batch}/${total} 批`,
    msg_plurk_ai_rewrite_done: '✓ AI 整理完成',
    msg_plurk_ai_custom_run: 'AI 處理中…',
    msg_plurk_ai_custom_done: '✓ 完成',
    msg_plurk_no_ai_key: '請先在 AI 設定（✦）中設定 API Key',
    plurk_ai_select_prompt: (batchStart, batchEnd, total, target) => `以下是 Plurk 串第 ${batchStart}～${batchEnd} 則回應（共 ${total} 則）。\n請從中挑出約 ${target} 則最值得保留的，回傳它們的行號（1-based，逗號分隔）。\n保留：有具體觀點、個人故事或經驗、有用資訊、連結分享、值得讀的討論。\n不保留：一兩個字的招呼（推、+1、讚）、哈哈哈、真的嗎、無內容的閒聊、重複類似的回應。\n嚴格按照 ${target} 則左右，只回傳數字，例如：1,4,9,12\n\n`,
    plurk_ai_rewrite_batch_prompt: (start, end) => `以下是 Plurk 串中第 ${start} 到 ${end} 則回應，請整理出重點與有趣觀點，以繁體中文段落呈現：\n\n`,
    plurk_ai_rewrite_final_prompt: (owner, postText) => `以下是同一 Plurk 串（發文者：${owner}，原文：${postText}）多段摘要，請整合成完整流暢的文章，以 HTML 格式回傳（使用 <p>、<blockquote>、<h3>），不要加解釋：\n\n`,
    plurk_ai_rewrite_single_prompt: (owner, postTime, postText) => `以下是一則 Plurk 串，發文者：${owner}，時間：${postTime}。\n\n原始貼文：\n${postText}\n\n回應：\n`,
    plurk_ai_rewrite_single_suffix: '\n\n請整理成流暢文章，保留重要觀點，儘量不失真。只回傳 HTML（使用 <p>、<blockquote>、<h3>），不要加解釋。',
  },
  'en': {
    label_wp_url: 'WordPress URL',
    label_wp_user: 'Username',
    hint_app_password: 'Generate from WordPress Admin → Users → Your Profile → Application Passwords.<br><a id="wpAdminLink" href="#" target="_blank">Go there →</a>',
    label_upload_inline: 'Upload inline images to media library',
    hint_upload_inline: 'Uploads all images in the article to WordPress media library and replaces URLs (warns if more than 10)',
    msg_many_images: count => `This article contains ${count} images. Upload all of them to the media library?`,
    label_include_source: 'Append source URL to post',
    hint_include_source: 'Adds a source link block at the end of the post when enabled',
    label_strip_params: 'Remove URL query parameters',
    hint_strip_params: 'Strips tracking parameters (utm_source, fbclid, etc.) before saving',
    label_whitelist: 'Whitelist parameters (keep, comma-separated)',
    hint_whitelist: 'Enter parameter names to keep, e.g.: id, p',
    btn_save_settings: 'Save Settings',
    label_backup: 'Settings Backup',
    btn_export: '↑ Export JSON',
    btn_import: '↓ Import JSON',
    placeholder_import_json: 'Paste JSON content then click Confirm',
    btn_import_confirm: 'Confirm Import',
    btn_cancel: 'Cancel',
    label_language: 'Interface Language',
    label_ai_provider: 'AI Provider',
    hint_ai_model: 'Select a model from the dropdown, or type a custom name below.',
    label_model_select: 'Select model',
    hint_ai_tokens: 'Output token limit (not context window). DeepSeek Chat max 8192, gpt-4o max 16384',
    label_ai_context: 'Batch Context Limit (tokens)',
    hint_ai_context: 'How many tokens to pack per AI batch. deepseek-v4: 300000, gpt-4o: 128000, small models: 16000',
    btn_save_ai: 'Save AI Settings',
    btn_test_ai: 'Test Connection',
    title_ai_settings: 'AI Settings',
    title_wp_settings: 'WordPress Settings',
    warn_no_config: '⚠ WordPress not configured. Please click ⚙ in the top-right corner.',
    badge_fb_mode: '📘 Facebook Post Mode',
    btn_fb_expand: '↕ Expand All Comments',
    label_use_selection: 'Import selected text only',
    label_show_preview: 'Show image preview',
    label_post_title: 'Post Title (editable)',
    placeholder_post_title: 'Post title',
    label_excerpt: 'Excerpt (optional)',
    placeholder_excerpt: 'Leave blank to use meta description',
    btn_clip: '✂ Import as Draft',
    btn_copy: '⎘ Copy Content (text + image)',
    btn_copy_text: '⎘ Copy Plain Text',
    btn_ai_clean: '✦ AI Clean Content',
    msg_loading: 'Loading…',
    msg_no_title: '(Unable to get title)',
    msg_cannot_parse: 'Unable to parse page',
    msg_cannot_connect: 'Cannot connect to page (please refresh and try again)',
    msg_copied: '✓ Copied',
    msg_copy_fail: 'Copy failed: ',
    msg_no_ai_key: 'Please enter and save an API Key in AI Settings (✦) first',
    msg_ai_processing: 'AI Processing…',
    msg_ai_empty: 'AI returned empty content',
    msg_ai_done: '✓ AI clean complete',
    msg_ai_cleaned: '✓ Cleaned',
    btn_clip_ai: '✂ Import as Draft [AI]',
    msg_ai_fail: 'AI failed: ',
    msg_fill_all: 'Please fill in all fields',
    msg_saving: 'Saving…',
    msg_testing_conn: 'Testing connection…',
    msg_saved_conn: (name) => `✓ Saved, connected as ${escHtml(name)}`,
    msg_saved_conn_fail: 'Settings saved but connection test failed: ',
    msg_no_api_key: 'Please enter an API Key first',
    msg_testing: 'Testing…',
    msg_conn_ok: (model, reply) => `✓ Connection successful (${escHtml(model)}): ${escHtml(reply)}`,
    msg_conn_fail: '✗ Connection failed: ',
    msg_clip_no_config: 'Please complete settings first',
    msg_importing: 'Importing…',
    msg_imported: (url) => `✓ Draft created!<br><a href="${url}" target="_blank">Edit in WordPress →</a>`,
    msg_import_fail: 'Import failed: ',
    msg_clip_done: '✓ Imported',
    msg_missing_fields: 'Missing required fields (wpUrl, wpUser)',
    msg_settings_imported: '✓ Settings imported and saved',
    msg_fb_expanding: 'Clicking expand buttons, please wait…',
    msg_fb_expanded: '✓ Expanded, re-extracting comments…',
    msg_fb_done: (count) => `✓ Extraction complete, ${count} comments`,
    msg_fb_fail: 'Failed: ',
    msg_ai_saved: '✓ AI settings saved',
    ai_clean_prompt: 'I want to clip this article, but there is a lot of irrelevant content mixed in. Please remove everything that is not part of the main article body, without modifying the main content. Return only the cleaned HTML, without any explanation or markdown markers.\n\nHere is the HTML to clean:\n\n',
    // Threads
    badge_threads_mode: '🧵 Threads Post Mode',
    btn_threads_expand: '↕ Load All Replies',
    msg_threads_expanding: 'Scrolling to load replies, please wait…',
    msg_threads_expanded: (n) => `✓ Loaded ${n} replies, re-extracting…`,
    msg_threads_load_fail: 'Load failed',
    // Plurk
    badge_plurk_mode: '🐧 Plurk Thread Backup Mode',
    btn_plurk_expand: '↕ Expand All Responses',
    label_plurk_images: 'Backup images',
    label_plurk_links: 'Backup links',
    label_plurk_no_emoji: 'Exclude emoji-only responses',
    btn_plurk_full: 'Full Backup',
    btn_plurk_ai_select: 'AI Select',
    btn_plurk_ai_rewrite: 'AI Rewrite',
    btn_plurk_ai_custom: 'Custom AI',
    btn_plurk_ai_run: 'Run Custom AI',
    placeholder_plurk_custom: 'Enter custom AI prompt… (responses will be appended)',
    msg_plurk_responses: (loaded, total) => loaded >= total ? `All ${total} responses loaded` : `Loaded ${loaded} / ${total} responses (more not yet expanded)`,
    msg_plurk_expanding: 'Expanding responses, please wait…',
    msg_plurk_expand_fail: 'Expand failed',
    msg_plurk_expanded: (loaded, total) => `✓ Loaded ${loaded} / ${total}`,
    msg_plurk_need_prompt: 'Please enter a custom prompt',
    msg_plurk_ai_select: (batch, total) => `AI selecting… batch ${batch}/${total}`,
    msg_plurk_ai_select_done: (kept) => `✓ AI selection complete, kept ${kept} responses`,
    msg_plurk_ai_rewrite: (batch, total) => `AI rewriting… batch ${batch}/${total}`,
    msg_plurk_ai_rewrite_done: '✓ AI rewrite complete',
    msg_plurk_ai_custom_run: 'AI processing…',
    msg_plurk_ai_custom_done: '✓ Done',
    msg_plurk_no_ai_key: 'Please configure an API Key in AI Settings (✦) first',
    plurk_ai_select_prompt: (batchStart, batchEnd, total, target) => `Below are responses ${batchStart}–${batchEnd} from a Plurk thread (${total} total).\nPick the best ~${target} responses worth keeping. Return their 1-based line numbers (comma-separated).\nKeep: specific opinions, personal stories, useful info, link shares, meaningful discussion.\nSkip: one-word greetings (+1, lol, really?), content-free chatter, near-duplicate lines.\nAim for exactly ~${target} numbers. Return numbers only, e.g.: 1,4,9,12\n\n`,
    plurk_ai_rewrite_batch_prompt: (start, end) => `Below are responses ${start} to ${end} from a Plurk thread. Summarize the key points and interesting observations in concise paragraphs:\n\n`,
    plurk_ai_rewrite_final_prompt: (owner, postText) => `Below are batch summaries from a single Plurk thread (author: ${owner}, original post: ${postText}). Combine them into one coherent article. Return HTML only (use <p>, <blockquote>, <h3>), no explanation:\n\n`,
    plurk_ai_rewrite_single_prompt: (owner, postTime, postText) => `Below is a Plurk thread by ${owner} posted at ${postTime}.\n\nOriginal post:\n${postText}\n\nResponses:\n`,
    plurk_ai_rewrite_single_suffix: '\n\nPlease rewrite as a coherent article preserving key points. Return HTML only (use <p>, <blockquote>, <h3>), no explanation.',
  }
};

let currentLang = 'zh-TW';

function resolveLanguage(setting) {
  if (setting === 'en') return 'en';
  if (setting === 'zh-TW') return 'zh-TW';
  return (navigator.language || '').startsWith('zh') ? 'zh-TW' : 'en';
}

function t(key, ...args) {
  const T = TRANSLATIONS[currentLang] || TRANSLATIONS['zh-TW'];
  const val = T[key];
  if (typeof val === 'function') return val(...args);
  return val !== undefined ? val : key;
}

// Safely sets element HTML content using DOMParser to avoid direct innerHTML assignment
function safeSetHtml(el, html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  el.replaceChildren(...Array.from(doc.body.childNodes));
}

// Sets a button to show a spinner + translated label without using innerHTML
function setSpinnerBtn(btn, labelKey) {
  btn.textContent = '';
  const sp = document.createElement('span');
  sp.className = 'spinner';
  btn.appendChild(sp);
  btn.appendChild(document.createTextNode(t(labelKey)));
}

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    safeSetHtml(el, t(el.dataset.i18nHtml));
  });
  const btnMap = {
    saveSettings: 'btn_save_settings', exportBtn: 'btn_export',
    importToggleBtn: 'btn_import', importConfirmBtn: 'btn_import_confirm',
    importCancelBtn: 'btn_cancel', saveAiSettings: 'btn_save_ai',
    testAiBtn: 'btn_test_ai', fbExpandBtn: 'btn_fb_expand',
    clipBtn: 'btn_clip', copyBtn: 'btn_copy', copyTextBtn: 'btn_copy_text',
    aiCleanBtn: 'btn_ai_clean',
    plurkExpandBtn: 'btn_plurk_expand'
  };
  for (const [id, key] of Object.entries(btnMap)) {
    const el = document.getElementById(id);
    if (el) el.textContent = t(key);
  }
  document.getElementById('postTitle').placeholder = t('placeholder_post_title');
  document.getElementById('postExcerpt').placeholder = t('placeholder_excerpt');
  document.getElementById('importJson').placeholder = t('placeholder_import_json');
  document.getElementById('settingsToggle').title = t('title_wp_settings');
  document.getElementById('aiSettingsToggle').title = t('title_ai_settings');
  document.getElementById('noConfigWarn').textContent = t('warn_no_config');
  if (!extractedData) {
    document.getElementById('pageTitle').textContent = t('msg_loading');
  }
  // Refresh model preset placeholder text
  const presetSel = document.getElementById('aiModelPreset');
  if (presetSel && presetSel.options.length > 0) {
    presetSel.options[0].text = `— ${t('label_model_select')} —`;
  }
}

// Show version from manifest
const _ver = chrome.runtime.getManifest().version;
document.getElementById('versionBadge').textContent = `v${_ver}`;

let extractedData = null;
let aiCleaned     = false;

// --- DOM refs (WP settings) ---
const settingsToggle      = document.getElementById('settingsToggle');
const settingsView        = document.getElementById('settingsView');
const clipView            = document.getElementById('clipView');
const aiSettingsView      = document.getElementById('aiSettingsView');

const wpUrlInput          = document.getElementById('wpUrl');
const wpUserInput         = document.getElementById('wpUser');
const wpPassInput         = document.getElementById('wpPass');
const uploadInlineImagesChk = document.getElementById('uploadInlineImages');
const includeSourceUrlChk   = document.getElementById('includeSourceUrl');
const stripUrlParamsChk     = document.getElementById('stripUrlParams');
const whitelistField      = document.getElementById('whitelistField');
const urlParamWhitelist   = document.getElementById('urlParamWhitelist');
const saveBtn             = document.getElementById('saveSettings');
const exportBtn           = document.getElementById('exportBtn');
const importToggleBtn     = document.getElementById('importToggleBtn');
const importPaste         = document.getElementById('importPaste');
const importJson          = document.getElementById('importJson');
const importConfirmBtn    = document.getElementById('importConfirmBtn');
const importCancelBtn     = document.getElementById('importCancelBtn');
const settingsSt          = document.getElementById('settingsStatus');

// --- DOM refs (AI settings) ---
const aiSettingsToggle = document.getElementById('aiSettingsToggle');
const aiProviderSel    = document.getElementById('aiProvider');
const aiApiKeyInput    = document.getElementById('aiApiKey');
const aiModelInput     = document.getElementById('aiModel');
const aiMaxTokensInput     = document.getElementById('aiMaxTokens');
const aiContextTokensInput = document.getElementById('aiContextTokens');
const saveAiBtn        = document.getElementById('saveAiSettings');
const testAiBtn        = document.getElementById('testAiBtn');
const aiSettingsSt     = document.getElementById('aiSettingsStatus');

// --- DOM refs (clip) ---
const plurkModeSection     = document.getElementById('plurkModeSection');
const plurkExpandBtn       = document.getElementById('plurkExpandBtn');
const plurkExpandStatus    = document.getElementById('plurkExpandStatus');
const plurkInfo            = document.getElementById('plurkInfo');
const plurkSaveImagesChk   = document.getElementById('plurkSaveImages');
const plurkSaveLinksChk    = document.getElementById('plurkSaveLinks');
const plurkNoEmojiChk      = document.getElementById('plurkNoEmoji');

const fbModeSection  = document.getElementById('fbModeSection');
const fbExpandBtn    = document.getElementById('fbExpandBtn');
const fbExpandStatus = document.getElementById('fbExpandStatus');

const threadsExpandBtn    = document.getElementById('threadsExpandBtn');
const threadsExpandStatus = document.getElementById('threadsExpandStatus');
const useSelectionWrap  = document.getElementById('useSelectionWrap');
const useSelectionChk   = document.getElementById('useSelection');
const showPreviewChk    = document.getElementById('showPreview');
const previewToggleWrap = document.getElementById('previewToggleWrap');
const copyBtn           = document.getElementById('copyBtn');
const copyTextBtn       = document.getElementById('copyTextBtn');
const aiCleanBtn        = document.getElementById('aiCleanBtn');
const aiCleanStatus     = document.getElementById('aiCleanStatus');
const noConfigWarn      = document.getElementById('noConfigWarn');
const pageTitle         = document.getElementById('pageTitle');
const pageUrl           = document.getElementById('pageUrl');
const previewImg        = document.getElementById('previewImg');
const postTitle         = document.getElementById('postTitle');
const postExcerpt       = document.getElementById('postExcerpt');
const clipBtn           = document.getElementById('clipBtn');
const clipStatus        = document.getElementById('clipStatus');

const DEFAULT_MODELS = { deepseek: 'deepseek-v4-pro', openai: 'gpt-4o' };
const MODEL_OPTIONS = {
  deepseek: ['deepseek-v4-pro', 'deepseek-v4-flash', 'deepseek-chat', 'deepseek-reasoner'],
  openai:   ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'o3', 'o4-mini']
};

function updateModelOptions(provider) {
  const sel = document.getElementById('aiModelPreset');
  if (!sel) return;
  const models = MODEL_OPTIONS[provider] || [];
  sel.replaceChildren();
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = `— ${t('label_model_select')} —`;
  sel.appendChild(placeholder);
  models.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m;
    sel.appendChild(opt);
  });
  // Pre-select if current value matches a known model
  const cur = aiModelInput ? aiModelInput.value : '';
  sel.value = models.includes(cur) ? cur : '';
}
const FB_POST_RE      = /^https?:\/\/(www\.|m\.)?facebook\.com\/([\w.%+-]+\/posts\/|permalink\.php|groups\/[^?#/]+\/posts\/|share\/p\/)/;
const PLURK_POST_RE   = /^https?:\/\/(www\.)?plurk\.com\/(p|m\/p)\/([a-zA-Z0-9]+)/;
const THREADS_POST_RE = /^https?:\/\/(www\.)?(threads\.com|threads\.net)\/@([\w.]+)\/post\/([A-Za-z0-9_-]+)/;

// --- Init ---
// Send a message to the active tab's content script. If the script hasn't been
// injected yet (e.g. the tab was opened before the extension loaded/updated),
// inject content.js on demand and retry once. Restricted pages (chrome://,
// the web store, etc.) will still throw — caller handles that.
async function sendToContent(tabId, msg) {
  try {
    return await chrome.tabs.sendMessage(tabId, msg);
  } catch (e) {
    const m = e && e.message || '';
    if (!/Receiving end does not exist|Could not establish connection/i.test(m)) throw e;
    await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] });
    return await chrome.tabs.sendMessage(tabId, msg);
  }
}

async function init() {
  const cfg   = await loadConfig();
  const aiCfg = await loadAiConfig();

  // Apply language before rendering
  const langSetting = cfg.uiLanguage || 'auto';
  currentLang = resolveLanguage(langSetting);
  const uiLangSel = document.getElementById('uiLanguage');
  if (uiLangSel) uiLangSel.value = langSetting;
  applyTranslations();

  // WP fields
  if (cfg.wpUrl) {
    wpUrlInput.value  = cfg.wpUrl;
    wpUserInput.value = cfg.wpUser || '';
  }
  const wpAdminLink = document.getElementById('wpAdminLink');
  if (wpAdminLink) {
    const base = cfg.wpUrl || 'https://example.com';
    wpAdminLink.href = `${base}/wp-admin/profile.php`;
  }
  uploadInlineImagesChk.checked = cfg.uploadInlineImages !== false;
  includeSourceUrlChk.checked   = cfg.includeSourceUrl  !== false;
  stripUrlParamsChk.checked    = cfg.stripUrlParams !== false;
  urlParamWhitelist.value      = cfg.urlParamWhitelist || '';
  whitelistField.style.display = stripUrlParamsChk.checked ? '' : 'none';

  // AI fields
  aiProviderSel.value    = aiCfg.aiProvider || 'deepseek';
  aiApiKeyInput.value    = aiCfg.aiApiKey   || '';
  aiModelInput.value     = aiCfg.aiModel    || DEFAULT_MODELS[aiProviderSel.value];
  aiMaxTokensInput.value     = aiCfg.aiMaxTokens     || 8192;
  aiContextTokensInput.value = aiCfg.aiContextTokens || 32000;
  updateModelOptions(aiProviderSel.value);

  const hasConfig = cfg.wpUrl && cfg.wpUser && cfg.wpPass;
  if (!hasConfig) {
    noConfigWarn.style.display = 'block';
    activateView(settingsView);
  }

  // Extract content from current tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    pageUrl.textContent = tab.url || '';

    if (FB_POST_RE.test(tab.url || '')) {
      fbModeSection.style.display = 'block';
    }
    if (PLURK_POST_RE.test(tab.url || '')) {
      plurkModeSection.style.display = 'block';
    }
    if (THREADS_POST_RE.test(tab.url || '')) {
      const threadsBadge = document.getElementById('threadsModeSection');
      if (threadsBadge) threadsBadge.style.display = 'block';
    }

    const resp = await sendToContent(tab.id, { action: 'extractContent' });
    if (resp && resp.success) {
      extractedData = resp.data;
      pageTitle.textContent = extractedData.title || t('msg_no_title');
      postTitle.value   = extractedData.title   || '';
      postExcerpt.value = extractedData.excerpt || '';

      if (extractedData.platform === 'plurk' && extractedData.plurkData) {
        const pd = extractedData.plurkData;
        plurkInfo.textContent = t('msg_plurk_responses', pd.loadedCount, pd.responseCount);
      }

      if (extractedData.hasSelection) {
        useSelectionWrap.style.display = 'flex';
      }

      if (extractedData.featuredImageUrl) {
        previewImg.src = extractedData.featuredImageUrl;
        previewImg.classList.add('visible');
        previewToggleWrap.style.display = 'flex';
      }

      copyBtn.disabled     = false;
      copyTextBtn.disabled = false;
      if (hasConfig)           clipBtn.disabled    = false;
      if (aiCfg.aiApiKey)      aiCleanBtn.disabled = false;
    } else {
      pageTitle.textContent = tab.title || t('msg_cannot_parse');
    }
  } catch (e) {
    pageTitle.textContent = t('msg_cannot_connect');
    console.error('Content script error:', e);
  }
}

// --- View management ---
function activateView(targetView) {
  settingsView.classList.remove('active');
  aiSettingsView.classList.remove('active');
  clipView.classList.remove('active');
  targetView.classList.add('active');
  settingsToggle.textContent   = targetView === settingsView   ? '✕' : '⚙';
  aiSettingsToggle.textContent = targetView === aiSettingsView ? '✕' : '✦';
}

settingsToggle.addEventListener('click', () => {
  activateView(settingsView.classList.contains('active') ? clipView : settingsView);
});

aiSettingsToggle.addEventListener('click', () => {
  activateView(aiSettingsView.classList.contains('active') ? clipView : aiSettingsView);
});

// --- Language change (live preview) ---
document.getElementById('uiLanguage').addEventListener('change', () => {
  currentLang = resolveLanguage(document.getElementById('uiLanguage').value);
  applyTranslations();
  // Re-set wpAdminLink href after innerHTML was replaced
  const base = wpUrlInput.value.trim() || 'https://example.com';
  const link = document.getElementById('wpAdminLink');
  if (link) link.href = `${base}/wp-admin/profile.php`;
});

// --- Strip params toggle ---
stripUrlParamsChk.addEventListener('change', () => {
  whitelistField.style.display = stripUrlParamsChk.checked ? '' : 'none';
});

// --- Preview toggle ---
showPreviewChk.addEventListener('change', () => {
  previewImg.classList.toggle('visible', showPreviewChk.checked);
});

// --- Fetch external image → base64 data URL (for Word-compatible clipboard) ---
async function fetchAsDataUrl(url) {
  const resp = await fetch(url);
  const blob = await resp.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Replace all <img src="http..."> in HTML string with embedded data URLs
async function embedImages(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const imgs = Array.from(doc.querySelectorAll('img[src]')).filter(img => img.src.startsWith('http'));
  await Promise.all(imgs.map(async img => {
    try { img.src = await fetchAsDataUrl(img.src); } catch { /* keep original */ }
  }));
  return doc.body.innerHTML;
}

// --- Copy content ---
copyBtn.addEventListener('click', async () => {
  if (!extractedData) return;
  const title   = postTitle.value.trim() || extractedData.title;
  const imgHtml = extractedData.featuredImageUrl
    ? `<figure><img src="${extractedData.featuredImageUrl}" alt="${title}" style="max-width:100%;height:auto;" /></figure>\n`
    : '';
  const rawHtml = `<h2>${title}</h2>\n${imgHtml}${effectiveContent()}`;
  try {
    const html = await embedImages(rawHtml);
    await navigator.clipboard.write([
      new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }) })
    ]);
    const orig = copyBtn.textContent;
    copyBtn.textContent = t('msg_copied');
    setTimeout(() => { copyBtn.textContent = orig; }, 2000);
  } catch (e) {
    showStatus(clipStatus, 'error', `${t('msg_copy_fail')}${escHtml(e.message)}`);
  }
});

// --- Copy text only ---
copyTextBtn.addEventListener('click', async () => {
  if (!extractedData) return;
  const title = postTitle.value.trim() || extractedData.title;
  const tmpDoc = new DOMParser().parseFromString(effectiveContent(), 'text/html');
  const body = tmpDoc.body.innerText.trim().replace(/[ \t]*\n[ \t]*\n([ \t]*\n)+/g, '\n\n');
  const plainText = `${title}\n\n${body}`;
  try {
    await navigator.clipboard.writeText(plainText);
    const orig = copyTextBtn.textContent;
    copyTextBtn.textContent = t('msg_copied');
    setTimeout(() => { copyTextBtn.textContent = orig; }, 2000);
  } catch (e) {
    showStatus(clipStatus, 'error', `${t('msg_copy_fail')}${escHtml(e.message)}`);
  }
});

// --- Shared AI API call helper ---
async function callAiApi({ provider, apiKey, model, maxTokens, messages }) {
  const endpoint = provider === 'openai'
    ? 'https://api.openai.com/v1/chat/completions'
    : 'https://api.deepseek.com/v1/chat/completions';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({ model, max_tokens: maxTokens, messages })
  });

  if (!res.ok) {
    const errJson = await res.json().catch(() => ({}));
    throw new Error(errJson.error?.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// --- Facebook: expand comments ---
fbExpandBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  fbExpandBtn.disabled = true;
  setSpinnerBtn(fbExpandBtn, 'msg_fb_expanding');
  showStatus(fbExpandStatus, 'success', t('msg_fb_expanding'));

  try {
    const resp = await sendToContent(tab.id, { action: 'expandFbComments' });

    if (!resp?.success) throw new Error(resp?.error || t('msg_fb_fail'));

    showStatus(fbExpandStatus, 'success', t('msg_fb_expanded'));

    // Re-extract after expansion
    const extracted = await sendToContent(tab.id, { action: 'extractContent' });
    if (extracted?.success) {
      extractedData = extracted.data;
      postTitle.value   = extractedData.title   || postTitle.value;
      postExcerpt.value = extractedData.excerpt  || postExcerpt.value;
      const count = extractedData.comments?.length ?? 0;
      showStatus(fbExpandStatus, 'success', t('msg_fb_done', count));
    }
  } catch (e) {
    showStatus(fbExpandStatus, 'error', `${t('msg_fb_fail')}${escHtml(e.message)}`);
  } finally {
    fbExpandBtn.disabled = false;
    fbExpandBtn.textContent = t('btn_fb_expand');
  }
});

// ── Plurk helpers ─────────────────────────────────────────────────────────────

function htmlEsc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildPlurkHTML(plurkData, responses, opts = {}) {
  const { saveImages = true, saveLinks = true, noEmoji = true } = opts;
  const { owner, postTime, postText, postImgs, loadedCount, responseCount } = plurkData;

  const filtered = responses.filter(r => {
    if (r.isEmpty) return false;
    if (noEmoji && r.isPureEmo) return false;
    return true;
  });

  let html = `<p><strong>${htmlEsc(owner)}</strong>`;
  if (postTime) html += ` · <small>${htmlEsc(postTime)}</small>`;
  html += '</p>\n';

  postText.split('\n').filter(l => l.trim()).forEach(line => {
    html += `<p>${htmlEsc(line)}</p>\n`;
  });

  if (saveImages) {
    postImgs.forEach(({ src, alt }) => {
      html += `<figure><img src="${htmlEsc(src)}" alt="${htmlEsc(alt)}" style="max-width:100%;height:auto;"/></figure>\n`;
    });
  }

  if (filtered.length > 0) {
    const countStr = filtered.length < loadedCount
      ? `${filtered.length} / ${loadedCount}${loadedCount < responseCount ? ' / ' + responseCount : ''}`
      : `${loadedCount}${loadedCount < responseCount ? ' / ' + responseCount : ''}`;
    html += '\n<!-- wp:separator -->\n<hr class="wp-block-separator has-alpha-channel-opacity"/>\n<!-- /wp:separator -->\n';
    html += `\n<!-- wp:heading {"level":3} -->\n<h3>回應（${countStr}）</h3>\n<!-- /wp:heading -->\n`;

    filtered.forEach(({ author, time, text, imgs, links }) => {
      html += '<!-- wp:quote -->\n<blockquote class="wp-block-quote">\n';
      html += `<p><strong>${htmlEsc(author)}</strong>`;
      if (time) html += ` · <small>${htmlEsc(time)}</small>`;
      html += '</p>\n';
      text.split('\n').filter(l => l.trim()).forEach(line => {
        html += `<p>${htmlEsc(line)}</p>\n`;
      });
      if (saveLinks) {
        links.forEach(({ href, text: lt }) => {
          html += `<p><a href="${htmlEsc(href)}" target="_blank" rel="noopener noreferrer">${htmlEsc(lt)}</a></p>\n`;
        });
      }
      html += '</blockquote>\n<!-- /wp:quote -->\n';
      // Images must be outside blockquote — Gutenberg wp:quote only allows <p> children
      if (saveImages) {
        imgs.forEach(({ src, alt }) => {
          html += `<!-- wp:html -->\n<figure><img src="${htmlEsc(src)}" alt="${htmlEsc(alt)}" style="max-width:100%;height:auto;"/></figure>\n<!-- /wp:html -->\n`;
        });
      }
    });
  }

  return html;
}

// AI精選: send responses in batches, LLM returns indices of interesting ones
async function plurkAiBatchSelect(responses, aiCfg, statusCb) {
  const { aiProvider: provider, aiApiKey: apiKey, aiModel: model, aiContextTokens } = aiCfg;

  // Pre-filter: skip responses too short to be meaningful (≤10 chars of text,
  // no link, no image). Keeps tokens down and reduces noise in AI input.
  const MIN_TEXT = 10;
  const filtered = responses.filter(r =>
    r.text.trim().length >= MIN_TEXT || r.hasLink || r.imgs?.length > 0
  );

  // Derive batch size from context window estimate.
  // Each response line ≈ 100 tokens (conservative). Reserve 500 for prompt/reply overhead.
  const contextLimit = Math.max(4000, parseInt(aiContextTokens) || 32000);
  const batchSize    = Math.min(500, Math.max(20, Math.floor((contextLimit - 500) / 100)));

  const kept = [];
  const totalBatches = Math.ceil(filtered.length / batchSize);

  for (let bi = 0; bi < totalBatches; bi++) {
    const batch = filtered.slice(bi * batchSize, (bi + 1) * batchSize);
    const batchStart = bi * batchSize + 1;
    const batchEnd   = bi * batchSize + batch.length;
    statusCb(t('msg_plurk_ai_select', bi + 1, totalBatches));

    // Use 1-based line numbers so the LLM doesn't need to shift indices
    const lines = batch.map((r, idx) => {
      const flags = [r.hasUserImg ? '[IMG]' : '', r.hasLink ? '[LINK]' : ''].filter(Boolean).join('');
      return `${idx + 1}|${flags ? flags + ' ' : ''}${r.author}: ${r.text.replace(/\n/g, ' ').slice(0, 150)}`;
    }).join('\n');

    // Target: keep ~30% of each batch
    const target = Math.max(1, Math.round(batch.length * 0.3));
    const prompt = t('plurk_ai_select_prompt', batchStart, batchEnd, batch.length, target) + lines;
    const json = await callAiApi({
      provider, apiKey, model, maxTokens: 2048,
      messages: [{ role: 'user', content: prompt }]
    });

    const reply = json.choices?.[0]?.message?.content?.trim() || '';
    // Parse 1-based indices to keep
    reply.split(/[\s,，]+/).forEach(s => {
      const n = parseInt(s, 10);
      if (!isNaN(n) && n >= 1 && n <= batch.length) kept.push(batch[n - 1]);
    });
  }

  return kept;
}

// AI整理成文: summarize thread, with batching for large threads
async function plurkAiBatchRewrite(plurkData, responses, aiCfg, statusCb, batchSize = 200) {
  const { aiProvider: provider, aiApiKey: apiKey, aiModel: model,
          aiMaxTokens: maxTokens = 8192 } = aiCfg;

  if (responses.length <= batchSize) {
    statusCb(t('msg_plurk_ai_rewrite', 1, 1));
    const text = responses.map(r => `${r.author}: ${r.text}`).join('\n');
    const prompt = t('plurk_ai_rewrite_single_prompt', plurkData.owner, plurkData.postTime, plurkData.postText)
      + text + t('plurk_ai_rewrite_single_suffix');
    const json = await callAiApi({
      provider, apiKey, model, maxTokens: parseInt(maxTokens) || 8192,
      messages: [{ role: 'user', content: prompt }]
    });
    let html = json.choices?.[0]?.message?.content?.trim() || '';
    return html.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
  }

  // Large thread: summarize each batch, then combine
  const totalBatches = Math.ceil(responses.length / batchSize);
  const summaries = [];

  for (let bi = 0; bi < totalBatches; bi++) {
    const batch = responses.slice(bi * batchSize, (bi + 1) * batchSize);
    statusCb(t('msg_plurk_ai_rewrite', bi + 1, totalBatches));
    const text = batch.map(r => `${r.author}: ${r.text}`).join('\n');
    const prompt = t('plurk_ai_rewrite_batch_prompt', bi * batchSize + 1, bi * batchSize + batch.length) + text;
    const json = await callAiApi({
      provider, apiKey, model, maxTokens: Math.min(2048, parseInt(maxTokens) || 2048),
      messages: [{ role: 'user', content: prompt }]
    });
    summaries.push(json.choices?.[0]?.message?.content?.trim() || '');
  }

  // Combine summaries into final article
  statusCb(t('msg_plurk_ai_rewrite', totalBatches + 1, totalBatches + 1));
  const combined = summaries.join('\n\n');
  const finalPrompt = t('plurk_ai_rewrite_final_prompt', plurkData.owner, plurkData.postText) + combined;
  const json = await callAiApi({
    provider, apiKey, model, maxTokens: parseInt(maxTokens) || 8192,
    messages: [{ role: 'user', content: finalPrompt }]
  });
  let html = json.choices?.[0]?.message?.content?.trim() || '';
  return html.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
}

function plurkOpts() {
  return {
    saveImages: plurkSaveImagesChk.checked,
    saveLinks:  plurkSaveLinksChk.checked,
    noEmoji:    plurkNoEmojiChk.checked
  };
}


// --- Threads: load all replies ---
threadsExpandBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  threadsExpandBtn.disabled = true;
  setSpinnerBtn(threadsExpandBtn, 'msg_threads_expanding');
  showStatus(threadsExpandStatus, 'success', t('msg_threads_expanding'));

  try {
    const resp = await sendToContent(tab.id, { action: 'expandThreadsReplies' });
    if (!resp?.success) throw new Error(resp?.error || '');

    showStatus(threadsExpandStatus, 'success', t('msg_threads_expanded', resp.count));

    const extracted = await sendToContent(tab.id, { action: 'extractContent' });
    if (extracted?.success) {
      extractedData = extracted.data;
      postTitle.value   = extractedData.title   || postTitle.value;
      postExcerpt.value = extractedData.excerpt || postExcerpt.value;
      pageTitle.textContent = extractedData.title || t('msg_no_title');
    }
  } catch (e) {
    showStatus(threadsExpandStatus, 'error', escHtml(e.message || t('msg_threads_load_fail')));
  } finally {
    threadsExpandBtn.disabled = false;
    threadsExpandBtn.textContent = t('btn_threads_expand');
  }
});

// --- Plurk: expand responses ---
plurkExpandBtn.addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  plurkExpandBtn.disabled = true;
  setSpinnerBtn(plurkExpandBtn, 'msg_plurk_expanding');
  showStatus(plurkExpandStatus, 'success', t('msg_plurk_expanding'));

  try {
    const resp = await sendToContent(tab.id, { action: 'expandPlurkResponses' });
    if (!resp?.success) throw new Error(resp?.error || '');

    // Re-extract
    const extracted = await sendToContent(tab.id, { action: 'extractContent' });
    if (extracted?.success) {
      extractedData = extracted.data;
      postTitle.value   = extractedData.title   || postTitle.value;
      postExcerpt.value = extractedData.excerpt || postExcerpt.value;
      const pd = extractedData.plurkData;
      plurkInfo.textContent = t('msg_plurk_responses', pd.loadedCount, pd.responseCount);
      showStatus(plurkExpandStatus, 'success',
        t('msg_plurk_expanded', pd.loadedCount, pd.responseCount));
    }
  } catch (e) {
    showStatus(plurkExpandStatus, 'error', escHtml(e.message || t('msg_plurk_expand_fail')));
  } finally {
    plurkExpandBtn.disabled = false;
    plurkExpandBtn.textContent = t('btn_plurk_expand');
  }
});


// --- AI provider change: update default model and preset select ---
aiProviderSel.addEventListener('change', () => {
  const def = DEFAULT_MODELS[aiProviderSel.value];
  aiModelInput.placeholder = def;
  if (!aiModelInput.value || Object.values(DEFAULT_MODELS).includes(aiModelInput.value)) {
    aiModelInput.value = def;
  }
  updateModelOptions(aiProviderSel.value);
});

// --- Model preset select: fill text input ---
document.getElementById('aiModelPreset').addEventListener('change', () => {
  const val = document.getElementById('aiModelPreset').value;
  if (val) aiModelInput.value = val;
});

// --- AI Clean ---
aiCleanBtn.addEventListener('click', async () => {
  if (!extractedData) return;
  const aiCfg = await loadAiConfig();
  if (!aiCfg.aiApiKey) {
    showStatus(aiCleanStatus, 'error', t('msg_no_ai_key'));
    return;
  }

  const provider  = aiCfg.aiProvider || 'deepseek';
  const apiKey    = aiCfg.aiApiKey;
  const model     = aiCfg.aiModel || DEFAULT_MODELS[provider];
  const maxTokens = parseInt(aiCfg.aiMaxTokens) || 8192;

  aiCleanBtn.disabled  = true;
  setSpinnerBtn(aiCleanBtn, 'msg_ai_processing');
  clipBtn.disabled     = true;
  copyBtn.disabled     = true;
  copyTextBtn.disabled = true;
  clearStatus(aiCleanStatus);

  const prompt = t('ai_clean_prompt') + effectiveContent();

  try {
    const json = await callAiApi({
      provider, apiKey, model, maxTokens,
      messages: [{ role: 'user', content: prompt }]
    });

    let cleaned = json.choices?.[0]?.message?.content?.trim() || '';
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
    if (!cleaned) throw new Error(t('msg_ai_empty'));

    if (useSelectionChk.checked && extractedData.selectedHtml) {
      extractedData.selectedHtml = cleaned;
    } else {
      extractedData.content = cleaned;
    }
    aiCleaned = true;
    showStatus(aiCleanStatus, 'success', t('msg_ai_done'));
    aiCleanBtn.textContent = t('msg_ai_cleaned');
    clipBtn.textContent    = t('btn_clip_ai');
    clipBtn.disabled     = false;
    copyBtn.disabled     = false;
    copyTextBtn.disabled = false;
    setTimeout(() => {
      aiCleanBtn.textContent = t('btn_ai_clean');
      aiCleanBtn.disabled    = false;
    }, 3000);
  } catch (e) {
    showStatus(aiCleanStatus, 'error', `${t('msg_ai_fail')}${escHtml(e.message)}`);
    aiCleanBtn.disabled  = false;
    aiCleanBtn.textContent = t('btn_ai_clean');
    clipBtn.disabled     = false;
    copyBtn.disabled     = false;
    copyTextBtn.disabled = false;
  }
});

// --- Save WP settings ---
saveBtn.addEventListener('click', async () => {
  const url  = wpUrlInput.value.trim().replace(/\/$/, '');
  const user = wpUserInput.value.trim();
  const pass = wpPassInput.value.trim();

  if (!url || !user || !pass) {
    showStatus(settingsSt, 'error', t('msg_fill_all'));
    return;
  }

  saveBtn.textContent = t('msg_saving');
  saveBtn.disabled = true;

  // Save first, then test connection
  await saveConfig({
    wpUrl:             url,
    wpUser:            user,
    wpPass:            pass,
    uploadInlineImages: uploadInlineImagesChk.checked,
    includeSourceUrl:   includeSourceUrlChk.checked,
    stripUrlParams:     stripUrlParamsChk.checked,
    urlParamWhitelist: urlParamWhitelist.value.trim(),
    uiLanguage:        document.getElementById('uiLanguage').value
  });
  const wpAdminLink = document.getElementById('wpAdminLink');
  if (wpAdminLink) wpAdminLink.href = `${url}/wp-admin/profile.php`;

  saveBtn.textContent = t('msg_testing_conn');
  try {
    const auth = btoa(`${user}:${pass}`);
    const res = await fetch(`${url}/wp-json/wp/v2/users/me`, {
      headers: { 'Authorization': `Basic ${auth}` },
      credentials: 'omit'
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const me = await res.json();
    showStatus(settingsSt, 'success', t('msg_saved_conn', me.name));
    noConfigWarn.style.display = 'none';
    if (extractedData) clipBtn.disabled = false;
  } catch (e) {
    showStatus(settingsSt, 'warn', `${t('msg_saved_conn_fail')}${escHtml(e.message)}`);
  } finally {
    saveBtn.textContent = t('btn_save_settings');
    saveBtn.disabled = false;
  }
});

// --- Save AI settings ---
saveAiBtn.addEventListener('click', async () => {
  const provider  = aiProviderSel.value;
  const apiKey    = aiApiKeyInput.value.trim();
  const model     = aiModelInput.value.trim() || DEFAULT_MODELS[provider];
  const maxTokens     = parseInt(aiMaxTokensInput.value)     || 8192;
  const contextTokens = parseInt(aiContextTokensInput.value) || 32000;

  await saveAiConfig({ aiProvider: provider, aiApiKey: apiKey, aiModel: model, aiMaxTokens: maxTokens, aiContextTokens: contextTokens });
  showStatus(aiSettingsSt, 'success', t('msg_ai_saved'));
  if (extractedData && apiKey) aiCleanBtn.disabled = false;
});

// --- Test AI connection ---
testAiBtn.addEventListener('click', async () => {
  const provider = aiProviderSel.value;
  const apiKey   = aiApiKeyInput.value.trim();
  const model    = aiModelInput.value.trim() || DEFAULT_MODELS[provider];

  if (!apiKey) {
    showStatus(aiSettingsSt, 'error', t('msg_no_api_key'));
    return;
  }

  testAiBtn.disabled = true;
  setSpinnerBtn(testAiBtn, 'msg_testing');
  clearStatus(aiSettingsSt);

  try {
    const json = await callAiApi({
      provider, apiKey, model, maxTokens: 16,
      messages: [{ role: 'user', content: 'hi' }]
    });
    const reply = json.choices?.[0]?.message?.content?.trim() || '(ok)';
    showStatus(aiSettingsSt, 'success', t('msg_conn_ok', model, reply));
  } catch (e) {
    showStatus(aiSettingsSt, 'error', `${t('msg_conn_fail')}${escHtml(e.message)}`);
  } finally {
    testAiBtn.disabled = false;
    testAiBtn.textContent = t('btn_test_ai');
  }
});

// --- Clip button ---
clipBtn.addEventListener('click', async () => {
  if (!extractedData) return;

  const cfg = await loadConfig();
  if (!cfg.wpUrl || !cfg.wpUser || !cfg.wpPass) {
    showStatus(clipStatus, 'error', t('msg_clip_no_config'));
    return;
  }

  const content = effectiveContent();

  // Warn if uploading inline images and count is high
  if (cfg.uploadInlineImages !== false) {
    const imgCount = (content.match(/<img\b/gi) || []).length;
    if (imgCount > 10) {
      if (!window.confirm(t('msg_many_images', imgCount))) return;
    }
  }

  const sendData = Object.assign({}, extractedData, {
    title:   postTitle.value.trim() || extractedData.title,
    excerpt: postExcerpt.value.trim(),
    content
  });

  clipBtn.disabled = true;
  setSpinnerBtn(clipBtn, 'msg_importing');
  clearStatus(clipStatus);

  try {
    const result = await chrome.runtime.sendMessage({
      action: 'sendToWordPress',
      payload: {
        wpUrl:              cfg.wpUrl,
        username:           cfg.wpUser,
        appPassword:        cfg.wpPass,
        uploadInlineImages: cfg.uploadInlineImages !== false,
        includeSourceUrl:   cfg.includeSourceUrl  !== false,
        stripUrlParams:     cfg.stripUrlParams    !== false,
        urlParamWhitelist:  cfg.urlParamWhitelist || '',
        articleData:        sendData
      }
    });

    if (result.success) {
      showStatus(clipStatus, 'success', t('msg_imported', result.result.editUrl));
      aiCleaned = false;
      clipBtn.textContent = t('msg_clip_done');
    } else {
      throw new Error(result.error);
    }
  } catch (e) {
    showStatus(clipStatus, 'error', `${t('msg_import_fail')}${escHtml(e.message)}`);
    clipBtn.disabled  = false;
    clipBtn.textContent = aiCleaned ? t('btn_clip_ai') : t('btn_clip');
  }
});

// --- Export settings as JSON ---
exportBtn.addEventListener('click', async () => {
  const cfg   = await loadConfig();
  const aiCfg = await loadAiConfig();
  const exportData = {
    wpUrl:             cfg.wpUrl             || '',
    wpUser:            cfg.wpUser            || '',
    wpPass:            cfg.wpPass            || '',
    uploadInlineImages: cfg.uploadInlineImages !== false,
    includeSourceUrl:   cfg.includeSourceUrl  !== false,
    stripUrlParams:     cfg.stripUrlParams    !== false,
    urlParamWhitelist:  cfg.urlParamWhitelist || '',
    uiLanguage:         cfg.uiLanguage        || 'auto',
    aiProvider:        aiCfg.aiProvider  || 'deepseek',
    aiApiKey:          aiCfg.aiApiKey    || '',
    aiModel:           aiCfg.aiModel     || '',
    aiMaxTokens:       aiCfg.aiMaxTokens     || 8192,
    aiContextTokens:   aiCfg.aiContextTokens || 32000
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'wp-clipper-settings.json';
  a.click();
  URL.revokeObjectURL(url);
});

// --- Import settings (paste JSON) ---
importToggleBtn.addEventListener('click', () => {
  importPaste.classList.toggle('visible');
  importJson.value = '';
  if (importPaste.classList.contains('visible')) importJson.focus();
});

importCancelBtn.addEventListener('click', () => {
  importPaste.classList.remove('visible');
  importJson.value = '';
});

importConfirmBtn.addEventListener('click', async () => {
  const text = importJson.value.trim();
  if (!text) return;
  try {
    const data = JSON.parse(text);
    if (!data.wpUrl || !data.wpUser) throw new Error(t('msg_missing_fields'));

    const cleaned = {
      wpUrl:             (data.wpUrl || '').trim().replace(/\/$/, ''),
      wpUser:            (data.wpUser || '').trim(),
      wpPass:            (data.wpPass || '').trim(),
      uploadInlineImages: data.uploadInlineImages !== false,
      includeSourceUrl:   data.includeSourceUrl  !== false,
      stripUrlParams:     data.stripUrlParams    !== false,
      urlParamWhitelist:  (data.urlParamWhitelist || '').trim(),
      uiLanguage:         data.uiLanguage || 'auto'
    };
    await saveConfig(cleaned);

    // AI settings (optional in JSON)
    if (data.aiApiKey || data.aiProvider) {
      const aiImport = {
        aiProvider:  data.aiProvider  || 'deepseek',
        aiApiKey:    (data.aiApiKey   || '').trim(),
        aiModel:     (data.aiModel    || '').trim(),
        aiMaxTokens:     data.aiMaxTokens     || 8192,
        aiContextTokens: data.aiContextTokens || 32000
      };
      await saveAiConfig(aiImport);
      aiProviderSel.value        = aiImport.aiProvider;
      aiApiKeyInput.value        = aiImport.aiApiKey;
      aiModelInput.value         = aiImport.aiModel || DEFAULT_MODELS[aiImport.aiProvider];
      aiMaxTokensInput.value     = aiImport.aiMaxTokens;
      aiContextTokensInput.value = aiImport.aiContextTokens;
    }

    wpUrlInput.value             = cleaned.wpUrl;
    wpUserInput.value            = cleaned.wpUser;
    wpPassInput.value            = cleaned.wpPass;
    uploadInlineImagesChk.checked = cleaned.uploadInlineImages;
    includeSourceUrlChk.checked   = cleaned.includeSourceUrl;
    stripUrlParamsChk.checked    = cleaned.stripUrlParams;
    urlParamWhitelist.value      = cleaned.urlParamWhitelist;
    whitelistField.style.display = cleaned.stripUrlParams ? '' : 'none';

    // Apply imported language
    currentLang = resolveLanguage(cleaned.uiLanguage);
    const uiLangSel = document.getElementById('uiLanguage');
    if (uiLangSel) uiLangSel.value = cleaned.uiLanguage;
    applyTranslations();
    const base = cleaned.wpUrl || 'https://example.com';
    const link = document.getElementById('wpAdminLink');
    if (link) link.href = `${base}/wp-admin/profile.php`;

    noConfigWarn.style.display = 'none';
    if (extractedData) clipBtn.disabled = false;
    if (extractedData && (data.aiApiKey || '').trim()) aiCleanBtn.disabled = false;

    importPaste.classList.remove('visible');
    importJson.value = '';
    showStatus(settingsSt, 'success', t('msg_settings_imported'));
  } catch (err) {
    showStatus(settingsSt, 'error', `${t('msg_import_fail')}${escHtml(err.message)}`);
  }
});

// --- Helpers ---
function loadConfig() {
  return new Promise(resolve => {
    chrome.storage.local.get(['wpUrl', 'wpUser', 'wpPass', 'includeSourceUrl', 'stripUrlParams', 'urlParamWhitelist', 'uiLanguage'], resolve);
  });
}

function saveConfig(data) {
  return new Promise(resolve => { chrome.storage.local.set(data, resolve); });
}

function loadAiConfig() {
  return new Promise(resolve => {
    chrome.storage.local.get(['aiProvider', 'aiApiKey', 'aiModel', 'aiMaxTokens', 'aiContextTokens'], resolve);
  });
}

function saveAiConfig(data) {
  return new Promise(resolve => { chrome.storage.local.set(data, resolve); });
}

function effectiveContent() {
  if (useSelectionChk.checked && extractedData.selectedHtml) {
    return extractedData.selectedHtml;
  }
  return extractedData.content;
}

function showStatus(el, type, html) {
  el.className = `status ${type}`;
  safeSetHtml(el, html);
}

function clearStatus(el) {
  el.className = 'status';
  el.innerHTML = '';
}

init();
