/* =====================================================================
   ترجمة تركواز — app.js
   ---------------------------------------------------------------------
   README (نسخة مختصرة)
   ---------------------------------------------------------------------
   1. ضع الملفات الثلاثة (index.html، styles.css، app.js) في مجلد واحد.
   2. افتح index.html مباشرة في المتصفح أو ارفعه على أي استضافة ثابتة
      (GitHub Pages، Netlify، nginx…).
   3. بدون نقطة نهاية API يعمل التطبيق في «الوضع التجريبي» اعتمادًا على
      قاموس صغير مدمج — مفيد لمعاينة الواجهة فقط.
   4. لربط خدمة حقيقية:
      • الصق مفتاح API في حقل «مفتاح API».
      • الصق عنوان النقطة في حقل «عنوان نقطة النهاية».
      يرسل التطبيق طلب POST بصيغة JSON:
        { q, source, target, model }
      مع ترويسة  Authorization: Bearer <apiKey>
      ويقرأ الترجمة من أول حقل موجود في الاستجابة:
        translatedText · translation · output · result ·
        data.translatedText · data.translation
      (أو يعيد النص الخام إذا لم تكن الاستجابة JSON).
   5. كل شيء يُحفظ في localStorage:
      مفتاح API · النقطة · اللغات · النموذج · الترجمة الصوتية ·
      الوضع الليلي · لوحة الألوان · سجل الترجمات (بحد أقصى 50 عنصرًا).
   6. اختصارات لوحة المفاتيح:
      Ctrl/⌘ + Enter  → الترجمة
      Esc             → إغلاق القوائم والنوافذ.
   ===================================================================== */

'use strict';

/* =====================================================================
   1. الثوابت
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

/* أسماء اللغات بالعربية */
const LANG_NAMES = {
  auto:'كشف تلقائي', ar:'العربية', en:'الإنجليزية', fr:'الفرنسية',
  es:'الإسبانية', de:'الألمانية', it:'الإيطالية', pt:'البرتغالية',
  ru:'الروسية', zh:'الصينية', ja:'اليابانية', ko:'الكورية',
  hi:'الهندية', tr:'التركية', nl:'الهولندية', pl:'البولندية',
  sv:'السويدية', da:'الدنماركية', fi:'الفنلندية', no:'النرويجية',
  el:'اليونانية', he:'العبرية', th:'التايلاندية', vi:'الفيتنامية',
  id:'الإندونيسية', ms:'الماليزية', uk:'الأوكرانية', cs:'التشيكية',
  sk:'السلوفاكية', hu:'المجرية', ro:'الرومانية', bg:'البلغارية',
  hr:'الكرواتية', sr:'الصربية', sl:'السلوفينية', fa:'الفارسية',
  ur:'الأردية', bn:'البنغالية', ta:'التاميلية', te:'التيلوغوية',
  sw:'السواحيلية', fil:'الفلبينية'
};

const MODEL_LABELS = {
  professional: 'احترافي',
  standard:     'قياسي',
  ai:           'ذكاء اصطناعي'
};

/* وسوم BCP-47 لخدمة Web Speech */
const SPEECH_LANG = {
  ar:'ar-SA', en:'en-US', fr:'fr-FR', es:'es-ES', de:'de-DE',
  it:'it-IT', pt:'pt-PT', ru:'ru-RU', zh:'zh-CN', ja:'ja-JP',
  ko:'ko-KR', hi:'hi-IN', tr:'tr-TR', nl:'nl-NL', pl:'pl-PL',
  sv:'sv-SE', da:'da-DK', fi:'fi-FI', no:'nb-NO', el:'el-GR',
  he:'he-IL', th:'th-TH', vi:'vi-VN', id:'id-ID', ms:'ms-MY',
  uk:'uk-UA', cs:'cs-CZ', sk:'sk-SK', hu:'hu-HU', ro:'ro-RO',
  bg:'bg-BG', hr:'hr-HR', sr:'sr-RS', sl:'sl-SI', fa:'fa-IR',
  ur:'ur-PK', bn:'bn-BD', ta:'ta-IN', te:'te-IN', sw:'sw-KE',
  fil:'fil-PH'
};

