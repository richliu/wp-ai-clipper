// popup.js

// ── i18n ─────────────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  'zh-TW': {
    label_wp_url: 'WordPress 網址',
    label_wp_user: '使用者名稱',
    hint_app_password: '從 WordPress 後台 → 使用者 → 你的個人檔案 → Application Passwords 產生。<br><a id="wpAdminLink" href="#" target="_blank">直接前往 →</a>',
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
    msg_saved_conn: (name) => `✓ 已儲存，連線為 ${name}`,
    msg_saved_conn_fail: '設定已儲存，但連線測試失敗：',
    msg_no_api_key: '請先填入 API Key',
    msg_testing: '測試中…',
    msg_conn_ok: (model, reply) => `✓ 連線成功（${model}）：${reply}`,
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
  },
  'en': {
    label_wp_url: 'WordPress URL',
    label_wp_user: 'Username',
    hint_app_password: 'Generate from WordPress Admin → Users → Your Profile → Application Passwords.<br><a id="wpAdminLink" href="#" target="_blank">Go there →</a>',
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
    msg_saved_conn: (name) => `✓ Saved, connected as ${name}`,
    msg_saved_conn_fail: 'Settings saved but connection test failed: ',
    msg_no_api_key: 'Please enter an API Key first',
    msg_testing: 'Testing…',
    msg_conn_ok: (model, reply) => `✓ Connection successful (${model}): ${reply}`,
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

function applyTranslations() {
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  const btnMap = {
    saveSettings: 'btn_save_settings', exportBtn: 'btn_export',
    importToggleBtn: 'btn_import', importConfirmBtn: 'btn_import_confirm',
    importCancelBtn: 'btn_cancel', saveAiSettings: 'btn_save_ai',
    testAiBtn: 'btn_test_ai', fbExpandBtn: 'btn_fb_expand',
    clipBtn: 'btn_clip', copyBtn: 'btn_copy', copyTextBtn: 'btn_copy_text',
    aiCleanBtn: 'btn_ai_clean'
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
const includeSourceUrlChk = document.getElementById('includeSourceUrl');
const stripUrlParamsChk   = document.getElementById('stripUrlParams');
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
const aiMaxTokensInput = document.getElementById('aiMaxTokens');
const saveAiBtn        = document.getElementById('saveAiSettings');
const testAiBtn        = document.getElementById('testAiBtn');
const aiSettingsSt     = document.getElementById('aiSettingsStatus');

// --- DOM refs (clip) ---
const fbModeSection  = document.getElementById('fbModeSection');
const fbExpandBtn    = document.getElementById('fbExpandBtn');
const fbExpandStatus = document.getElementById('fbExpandStatus');
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
  sel.innerHTML = `<option value="">— ${t('label_model_select')} —</option>` +
    models.map(m => `<option value="${m}">${m}</option>`).join('');
  // Pre-select if current value matches a known model
  const cur = aiModelInput ? aiModelInput.value : '';
  sel.value = models.includes(cur) ? cur : '';
}
const FB_POST_RE = /^https?:\/\/(www\.|m\.)?facebook\.com\/([\w.%+-]+\/posts\/|permalink\.php|groups\/[^?#/]+\/posts\/|share\/p\/)/;

// --- Init ---
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
  includeSourceUrlChk.checked  = cfg.includeSourceUrl !== false;
  stripUrlParamsChk.checked    = cfg.stripUrlParams !== false;
  urlParamWhitelist.value      = cfg.urlParamWhitelist || '';
  whitelistField.style.display = stripUrlParamsChk.checked ? '' : 'none';

  // AI fields
  aiProviderSel.value    = aiCfg.aiProvider || 'deepseek';
  aiApiKeyInput.value    = aiCfg.aiApiKey   || '';
  aiModelInput.value     = aiCfg.aiModel    || DEFAULT_MODELS[aiProviderSel.value];
  aiMaxTokensInput.value = aiCfg.aiMaxTokens || 8192;
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

    const resp = await chrome.tabs.sendMessage(tab.id, { action: 'extractContent' });
    if (resp && resp.success) {
      extractedData = resp.data;
      pageTitle.textContent = extractedData.title || t('msg_no_title');
      postTitle.value   = extractedData.title   || '';
      postExcerpt.value = extractedData.excerpt || '';

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

// --- Copy content ---
copyBtn.addEventListener('click', async () => {
  if (!extractedData) return;
  const title   = postTitle.value.trim() || extractedData.title;
  const imgHtml = extractedData.featuredImageUrl
    ? `<figure><img src="${extractedData.featuredImageUrl}" alt="${title}" style="max-width:100%;height:auto;" /></figure>\n`
    : '';
  const html = `<h2>${title}</h2>\n${imgHtml}${effectiveContent()}`;
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'text/html': new Blob([html], { type: 'text/html' }) })
    ]);
    const orig = copyBtn.textContent;
    copyBtn.textContent = t('msg_copied');
    setTimeout(() => { copyBtn.textContent = orig; }, 2000);
  } catch (e) {
    showStatus(clipStatus, 'error', `${t('msg_copy_fail')}${e.message}`);
  }
});

