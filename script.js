'use strict';

/* ============================================================
   Constants
============================================================ */
const STORAGE_KEY = 'tq-translator-state-v1';
const HISTORY_KEY = 'tq-translator-history-v1';
const DEMO_CHUNK_SIZE = 450;

const LANGUAGES = [
  { code: 'auto', name: 'كشف تلقائي', speech: '' },
  { code: 'ar', name: 'العربية',    speech: 'ar-SA' },
  { code: 'en', name: 'الإنجليزية', speech: 'en-US' },
  { code: 'fr', name: 'الفرنسية',   speech: 'fr-FR' },
  { code: 'es', name: 'الإسبانية',  speech: 'es-ES' },
  { code: 'de', name: 'الألمانية',  speech: 'de-DE' },
  { code: 'tr', name: 'التركية',    speech: 'tr-TR' },
  { code: 'ru', name: 'الروسية',    speech: 'ru-RU' },
  { code: 'zh', name: 'الصينية',    speech: 'zh-CN' },
  { code: 'ja', name: 'اليابانية',  speech: 'ja-JP' },
  { code: 'it', name: 'الإيطالية',  speech: 'it-IT' },
  { code: 'pt', name: 'البرتغالية', speech: 'pt-PT' },
  { code: 'hi', name: 'الهندية',    speech: 'hi-IN' },
  { code: 'ko', name: 'الكورية',    speech: 'ko-KR' },
  { code: 'nl', name: 'الهولندية',  speech: 'nl-NL' },
  { code: 'pl', name: 'البولندية',  speech: 'pl-PL' },
  { code: 'sv', name: 'السويدية',   speech: 'sv-SE' },
  { code: 'fa', name: 'الفارسية',   speech: 'fa-IR' },
  { code: 'ur', name: 'الأردية',    speech: 'ur-PK' }
];

const DEFAULT_STATE = {
  apiKey: '',
  endpoint: '',
  sourceLang: 'ar',
  targetLang: 'en',
  model: 'standard',
  voiceEnabled: false,
  darkMode: false,
  colors: {
    primary: '#14b8a6',
    secondary: '#0d9488',
    bg: '#f0fdfa'
  }
};

/* ============================================================
   State & DOM
============================================================ */
let state = clone(DEFAULT_STATE);

const $ = (id) => document.getElementById(id);
const els = {
  menuToggle: $('menuToggle'),
  dropdownMenu: $('dropdownMenu'),
  colorsBtn: $('colorsBtn'),
  clearHistoryBtn: $('clearHistoryBtn'),
  darkModeToggle: $('darkModeToggle'),
  apiKey: $('apiKey'),
  endpoint: $('endpoint'),
  sourceLang: $('sourceLang'),
  targetLang: $('targetLang'),
  model: $('model'),
  swapLangs: $('swapLangs'),
  importBtn: $('importBtn'),
  fileInput: $('fileInput'),
  inputText: $('inputText'),
  outputText: $('outputText'),
  inputCount: $('inputCount'),
  copyBtn: $('copyBtn'),
  translateBtn: $('translateBtn'),
  voiceToggle: $('voiceToggle'),
  colorsPanel: $('colorsPanel'),
  closeColors: $('closeColors'),
  primaryColor: $('primaryColor'),
  secondaryColor: $('secondaryColor'),
  bgColor: $('bgColor'),
  resetColors: $('resetColors'),
  toast: $('toast')
};

/* ============================================================
   Utilities
============================================================ */
function clone(obj) {
  if (typeof structuredClone === 'function') return structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}

function deepMerge(target, source) {
  for (const key of Object.keys(source || {})) {
    const val = source[key];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      target[key] = deepMerge(target[key] || {}, val);
    } else {
      target[key] = val;
    }
  }
  return target;
}