/* قاموس صغير للوضع التجريبي (بالإنجليزية والعربية فقط) */
const DEMO_DICT = {
  'en->ar': {
    hello:'مرحبا', hi:'أهلاً', world:'عالم', good:'جيد', morning:'صباح',
    evening:'مساء', night:'ليل', thank:'شكراً', thanks:'شكراً', please:'من فضلك',
    yes:'نعم', no:'لا', friend:'صديق', love:'حب', water:'ماء', food:'طعام',
    house:'بيت', book:'كتاب', translate:'ترجم', translation:'ترجمة',
    language:'لغة', welcome:'أهلاً وسهلاً', goodbye:'وداعاً', how:'كيف',
    what:'ماذا', is:'هو', this:'هذا', name:'اسم', my:'لي', your:'لك',
    the:'ال', and:'و', with:'مع', for:'لأجل', very:'جداً', i:'أنا',
    am:'أكون', we:'نحن', they:'هم', from:'من', to:'إلى', in:'في',
    on:'على', of:'من', it:'هو', that:'ذلك', today:'اليوم', tomorrow:'غداً'
  },
  'ar->en': {
    'مرحبا':'hello', 'أهلاً':'hi', 'عالم':'world', 'جيد':'good',
    'صباح':'morning', 'مساء':'evening', 'ليل':'night', 'شكراً':'thanks',
    'من فضلك':'please', 'نعم':'yes', 'لا':'no', 'صديق':'friend',
    'حب':'love', 'ماء':'water', 'طعام':'food', 'بيت':'house',
    'كتاب':'book', 'ترجم':'translate', 'ترجمة':'translation',
    'لغة':'language', 'وداعاً':'goodbye', 'كيف':'how', 'ماذا':'what',
    'هو':'is', 'هذا':'this', 'اسم':'name', 'أنا':'I', 'نحن':'we',
    'هم':'they', 'من':'from', 'إلى':'to', 'في':'in', 'على':'on',
    'اليوم':'today', 'غداً':'tomorrow'
  }
};

/* =====================================================================
   2. أدوات مساعدة صغيرة
   ===================================================================== */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const sleep = ms => new Promise(res => setTimeout(res, ms));

/* غلاف آمن لـ localStorage — الوضع الخاص أو تجاوز الحصة قد يرمي استثناءً */
const store = {
  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch (err) { console.warn('[storage] فشل الكتابة', key, err); }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch { /* تجاهل */ }
  }
};

const debounce = (fn, ms = 220) => {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
};

/* ---------------- رياضيات الألوان (لضمان تباين وصولي) ---------------- */

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

/* الإنارة النسبية وفق WCAG */
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

/* اختيار لون أمامي مقروء لخلفية معيّنة */
function bestOn(bg) {
  const dark  = '#042f2e';
  const light = '#ffffff';
  return contrast(bg, dark) >= contrast(bg, light) ? dark : light;
}

/* =====================================================================
   3. حالة التطبيق
   ===================================================================== */

const state = {
  apiKey:   '',
  endpoint: '',
  source:   'auto',
  target:   'ar',
  model:    'professional',
  voice:    false,
  dark:     false,
  colors:   { ...DEFAULT_COLORS },
  history:  []
};

/* أسماء الملفات المستوردة للنص الحالي (في الذاكرة فقط) */
let importedFiles = [];

/* =====================================================================
   4. مراجع DOM
   ===================================================================== */

