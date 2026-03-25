// popup.js

let extractedData = null;

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
const aiSettingsSt     = document.getElementById('aiSettingsStatus');

// --- DOM refs (clip) ---
const useSelectionWrap  = document.getElementById('useSelectionWrap');
const useSelectionChk   = document.getElementById('useSelection');
const showPreviewChk    = document.getElementById('showPreview');
const previewToggleWrap = document.getElementById('previewToggleWrap');
const copyBtn           = document.getElementById('copyBtn');
const copyTextBtn       = document.getElementById('copyTextBtn');
const aiCleanBtn        = document.getElementById('aiCleanBtn');
const noConfigWarn      = document.getElementById('noConfigWarn');
const pageTitle         = document.getElementById('pageTitle');
const pageUrl           = document.getElementById('pageUrl');
const previewImg        = document.getElementById('previewImg');
const postTitle         = document.getElementById('postTitle');
const postExcerpt       = document.getElementById('postExcerpt');
const clipBtn           = document.getElementById('clipBtn');
const clipStatus        = document.getElementById('clipStatus');

const DEFAULT_MODELS = { deepseek: 'deepseek-chat', openai: 'gpt-4o' };

// --- Init ---
async function init() {
  const cfg   = await loadConfig();
  const aiCfg = await loadAiConfig();

  // WP fields
  if (cfg.wpUrl) {
    wpUrlInput.value  = cfg.wpUrl;
    wpUserInput.value = cfg.wpUser || '';
  }
  includeSourceUrlChk.checked  = cfg.includeSourceUrl !== false;
  stripUrlParamsChk.checked    = cfg.stripUrlParams !== false;
  urlParamWhitelist.value      = cfg.urlParamWhitelist || '';
  whitelistField.style.display = stripUrlParamsChk.checked ? '' : 'none';

  // AI fields
  aiProviderSel.value    = aiCfg.aiProvider || 'deepseek';
  aiApiKeyInput.value    = aiCfg.aiApiKey   || '';
  aiModelInput.value     = aiCfg.aiModel    || DEFAULT_MODELS[aiProviderSel.value];
  aiMaxTokensInput.value = aiCfg.aiMaxTokens || 128000;

  const hasConfig = cfg.wpUrl && cfg.wpUser && cfg.wpPass;
  if (!hasConfig) {
    noConfigWarn.style.display = 'block';
    activateView(settingsView);
  }

  // Extract content from current tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    pageUrl.textContent = tab.url || '';

    const resp = await chrome.tabs.sendMessage(tab.id, { action: 'extractContent' });
    if (resp && resp.success) {
      extractedData = resp.data;
      pageTitle.textContent = extractedData.title || '（無法取得標題）';
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
      pageTitle.textContent = tab.title || '無法解析頁面';
    }
  } catch (e) {
    pageTitle.textContent = '無法連接頁面（請重新整理後再試）';
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
    copyBtn.textContent = '✓ 已複製';
    setTimeout(() => { copyBtn.textContent = orig; }, 2000);
  } catch (e) {
    showStatus(clipStatus, 'error', `複製失敗：${e.message}`);
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
    copyTextBtn.textContent = '✓ 已複製';
    setTimeout(() => { copyTextBtn.textContent = orig; }, 2000);
  } catch (e) {
    showStatus(clipStatus, 'error', `複製失敗：${e.message}`);
  }
});

// --- AI provider change: update default model ---
aiProviderSel.addEventListener('change', () => {
  const def = DEFAULT_MODELS[aiProviderSel.value];
  aiModelInput.placeholder = def;
  if (!aiModelInput.value || Object.values(DEFAULT_MODELS).includes(aiModelInput.value)) {
    aiModelInput.value = def;
  }
});

// --- AI Clean ---
aiCleanBtn.addEventListener('click', async () => {
  if (!extractedData) return;
  const aiCfg = await loadAiConfig();
  if (!aiCfg.aiApiKey) {
    showStatus(clipStatus, 'error', '請先在 AI 設定（✦）中填入 API Key');
    return;
  }

  const provider  = aiCfg.aiProvider || 'deepseek';
  const apiKey    = aiCfg.aiApiKey;
  const model     = aiCfg.aiModel || DEFAULT_MODELS[provider];
  const maxTokens = parseInt(aiCfg.aiMaxTokens) || 128000;
  const endpoint  = provider === 'openai'
    ? 'https://api.openai.com/v1/chat/completions'
    : 'https://api.deepseek.com/v1/chat/completions';

  aiCleanBtn.disabled = true;
  aiCleanBtn.innerHTML = '<span class="spinner"></span>AI 處理中…';
  clearStatus(clipStatus);

  const prompt =
    '我要擷取這篇文章，但是會同時抓到很多不相干的內容，請將本文以外的不相關內容移除，' +
    '本文原封不動不修改。只回傳清理後的 HTML 內容，不要加任何解釋或 markdown 標記。\n\n' +
    '以下是待清理的 HTML 內容：\n\n' + effectiveContent();

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `HTTP ${res.status}`);
    }

    const json = await res.json();
    let cleaned = json.choices?.[0]?.message?.content?.trim() || '';
    // Strip markdown code fences if AI wrapped the response
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim();
    if (!cleaned) throw new Error('AI 回傳內容為空');

    if (useSelectionChk.checked && extractedData.selectedHtml) {
      extractedData.selectedHtml = cleaned;
    } else {
      extractedData.content = cleaned;
    }
    showStatus(clipStatus, 'success', '✓ AI 清理完成，內容已更新');
    aiCleanBtn.innerHTML = '✓ 已清理';
    setTimeout(() => {
      aiCleanBtn.innerHTML = '✦ AI 清理內容';
      aiCleanBtn.disabled = false;
    }, 3000);
  } catch (e) {
    showStatus(clipStatus, 'error', `AI 失敗：${e.message}`);
    aiCleanBtn.disabled = false;
    aiCleanBtn.innerHTML = '✦ AI 清理內容';
  }
});

