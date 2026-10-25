/* =====================================================================
   Turquoise Translate — app.js
   ---------------------------------------------------------------------
   README / SETUP (short version)
   ---------------------------------------------------------------------
   1. Put index.html, styles.css and app.js in the same folder.
   2. Open index.html directly in a browser (file:// works) or serve it
      from any static host (GitHub Pages, Netlify, nginx, …).
   3. Without an API endpoint the app runs in *demo mode* using a small
      built-in dictionary — handy for previewing the UI.
   4. To connect a real service:
        • paste your API key   → "API key"
        • paste the endpoint   → "API endpoint URL"
      The app POSTs JSON:
        { q, source, target, model }
      with header  Authorization: Bearer <apiKey>
      and reads the translation from the first of:
        translatedText · translation · output · result · data.translatedText
      (or the raw text body if the response is not JSON).
   5. Everything is persisted in localStorage:
        API key · endpoint · languages · model · voice toggle ·
        dark mode · palette · translation history (max 50 items).
   6. Shortcuts: Ctrl/⌘ + Enter translates · Esc closes menus/dialogs.

   No build step, no dependencies, no tracking.
   ===================================================================== */

'use strict';

/* =====================================================================
   1. CONSTANTS
   ===================================================================== */

const STORE = {
  key:      'tt.apiKey',
  endpoint: 'tt.endpoint',
  source:   'tt.sourceLang',
  target:   'tt.targetLang',
  model:    'tt.model',
  voice:    'tt.voice',
  dark:     'tt.dark',
  colors:   'tt.colors',
  history:  'tt.history'
};

const DEFAULT_COLORS = { primary: '#14b8a6', secondary: '#06b6d4', bg: '#f0fdfa' };
const DARK_BG        = '#04201e';
const LIGHT_BG       = '#f0fdfa';

const LANG_NAMES = {
  auto:'Auto-detect', en:'English', es:'Spanish', fr:'French', de:'German',
  it:'Italian', pt:'Portuguese', ru:'Russian', ar:'Arabic', zh:'Chinese',
  ja:'Japanese', ko:'Korean', hi:'Hindi', tr:'Turkish', nl:'Dutch',
  pl:'Polish', sv:'Swedish', da:'Danish', fi:'Finnish', no:'Norwegian',
  el:'Greek', he:'Hebrew', th:'Thai', vi:'Vietnamese', id:'Indonesian',
  ms:'Malay', uk:'Ukrainian', cs:'Czech', sk:'Slovak', hu:'Hungarian',
  ro:'Romanian', bg:'Bulgarian', hr:'Croatian', sr:'Serbian', sl:'Slovenian',
  fa:'Persian', ur:'Urdu', bn:'Bengali', ta:'Tamil', te:'Telugu',
  sw:'Swahili', fil:'Filipino'
};

const MODEL_LABELS = { professional: 'Professional', standard: 'Standard', ai: 'AI-powered' };

/* BCP-47 tags for the Web Speech API */
const SPEECH_LANG = {
  en:'en-US', es:'es-ES', fr:'fr-FR', de:'de-DE', it:'it-IT', pt:'pt-PT',
  ru:'ru-RU', ar:'ar-SA', zh:'zh-CN', ja:'ja-JP', ko:'ko-KR', hi:'hi-IN',
  tr:'tr-TR', nl:'nl-NL', pl:'pl-PL', sv:'sv-SE', da:'da-DK', fi:'fi-FI',
  no:'nb-NO', el:'el-GR', he:'he-IL', th:'th-TH', vi:'vi-VN', id:'id-ID',
  ms:'ms-MY', uk:'uk-UA', cs:'cs-CZ', sk:'sk-SK', hu:'hu-HU', ro:'ro-RO',
  bg:'bg-BG', hr:'hr-HR', sr:'sr-RS', sl:'sl-SI', fa:'fa-IR', ur:'ur-PK',
  bn:'bn-BD', ta:'ta-IN', te:'te-IN', sw:'sw-KE', fil:'fil-PH'
};