const el = {
  root: document.documentElement,

  menuBtn:           $('#menuBtn'),
  menu:              $('#menuDropdown'),
  darkSwitch:        $('#darkModeSwitch'),
  menuColors:        $('#menuColors'),
  menuHistory:       $('#menuHistory'),
  menuClearHistory:  $('#menuClearHistory'),

  apiKey:            $('#apiKey'),
  toggleKeyBtn:      $('#toggleKeyBtn'),
  apiEndpoint:       $('#apiEndpoint'),
  endpointBadge:     $('#endpointBadge'),

  importBtn:         $('#importBtn'),
  fileInput:         $('#fileInput'),
  colorsBtn:         $('#colorsBtn'),
  clearHistoryBtn:   $('#clearHistoryBtn'),
  voiceSwitch:       $('#voiceSwitch'),

  sourceLang:        $('#sourceLang'),
  targetLang:        $('#targetLang'),
  swapBtn:           $('#swapBtn'),
  modelSelect:       $('#modelSelect'),

  inputText:         $('#inputText'),
  charCount:         $('#charCount'),
  fileChips:         $('#fileChips'),
  clearInputBtn:     $('#clearInputBtn'),

  outputText:        $('#outputText'),
  outputMeta:        $('#outputMeta'),
  outputInfo:        $('#outputInfo'),
  speakBtn:          $('#speakBtn'),
  copyBtn:           $('#copyBtn'),

  translateBtn:      $('#translateBtn'),
  spinner:           $('#spinner'),
  feedback:          $('#feedback'),
  statusPill:        $('#statusPill'),

  historyCard:       $('#historyCard'),
  historyList:       $('#historyList'),
  historyEmpty:      $('#historyEmpty'),
  historyHideBtn:    $('#historyHideBtn'),

  colorDialog:       $('#colorDialog'),
  colorPrimary:      $('#colorPrimary'),
  colorSecondary:    $('#colorSecondary'),
  colorBg:           $('#colorBg'),
  contrastReport:    $('#contrastReport'),
  resetColorsBtn:    $('#resetColorsBtn'),

  toastStack:        $('#toastStack')
};

/* =====================================================================
   5. السمة والألوان
   ===================================================================== */

/* دفع اللوحة إلى خصائص CSS واستخلاص لون نص متباين تلقائيًا.
   تنفَّذ عند الإقلاع، وعند تغيير اللوحة، وعند تبديل الوضع الليلي. */
function applyColors(colors) {
  const { primary, secondary, bg } = colors;
  const dark = state.dark;

  const text        = bestOn(bg);
  const onPrimary   = bestOn(primary);
  const onSecondary = bestOn(secondary);

  /* السطح: خطوة ناعمة مبتعدة عن الخلفية */
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

  /* مزامنة لون شريط المتصفح (theme-color) */
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', primary);
}

function applyTheme() {
  el.root.dataset.theme = state.dark ? 'dark' : 'light';
  el.darkSwitch.checked = state.dark;
  applyColors(state.colors);
}

/* =====================================================================
   6. الحالة / التغذية الراجعة / التنبيهات
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
  $('.btn-label', el.translateBtn).textContent = isLoading ? 'جارٍ الترجمة…' : 'ترجم';
  if (isLoading) setStatus('working', 'يعمل');
}

/* =====================================================================
   7. التخزين
   ===================================================================== */

function loadSettings() {
  state.apiKey   = store.get(STORE.key, '') ?? '';
  state.endpoint = store.get(STORE.endpoint, '') ?? '';
  state.source   = store.get(STORE.source, 'auto');
  state.target   = store.get(STORE.target, 'ar');
  state.model    = store.get(STORE.model, 'professional');
  state.voice    = store.get(STORE.voice, false) === true;
  state.dark     = store.get(STORE.dark, false) === true;

  const savedColors = store.get(STORE.colors, null);
  state.colors = (savedColors && savedColors.primary && savedColors.secondary && savedColors.bg)
    ? { ...savedColors }
    : { ...DEFAULT_COLORS };

  const hist = store.get(STORE.history, []);
  state.history = Array.isArray(hist) ? hist.slice(0, 50) : [];

  /* مزامنة عناصر النموذج */
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
  el.endpointBadge.textContent = live ? 'API حيّ' : 'الوضع التجريبي';
  el.endpointBadge.classList.toggle('live', live);
}

