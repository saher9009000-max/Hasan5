/* ══════════════════════════════════════════════════
   LinguaHub Mobile — v1.0.0
   ══════════════════════════════════════════════════ */

const APP_VERSION = 'v1.0.0 (Build 100)';
const API_URL = 'https://api.mymemory.translated.net/get';

// ─── الحالة ───
const state = {
  sourceLang: 'ar',
  targetLang: 'en',
  theme: localStorage.getItem('lh_theme') || 'system',
  color: localStorage.getItem('lh_color') || '#2563EB',
  isListening: false,
};

// ─── عناصر DOM ───
const $ = (id) => document.getElementById(id);
const elements = {
  sourceLang: $('sourceLang'),
  targetLang: $('targetLang'),
  sourceText: $('sourceText'),
  targetText: $('targetText'),
  charCount: $('charCount'),
  matchScore: $('matchScore'),
  translateBtn: $('translateBtn'),
  swapBtn: $('swapBtn'),
  clearBtn: $('clearBtn'),
  micBtn: $('micBtn'),
  ocrBtn: $('ocrBtn'),
  speakBtn: $('speakBtn'),
  copyBtn: $('copyBtn'),
  imageInput: $('imageInput'),
  themeToggle: $('themeToggle'),
  themeModes: $('themeModes'),
  colorGrid: $('colorGrid'),
  toast: $('toast'),
  contactForm: $('contactForm'),
};

// ══════════════════════════════════════════════════
// 1) السمة والألوان
// ══════════════════════════════════════════════════
function getEffectiveTheme() {
  if (state.theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return state.theme;
}

function applyTheme() {
  const effective = getEffectiveTheme();
  document.documentElement.setAttribute('data-theme', effective);
  document.documentElement.style.setProperty('--primary', state.color);
  document.querySelector('meta[name="theme-color"]').setAttribute('content', state.color);

  // أيقونة زر التبديل
  elements.themeToggle.textContent = effective === 'dark' ? '☀️' : '🌙';

  // تفعيل الأزرار المطابقة
  document.querySelectorAll('#themeModes button').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.mode === state.theme);
  });

  // تفعيل نقطة اللون
  document.querySelectorAll('.color-dot').forEach((dot) => {
    dot.classList.toggle('active', dot.dataset.color.toLowerCase() === state.color.toLowerCase());
  });
}

function setTheme(mode) {
  state.theme = mode;
  localStorage.setItem('lh_theme', mode);
  applyTheme();
}

function setColor(color) {
  state.color = color;
  localStorage.setItem('lh_color', color);
  applyTheme();
}

// استمع لتغيير الوضع في النظام
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (state.theme === 'system') applyTheme();
});

// ══════════════════════════════════════════════════
// 2) التنقل بين الشاشات
// ══════════════════════════════════════════════════
function switchScreen(tab) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
  document.getElementById(`screen-${tab}`).classList.add('active');
  document.querySelector(`.nav-btn[data-tab="${tab}"]`).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ══════════════════════════════════════════════════