/* Tiny dictionary used only in demo mode (no endpoint configured). */
const DEMO_DICT = {
  es: { hello:'hola', hi:'hola', world:'mundo', good:'bueno', morning:'mañana',
        night:'noche', thank:'gracias', thanks:'gracias', you:'tú', please:'por favor',
        yes:'sí', no:'no', friend:'amigo', love:'amor', water:'agua', food:'comida',
        house:'casa', book:'libro', translate:'traducir', translation:'traducción',
        language:'idioma', welcome:'bienvenido', goodbye:'adiós', how:'cómo',
        are:'estás', what:'qué', is:'es', this:'esto', name:'nombre', my:'mi',
        your:'tu', the:'el', a:'un', and:'y', with:'con', for:'para', very:'muy',
        i:'yo', am:'soy', we:'nosotros', they:'ellos', from:'de', to:'a',
        in:'en', on:'en', of:'de', it:'eso', that:'eso', today:'hoy', tomorrow:'mañana' },
  fr: { hello:'bonjour', hi:'salut', world:'monde', good:'bon', morning:'matin',
        night:'nuit', thank:'merci', thanks:'merci', you:'vous', please:'s’il vous plaît',
        yes:'oui', no:'non', friend:'ami', love:'amour', water:'eau', food:'nourriture',
        house:'maison', book:'livre', translate:'traduire', translation:'traduction',
        language:'langue', welcome:'bienvenue', goodbye:'au revoir', how:'comment',
        are:'êtes', what:'quoi', is:'est', this:'ceci', name:'nom', my:'mon',
        your:'votre', the:'le', a:'un', and:'et', with:'avec', for:'pour', very:'très',
        i:'je', am:'suis', we:'nous', they:'ils', from:'de', to:'à', in:'dans',
        on:'sur', of:'de', it:'il', that:'que', today:'aujourd’hui', tomorrow:'demain' },
  de: { hello:'hallo', hi:'hallo', world:'Welt', good:'gut', morning:'Morgen',
        night:'Nacht', thank:'danke', thanks:'danke', you:'du', please:'bitte',
        yes:'ja', no:'nein', friend:'Freund', love:'Liebe', water:'Wasser',
        food:'Essen', house:'Haus', book:'Buch', translate:'übersetzen',
        translation:'Übersetzung', language:'Sprache', welcome:'willkommen',
        goodbye:'auf Wiedersehen', how:'wie', are:'bist', what:'was', is:'ist',
        this:'dies', name:'Name', my:'mein', your:'dein', the:'der', a:'ein',
        and:'und', with:'mit', for:'für', very:'sehr', i:'ich', am:'bin',
        we:'wir', they:'sie', from:'von', to:'zu', in:'in', on:'auf', of:'von',
        it:'es', that:'das', today:'heute', tomorrow:'morgen' },
  tr: { hello:'merhaba', hi:'selam', world:'dünya', good:'iyi', morning:'sabah',
        night:'gece', thank:'teşekkür', thanks:'teşekkürler', you:'sen',
        please:'lütfen', yes:'evet', no:'hayır', friend:'arkadaş', love:'aşk',
        water:'su', food:'yemek', house:'ev', book:'kitap', translate:'çevir',
        translation:'çeviri', language:'dil', welcome:'hoş geldiniz',
        goodbye:'hoşça kal', how:'nasıl', are:'sın', what:'ne', is:'dir',
        this:'bu', name:'isim', my:'benim', your:'senin', the:'', a:'bir',
        and:'ve', with:'ile', for:'için', very:'çok', i:'ben', am:'im',
        we:'biz', they:'onlar', from:'den', to:'e', in:'de', on:'da',
        of:'in', it:'o', that:'şu', today:'bugün', tomorrow:'yarın' }
};

/* =====================================================================
   2. TINY HELPERS
   ===================================================================== */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const sleep = ms => new Promise(res => setTimeout(res, ms));

/* Safe localStorage wrappers — private mode / quota can throw. */
const store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (err) { console.warn('[storage] write failed', key, err); }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* ignore */ }
  }
};

const debounce = (fn, ms = 220) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

/* ---------------- Colour maths (for accessible theming) ---------------- */

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  const n = parseInt(full, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }) {
  const to = v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
}

function mix(hexA, hexB, t) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  return rgbToHex({
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t
  });
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* WCAG relative luminance */
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const ch = c => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