/* =====================================================================
   8. القائمة المنسدلة
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

/* إغلاق عند النقر خارج القائمة */
document.addEventListener('click', (e) => {
  if (el.menu.hidden) return;
  if (el.menu.contains(e.target) || el.menuBtn.contains(e.target)) return;
  closeMenu();
});

/* إغلاق بمفتاح Escape */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !el.menu.hidden) {
    closeMenu();
    el.menuBtn.focus();
  }
});

/* عناصر القائمة */
el.menuColors.addEventListener('click', () => { closeMenu(); openColorDialog(); });
el.menuHistory.addEventListener('click', () => { closeMenu(); showHistory(true); });
el.menuClearHistory.addEventListener('click', () => { closeMenu(); clearHistory(); });

/* مفتاح الوضع الليلي */
el.darkSwitch.addEventListener('change', () => {
  state.dark = el.darkSwitch.checked;

  /* تبديل الخلفية الافتراضية فقط كي لا نفقد لوحة المستخدم */
  const bg = state.colors.bg.toLowerCase();
  if (state.dark && bg === LIGHT_BG) state.colors.bg = DARK_BG;
  if (!state.dark && bg === DARK_BG) state.colors.bg = LIGHT_BG;

  applyTheme();
  saveSettings();
  toast(state.dark ? 'تم تفعيل الوضع الليلي' : 'تم تعطيل الوضع الليلي', 'info', 1800);
});

/* =====================================================================
   9. حقول إعدادات API
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

/* إظهار / إخفاء المفتاح */
el.toggleKeyBtn.addEventListener('click', () => {
  const visible = el.apiKey.type === 'text';
  el.apiKey.type = visible ? 'password' : 'text';
  el.toggleKeyBtn.setAttribute('aria-pressed', String(!visible));
  el.toggleKeyBtn.setAttribute('aria-label', visible ? 'إظهار مفتاح API' : 'إخفاء مفتاح API');
});

/* =====================================================================
   10. اختيار اللغات والنموذج
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

/* تبديل اللغتين. عند وجود «كشف تلقائي» نستخدم الإنجليزية كافتراضي */
el.swapBtn.addEventListener('click', () => {
  const from = state.source === 'auto' ? 'en' : state.source;
  const to = state.target;
  state.source = to;
  state.target = from;
  el.sourceLang.value = state.source;
  el.targetLang.value = state.target;
  saveSettings();
  updateOutputInfo();
  toast('تم تبديل اللغتين', 'info', 1600);
});

/* =====================================================================
   11. الترجمة الصوتية
   ===================================================================== */

el.voiceSwitch.addEventListener('change', () => {
  state.voice = el.voiceSwitch.checked;
  saveSettings();
  if (state.voice) {
    toast('تم تفعيل الترجمة الصوتية — ستُقرأ النتائج بصوت عالٍ.', 'info');
  }
});

function speak(text, lang) {
  if (!text) return;
  if (!('speechSynthesis' in window)) {
    toast('متصفحك لا يدعم تحويل النص إلى كلام.', 'error');
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = SPEECH_LANG[lang] || lang || 'ar-SA';
    utter.rate = 1;
    utter.pitch = 1;
    window.speechSynthesis.speak(utter);
  } catch (err) {
    console.warn('[speech]', err);
    toast('تعذّر تشغيل الصوت.', 'error');
  }
}

el.speakBtn.addEventListener('click', () => {
  const text = el.outputText.value.trim();
  if (!text) return toast('لا يوجد نص للقراءة بعد.', 'error');
  speak(text, state.target);
});

