// popup.js

let extractedData = null;

// --- DOM refs ---
const settingsToggle = document.getElementById('settingsToggle');
const settingsView   = document.getElementById('settingsView');
const clipView       = document.getElementById('clipView');

const wpUrlInput  = document.getElementById('wpUrl');
const wpUserInput = document.getElementById('wpUser');
const wpPassInput = document.getElementById('wpPass');
const saveBtn     = document.getElementById('saveSettings');
const settingsSt  = document.getElementById('settingsStatus');

const showPreviewChk     = document.getElementById('showPreview');
const previewToggleWrap  = document.getElementById('previewToggleWrap');
const copyBtn            = document.getElementById('copyBtn');
const copyTextBtn        = document.getElementById('copyTextBtn');

const noConfigWarn = document.getElementById('noConfigWarn');
const pageTitle    = document.getElementById('pageTitle');
const pageUrl      = document.getElementById('pageUrl');
const previewImg   = document.getElementById('previewImg');
const postTitle    = document.getElementById('postTitle');
const postExcerpt  = document.getElementById('postExcerpt');
const clipBtn      = document.getElementById('clipBtn');
const clipStatus   = document.getElementById('clipStatus');

// --- Init ---
async function init() {
  const cfg = await loadConfig();

  if (cfg.wpUrl) {
    wpUrlInput.value  = cfg.wpUrl;
    wpUserInput.value = cfg.wpUser || '';
    // Don't pre-fill password for security
  }

  const hasConfig = cfg.wpUrl && cfg.wpUser && cfg.wpPass;
  if (!hasConfig) {
    noConfigWarn.style.display = 'block';
    // 尚未設定，自動切換到設定頁
    settingsView.classList.add('active');
    clipView.classList.remove('active');
    settingsToggle.textContent = '✕';
  }

  // Extract content from current tab
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    pageUrl.textContent = tab.url || '';

    const resp = await chrome.tabs.sendMessage(tab.id, { action: 'extractContent' });
    if (resp && resp.success) {
      extractedData = resp.data;
      pageTitle.textContent = extractedData.title || '（無法取得標題）';
      postTitle.value = extractedData.title || '';
      postExcerpt.value = extractedData.excerpt || '';

      if (extractedData.featuredImageUrl) {
        previewImg.src = extractedData.featuredImageUrl;
        previewImg.classList.add('visible');
        previewToggleWrap.style.display = 'flex';
      }

      copyBtn.disabled = false;
      copyTextBtn.disabled = false;
      if (hasConfig) clipBtn.disabled = false;
    } else {
      pageTitle.textContent = tab.title || '無法解析頁面';
    }
  } catch (e) {
    pageTitle.textContent = '無法連接頁面（請重新整理後再試）';
    console.error('Content script error:', e);
  }
}

// --- Settings toggle ---
settingsToggle.addEventListener('click', () => {
  const isSettings = settingsView.classList.contains('active');
  settingsView.classList.toggle('active', !isSettings);
  clipView.classList.toggle('active', isSettings);
  settingsToggle.textContent = isSettings ? '⚙' : '✕';
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
  const html = `<h2>${title}</h2>\n${imgHtml}${extractedData.content}`;

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
  tmp.innerHTML = extractedData.content;
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

// --- Save settings ---
saveBtn.addEventListener('click', async () => {
  const url  = wpUrlInput.value.trim().replace(/\/$/, '');
  const user = wpUserInput.value.trim();
  const pass = wpPassInput.value.trim();

  if (!url || !user || !pass) {
    showStatus(settingsSt, 'error', '請填寫所有欄位');
    return;
  }

  // Test connection
  saveBtn.textContent = '測試連線中…';
  saveBtn.disabled = true;

  try {
    const auth = btoa(`${user}:${pass}`);
    const res = await fetch(`${url}/wp-json/wp/v2/users/me`, {
      headers: { 'Authorization': `Basic ${auth}` }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const me = await res.json();

    await saveConfig({ wpUrl: url, wpUser: user, wpPass: pass });
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

// --- Clip button ---
clipBtn.addEventListener('click', async () => {
  if (!extractedData) return;

  const cfg = await loadConfig();
  if (!cfg.wpUrl || !cfg.wpUser || !cfg.wpPass) {
    showStatus(clipStatus, 'error', '請先完成設定');
    return;
  }

  // Apply edits from UI
  extractedData.title   = postTitle.value.trim() || extractedData.title;
  extractedData.excerpt = postExcerpt.value.trim();

  clipBtn.disabled = true;
  clipBtn.innerHTML = '<span class="spinner"></span>匯入中…';
  clearStatus(clipStatus);

  try {
    const result = await chrome.runtime.sendMessage({
      action: 'sendToWordPress',
      payload: {
        wpUrl:       cfg.wpUrl,
        username:    cfg.wpUser,
        appPassword: cfg.wpPass,
        articleData: extractedData
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

// --- Helpers ---
function loadConfig() {
  return new Promise(resolve => {
    chrome.storage.local.get(['wpUrl', 'wpUser', 'wpPass'], resolve);
  });
}

function saveConfig(data) {
  return new Promise(resolve => {
    chrome.storage.local.set(data, resolve);
  });
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