function contrast(hexA, hexB) {
  const la = luminance(hexA), lb = luminance(hexB);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/* Pick the readable foreground for a given background. */
function bestOn(bg) {
  const dark = '#042f2e';
  const light = '#ffffff';
  return contrast(bg, dark) >= contrast(bg, light) ? dark : light;
}

/* =====================================================================
   3. APPLICATION STATE
   ===================================================================== */

const state = {
  apiKey: '',
  endpoint: '',
  source: 'auto',
  target: 'es',
  model: 'professional',
  voice: false,
  dark: false,
  colors: { ...DEFAULT_COLORS },
  history: []
};

/* Imported file names for the current draft (kept in memory only). */
let importedFiles = [];

/* =====================================================================
   4. DOM REFERENCES
   ===================================================================== */

const el = {
  root: document.documentElement,

  menuBtn: $('#menuBtn'),
  menu: $('#menuDropdown'),
  darkSwitch: $('#darkModeSwitch'),
  menuColors: $('#menuColors'),
  menuHistory: $('#menuHistory'),
  menuClearHistory: $('#menuClearHistory'),

  apiKey: $('#apiKey'),
  toggleKeyBtn: $('#toggleKeyBtn'),
  apiEndpoint: $('#apiEndpoint'),
  endpointBadge: $('#endpointBadge'),

  importBtn: $('#importBtn'),
  fileInput: $('#fileInput'),
  colorsBtn: $('#colorsBtn'),
  clearHistoryBtn: $('#clearHistoryBtn'),
  voiceSwitch: $('#voiceSwitch'),

  sourceLang: $('#sourceLang'),
  targetLang: $('#targetLang'),
  swapBtn: $('#swapBtn'),
  modelSelect: $('#modelSelect'),

  inputText: $('#inputText'),
  charCount: $('#charCount'),
  fileChips: $('#fileChips'),
  clearInputBtn: $('#clearInputBtn'),

  outputText: $('#outputText'),
  outputMeta: $('#outputMeta'),
  outputInfo: $('#outputInfo'),
  speakBtn: $('#speakBtn'),
  copyBtn: $('#copyBtn'),

  translateBtn: $('#translateBtn'),
  spinner: $('#spinner'),
  feedback: $('#feedback'),
  statusPill: $('#statusPill'),

  historyCard: $('#historyCard'),
  historyList: $('#historyList'),
  historyEmpty: $('#historyEmpty'),
  historyHideBtn: $('#historyHideBtn'),

  colorDialog: $('#colorDialog'),
  colorPrimary: $('#colorPrimary'),
  colorSecondary: $('#colorSecondary'),
  colorBg: $('#colorBg'),
  contrastReport: $('#contrastReport'),
  resetColorsBtn: $('#resetColorsBtn'),

  toastStack: $('#toastStack')
};

/* =====================================================================
   5. THEME & COLOUR APPLICATION
   ===================================================================== */

/* Push the palette into CSS custom properties and derive contrast-safe
   foregrounds. Runs on load, on palette change and on dark-mode toggle. */
function applyColors(colors) {
  const { primary, secondary, bg } = colors;
  const dark = state.dark;

  const text        = bestOn(bg);
  const onPrimary   = bestOn(primary);
  const onSecondary = bestOn(secondary);

  /* Surface is a soft step away from the background. */
  const surface = dark ? mix(bg, '#ffffff', 0.07) : mix(bg, '#ffffff', 0.62);

  const muted        = rgba(text, 0.66);
  const border       = rgba(primary, dark ? 0.42 : 0.30);
  const borderStrong = rgba(primary, 0.58);
  const ring         = rgba(primary, 0.45);

  const s = el.root.style;
  s.setProperty('--primary', primary);
  s.setProperty('--secondary', secondary);
  s.setProperty('--bg', bg);
  s.setProperty('--surface', surface);
  s.setProperty('--text', text);
  s.setProperty('--muted', muted);
  s.setProperty('--border', border);
  s.setProperty('--border-strong', borderStrong);
  s.setProperty('--on-primary', onPrimary);
  s.setProperty('--on-secondary', onSecondary);
  s.setProperty('--ring', ring);

  /* Keep the browser chrome (mobile address bar) in sync. */
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', primary);
}

function applyTheme() {
  el.root.dataset.theme = state.dark ? 'dark' : 'light';
  el.darkSwitch.checked = state.dark;
  applyColors(state.colors);
}

/* =====================================================================
   6. STATUS / FEEDBACK / TOASTS
   ===================================================================== */

function setStatus(kind, label) {
  el.statusPill.dataset.state = kind;
  $('.status-text', el.statusPill).textContent = label;
}

function setFeedback(message, kind = '') {
  el.feedback.textContent = message;
  el.feedback.className = `feedback ${kind}`.trim();
}

function toast(message, kind = 'info', timeout = 3400) {
  const node = document.createElement('div');
  node.className = `toast ${kind}`;
  node.setAttribute('role', kind === 'error' ? 'alert' : 'status');
  node.textContent = message;
  el.toastStack.appendChild(node);

  setTimeout(() => {
    node.classList.add('leaving');
    node.addEventListener('animationend', () => node.remove(), { once: true });
  }, timeout);
}

function setLoading(isLoading) {
  el.translateBtn.disabled = isLoading;
  el.spinner.hidden = !isLoading;
  $('.btn-label', el.translateBtn).textContent = isLoading ? 'Translating…' : 'Translate';
  if (isLoading) setStatus('working', 'Working');
}

/* =====================================================================
   7. PERSISTENCE
   ===================================================================== */

function loadSettings() {
  state.apiKey   = store.get(STORE.key, '') ?? '';
  state.endpoint = store.get(STORE.endpoint, '') ?? '';
  state.source   = store.get(STORE.source, 'auto');
  state.target   = store.get(STORE.target, 'es');
  state.model    = store.get(STORE.model, 'professional');
  state.voice    = store.get(STORE.voice, false) === true;
  state.dark     = store.get(STORE.dark, false) === true;

  const savedColors = store.get(STORE.colors, null);
  state.colors = (savedColors && savedColors.primary && savedColors.secondary && savedColors.bg)
    ? { ...savedColors }
    : { ...DEFAULT_COLORS };

  const hist = store.get(STORE.history, []);
  state.history = Array.isArray(hist) ? hist.slice(0, 50) : [];

  /* Reflect into the form controls */
  el.apiKey.value = state.apiKey;
  el.apiEndpoint.value = state.endpoint;
  el.sourceLang.value = state.source;
  el.targetLang.value = state.target;
  el.modelSelect.value = state.model;
  el.voiceSwitch.checked = state.voice;
  updateEndpointBadge();
}

function saveSettings() {
  store.set(STORE.key, state.apiKey);
  store.set(STORE.endpoint, state.endpoint);
  store.set(STORE.source, state.source);
  store.set(STORE.target, state.target);
  store.set(STORE.model, state.model);
  store.set(STORE.voice, state.voice);
  store.set(STORE.dark, state.dark);
  store.set(STORE.colors, state.colors);
}

const saveHistory = () => store.set(STORE.history, state.history.slice(0, 50));

function updateEndpointBadge() {
  const live = Boolean(state.endpoint.trim() && state.apiKey.trim());
  el.endpointBadge.textContent = live ? 'Live API' : 'Demo mode';
  el.endpointBadge.classList.toggle('live', live);
}

/* =====================================================================
   8. MENU (three-dot dropdown)
   ===================================================================== */

function openMenu() {
  el.menu.hidden = false;
  el.menuBtn.setAttribute('aria-expanded', 'true');
}
function closeMenu() {
  el.menu.hidden = true;
  el.menuBtn.setAttribute('aria-expanded', 'false');
}

el.menuBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  el.menu.hidden ? openMenu() : closeMenu();
});