// --- Save WP settings ---
saveBtn.addEventListener('click', async () => {
  const url  = wpUrlInput.value.trim().replace(/\/$/, '');
  const user = wpUserInput.value.trim();
  const pass = wpPassInput.value.trim();

  if (!url || !user || !pass) {
    showStatus(settingsSt, 'error', '請填寫所有欄位');
    return;
  }

  saveBtn.textContent = '測試連線中…';
  saveBtn.disabled = true;

  try {
    const auth = btoa(`${user}:${pass}`);
    const res = await fetch(`${url}/wp-json/wp/v2/users/me`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const me = await res.json();

    await saveConfig({
      wpUrl:             url,
      wpUser:            user,
      wpPass:            pass,
      includeSourceUrl:  includeSourceUrlChk.checked,
      stripUrlParams:    stripUrlParamsChk.checked,
      urlParamWhitelist: urlParamWhitelist.value.trim()
    });
    showStatus(settingsSt, 'success', `✓ 已連線為 ${me.name}`);
    noConfigWarn.style.display = 'none';
    if (extractedData) clipBtn.disabled = false;
  } catch (e) {
    showStatus(settingsSt, 'error', `連線失敗：${e.message}。請確認網址、帳號、Application Password 是否正確。`);
  } finally {
    saveBtn.textContent = '儲存設定';
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
  showStatus(aiSettingsSt, 'success', '✓ AI 設定已儲存');
  if (extractedData && apiKey) aiCleanBtn.disabled = false;
});

// --- Clip button ---
clipBtn.addEventListener('click', async () => {
  if (!extractedData) return;

  const cfg = await loadConfig();
  if (!cfg.wpUrl || !cfg.wpUser || !cfg.wpPass) {
    showStatus(clipStatus, 'error', '請先完成設定');
    return;
  }

  const sendData = Object.assign({}, extractedData, {
    title:   postTitle.value.trim() || extractedData.title,
    excerpt: postExcerpt.value.trim(),
    content: effectiveContent()
  });

  clipBtn.disabled = true;
  clipBtn.innerHTML = '<span class="spinner"></span>匯入中…';
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
      showStatus(clipStatus, 'success',
        `✓ 已建立草稿！<br><a href="${result.result.editUrl}" target="_blank">在 WordPress 編輯 →</a>`
      );
      clipBtn.innerHTML = '✓ 已匯入';
    } else {
      throw new Error(result.error);
    }
  } catch (e) {
    showStatus(clipStatus, 'error', `匯入失敗：${e.message}`);
    clipBtn.disabled = false;
    clipBtn.innerHTML = '✂ 匯入為草稿';
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
    if (!data.wpUrl || !data.wpUser) throw new Error('缺少必要欄位（wpUrl, wpUser）');

    const cleaned = {
      wpUrl:             (data.wpUrl || '').trim().replace(/\/$/, ''),
      wpUser:            (data.wpUser || '').trim(),
      wpPass:            (data.wpPass || '').trim(),
      includeSourceUrl:  data.includeSourceUrl !== false,
      stripUrlParams:    data.stripUrlParams   !== false,
      urlParamWhitelist: (data.urlParamWhitelist || '').trim()
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

    noConfigWarn.style.display = 'none';
    if (extractedData) clipBtn.disabled = false;
    if (extractedData && (data.aiApiKey || '').trim()) aiCleanBtn.disabled = false;

    importPaste.classList.remove('visible');
    importJson.value = '';
    showStatus(settingsSt, 'success', '✓ 設定已匯入並儲存');
  } catch (err) {
    showStatus(settingsSt, 'error', `匯入失敗：${err.message}`);
  }
});

// --- Helpers ---
function loadConfig() {
  return new Promise(resolve => {
    chrome.storage.local.get(['wpUrl', 'wpUser', 'wpPass', 'includeSourceUrl', 'stripUrlParams', 'urlParamWhitelist'], resolve);
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