function hexToRgb(hex) {
  if (!hex) return null;
  const m = String(hex).replace('#', '').match(/^([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16)
  ];
}

function relativeLuminance(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return 1;
  const lin = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const [r, g, b] = rgb;
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function getContrastText(hex) {
  return relativeLuminance(hex) > 0.45 ? '#0f172a' : '#f8fafc';
}

function darken(hex, amount) {
  const rgb = hexToRgb(hex) || [15, 23, 42];
  return `rgb(${Math.round(rgb[0] * (1 - amount))}, ${Math.round(rgb[1] * (1 - amount))}, ${Math.round(rgb[2] * (1 - amount))})`;
}

function lighten(hex, amount) {
  const rgb = hexToRgb(hex) || [15, 23, 42];
  return `rgb(${Math.round(rgb[0] + (255 - rgb[0]) * amount)}, ${Math.round(rgb[1] + (255 - rgb[1]) * amount)}, ${Math.round(rgb[2] + (255 - rgb[2]) * amount)})`;
}

function decodeHtml(str) {
  const el = document.createElement('textarea');
  el.innerHTML = str;
  return el.value;
}

function chunkText(text, maxLen) {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  const parts = text.split(/(?<=[.!?؟।\n])\s+/);
  let current = '';

  for (const part of parts) {
    if ((current + ' ' + part).trim().length > maxLen) {
      if (current.trim()) chunks.push(current.trim());
      current = part;
      while (current.length > maxLen) {
        let cut = current.lastIndexOf(' ', maxLen);
        if (cut === -1) cut = maxLen;
        chunks.push(current.slice(0, cut).trim());
        current = current.slice(cut).trim();
      }
    } else {
      current = (current + ' ' + part).trim();
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/* ============================================================
   State persistence
============================================================ */
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = deepMerge(clone(DEFAULT_STATE), JSON.parse(raw));
  } catch (err) {
    console.warn('Failed to load state', err);
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Failed to save state', err);
  }
}

/* ============================================================
   Theme / Colors
============================================================ */
function applyColors() {
  const root = document.documentElement;
  const c = state.colors;

  root.style.setProperty('--primary', c.primary);
  root.style.setProperty('--secondary', c.secondary);
  root.style.setProperty('--bg', c.bg);

  // Auto-contrast for light mode based on chosen background
  const bgIsDark = getContrastText(c.bg) === '#f8fafc';
  root.style.setProperty('--text', bgIsDark ? '#f8fafc' : '#0f172a');
  root.style.setProperty('--card-bg', bgIsDark ? '#1e293b' : '#ffffff');
  root.style.setProperty('--border', bgIsDark ? '#334155' : '#e2e8f0');

  // Derive dark-mode palette from user background
  const darkBg = darken(c.bg, 0.9);
  root.style.setProperty('--bg-dark', darkBg);
  root.style.setProperty('--card-bg-dark', lighten(darkBg, 0.07));
  root.style.setProperty('--border-dark', lighten(darkBg, 0.17));
  root.style.setProperty('--text-dark', '#e2e8f0');

  // Sync pickers
  els.primaryColor.value = c.primary;
  els.secondaryColor.value = c.secondary;
  els.bgColor.value = c.bg;
}

function syncUI() {
  els.apiKey.value = state.apiKey;
  els.endpoint.value = state.endpoint;
  els.sourceLang.value = state.sourceLang;
  els.targetLang.value = state.targetLang;
  els.model.value = state.model;
  els.voiceToggle.checked = state.voiceEnabled;
  els.darkModeToggle.checked = state.darkMode;
  document.body.classList.toggle('dark', state.darkMode);
  applyColors();
}

/* ============================================================
   Languages
============================================================ */
function populateLanguages() {
  els.sourceLang.innerHTML = LANGUAGES
    .map((l) => `<option value="${l.code}">${l.name}</option>`)
    .join('');

  els.targetLang.innerHTML = LANGUAGES
    .filter((l) => l.code !== 'auto')
    .map((l) => `<option value="${l.code}">${l.name}</option>`)
    .join('');
}

/* ============================================================
   Translation core
============================================================ */
async function handleTranslate() {
  const text = els.inputText.value.trim();
  if (!text) return showToast('يرجى إدخال نص للترجمة', 'error');

  if (state.sourceLang !== 'auto' && state.sourceLang === state.targetLang) {
    return showToast('اللغة المصدر والهدف متطابقتان', 'error');
  }

  setLoading(true);
  try {
    const result = state.endpoint.trim()
      ? await translateWithEndpoint(text)
      : await translateWithDemo(text);

    els.outputText.value = result;
    saveHistory(text, result);
    showToast('تمت الترجمة بنجاح', 'success');

    if (state.voiceEnabled) speak(result);
  } catch (err) {
    console.error(err);
    showToast(err.message || 'حدث خطأ أثناء الترجمة', 'error');
  } finally {
    setLoading(false);
  }
}

async function translateWithDemo(text) {
  const source = state.sourceLang === 'auto' ? 'en' : state.sourceLang;
  const chunks = chunkText(text, DEMO_CHUNK_SIZE);
  const results = [];

  for (const chunk of chunks) {
    const url =
      'https://api.mymemory.translated.net/get?q=' +
      encodeURIComponent(chunk) +
      '&langpair=' +
      source + '|' + state.targetLang;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`فشل الاتصال بخدمة العرض (${res.status})`);

    const data = await res.json();
    const t = data?.responseData?.translatedText;
    if (!t || /MYMEMORY WARNING/i.test(t)) {
      throw new Error('تعذر الحصول على ترجمة من خدمة العرض. جرّب نقطة نهاية خاصة.');
    }
    results.push(decodeHtml(t));
  }

  return results.join('\n\n');
}

async function translateWithEndpoint(text) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.apiKey) {
    headers['Authorization'] = `Bearer ${state.apiKey}`;
    headers['X-API-Key'] = state.apiKey;
    headers['api-key'] = state.apiKey;
  }

  const body = {
    q: text,
    text,
    source: state.sourceLang === 'auto' ? 'auto' : state.sourceLang,
    target: state.targetLang,
    target_lang: state.targetLang,
    model: state.model,
    api_key: state.apiKey
  };

  let res;
  try {
    res = await fetch(state.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
  } catch {
    throw new Error('تعذر الاتصال بالخادم. تحقق من عنوان URL.');
  }

  if (!res.ok) {
    let detail = '';
    try { detail = (await res.text()).slice(0, 140); } catch {}
    throw new Error(`فشل الطلب (${res.status})${detail ? ': ' + detail : ''}`);
  }

  let data;
  try { data = await res.json(); } catch { throw new Error('استجابة غير صالحة من الخادم'); }

  const translated = extractTranslation(data);
  if (!translated) throw new Error('لم يتم العثور على ترجمة في استجابة الخادم');
  return translated;
}

function extractTranslation(data) {
  if (typeof data === 'string') return data;
  const candidates = [
    data.translatedText,
    data.translation,
    data.result?.translatedText,
    data.result?.text,
    data.data?.translatedText,
    data.data?.translations?.[0]?.translatedText,
    data.translations?.[0]?.text,
    data.choices?.[0]?.message?.content,
    data.output
  ];
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }
  return null;
}