/* Close on outside click */
document.addEventListener('click', (e) => {
  if (el.menu.hidden) return;
  if (el.menu.contains(e.target) || el.menuBtn.contains(e.target)) return;
  closeMenu();
});

/* Close on Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !el.menu.hidden) {
    closeMenu();
    el.menuBtn.focus();
  }
});

/* Menu items */
el.menuColors.addEventListener('click', () => { closeMenu(); openColorDialog(); });
el.menuHistory.addEventListener('click', () => { closeMenu(); showHistory(true); });
el.menuClearHistory.addEventListener('click', () => { closeMenu(); clearHistory(); });

/* Dark-mode switch (in the dropdown) */
el.darkSwitch.addEventListener('change', () => {
  state.dark = el.darkSwitch.checked;

  /* Swap only the default backgrounds so custom palettes survive. */
  const bg = state.colors.bg.toLowerCase();
  if (state.dark && bg === LIGHT_BG) state.colors.bg = DARK_BG;
  if (!state.dark && bg === DARK_BG) state.colors.bg = LIGHT_BG;

  applyTheme();
  saveSettings();
  toast(state.dark ? 'Dark mode on' : 'Dark mode off', 'info', 1800);
});

/* =====================================================================
   9. API CONFIGURATION INPUTS
   ===================================================================== */