/* =====================================================================
   12. استيراد الملفات
   ===================================================================== */

const MAX_FILE_BYTES = 1.5 * 1024 * 1024; // 1.5 ميغابايت لكل ملف

el.importBtn.addEventListener('click', () => el.fileInput.click());

el.fileInput.addEventListener('change', async () => {
  const files = Array.from(el.fileInput.files || []);
  if (!files.length) return;

  const parts = [];
  const accepted = [];

  for (const file of files) {
    try {
      if (file.size > MAX_FILE_BYTES) {
        toast(`"${file.name}" كبير جدًا (الحد 1.5 ميغابايت).`, 'error');
        continue;
      }
      const text = await file.text();

      /* فحص سريع للثنائيات: وجود NUL في أول 1000 حرف */
      if (text.slice(0, 1000).includes('\u0000')) {
        toast(`"${file.name}" يبدو ملفًا ثنائيًا وتم تجاهله.`, 'error');
        continue;
      }

      const clean = text.replace(/\r\n?/g, '\n').trim();
      if (!clean) {
        toast(`"${file.name}" فارغ وتم تجاهله.`, 'info');
        continue;
      }

      parts.push(`--- ${file.name} ---\n${clean}`);
      accepted.push({ name: file.name, size: file.size });
    } catch (err) {
      console.error(err);
      toast(`تعذّرت قراءة "${file.name}".`, 'error');
    }
  }

  el.fileInput.value = ''; // للسماح بإعادة اختيار الملف نفسه

  if (!parts.length) return;

  const existing = el.inputText.value.trim();
  el.inputText.value = existing ? `${existing}\n\n${parts.join('\n\n')}` : parts.join('\n\n');

  importedFiles = importedFiles.concat(accepted);
  renderFileChips();
  updateCharCount();
  setFeedback(`تم استيراد ${accepted.length} ملف/ملفات.`, 'success');
  toast(`تم استيراد ${accepted.length} ملف/ملفات.`, 'success');
});

function renderFileChips() {
  el.fileChips.textContent = importedFiles.length
    ? importedFiles.map(f => `📄 ${f.name}`).join('  ·  ')
    : '';
}

/* =====================================================================
   13. لوحة الإدخال
   ===================================================================== */

function updateCharCount() {
  const n = el.inputText.value.length;
  el.charCount.textContent = `${n.toLocaleString('ar-EG')} حرف`;
}

function updateOutputInfo() {
  const from = LANG_NAMES[state.source] || state.source;
  const to = LANG_NAMES[state.target] || state.target;
  el.outputMeta.textContent = `${from} ← ${to} · ${MODEL_LABELS[state.model] || state.model}`;
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
   14. الترجمة
   ===================================================================== */

/**
 * إرسال الطلب إلى نقطة النهاية المُهيّأة.
 * العقد متساهل بقصدٍ: خدمات كثيرة تختلف قليلًا في شكل الاستجابة،
 * لذلك نجرب الأشكال الشائعة بالترتيب.
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
    if (err.name === 'AbortError') throw new Error('انتهت مهلة الطلب بعد 30 ثانية.');
    throw new Error('خطأ في الشبكة — تحقّق من عنوان النقطة واتصالك.');
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.text();
      if (body) detail = ` — ${body.slice(0, 180)}`;
    } catch { /* تجاهل */ }
    throw new Error(`استجاب الـ API بالرمز HTTP ${res.status}${detail}`);
  }

  const raw = await res.text();
  if (!raw) throw new Error('أعاد الـ API استجابة فارغة.');

  let data;
  try { data = JSON.parse(raw); }
  catch { return raw.trim(); } // API بنص عادي

  const candidate =
    data.translatedText ??
    data.translation ??
    data.output ??
    data.result ??
    data.data?.translatedText ??
    data.data?.translation ??
    data.choices?.[0]?.message?.content;

  if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
  throw new Error('تعذّر العثور على ترجمة في استجابة الـ API.');
}