/* ============================================================
   Voice
============================================================ */
function speak(text) {
  if (!('speechSynthesis' in window)) {
    return showToast('المتصفح لا يدعم القراءة الصوتية', 'error');
  }
  speechSynthesis.cancel();

  const lang = LANGUAGES.find((l) => l.code === state.targetLang);
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang?.speech || 'en-US';
  utter.rate = 1;

  const voices = speechSynthesis.getVoices();
  if (voices.length) {
    const match =
      voices.find((v) => v.lang === utter.lang) ||
      voices.find((v) => v.lang.startsWith(utter.lang.split('-')[0]));
    if (match) utter.voice = match;
  }

  speechSynthesis.speak(utter);
}

/* ============================================================
   History
============================================================ */
function saveHistory(src, tgt) {
  try {
    const history = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    history.unshift({
      src: src.slice(0, 500),
      tgt: tgt.slice(0, 500),
      model: state.model,
      from: state.sourceLang,
      to: state.targetLang,
      at: Date.now()
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 100)));
  } catch { /* ignore */ }
}

function clearHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    showToast('تم مسح سجل الترجمات', 'success');
  } catch {
    showToast('تعذر مسح السجل', 'error');
  }
}

/* ============================================================
   UI helpers
============================================================ */
let toastTimer;
function showToast(msg, type = 'success') {
  els.toast.textContent = msg;
  els.toast.className = `toast show ${type === 'error' ? 'error' : ''}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => els.toast.classList.remove('show'), 3400);
}

function setLoading(loading) {
  els.translateBtn.disabled = loading;
  const spinner = els.translateBtn.querySelector('.spinner');
  const btnText = els.translateBtn.querySelector('.btn-text');
  if (loading) {
    spinner.hidden = false;
    btnText.textContent = 'جارٍ الترجمة...';
  } else {
    spinner.hidden = true;
    btnText.textContent = 'ترجمة';
  }
}

function updateInputCount() {
  const len = els.inputText.value.length;
  els.inputCount.textContent = `${len} حرف`;
}

async function handleFiles(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;

  let combined = '';
  for (const file of files) {
    try {
      const text = await file.text();
      combined += (combined ? '\n\n' : '') + text;
    } catch (err) {
      console.warn('Read failed:', file.name, err);
    }
  }

  if (combined) {
    els.inputText.value = combined;
    updateInputCount();
    showToast(`تم استيراد ${files.length} ملف`, 'success');
  } else {
    showToast('تعذر قراءة الملفات المحددة', 'error');
  }
  event.target.value = '';
}

/* ============================================================
   Event binding
============================================================ */
function bindEvents() {
  // ---- Header dropdown
  els.menuToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = els.dropdownMenu.hidden;
    els.dropdownMenu.hidden = !isHidden;
    els.menuToggle.setAttribute('aria-expanded', String(isHidden));
  });

  document.addEventListener('click', (e) => {
    if (
      !els.dropdownMenu.hidden &&
      !els.dropdownMenu.contains(e.target) &&
      !els.menuToggle.contains(e.target)
    ) {
      els.dropdownMenu.hidden = true;
      els.menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !els.dropdownMenu.hidden) {
      els.dropdownMenu.hidden = true;
      els.menuToggle.setAttribute('aria-expanded', 'false');
    }
  });

  // ---- Colors panel toggle
  els.colorsBtn.addEventListener('click', () => {
    els.colorsPanel.hidden = !els.colorsPanel.hidden;
    els.dropdownMenu.hidden = true;
    if (!els.colorsPanel.hidden) {
      els.colorsPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
  els.closeColors.addEventListener('click', () => { els.colorsPanel.hidden = true; });

  // ---- Clear history
  els.clearHistoryBtn.addEventListener('click', () => {
    els.dropdownMenu.hidden = true;
    clearHistory();
  });

  // ---- Dark mode
  els.darkModeToggle.addEventListener('change', () => {
    state.darkMode = els.darkModeToggle.checked;
    document.body.classList.toggle('dark', state.darkMode);
    saveState();
  });

  // ---- API settings
  els.apiKey.addEventListener('input', () => {
    state.apiKey = els.apiKey.value;
    saveState();
  });
  els.endpoint.addEventListener('input', () => {
    state.endpoint = els.endpoint.value;
    saveState();
  });

  // ---- Language selectors
  els.sourceLang.addEventListener('change', () => {
    state.sourceLang = els.sourceLang.value;
    saveState();
  });
  els.targetLang.addEventListener('change', () => {
    state.targetLang = els.targetLang.value;
    saveState();
  });
  els.model.addEventListener('change', () => {
    state.model = els.model.value;
    saveState();
  });

  els.swapLangs.addEventListener('click', () => {
    if (state.sourceLang === 'auto') {
      return showToast('لا يمكن تبديل الكشف التلقائي', 'error');
    }
    const tmp = state.sourceLang;
    state.sourceLang = state.targetLang;
    state.targetLang = tmp;
    els.sourceLang.value = state.sourceLang;
    els.targetLang.value = state.targetLang;
    saveState();
  });

  // ---- Voice
  els.voiceToggle.addEventListener('change', () => {
    state.voiceEnabled = els.voiceToggle.checked;
    saveState();
    if (state.voiceEnabled) showToast('الترجمة الصوتية مفعّلة', 'success');
  });

  // ---- Import
  els.importBtn.addEventListener('click', () => els.fileInput.click());
  els.fileInput.addEventListener('change', handleFiles);

  // ---- Input counter
  els.inputText.addEventListener('input', updateInputCount);

  // ---- Copy
  els.copyBtn.addEventListener('click', async () => {
    if (!els.outputText.value) return showToast('لا توجد ترجمة للنسخ', 'error');
    try {
      await navigator.clipboard.writeText(els.outputText.value);
      showToast('تم نسخ الترجمة', 'success');
    } catch {
      showToast('تعذر النسخ إلى الحافظة', 'error');
    }
  });

  // ---- Translate
  els.translateBtn.addEventListener('click', handleTranslate);
  els.inputText.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleTranslate();
    }
  });

  // ---- Colors
  els.primaryColor.addEventListener('input', () => {
    state.colors.primary = els.primaryColor.value;
    applyColors();
    saveState();
  });
  els.secondaryColor.addEventListener('input', () => {
    state.colors.secondary = els.secondaryColor.value;
    applyColors();
    saveState();
  });
  els.bgColor.addEventListener('input', () => {
    state.colors.bg = els.bgColor.value;
    applyColors();
    saveState();
  });

  els.resetColors.addEventListener('click', () => {
    state.colors = { ...DEFAULT_STATE.colors };
    applyColors();
    saveState();
    showToast('تمت استعادة الألوان الافتراضية', 'success');
  });
}

/* ============================================================
   Boot
============================================================ */
function init() {
  loadState();
  populateLanguages();
  bindEvents();
  syncUI();
  updateInputCount();

  // Preload voices for speech synthesis
  if ('speechSynthesis' in window) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices();
  }
}

document.addEventListener('DOMContentLoaded', init);