el.apiKey.addEventListener('input', debounce(() => {
  state.apiKey = el.apiKey.value.trim();
  updateEndpointBadge();
  saveSettings();
}, 250));

el.apiEndpoint.addEventListener('input', debounce(() => {
  state.endpoint = el.apiEndpoint.value.trim();
  updateEndpointBadge();
  saveSettings();
}, 250));

/* Show / hide the key */
el.toggleKeyBtn.addEventListener('click', () => {
  const visible = el.apiKey.type === 'text';
  el.apiKey.type = visible ? 'password' : 'text';
  el.toggleKeyBtn.setAttribute('aria-pressed', String(!visible));
  el.toggleKeyBtn.setAttribute('aria-label', visible ? 'Show API key' : 'Hide API key');
});

/* =====================================================================
   10. LANGUAGE / MODEL SELECTION
   ===================================================================== */

el.sourceLang.addEventListener('change', () => {
  state.source = el.sourceLang.value;
  saveSettings();
});

el.targetLang.addEventListener('change', () => {
  state.target = el.targetLang.value;
  saveSettings();
  updateOutputInfo();
});

el.modelSelect.addEventListener('change', () => {
  state.model = el.modelSelect.value;
  saveSettings();
});

/* Swap languages. If source is "auto", fall back to English. */
el.swapBtn.addEventListener('click', () => {
  const from = state.source === 'auto' ? 'en' : state.source;
  const to = state.target;
  state.source = to;
  state.target = from;
  el.sourceLang.value = state.source;
  el.targetLang.value = state.target;
  saveSettings();
  updateOutputInfo();
  toast('Languages swapped', 'info', 1600);
});

/* =====================================================================
   11. VOICE TRANSLATION
   ===================================================================== */

el.voiceSwitch.addEventListener('change', () => {
  state.voice = el.voiceSwitch.checked;
  saveSettings();
  if (state.voice) toast('Voice translation enabled — results will be read aloud.', 'info');
});

function speak(text, lang) {
  if (!text) return;
  if (!('speechSynthesis' in window)) {
    toast('Speech synthesis is not supported in this browser.', 'error');
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = SPEECH_LANG[lang] || lang || 'en-US';
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  } catch (err) {
    console.warn('[speech]', err);
    toast('Could not play the audio.', 'error');
  }
}

el.speakBtn.addEventListener('click', () => {
  const text = el.outputText.value.trim();
  if (!text) return toast('Nothing to read yet.', 'error');
  speak(text, state.target);
});

/* =====================================================================
   12. FILE IMPORT
   ===================================================================== */

const MAX_FILE_BYTES = 1.5 * 1024 * 1024; // 1.5 MB per file

el.importBtn.addEventListener('click', () => el.fileInput.click());

el.fileInput.addEventListener('change', async () => {
  const files = Array.from(el.fileInput.files || []);
  if (!files.length) return;

  const parts = [];
  const accepted = [];

  for (const file of files) {
    try {
      if (file.size > MAX_FILE_BYTES) {
        toast(`"${file.name}" is too large (max 1.5 MB).`, 'error');
        continue;
      }
      const text = await file.text();

      /* Cheap binary sniffing: NUL bytes in the first 1000 chars. */
      if (text.slice(0, 1000).includes('\u0000')) {
        toast(`"${file.name}" looks like a binary file and was skipped.`, 'error');
        continue;
      }

      const clean = text.replace(/\r\n?/g, '\n').trim();
      if (!clean) {
        toast(`"${file.name}" is empty and was skipped.`, 'info');
        continue;
      }

      parts.push(`--- ${file.name} ---\n${clean}`);
      accepted.push({ name: file.name, size: file.size });
    } catch (err) {
      console.error(err);
      toast(`Could not read "${file.name}".`, 'error');
    }
  }

  el.fileInput.value = ''; // allow re-selecting the same file

  if (!parts.length) return;

  const existing = el.inputText.value.trim();
  el.inputText.value = existing ? `${existing}\n\n${parts.join('\n\n')}` : parts.join('\n\n');

  importedFiles = importedFiles.concat(accepted);
  renderFileChips();
  updateCharCount();
  setFeedback(`Imported ${accepted.length} file(s).`, 'success');
  toast(`Imported ${accepted.length} file(s).`, 'success');
});