/* كشف اتجاه اللغة في الوضع التجريبي (عربي أو إنجليزي) */
function detectLang(text) {
  return /[\u0600-\u06FF]/.test(text) ? 'ar' : 'en';
}

/** الوضع التجريبي: استبدال كلمة بكلمة عبر القاموس المدمج. */
function demoTranslate(text, target, source) {
  const src = source === 'auto' ? detectLang(text) : source;
  const key = `${src}->${target}`;
  const dict = DEMO_DICT[key];

  if (!dict) {
    return `[${LANG_NAMES[target] || target}] ${text}`;
  }

  return text.replace(/\b[\p{L}\p{M}']+\b/gu, (word) => {
    const lookup = word.toLowerCase();
    const out = dict[lookup] ?? dict[word];
    if (!out) return word;
    return /^\p{Lu}/u.test(word)
      ? out.charAt(0).toUpperCase() + out.slice(1)
      : out;
  });
}

async function doTranslate() {
  const text = el.inputText.value.trim();

  if (!text) {
    setFeedback('الرجاء إدخال أو استيراد نص أولاً.', 'error');
    setStatus('error', 'إدخال فارغ');
    el.inputText.focus();
    return;
  }

  if (state.source !== 'auto' && state.source === state.target) {
    setFeedback('لغتا المصدر والهدف متطابقتان.', 'error');
    setStatus('error', 'نفس اللغة');
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
        apiKey:   state.apiKey,
        text,
        source:   state.source,
        target:   state.target,
        model:    state.model
      });
      setFeedback('تمت الترجمة عبر الـ API الخاص بك.', 'success');
    } else {
      await sleep(420); // إبقاء المؤشر ظاهرًا لمدة معقولة
      translated = demoTranslate(text, state.target, state.source);
      setFeedback('وضع تجريبي — أضف النقطة والمفتاح لترجمة حقيقية.', 'success');
    }

    el.outputText.value = translated;

    const ms = Math.round(performance.now() - started);
    el.outputInfo.textContent = `${translated.length.toLocaleString('ar-EG')} حرف · ${ms} م.ث`;
    updateOutputInfo();

    addHistory({
      ts: Date.now(),
      source: state.source,
      target: state.target,
      model:  state.model,
      input:  text,
      output: translated
    });

    if (state.voice) speak(translated, state.target);

    setStatus('success', 'تم');
    toast('الترجمة جاهزة.', 'success', 2200);
  } catch (err) {
    console.error('[translate]', err);
    const message = err?.message || 'فشلت الترجمة.';
    setFeedback(message, 'error');
    setStatus('error', 'فشل');
    toast(message, 'error', 5200);
  } finally {
    setLoading(false);
  }
}

el.translateBtn.addEventListener('click', doTranslate);

/* Ctrl / ⌘ + Enter للترجمة السريعة */
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (!el.translateBtn.disabled) doTranslate();
  }
});

/* =====================================================================
   15. إجراءات الإخراج
   ===================================================================== */

el.copyBtn.addEventListener('click', async () => {
  const text = el.outputText.value;
  if (!text) return toast('لا يوجد نص للنسخ بعد.', 'error');
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      el.outputText.select();
      document.execCommand('copy');
    }
    toast('تم النسخ إلى الحافظة.', 'success', 1800);
  } catch {
    toast('فشل النسخ — اختر النص يدويًا.', 'error');
  }
});