// 3) الترجمة
// ══════════════════════════════════════════════════
async function translate() {
  const text = elements.sourceText.value.trim();
  if (!text) {
    showToast('أدخل نصًا للترجمة أولاً');
    return;
  }
  if (state.sourceLang === state.targetLang) {
    showToast('اختر لغتين مختلفتين');
    return;
  }

  elements.translateBtn.disabled = true;
  elements.translateBtn.classList.add('loading');
  elements.targetText.textContent = '';

  try {
    const url = `${API_URL}?q=${encodeURIComponent(text)}&langpair=${state.sourceLang}|${state.targetLang}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('network');
    const data = await res.json();

    const translated = data?.responseData?.translatedText || '';
    if (!translated) throw new Error('empty');

    elements.targetText.textContent = translated;
    elements.matchScore.textContent = data?.responseData?.match
      ? `${(data.responseData.match * 100).toFixed(1)}%`
      : '—';
  } catch (err) {
    elements.targetText.textContent = '⚠️ تعذر الاتصال بخدمة الترجمة. تحقق من الإنترنت.';
    showToast('فشلت الترجمة');
  } finally {
    elements.translateBtn.disabled = false;
    elements.translateBtn.classList.remove('loading');
  }
}

// ══════════════════════════════════════════════════
// 4) تبديل اللغات
// ══════════════════════════════════════════════════
function swapLanguages() {
  [state.sourceLang, state.targetLang] = [state.targetLang, state.sourceLang];
  elements.sourceLang.value = state.sourceLang;
  elements.targetLang.value = state.targetLang;

  // تبديل النص
  const currentResult = elements.targetText.textContent;
  if (currentResult && currentResult !== 'الترجمة ستظهر هنا' && !currentResult.startsWith('⚠️')) {
    elements.sourceText.value = currentResult;
    elements.targetText.textContent = 'الترجمة ستظهر هنا';
  }
  updateTextDirection();
  updateCharCount();
}

function updateTextDirection() {
  const dir = ['ar', 'he', 'fa'].includes(state.sourceLang) ? 'rtl' : 'ltr';
  elements.sourceText.style.direction = dir;
  elements.sourceText.style.textAlign = dir === 'rtl' ? 'right' : 'left';

  const targetDir = ['ar', 'he', 'fa'].includes(state.targetLang) ? 'rtl' : 'ltr';
  elements.targetText.style.direction = targetDir;
  elements.targetText.style.textAlign = targetDir === 'rtl' ? 'right' : 'left';
}

function updateCharCount() {
  elements.charCount.textContent = elements.sourceText.value.length;
}

// ══════════════════════════════════════════════════
// 5) الإدخال الصوتي (Web Speech API)
// ══════════════════════════════════════════════════
function startVoiceInput() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    showToast('متصفحك لا يدعم الإدخال الصوتي');
    return;
  }
  if (state.isListening) return;

  const recognition = new SR();
  recognition.lang = state.sourceLang === 'ar' ? 'ar-SA' : state.sourceLang;
  recognition.continuous = false;
  recognition.interimResults = true;

  recognition.onstart = () => {
    state.isListening = true;
    elements.micBtn.classList.add('listening');
    showToast('🎤 تحدث الآن...');
  };

  recognition.onresult = (event) => {
    let transcript = '';
    for (let i = 0; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript;
    }
    elements.sourceText.value = transcript;
    updateCharCount();
  };

  recognition.onerror = (event) => {
    showToast('خطأ في الاستماع: ' + event.error);
  };

  recognition.onend = () => {
    state.isListening = false;
    elements.micBtn.classList.remove('listening');
  };

  recognition.start();
}

// ══════════════════════════════════════════════════
// 6) التحدث بصوت (TTS)
// ══════════════════════════════════════════════════
function speakResult() {
  const text = elements.targetText.textContent;
  if (!text || text === 'الترجمة ستظهر هنا' || text.startsWith('⚠️')) {
    showToast('لا يوجد نص لقراءته');
    return;
  }
  if (!('speechSynthesis' in window)) {
    showToast('متصفحك لا يدعم النطق');
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = state.targetLang === 'ar' ? 'ar-SA' : state.targetLang;
  utterance.rate = 0.95;
  window.speechSynthesis.speak(utterance);
  showToast('🔊 جارٍ النطق...');
}

// ══════════════════════════════════════════════════
// 7) نسخ النص
// ══════════════════════════════════════════════════
async function copyResult() {
  const text = elements.targetText.textContent;
  if (!text || text === 'الترجمة ستظهر هنا') return;
  try {
    await navigator.clipboard.writeText(text);
    showToast('✅ تم النسخ');
  } catch {
    // fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('✅ تم النسخ');
  }
}

// ══════════════════════════════════════════════════
// 8) استخراج النص من الصورة (OCR)
// ══════════════════════════════════════════════════
async function processImage(file) {
  if (typeof Tesseract === 'undefined') {
    showToast('محرك OCR غير متاح');
    return;
  }
  showToast('🔍 جارٍ استخراج النص...');
  try {
    const result = await Tesseract.recognize(file, state.sourceLang, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          elements.ocrBtn.textContent = `⏳ ${Math.round(m.progress * 100)}%`;
        }
      },
    });
    elements.sourceText.value = result.data.text.trim();
    updateCharCount();
    showToast('✅ تم استخراج النص');
  } catch (err) {
    showToast('تعذر استخراج النص');
  } finally {
    elements.ocrBtn.textContent = '📷';
    elements.imageInput.value = '';
  }
}

// ══════════════════════════════════════════════════
// 9) نموذج الاتصال
// ══════════════════════════════════════════════════
function handleContactSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const subject = form.subject.value;
  const message = form.message.value.trim();

  if (!name || !email || !message) {
    showToast('يرجى ملء الحقول المطلوبة');
    return;
  }

  const body = `الاسم: ${name}%0Aالبريد: ${email}%0A%0A${message}`;
  const mailto = `mailto:support@linguahub.app?subject=${encodeURIComponent(subject)}&body=${body}`;
  window.location.href = mailto;
  showToast('📧 فتح تطبيق البريد...');
  form.reset();
}

// ══════════════════════════════════════════════════
// 10) Toast
// ══════════════════════════════════════════════════
let toastTimer;
function showToast(msg) {
  elements.toast.textContent = msg;
  elements.toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    elements.toast.classList.remove('show');
  }, 2400);
}

// ══════════════════════════════════════════════════
// 11) ربط الأحداث
// ══════════════════════════════════════════════════
function bindEvents() {
  // التنقل
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchScreen(btn.dataset.tab));
  });

  // السمة
  elements.themeToggle.addEventListener('click', () => {
    const next = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  elements.themeModes.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-mode]');
    if (btn) setTheme(btn.dataset.mode);
  });

  elements.colorGrid.addEventListener('click', (e) => {
    const dot = e.target.closest('.color-dot');
    if (dot) setColor(dot.dataset.color);
  });

  // الترجمة
  elements.translateBtn.addEventListener('click', translate);
  elements.swapBtn.addEventListener('click', swapLanguages);
  elements.clearBtn.addEventListener('click', () => {
    elements.sourceText.value = '';
    elements.targetText.textContent = 'الترجمة ستظهر هنا';
    elements.matchScore.textContent = '—';
    updateCharCount();
  });

  elements.sourceLang.addEventListener('change', (e) => {
    state.sourceLang = e.target.value;
    updateTextDirection();
  });
  elements.targetLang.addEventListener('change', (e) => {
    state.targetLang = e.target.value;
    updateTextDirection();
  });

  elements.sourceText.addEventListener('input', updateCharCount);

  // الصوت والنطق والنسخ
  elements.micBtn.addEventListener('click', startVoiceInput);
  elements.speakBtn.addEventListener('click', speakResult);
  elements.copyBtn.addEventListener('click', copyResult);

  // OCR
  elements.ocrBtn.addEventListener('click', () => elements.imageInput.click());
  elements.imageInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) processImage(file);
  });

  // نموذج الاتصال
  elements.contactForm.addEventListener('submit', handleContactSubmit);
}

// ══════════════════════════════════════════════════
// 12) التهيئة
// ══════════════════════════════════════════════════
function init() {
  applyTheme();
  updateTextDirection();
  updateCharCount();
  bindEvents();
  console.log(`%c🌐 LinguaHub Mobile ${APP_VERSION}`, 'color:#2563EB;font-weight:bold;font-size:14px');
}

document.addEventListener('DOMContentLoaded', init);