function renderFileChips() {
  el.fileChips.textContent = importedFiles.length
    ? importedFiles.map(f => `📄 ${f.name}`).join('  ·  ')
    : '';
}

/* =====================================================================
   13. INPUT PANE
   ===================================================================== */

function updateCharCount() {
  const n = el.inputText.value.length;
  el.charCount.textContent = `${n.toLocaleString()} character${n === 1 ? '' : 's'}`;
}

function updateOutputInfo() {
  const from = LANG_NAMES[state.source] || state.source;
  const to = LANG_NAMES[state.target] || state.target;
  el.outputMeta.textContent = `${from} → ${to} · ${MODEL_LABELS[state.model] || state.model}`;
}

el.inputText.addEventListener('input', updateCharCount);

el.clearInputBtn.addEventListener('click', () => {
  el.inputText.value = '';
  importedFiles = [];
  renderFileChips();
  updateCharCount();
  el.inputText.focus();
});

/* =====================================================================
   14. TRANSLATION
   ===================================================================== */

/**
 * Call the configured endpoint.
 * The contract is intentionally forgiving: many providers differ slightly,
 * so we try the most common response shapes before giving up.
 */
async function callApi({ endpoint, apiKey, text, source, target, model }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);

  let res;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({ q: text, source, target, model }),
      signal: controller.signal
    });
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out after 30 seconds.');
    throw new Error('Network error — check the endpoint URL and your connection.');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.text();
      if (body) detail = ` — ${body.slice(0, 180)}`;
    } catch { /* ignore */ }
    throw new Error(`API responded with HTTP ${res.status}${detail}`);
  }

  const raw = await res.text();
  if (!raw) throw new Error('The API returned an empty response.');

  let data;
  try { data = JSON.parse(raw); }
  catch { return raw.trim(); } // plain-text API

  const candidate =
    data.translatedText ??
    data.translation ??
    data.output ??
    data.result ??
    data.data?.translatedText ??
    data.data?.translation ??
    data.choices?.[0]?.message?.content;

  if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  throw new Error('Could not find a translation in the API response.');
}

/** Demo mode: word-by-word dictionary substitution. */
function demoTranslate(text, target) {
  const dict = DEMO_DICT[target];
  if (!dict) {
    return `[${LANG_NAMES[target] || target}] ${text}`;
  }
  return text.replace(/\b[\p{L}\p{M}']+\b/gu, (word) => {
    const key = word.toLowerCase();
    if (!(key in dict)) return word;
    const out = dict[key];
    if (!out) return word;
    return /^\p{Lu}/u.test(word)
      ? out.charAt(0).toUpperCase() + out.slice(1)
      : out;
  });
}