/* =====================================================================
   16. السجل
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
    langs.textContent = `${LANG_NAMES[item.source] || item.source} ← ${LANG_NAMES[item.target] || item.target}`;

    const time = document.createElement('time');
    time.dateTime = new Date(item.ts).toISOString();
    time.textContent = new Date(item.ts).toLocaleString('ar-EG');

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
      historyButton('إعادة الاستخدام', 'reuse', index),
      historyButton('🔊', 'speak', index, 'قراءة بصوت عالٍ'),
      historyButton('نسخ', 'copy', index)
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

/* تفويض أحداث أزرار السجل */
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
      toast('تم تحميل الترجمة في المترجم.', 'info', 1800);
      el.inputText.focus();
      break;

    case 'speak':
      speak(item.output, item.target);
      break;

    case 'copy':
      try {
        await navigator.clipboard.writeText(item.output);
        toast('تم النسخ إلى الحافظة.', 'success', 1800);
      } catch {
        toast('فشل النسخ.', 'error');
      }
      break;
  }
});

function clearHistory() {
  if (!state.history.length) {
    toast('السجل فارغ بالفعل.', 'info', 1800);
    return;
  }
  const ok = window.confirm('حذف جميع الترجمات المحفوظة؟ لا يمكن التراجع.');
  if (!ok) return;

  state.history = [];
  store.remove(STORE.history);
  renderHistory();
  toast('تم مسح السجل.', 'success', 2000);
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
   17. نافذة ألوان الموقع
   ===================================================================== */

function openColorDialog() {
  el.colorPrimary.value   = state.colors.primary;
  el.colorSecondary.value = state.colors.secondary;
  el.colorBg.value        = state.colors.bg;
  updateContrastReport();

  if (typeof el.colorDialog.showModal === 'function') {
    el.colorDialog.showModal();
  } else {
    el.colorDialog.setAttribute('open', '');
  }
}

el.colorsBtn.addEventListener('click', openColorDialog);

/* معاينة حيّة أثناء سحب المنتقي */
function onColorInput() {
  state.colors = {
    primary:   el.colorPrimary.value,
    secondary: el.colorSecondary.value,
    bg:        el.colorBg.value
  };
  applyColors(state.colors);
  updateContrastReport();
}

el.colorPrimary.addEventListener('input', onColorInput);
el.colorSecondary.addEventListener('input', onColorInput);
el.colorBg.addEventListener('input', onColorInput);

/* التثبيت عند إغلاق النافذة (تم / Esc / ✕) */
el.colorDialog.addEventListener('close', () => {
  saveSettings();
  applyColors(state.colors);
});

el.resetColorsBtn.addEventListener('click', () => {
  state.colors = { ...DEFAULT_COLORS };
  if (state.dark) state.colors.bg = DARK_BG;

  el.colorPrimary.value   = state.colors.primary;
  el.colorSecondary.value = state.colors.secondary;
  el.colorBg.value        = state.colors.bg;

  applyColors(state.colors);
  updateContrastReport();
  saveSettings();
  toast('أُعيدت اللوحة إلى الافتراضية.', 'info', 1800);
});

/* تقرير التباين داخل النافذة */
function updateContrastReport() {
  const rows = [
    ['نص الزر على الأساسي',   contrast(state.colors.primary, bestOn(state.colors.primary))],
    ['نص المتن على الخلفية', contrast(state.colors.bg, bestOn(state.colors.bg))],
    ['اللمسات على الثانوي',  contrast(state.colors.secondary, bestOn(state.colors.secondary))]
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
    value.innerHTML = `<span class="ratio">${ratio.toFixed(2)}:1</span> ${ok ? '✓ AA' : '✗ منخفض'}`;

    row.append(name, value);
    el.contrastReport.appendChild(row);
  });
}

/* =====================================================================
   18. الإقلاع
   ===================================================================== */

function init() {
  loadSettings();
  applyTheme();
  updateOutputInfo();
  updateCharCount();
  renderHistory();
  setStatus('idle', 'جاهز');

  /* تلميح لطيف أول مرة */
  if (!state.apiKey && !state.endpoint) {
    setTimeout(() => {
      toast('نصيحة: أضف مفتاح API ونقطة النهاية — أو جرّب الوضع التجريبي مباشرةً.', 'info', 5200);
    }, 900);
  }
}

init();