// --- Copy text only ---
copyTextBtn.addEventListener('click', async () => {
  if (!extractedData) return;
  const title = postTitle.value.trim() || extractedData.title;
  const tmp = document.createElement('div');
  tmp.innerHTML = effectiveContent();
  const body = tmp.innerText.trim().replace(/[ \t]*\n[ \t]*\n([ \t]*\n)+/g, '\n\n');
  const plainText = `${title}\n\n${body}`;
  try {
    await navigator.clipboard.writeText(plainText);
    const orig = copyTextBtn.textContent;
    copyTextBtn.textContent = t('msg_copied');
    setTimeout(() => { copyTextBtn.textContent = orig; }, 2000);
  } catch (e) {
    showStatus(clipStatus, 'error', `${t('msg_copy_fail')}${e.message}`);
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
  fbExpandBtn.innerHTML = `<span class="spinner"></span>${t('msg_fb_expanding')}`;
  showStatus(fbExpandStatus, 'success', t('msg_fb_expanding'));

  try {
    const resp = await chrome.tabs.sendMessage(tab.id, { action: 'expandFbComments' });

    if (!resp?.success) throw new Error(resp?.error || t('msg_fb_fail'));

    showStatus(fbExpandStatus, 'success', t('msg_fb_expanded'));

    // Re-extract after expansion
    const extracted = await chrome.tabs.sendMessage(tab.id, { action: 'extractContent' });
    if (extracted?.success) {
      extractedData = extracted.data;
      postTitle.value   = extractedData.title   || postTitle.value;
      postExcerpt.value = extractedData.excerpt  || postExcerpt.value;
      const count = extractedData.comments?.length ?? 0;
      showStatus(fbExpandStatus, 'success', t('msg_fb_done', count));
    }
  } catch (e) {
    showStatus(fbExpandStatus, 'error', `${t('msg_fb_fail')}${e.message}`);
  } finally {
    fbExpandBtn.disabled = false;
    fbExpandBtn.textContent = t('btn_fb_expand');
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
  aiCleanBtn.innerHTML = `<span class="spinner"></span>${t('msg_ai_processing')}`;
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
    showStatus(aiCleanStatus, 'error', `${t('msg_ai_fail')}${e.message}`);
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
    includeSourceUrl:  includeSourceUrlChk.checked,
    stripUrlParams:    stripUrlParamsChk.checked,
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
    showStatus(settingsSt, 'warn', `${t('msg_saved_conn_fail')}${e.message}`);
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
  const maxTokens = parseInt(aiMaxTokensInput.value) || 128000;

  await saveAiConfig({ aiProvider: provider, aiApiKey: apiKey, aiModel: model, aiMaxTokens: maxTokens });
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
  testAiBtn.innerHTML = `<span class="spinner"></span>${t('msg_testing')}`;
  clearStatus(aiSettingsSt);

  try {
    const json = await callAiApi({
      provider, apiKey, model, maxTokens: 16,
      messages: [{ role: 'user', content: 'hi' }]
    });
    const reply = json.choices?.[0]?.message?.content?.trim() || '(ok)';
    showStatus(aiSettingsSt, 'success', t('msg_conn_ok', model, reply));
  } catch (e) {
    showStatus(aiSettingsSt, 'error', `${t('msg_conn_fail')}${e.message}`);
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

  const sendData = Object.assign({}, extractedData, {
    title:   postTitle.value.trim() || extractedData.title,
    excerpt: postExcerpt.value.trim(),
    content: effectiveContent()
  });

  clipBtn.disabled = true;
  clipBtn.innerHTML = `<span class="spinner"></span>${t('msg_importing')}`;
  clearStatus(clipStatus);

  try {
    const result = await chrome.runtime.sendMessage({
      action: 'sendToWordPress',
      payload: {
        wpUrl:             cfg.wpUrl,
        username:          cfg.wpUser,
        appPassword:       cfg.wpPass,
        includeSourceUrl:  cfg.includeSourceUrl !== false,
        stripUrlParams:    cfg.stripUrlParams !== false,
        urlParamWhitelist: cfg.urlParamWhitelist || '',
        articleData:       sendData
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
    showStatus(clipStatus, 'error', `${t('msg_import_fail')}${e.message}`);
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
    includeSourceUrl:  cfg.includeSourceUrl  !== false,
    stripUrlParams:    cfg.stripUrlParams    !== false,
    urlParamWhitelist: cfg.urlParamWhitelist || '',
    uiLanguage:        cfg.uiLanguage        || 'auto',
    aiProvider:        aiCfg.aiProvider  || 'deepseek',
    aiApiKey:          aiCfg.aiApiKey    || '',
    aiModel:           aiCfg.aiModel     || '',
    aiMaxTokens:       aiCfg.aiMaxTokens || 128000
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
      includeSourceUrl:  data.includeSourceUrl !== false,
      stripUrlParams:    data.stripUrlParams   !== false,
      urlParamWhitelist: (data.urlParamWhitelist || '').trim(),
      uiLanguage:        data.uiLanguage || 'auto'
    };
    await saveConfig(cleaned);

    // AI settings (optional in JSON)
    if (data.aiApiKey || data.aiProvider) {
      const aiImport = {
        aiProvider:  data.aiProvider  || 'deepseek',
        aiApiKey:    (data.aiApiKey   || '').trim(),
        aiModel:     (data.aiModel    || '').trim(),
        aiMaxTokens: data.aiMaxTokens || 128000
      };
      await saveAiConfig(aiImport);
      aiProviderSel.value    = aiImport.aiProvider;
      aiApiKeyInput.value    = aiImport.aiApiKey;
      aiModelInput.value     = aiImport.aiModel || DEFAULT_MODELS[aiImport.aiProvider];
      aiMaxTokensInput.value = aiImport.aiMaxTokens;
    }

    wpUrlInput.value             = cleaned.wpUrl;
    wpUserInput.value            = cleaned.wpUser;
    wpPassInput.value            = cleaned.wpPass;
    includeSourceUrlChk.checked  = cleaned.includeSourceUrl;
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
    showStatus(settingsSt, 'error', `${t('msg_import_fail')}${err.message}`);
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
    chrome.storage.local.get(['aiProvider', 'aiApiKey', 'aiModel', 'aiMaxTokens'], resolve);
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
  el.innerHTML = html;
}

function clearStatus(el) {
  el.className = 'status';
  el.innerHTML = '';
}

init();