async function doTranslate() {
  const text = el.inputText.value.trim();

  if (!text) {
    setFeedback('Please enter or import some text first.', 'error');
    setStatus('error', 'Empty input');
    el.inputText.focus();
    return;
  }

  if (state.source !== 'auto' && state.source === state.target) {
    setFeedback('Source and target languages are the same.', 'error');
    setStatus('error', 'Same language');
    return;
  }

  setLoading(true);
  setFeedback('');
  el.outputText.value = '';
  el.outputInfo.textContent = '';

  const started = performance.now();

  try {
    let translated;
    const useLive = Boolean(state.endpoint.trim() && state.apiKey.trim());

    if (useLive) {
      translated = await callApi({
        endpoint: state.endpoint,
        apiKey: state.apiKey,
        text,
        source: state.source,
        target: state.target,
        model: state.model
      });
      setFeedback('Translated via your API.', 'success');
    } else {
      await sleep(420); // keep the spinner visible long enough to feel real
      translated = demoTranslate(text, state.target);
      setFeedback('Demo mode — add an endpoint and key for live translations.', 'success');
    }

    el.outputText.value = translated;

    const ms = Math.round(performance.now() - started);
    el.outputInfo.textContent = `${translated.length.toLocaleString()} chars · ${ms} ms`;
    updateOutputInfo();

    addHistory({
      ts: Date.now(),
      source: state.source,
      target: state.target,
      model: state.model,
      input: text,
      output: translated
    });

    if (state.voice) speak(translated, state.target);

    setStatus('success', 'Done');
    toast('Translation ready.', 'success', 2200);
  } catch (err) {
    console.error('[translate]', err);
    const message = err?.message || 'Translation failed.';
    setFeedback(message, 'error');
    setStatus('error', 'Failed');
    toast(message, 'error', 5200);
  } finally {
    setLoading(false);
  }
}

el.translateBtn.addEventListener('click', doTranslate);

/* Ctrl / ⌘ + Enter anywhere in the translator card */
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (!el.translateBtn.disabled) doTranslate();
  }
});

/* =====================================================================
   15. OUTPUT ACTIONS
   ===================================================================== */

el.copyBtn.addEventListener('click', async () => {
  const text = el.outputText.value;
  if (!text) return toast('Nothing to copy yet.', 'error');
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      el.outputText.select();
      document.execCommand('copy');
    }
    toast('Copied to clipboard.', 'success', 1800);
  } catch {
    toast('Copy failed — please select the text manually.', 'error');
  }
});

/* =====================================================================
   16. HISTORY
   ===================================================================== */

function addHistory(entry) {
  state.history.unshift({ id: `${entry.ts}-${Math.random().toString(36).slice(2, 7)}`, ...entry });
  state.history = state.history.slice(0, 50);
  saveHistory();
  renderHistory();
}

function renderHistory() {
  el.historyList.innerHTML = '';

  if (!state.history.length) {
    el.historyEmpty.hidden = false;
    return;
  }
  el.historyEmpty.hidden = true;

  const fragment = document.createDocumentFragment();

  state.history.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.dataset.index = String(index);

    const meta = document.createElement('div');
    meta.className = 'history-meta';

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = MODEL_LABELS[item.model] || item.model;

    const langs = document.createElement('span');
    langs.textContent = `${LANG_NAMES[item.source] || item.source} → ${LANG_NAMES[item.target] || item.target}`;

    const time = document.createElement('time');
    time.dateTime = new Date(item.ts).toISOString();
    time.textContent = new Date(item.ts).toLocaleString();

    meta.append(badge, langs, time);

    const src = document.createElement('p');
    src.className = 'history-src';
    src.textContent = truncate(item.input, 150);

    const out = document.createElement('p');
    out.className = 'history-out';
    out.textContent = truncate(item.output, 150);

    const actions = document.createElement('div');
    actions.className = 'history-actions';

    actions.append(
      historyButton('Reuse', 'reuse', index),
      historyButton('🔊', 'speak', index, 'Read aloud'),
      historyButton('Copy', 'copy', index)
    );

    li.append(meta, src, out, actions);
    fragment.appendChild(li);
  });

  el.historyList.appendChild(fragment);
}

function historyButton(label, action, index, ariaLabel) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-ghost btn-sm';
  btn.dataset.action = action;
  btn.dataset.index = String(index);
  btn.textContent = label;
  if (ariaLabel) btn.setAttribute('aria-label', ariaLabel);
  return btn;
}

function truncate(str, n) {
  const clean = String(str).replace(/\s+/g, ' ').trim();
  return clean.length > n ? `${clean.slice(0, n - 1)}…` : clean;
}

/* Event delegation for history actions */
el.historyList.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const index = Number(btn.dataset.index);
  const item = state.history[index];
  if (!item) return;

  switch (btn.dataset.action) {
    case 'reuse':
      el.inputText.value = item.input;
      el.outputText.value = item.output;
      state.source = item.source;
      state.target = item.target;
      state.model = item.model;
      el.sourceLang.value = item.source;
      el.targetLang.value = item.target;
      el.modelSelect.value = item.model;
      saveSettings();
      updateCharCount();
      updateOutputInfo();
      el.outputInfo.textContent = '';
      toast('Loaded into the translator.', 'info', 1800);
      el.inputText.focus();
      break;

    case 'speak':
      speak(item.output, item.target);
      break;

    case 'copy':
      try {
        await navigator.clipboard.writeText(item.output);
        toast('Copied to clipboard.', 'success', 1800);
      } catch {
        toast('Copy failed.', 'error');
      }
      break;
  }
});

function clearHistory() {
  if (!state.history.length) {
    toast('History is already empty.', 'info', 1800);
    return;
  }
  const ok = window.confirm('Delete all saved translations? This cannot be undone.');
  if (!ok) return;

  state.history = [];
  store.remove(STORE.history);
  renderHistory();
  toast('History cleared.', 'success', 2000);
}

el.clearHistoryBtn.addEventListener('click', clearHistory);

function showHistory(show) {
  el.historyCard.hidden = !show;
  if (show) {
    renderHistory();
    el.historyCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

el.historyHideBtn.addEventListener('click', () => {
  el.historyCard.hidden = true;
});

/* =====================================================================
   17. SITE COLORS DIALOG
   ===================================================================== */

function openColorDialog() {
  el.colorPrimary.value = state.colors.primary;
  el.colorSecondary.value = state.colors.secondary;
  el.colorBg.value = state.colors.bg;
  updateContrastReport();

  if (typeof el.colorDialog.showModal === 'function') {
    el.colorDialog.showModal();
  } else {
    el.colorDialog.setAttribute('open', ''); // very old browser fallback
  }
}

el.colorsBtn.addEventListener('click', openColorDialog);

/* Live preview while the user drags a colour picker */
function onColorInput() {
  state.colors = {
    primary: el.colorPrimary.value,
    secondary: el.colorSecondary.value,
    bg: el.colorBg.value
  };
  applyColors(state.colors);
  updateContrastReport();
}

el.colorPrimary.addEventListener('input', onColorInput);
el.colorSecondary.addEventListener('input', onColorInput);
el.colorBg.addEventListener('input', onColorInput);

/* Persist when the dialog closes (Done, Esc or ✕) */
el.colorDialog.addEventListener('close', () => {
  saveSettings();
  applyColors(state.colors);
});

el.resetColorsBtn.addEventListener('click', () => {
  state.colors = { ...DEFAULT_COLORS };
  /* If dark mode is active, restore the dark background instead. */
  if (state.dark) state.colors.bg = DARK_BG;

  el.colorPrimary.value = state.colors.primary;
  el.colorSecondary.value = state.colors.secondary;
  el.colorBg.value = state.colors.bg;

  applyColors(state.colors);
  updateContrastReport();
  saveSettings();
  toast('Palette reset to defaults.', 'info', 1800);
});

/* Contrast readout inside the dialog */
function updateContrastReport() {
  const rows = [
    ['Button text on primary', contrast(state.colors.primary, bestOn(state.colors.primary))],
    ['Body text on background', contrast(state.colors.bg, bestOn(state.colors.bg))],
    ['Accents on secondary', contrast(state.colors.secondary, bestOn(state.colors.secondary))]
  ];

  el.contrastReport.innerHTML = '';
  rows.forEach(([label, ratio]) => {
    const row = document.createElement('div');
    row.className = 'contrast-row';

    const name = document.createElement('span');
    name.textContent = label;

    const value = document.createElement('span');
    const ok = ratio >= 4.5;
    value.className = ok ? 'pass' : 'fail';
    value.innerHTML = `<span class="ratio">${ratio.toFixed(2)}:1</span> ${ok ? '✓ AA' : '✗ low'}`;

    row.append(name, value);
    el.contrastReport.appendChild(row);
  });
}

/* =====================================================================
   18. BOOTSTRAP
   ===================================================================== */

function init() {
  loadSettings();
  applyTheme();
  updateOutputInfo();
  updateCharCount();
  renderHistory();
  setStatus('idle', 'Ready');

  /* Small, friendly first-run hint. */
  if (!state.apiKey && !state.endpoint) {
    setTimeout(() => {
      toast('Tip: add your API key and endpoint — or try demo mode right away.', 'info', 5200);
    }, 900);
  }
}

init();