/* =========================================================
   Premium Translate v1.1 — Single-file application
   ========================================================= */
(() => {
  'use strict';

  /* ---------- Constants ---------- */
  const LS_KEYS = {
    settings: 'pt_settings_v1',
    history: 'pt_history_v1',
    favorites: 'pt_favorites_v1',
    theme: 'pt_theme_v1',
    engine: 'pt_engine_v1',
    type: 'pt_type_v1',
  };

  const MAX_CHARS = 500;

  const LANGUAGES = [
    { code: 'auto', name: 'كشف تلقائي' },
    { code: 'ar', name: 'العربية' },
    { code: 'en', name: 'الإنجليزية' },
    { code: 'fr', name: 'الفرنسية' },
    { code: 'es', name: 'الإسبانية' },
    { code: 'de', name: 'الألمانية' },
    { code: 'it', name: 'الإيطالية' },
    { code: 'pt', name: 'البرتغالية' },
    { code: 'ru', name: 'الروسية' },
    { code: 'tr', name: 'التركية' },
    { code: 'ja', name: 'اليابانية' },
    { code: 'ko', name: 'الكورية' },
    { code: 'zh', name: 'الصينية' },
    { code: 'hi', name: 'الهندية' },
    { code: 'ur', name: 'الأردية' },
    { code: 'fa', name: 'الفارسية' },
    { code: 'nl', name: 'الهولندية' },
    { code: 'pl', name: 'البولندية' },
    { code: 'sv', name: 'السويدية' },
    { code: 'he', name: 'العبرية' },
    { code: 'id', name: 'الإندونيسية' },
    { code: 'ms', name: 'الماليزية' },
    { code: 'th', name: 'التايلاندية' },
    { code: 'vi', name: 'الفيتنامية' },
    { code: 'uk', name: 'الأوكرانية' },
    { code: 'ro', name: 'الرومانية' },
    { code: 'el', name: 'اليونانية' },
    { code: 'cs', name: 'التشيكية' },
    { code: 'hu', name: 'الهنغارية' },
    { code: 'fi', name: 'الفنلندية' },
    { code: 'da', name: 'الدنماركية' },
    { code: 'no', name: 'النرويجية' },
    { code: 'bg', name: 'البلغارية' },
    { code: 'hr', name: 'الكرواتية' },
    { code: 'sk', name: 'السلوفاكية' },
    { code: 'sl', name: 'السلوفينية' },
    { code: 'et', name: 'الإستونية' },
    { code: 'lv', name: 'اللاتفية' },
    { code: 'lt', name: 'الليتوانية' },
    { code: 'sr', name: 'الصربية' },
    { code: 'bs', name: 'البوسنية' },
    { code: 'sq', name: 'الألبانية' },
    { code: 'mk', name: 'المقدونية' },
    { code: 'ka', name: 'الجورجية' },
    { code: 'hy', name: 'الأرمينية' },
    { code: 'az', name: 'الأذربيجانية' },
    { code: 'kk', name: 'الكازاخية' },
    { code: 'uz', name: 'الأوزبكية' },
    { code: 'tl', name: 'الفلبينية' },
    { code: 'sw', name: 'السواحيلية' },
    { code: 'am', name: 'الأمهرية' },
    { code: 'bn', name: 'البنغالية' },
    { code: 'ta', name: 'التاميلية' },
    { code: 'te', name: 'التيلوغوية' },
    { code: 'ml', name: 'المالايالامية' },
    { code: 'gu', name: 'الغوجاراتية' },
    { code: 'mr', name: 'الماراثية' },
    { code: 'pa', name: 'البنجابية' },
    { code: 'ne', name: 'النيبالية' },
    { code: 'si', name: 'السنهالية' },
    { code: 'my', name: 'البورمية' },
    { code: 'km', name: 'الخميرية' },
    { code: 'lo', name: 'اللاوية' },
    { code: 'mn', name: 'المنغولية' },
    { code: 'ps', name: 'الباشتو' },
    { code: 'ku', name: 'الكردية' },
    { code: 'mt', name: 'المالطية' },
    { code: 'is', name: 'الأيسلندية' },
    { code: 'ga', name: 'الأيرلندية' },
    { code: 'cy', name: 'الويلزية' },
    { code: 'af', name: 'الأفريكانية' },
    { code: 'zu', name: 'الزولو' },
    { code: 'yo', name: 'اليوروبا' },
    { code: 'ig', name: 'الإيغبو' },
    { code: 'ha', name: 'الهوسا' },
    { code: 'so', name: 'الصومالية' },
    { code: 'mg', name: 'الملغاشية' },
    { code: 'eo', name: 'الإسبرانتو' },
  ];

  const TRANSLATION_TYPES = [
    { id: 'natural', name: 'ترجمة طبيعية', desc: 'أسلوب سلس وطبيعي كأنه كُتب باللغة الهدف.', icon: 'message' },
    { id: 'literal', name: 'ترجمة حرفية', desc: 'التزام دقيق بالمعنى الحرفي للكلمات.', icon: 'type' },
    { id: 'formal', name: 'ترجمة رسمية', desc: 'أسلوب مهني مناسب للسياقات الرسمية.', icon: 'briefcase' },
    { id: 'informal', name: 'ترجمة غير رسمية', desc: 'أسلوب ودّي وعاميّ مناسب للمحادثات.', icon: 'smile' },
    { id: 'academic', name: 'ترجمة أكاديمية', desc: 'دقة علمية ومصطلحات أكاديمية.', icon: 'book' },
    { id: 'professional', name: 'ترجمة احترافية', desc: 'جودة عالية مع مراعاة السياق والمصطلحات.', icon: 'award' },
    { id: 'explain', name: 'شرح معنى النص', desc: 'شرح المعنى والنية بدلاً من الترجمة الحرفية.', icon: 'help' },
  ];

  const TYPE_PROMPTS = {
    natural: 'ترجم النص ترجمة طبيعية سلسة كأنه كُتب أصلاً باللغة الهدف.',
    literal: 'ترجم النص ترجمة حرفية دقيقة، مع الالتزام بالمعنى الحرفي للكلمات.',
    formal: 'ترجم النص بأسلوب رسمي ومهني مناسب للسياقات الرسمية.',
    informal: 'ترجم النص بأسلوب غير رسمي وودّي مناسب للمحادثات اليومية.',
    academic: 'ترجم النص بأسلوب أكاديمي دقيق مع استخدام المصطلحات العلمية المناسبة.',
    professional: 'ترجم النص ترجمة احترافية عالية الجودة مع مراعاة السياق والمصطلحات.',
    explain: 'اشرح معنى النص ونيته باللغة الهدف بدلاً من تقديم ترجمة حرفية.',
  };

  const TYPE_ICONS = {
    message: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    type: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
    briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>',
    smile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
    book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    award: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>',
    help: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  };

  /* ---------- State ---------- */
  const state = {
    engine: 'normal',
    model: null,
    models: [],
    type: 'natural',
    history: [],
    favorites: [],
    historyTab: 'history',
    historyQuery: '',
    pendingModel: null,
    pendingType: null,
    currentResult: null,
    isTranslating: false,
    isSpeaking: false,
    settings: { apiKey: '', endpoint: 'https://api.openai.com/v1' },
  };

  /* ---------- DOM Cache ---------- */
  const $ = (id) => document.getElementById(id);
  const dom = {};

  function cacheDom() {
    dom.sourceLang = $('sourceLang');
    dom.targetLang = $('targetLang');
    dom.swapBtn = $('swapBtn');
    dom.sourceText = $('sourceText');
    dom.charCount = $('charCount');
    dom.outputArea = $('outputArea');
    dom.outputText = $('outputText');
    dom.outputPlaceholder = $('outputPlaceholder');
    dom.translateBtn = $('translateBtn');
    dom.clearAllBtn = $('clearAllBtn');
    dom.pasteBtn = $('pasteBtn');
    dom.importBtn = $('importBtn');
    dom.fileInput = $('fileInput');
    dom.voiceInputBtn = $('voiceInputBtn');
    dom.clearBtn = $('clearBtn');
    dom.copyBtn = $('copyBtn');
    dom.speakBtn = $('speakBtn');
    dom.speakIcon = $('speakIcon');
    dom.shareBtn = $('shareBtn');
    dom.favBtn = $('favBtn');
    dom.retranslateBtn = $('retranslateBtn');
    dom.statusBar = $('statusBar');
    dom.aiOptions = $('aiOptions');
    dom.modelSelectorBtn = $('modelSelectorBtn');
    dom.modelSelectorValue = $('modelSelectorValue');
    dom.typeSelectorBtn = $('typeSelectorBtn');
    dom.typeSelectorValue = $('typeSelectorValue');
    dom.engineBtns = document.querySelectorAll('.engine-btn');

    dom.modelModal = $('modelModal');
    dom.modelSearchInput = $('modelSearchInput');
    dom.modelList = $('modelList');
    dom.modelStatus = $('modelStatus');
    dom.refreshModelsBtn = $('refreshModelsBtn');
    dom.confirmModelBtn = $('confirmModelBtn');

    dom.typeModal = $('typeModal');
    dom.typeGrid = $('typeGrid');
    dom.confirmTypeBtn = $('confirmTypeBtn');

    dom.settingsModal = $('settingsModal');
    dom.apiKeyInput = $('apiKeyInput');
    dom.endpointInput = $('endpointInput');
    dom.toggleApiKeyBtn = $('toggleApiKeyBtn');
    dom.eyeIconShow = $('eyeIconShow');
    dom.eyeIconHide = $('eyeIconHide');
    dom.testConnectionBtn = $('testConnectionBtn');
    dom.deleteKeyBtn = $('deleteKeyBtn');
    dom.saveSettingsBtn = $('saveSettingsBtn');
    dom.connectionStatus = $('connectionStatus');
    dom.connectionStatusText = $('connectionStatusText');

    dom.themeToggleBtn = $('themeToggleBtn');
    dom.themeIconSun = $('themeIconSun');
    dom.themeIconMoon = $('themeIconMoon');
    dom.settingsBtn = $('settingsBtn');
    dom.historyToggleBtn = $('historyToggleBtn');
    dom.historySection = $('historySection');
    dom.historyList = $('historyList');
    dom.historySearchInput = $('historySearchInput');
    dom.clearHistoryBtn = $('clearHistoryBtn');
    dom.historyTabs = document.querySelectorAll('.history-tab');

    dom.toastContainer = $('toastContainer');
  }

  /* ---------- Utilities ---------- */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function uuid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
  }

  function debounce(fn, ms = 200) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }

  function getLangName(code) {
    return (LANGUAGES.find((l) => l.code === code) || {}).name || code;
  }

  function truncateMiddle(str, maxLen = 28) {
    if (!str || str.length <= maxLen) return str;
    const half = Math.floor((maxLen - 3) / 2);
    return str.slice(0, half) + '…' + str.slice(-half);
  }

  function toast(message, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icon = type === 'error'
      ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    el.innerHTML = icon + `<span>${escapeHtml(message)}</span>`;
    dom.toastContainer.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      el.style.transition = 'all 0.25s';
      setTimeout(() => el.remove(), 260);
    }, 3200);
  }

  /* ---------- LocalStorage helpers ---------- */
  function safeGet(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }
  function safeSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('LocalStorage write failed', e);
      return false;
    }
  }

  /* ---------- Settings ---------- */
  function loadSettings() {
    const saved = safeGet(LS_KEYS.settings, null);
    if (saved && typeof saved === 'object') {
      state.settings.apiKey = saved.apiKey || '';
      state.settings.endpoint = saved.endpoint || 'https://api.openai.com/v1';
    }
  }
  function saveSettings() {
    const ok = safeSet(LS_KEYS.settings, state.settings);
    if (ok) toast('تم حفظ الإعدادات بنجاح.');
    else toast('تعذّر حفظ الإعدادات محلياً.', 'error');
  }

  function normalizeEndpoint(url) {
    return String(url || '').trim().replace(/\/+$/, '');
  }

  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';
    dom.themeIconSun.style.display = isDark ? 'none' : '';
    dom.themeIconMoon.style.display = isDark ? '' : 'none';
    dom.themeToggleBtn.setAttribute('aria-label', isDark ? 'الوضع الفاتح' : 'الوضع الداكن');
    safeSet(LS_KEYS.theme, theme);
  }
  function initTheme() {
    const saved = safeGet(LS_KEYS.theme, 'light');
    applyTheme(saved === 'dark' ? 'dark' : 'light');
  }

  /* ---------- Language selects ---------- */
  function fillLanguageSelect(selectEl, includeAuto, selectedCode) {
    selectEl.innerHTML = '';
    LANGUAGES.forEach((lang) => {
      if (!includeAuto && lang.code === 'auto') return;
      const opt = document.createElement('option');
      opt.value = lang.code;
      opt.textContent = lang.name;
      selectEl.appendChild(opt);
    });
    if (selectedCode) selectEl.value = selectedCode;
  }

  function initLanguageSelects() {
    fillLanguageSelect(dom.sourceLang, true, 'auto');
    fillLanguageSelect(dom.targetLang, false, 'en');
  }

  /* ---------- Engine switch ---------- */
  function setEngine(engine) {
    state.engine = engine;
    dom.engineBtns.forEach((btn) => {
      const active = btn.dataset.engine === engine;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', String(active));
    });
    dom.aiOptions.hidden = engine !== 'ai';
    safeSet(LS_KEYS.engine, engine);
    updateSelectorLabels();
  }

  function initEngine() {
    const saved = safeGet(LS_KEYS.engine, 'normal');
    setEngine(saved === 'ai' ? 'ai' : 'normal');
  }

  /* ---------- Translation type ---------- */
  function renderTypeGrid() {
    dom.typeGrid.innerHTML = '';
    TRANSLATION_TYPES.forEach((type) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'type-card' + (state.pendingType === type.id ? ' selected' : '');
      btn.dataset.typeId = type.id;
      btn.innerHTML = `
        <span class="type-card-icon">${TYPE_ICONS[type.icon] || ''}</span>
        <span class="type-card-body">
          <span class="type-card-name">${escapeHtml(type.name)}</span>
          <span class="type-card-desc">${escapeHtml(type.desc)}</span>
        </span>
      `;
      btn.addEventListener('click', () => {
        state.pendingType = type.id;
        renderTypeGrid();
      });
      dom.typeGrid.appendChild(btn);
    });
  }

  function openTypeModal() {
    state.pendingType = state.type;
    renderTypeGrid();
    openModal(dom.typeModal);
  }

  function confirmType() {
    if (!state.pendingType) {
      toast('اختر نوع الترجمة أولاً.', 'error');
      return;
    }
    state.type = state.pendingType;
    safeSet(LS_KEYS.type, state.type);
    updateSelectorLabels();
    closeModal(dom.typeModal);
    toast('تم تحديث نوع الترجمة.');
  }

  function updateSelectorLabels() {
    const typeObj = TRANSLATION_TYPES.find((t) => t.id === state.type);
    dom.typeSelectorValue.textContent = typeObj ? typeObj.name : '—';
    if (state.model) {
      dom.modelSelectorValue.textContent = truncateMiddle(state.model.id, 26);
      dom.modelSelectorValue.title = state.model.id;
    } else {
      dom.modelSelectorValue.textContent = 'لم يتم اختيار نموذج';
      dom.modelSelectorValue.title = '';
    }
  }

  /* ---------- Modal helpers ---------- */
  let lastFocused = null;
  function openModal(el) {
    lastFocused = document.activeElement;
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
    const focusable = el.querySelector('button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) setTimeout(() => focusable.focus(), 60);
  }
  function closeModal(el) {
    el.classList.remove('open');
    if (!document.querySelector('.modal-overlay.open')) {
      document.body.style.overflow = '';
    }
    if (lastFocused && typeof lastFocused.focus === 'function') {
      setTimeout(() => lastFocused.focus(), 30);
    }
  }
  function initModalCloseButtons() {
    document.querySelectorAll('[data-close-modal]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.closeModal;
        const modal = document.getElementById(id);
        if (modal) closeModal(modal);
      });
    });
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(overlay);
      });
    });
  }

  /* ---------- Models ---------- */
  function setModelStatus(message, type = 'info', showSpinner = false) {
    if (!message) {
      dom.modelStatus.hidden = true;
      dom.modelStatus.innerHTML = '';
      return;
    }
    dom.modelStatus.hidden = false;
    dom.modelStatus.className = `status-bar ${type}`;
    dom.modelStatus.innerHTML = `
      ${showSpinner ? '<span class="spinner-xs"></span>' : ''}
      <span>${escapeHtml(message)}</span>
    `;
  }

  function getModelsEndpoint() {
    return normalizeEndpoint(state.settings.endpoint) + '/models';
  }

  async function fetchModels() {
    const endpoint = normalizeEndpoint(state.settings.endpoint);
    const apiKey = state.settings.apiKey.trim();

    if (!endpoint) {
      setModelStatus('يرجى إدخال عنوان Endpoint في الإعدادات أولاً.', 'error');
      return;
    }
    if (!apiKey) {
      setModelStatus('يرجى إدخال مفتاح API في الإعدادات لجلب النماذج.', 'error');
      return;
    }

    dom.refreshModelsBtn.disabled = true;
    setModelStatus('جارٍ جلب النماذج من الخدمة…', 'info', true);

    try {
      const res = await fetch(getModelsEndpoint(), {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
      });

      if (!res.ok) {
        let detail = '';
        try {
          const err = await res.json();
          detail = err?.error?.message || err?.message || '';
        } catch {}
        throw new Error(
          res.status === 401 || res.status === 403
            ? `فشل المصادقة (${res.status}). تحقق من مفتاح API.`
            : res.status === 404
            ? 'نقطة النهاية /models غير موجودة. تحقق من عنوان Endpoint.'
            : `خطأ ${res.status}${detail ? ': ' + detail : ''}`
        );
      }

      const data = await res.json();
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const models = list
        .filter((m) => m && (typeof m.id === 'string' || typeof m.name === 'string'))
        .map((m) => ({
          id: m.id || m.name,
          owned_by: m.owned_by || m.ownedBy || m.publisher || '',
          created: m.created || m.created_at || null,
        }));

      if (!models.length) {
        setModelStatus('لم تُرجع الخدمة أي نماذج.', 'warning');
        state.models = [];
        renderModelList();
        return;
      }

      state.models = models;
      renderModelList();
      setModelStatus(`تم جلب ${models.length} نموذجاً بنجاح.`, 'success');
    } catch (err) {
      console.error(err);
      const isNetwork = err instanceof TypeError;
      setModelStatus(
        isNetwork
          ? 'تعذّر الاتصال بالخدمة. قد يكون السبب CORS أو الشبكة أو عنوان Endpoint غير صحيح.'
          : err.message || 'حدث خطأ غير متوقع.',
        'error'
      );
      state.models = [];
      renderModelList();
    } finally {
      dom.refreshModelsBtn.disabled = false;
    }
  }

  function renderModelList() {
    const query = dom.modelSearchInput.value.trim().toLowerCase();
    const filtered = state.models.filter((m) => m.id.toLowerCase().includes(query));

    if (!state.models.length) {
      dom.modelList.innerHTML = `
        <div class="history-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 14h3M1 9h3M1 14h3"/></svg>
          لا توجد نماذج بعد. اضغط "تحديث" لجلبها من خدمتك.
        </div>`;
      dom.confirmModelBtn.disabled = true;
      return;
    }
    if (!filtered.length) {
      dom.modelList.innerHTML = `
        <div class="history-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          لا توجد نتائج مطابقة لبحثك.
        </div>`;
      dom.confirmModelBtn.disabled = true;
      return;
    }

    dom.modelList.innerHTML = '';
    filtered.forEach((model) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'model-item' + (state.pendingModel === model.id ? ' selected' : '');
      btn.dataset.modelId = model.id;
      btn.innerHTML = `
        <span class="model-item-radio"></span>
        <span class="model-item-body">
          <span class="model-item-name">${escapeHtml(model.id)}</span>
          <span class="model-item-meta">
            ${model.owned_by ? `<span>${escapeHtml(model.owned_by)}</span>` : ''}
            ${model.created ? `<span>${new Date(model.created * 1000).toLocaleDateString('ar')}</span>` : ''}
          </span>
        </span>
      `;
      btn.addEventListener('click', () => {
        state.pendingModel = model.id;
        renderModelList();
        dom.confirmModelBtn.disabled = false;
      });
      dom.modelList.appendChild(btn);
    });
    dom.confirmModelBtn.disabled = !state.pendingModel;
  }

  function openModelModal() {
    state.pendingModel = state.model ? state.model.id : null;
    dom.modelSearchInput.value = '';
    dom.confirmModelBtn.disabled = !state.pendingModel;
    renderModelList();
    openModal(dom.modelModal);
    if (!state.models.length && state.settings.apiKey && state.settings.endpoint) {
      fetchModels();
    }
  }

  function confirmModel() {
    if (!state.pendingModel) {
      toast('اختر نموذجاً أولاً.', 'error');
      return;
    }
    const found = state.models.find((m) => m.id === state.pendingModel);
    state.model = found || { id: state.pendingModel, owned_by: '', created: null };
    updateSelectorLabels();
    closeModal(dom.modelModal);
    toast('تم تحديد النموذج: ' + truncateMiddle(state.model.id, 30));
  }

  /* ---------- Translation engines ---------- */
  function setStatus(message, type = 'info', showSpinner = false) {
    if (!message) {
      dom.statusBar.hidden = true;
      dom.statusBar.innerHTML = '';
      return;
    }
    dom.statusBar.hidden = false;
    dom.statusBar.className = `status-bar ${type}`;
    dom.statusBar.innerHTML = `
      ${showSpinner ? '<span class="spinner-xs"></span>' : ''}
      <span>${escapeHtml(message)}</span>
    `;
  }

  function setTranslating(loading) {
    state.isTranslating = loading;
    dom.translateBtn.disabled = loading;
    dom.retranslateBtn.disabled = loading || !state.currentResult;
    dom.translateBtn.innerHTML = loading
      ? '<span class="spinner-xs" style="width:16px;height:16px;border-width:2.5px;border-color:#fff;border-top-color:transparent;"></span> جارٍ الترجمة…'
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/></svg> ترجمة`;
  }

  async function translateNormal(text, sourceLang, targetLang) {
    const q = encodeURIComponent(text);
    const langpair = encodeURIComponent(`${sourceLang}|${targetLang}`);
    const url = `https://api.mymemory.translated.net/get?q=${q}&langpair=${langpair}`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`فشل الاتصال بخدمة الترجمة (${res.status}).`);
    }
    const data = await res.json();

    if (data.responseStatus && Number(data.responseStatus) !== 200) {
      const msg = data.responseDetails || 'فشلت خدمة الترجمة في معالجة النص.';
      throw new Error(msg);
    }
    const translated = data?.responseData?.translatedText;
    if (!translated || typeof translated !== 'string') {
      throw new Error('لم تُرجع خدمة الترجمة نصاً صالحاً.');
    }

    if (/MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY/i.test(translated)) {
      throw new Error('تم استهلاك الحصة المجانية اليومية من خدمة الترجمة العادية. حاول لاحقاً أو استخدم الترجمة بالذكاء الاصطناعي.');
    }

    return translated;
  }

  async function translateAI(text, sourceLang, targetLang) {
    const endpoint = normalizeEndpoint(state.settings.endpoint);
    const apiKey = state.settings.apiKey.trim();
    const modelId = state.model ? state.model.id : '';

    if (!endpoint) throw new Error('يرجى إدخال عنوان Endpoint في الإعدادات.');
    if (!apiKey) throw new Error('يرجى إدخال مفتاح API في الإعدادات لاستخدام الترجمة بالذكاء الاصطناعي.');
    if (!modelId) throw new Error('يرجى اختيار نموذج ذكاء اصطناعي أولاً.');

    const typePrompt = TYPE_PROMPTS[state.type] || TYPE_PROMPTS.natural;
    const sourceName = sourceLang === 'auto' ? 'اللغة المصدر (اكتشفها)' : getLangName(sourceLang);
    const targetName = getLangName(targetLang);

    const systemContent = [
      'أنت مترجم محترف. المطلوب هو ترجمة النص المُدخل إلى اللغة الهدف.',
      `نوع الترجمة المطلوب: ${typePrompt}`,
      `اللغة الهدف: ${targetName}.`,
      `اللغة المصدر: ${sourceName}.`,
      'أخرج الترجمة فقط دون شرح أو مقدمات أو علامات اقتباس، إلا إذا كان نوع الترجمة "شرح معنى النص" فاشرح المعنى بوضوح.',
      'حافظ على التنسيق والفقرات الأصلية قدر الإمكان.',
    ].join('\n');

    const body = {
      model: modelId,
      messages: [
        { role: 'system', content: systemContent },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
    };

    let res;
    try {
      res = await fetch(endpoint + '/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch (err) {
      throw new Error(
        'تعذّر الاتصال بخدمة الذكاء الاصطناعي. تحقق من الشبكة أو CORS أو صحة عنوان Endpoint.'
      );
    }

    if (!res.ok) {
      let detail = '';
      try {
        const err = await res.json();
        detail = err?.error?.message || err?.message || '';
      } catch {}
      if (res.status === 401) throw new Error('مفتاح API غير صالح أو منتهي (401).');
      if (res.status === 403) throw new Error('تم رفض الوصول (403). تحقق من صلاحيات المفتاح.');
      if (res.status === 404) throw new Error('نقطة النهاية /chat/completions غير موجودة. تحقق من عنوان Endpoint.');
      if (res.status === 429) throw new Error('تم تجاوز حد الطلبات (429). حاول لاحقاً.');
      throw new Error(`خطأ ${res.status}${detail ? ': ' + detail : ''}`);
    }

    const data = await res.json();
    const content =
      data?.choices?.[0]?.message?.content ??
      data?.choices?.[0]?.text ??
      data?.content ??
      '';
    if (!content || typeof content !== 'string') {
      throw new Error('لم تُرجع الخدمة نصاً صالحاً.');
    }
    return content.trim();
  }

  async function doTranslate() {
    const text = dom.sourceText.value.trim();
    const sourceLang = dom.sourceLang.value;
    const targetLang = dom.targetLang.value;

    if (!text) {
      toast('أدخل نصاً للترجمة أولاً.', 'error');
      dom.sourceText.focus();
      return;
    }
    if (text.length > MAX_CHARS) {
      toast(`الحد الأقصى ${MAX_CHARS} حرفاً.`, 'error');
      return;
    }
    if (sourceLang !== 'auto' && sourceLang === targetLang) {
      toast('لغة المصدر والهدف متطابقتان. اختر لغة مختلفة.', 'error');
      return;
    }

    setTranslating(true);
    setStatus('جارٍ الترجمة…', 'info', true);

    try {
      let result;
      if (state.engine === 'normal') {
        result = await translateNormal(text, sourceLang, targetLang);
      } else {
        result = await translateAI(text, sourceLang, targetLang);
      }

      state.currentResult = {
        sourceText: text,
        translatedText: result,
        sourceLang,
        targetLang,
        engine: state.engine,
        type: state.engine === 'ai' ? state.type : 'normal',
        model: state.engine === 'ai' && state.model ? state.model.id : null,
        timestamp: Date.now(),
        id: uuid(),
      };

      renderResult(result);
      addToHistory(state.currentResult);
      setStatus(
        state.engine === 'ai'
          ? `تمت الترجمة بالذكاء الاصطناعي (${truncateMiddle(state.currentResult.model || '', 30)}).`
          : 'تمت الترجمة العادية بنجاح.',
        'success'
      );
      toast('تمت الترجمة بنجاح.');
    } catch (err) {
      console.error(err);
      setStatus(err.message || 'حدث خطأ أثناء الترجمة.', 'error');
      toast(err.message || 'فشلت الترجمة.', 'error');
    } finally {
      setTranslating(false);
    }
  }

  function renderResult(text) {
    dom.outputPlaceholder.hidden = true;
    dom.outputText.hidden = false;
    dom.outputText.textContent = text;
    [dom.copyBtn, dom.speakBtn, dom.shareBtn, dom.favBtn, dom.retranslateBtn].forEach((b) => {
      b.disabled = false;
    });
    dom.favBtn.classList.toggle(
      'active',
      state.favorites.some((f) => f.sourceText === dom.sourceText.value.trim() && f.translatedText === text)
    );
  }

  function resetOutput() {
    state.currentResult = null;
    dom.outputPlaceholder.hidden = false;
    dom.outputText.hidden = true;
    dom.outputText.textContent = '';
    [dom.copyBtn, dom.speakBtn, dom.shareBtn, dom.favBtn, dom.retranslateBtn].forEach((b) => {
      b.disabled = true;
    });
    dom.favBtn.classList.remove('active');
    stopSpeaking();
  }

  /* ---------- History & Favorites ---------- */
  function loadHistoryAndFavorites() {
    state.history = safeGet(LS_KEYS.history, []);
    state.favorites = safeGet(LS_KEYS.favorites, []);
    if (!Array.isArray(state.history)) state.history = [];
    if (!Array.isArray(state.favorites)) state.favorites = [];
  }

  function persistHistory() {
    if (!safeSet(LS_KEYS.history, state.history)) {
      toast('تعذّر حفظ السجل محلياً. قد تكون مساحة التخزين ممتلئة.', 'error');
    }
  }
  function persistFavorites() {
    if (!safeSet(LS_KEYS.favorites, state.favorites)) {
      toast('تعذّر حفظ المفضلة محلياً.', 'error');
    }
  }

  function addToHistory(item) {
    state.history = state.history.filter(
      (h) => !(h.sourceText === item.sourceText && h.translatedText === item.translatedText && h.targetLang === item.targetLang)
    );
    state.history.unshift(item);
    if (state.history.length > 100) state.history = state.history.slice(0, 100);
    persistHistory();
    renderHistory();
  }

  function toggleFavorite(item) {
    const idx = state.favorites.findIndex(
      (f) => f.sourceText === item.sourceText && f.translatedText === item.translatedText && f.targetLang === item.targetLang
    );
    if (idx >= 0) {
      state.favorites.splice(idx, 1);
      toast('تمت الإزالة من المفضلة.');
    } else {
      state.favorites.unshift({ ...item, id: uuid(), timestamp: Date.now() });
      if (state.favorites.length > 100) state.favorites = state.favorites.slice(0, 100);
      toast('تمت الإضافة إلى المفضلة.');
    }
    persistFavorites();
    renderHistory();
    dom.favBtn.classList.toggle(
      'active',
      state.favorites.some(
        (f) => f.sourceText === dom.sourceText.value.trim() && f.translatedText === dom.outputText.textContent
      )
    );
  }

  function renderHistory() {
    const list = state.historyTab === 'history' ? state.history : state.favorites;
    const q = state.historyQuery.trim().toLowerCase();
    const filtered = q
      ? list.filter(
          (item) =>
            item.sourceText.toLowerCase().includes(q) ||
            item.translatedText.toLowerCase().includes(q)
        )
      : list;

    if (!filtered.length) {
      dom.historyList.innerHTML = `
        <div class="history-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l3 2"/></svg>
          ${q ? 'لا توجد نتائج مطابقة.' : state.historyTab === 'history' ? 'لا توجد ترجمات في السجل بعد.' : 'لا توجد عناصر في المفضلة بعد.'}
        </div>`;
      return;
    }

    dom.historyList.innerHTML = '';
    filtered.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `
        <div class="history-item-main">
          <div class="history-item-langs">
            <span>${escapeHtml(getLangName(item.sourceLang))}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="10" height="10"><polyline points="15 18 9 12 15 6"/></svg>
            <span>${escapeHtml(getLangName(item.targetLang))}</span>
            ${item.engine === 'ai' ? '<span style="color:var(--accent);font-weight:700;">· AI</span>' : ''}
          </div>
          <div class="history-item-src" title="${escapeHtml(item.sourceText)}">${escapeHtml(item.sourceText)}</div>
          <div class="history-item-dst" title="${escapeHtml(item.translatedText)}">${escapeHtml(item.translatedText)}</div>
        </div>
        <div class="history-item-actions">
          <button class="icon-btn" style="width:32px;height:32px;" data-act="reuse" title="إعادة الاستخدام" aria-label="إعادة الاستخدام">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
          <button class="icon-btn" style="width:32px;height:32px;" data-act="copy" title="نسخ" aria-label="نسخ">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          </button>
          <button class="icon-btn" style="width:32px;height:32px;" data-act="delete" title="حذف" aria-label="حذف">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="15" height="15"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
          </button>
        </div>
      `;
      const reuseBtn = div.querySelector('[data-act="reuse"]');
      reuseBtn.addEventListener('click', () => {
        dom.sourceText.value = item.sourceText;
        dom.sourceLang.value = item.sourceLang;
        dom.targetLang.value = item.targetLang;
        dom.charCount.textContent = `${item.sourceText.length} / ${MAX_CHARS}`;
        dom.charCount.classList.toggle('over', item.sourceText.length > MAX_CHARS);
        resetOutput();
        dom.sourceText.focus();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast('تم تحميل النص في المحرر.');
      });
      div.querySelector('[data-act="copy"]').addEventListener('click', () => {
        copyText(item.translatedText);
      });
      div.querySelector('[data-act="delete"]').addEventListener('click', () => {
        if (state.historyTab === 'history') {
          state.history = state.history.filter((h) => h.id !== item.id);
          persistHistory();
        } else {
          state.favorites = state.favorites.filter((f) => f.id !== item.id);
          persistFavorites();
        }
        renderHistory();
        toast('تم الحذف.');
      });
      dom.historyList.appendChild(div);
    });
  }

  /* ---------- Clipboard / Speech / Share ---------- */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast('تم النسخ إلى الحافظة.');
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        toast('تم النسخ إلى الحافظة.');
      } catch {
        toast('تعذّر النسخ. انسخ النص يدوياً.', 'error');
      } finally {
        ta.remove();
      }
    }
  }

  function stopSpeaking() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    state.isSpeaking = false;
    dom.speakIcon.innerHTML =
      '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>';
    const span = dom.speakBtn.querySelector('span');
    if (span) span.textContent = 'نطق';
  }

  function speakOutput() {
    const text = dom.outputText.textContent.trim();
    if (!text) return;
    if (!('speechSynthesis' in window)) {
      toast('متصفحك لا يدعم النطق الصوتي.', 'error');
      return;
    }
    if (state.isSpeaking) {
      stopSpeaking();
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const targetLangCode = dom.targetLang.value;
    const bcp47 = targetLangCode === 'zh' ? 'zh-CN' : targetLangCode === 'pt' ? 'pt-BR' : targetLangCode;
    utter.lang = bcp47 || 'en-US';
    utter.rate = 0.95;
    utter.pitch = 1;

    const voices = window.speechSynthesis.getVoices();
    const match = voices.find((v) => v.lang.toLowerCase().startsWith(utter.lang.toLowerCase().slice(0, 2)));
    if (match) utter.voice = match;

    utter.onstart = () => {
      state.isSpeaking = true;
      dom.speakIcon.innerHTML = '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>';
      const span = dom.speakBtn.querySelector('span');
      if (span) span.textContent = 'إيقاف';
    };
    utter.onend = stopSpeaking;
    utter.onerror = () => {
      stopSpeaking();
      toast('تعذّر تشغيل النطق. قد لا يتوفر صوت للغة الهدف.', 'error');
    };
    window.speechSynthesis.speak(utter);
  }

  async function shareResult() {
    const text = dom.outputText.textContent.trim();
    if (!text) return;
    const shareData = { title: 'ترجمة', text };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== 'AbortError') copyText(text);
      }
    } else {
      copyText(text);
    }
  }

  /* ---------- Voice input (Speech Recognition) ---------- */
  function initVoiceInput() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      dom.voiceInputBtn.title = 'الإدخال الصوتي غير مدعوم في هذا المتصفح';
      dom.voiceInputBtn.addEventListener('click', () => {
        toast('الإدخال الصوتي غير مدعوم في متصفحك. جرّب Chrome أو Edge.', 'error');
      });
      return;
    }
    let recognition = null;
    let listening = false;

    const langMap = {
      ar: 'ar-SA',
      en: 'en-US',
      fr: 'fr-FR',
      es: 'es-ES',
      de: 'de-DE',
      it: 'it-IT',
      pt: 'pt-BR',
      ru: 'ru-RU',
      tr: 'tr-TR',
      ja: 'ja-JP',
      ko: 'ko-KR',
      zh: 'zh-CN',
      hi: 'hi-IN',
      ur: 'ur-PK',
      fa: 'fa-IR',
      nl: 'nl-NL',
      pl: 'pl-PL',
      sv: 'sv-SE',
    };

    dom.voiceInputBtn.addEventListener('click', () => {
      if (listening && recognition) {
        try {
          recognition.stop();
        } catch {}
        return;
      }
      try {
        recognition = new SR();
        const selectedLang = dom.sourceLang.value;
        recognition.lang = selectedLang === 'auto' ? 'ar-SA' : (langMap[selectedLang] || selectedLang);
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
          listening = true;
          dom.voiceInputBtn.classList.add('active');
          setStatus('جاري تسجيل الصوت...', 'info', true);
          toast('جارٍ التسجيل والاستماع… تحدث الآن.');
        };
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          const current = dom.sourceText.value;
          dom.sourceText.value = current ? current + ' ' + transcript : transcript;
          updateCharCount();
        };
        recognition.onerror = (event) => {
          if (event.error === 'not-allowed') toast('تم رفض إذن الميكروفون.', 'error');
          else if (event.error === 'no-speech') toast('لم يتم التقاط صوت. حاول مجدداً.', 'error');
          else toast('خطأ في الإدخال الصوتي: ' + event.error, 'error');
        };
        recognition.onend = () => {
          listening = false;
          dom.voiceInputBtn.classList.remove('active');
        };
        recognition.start();
      } catch (err) {
        console.error(err);
        listening = false;
        dom.voiceInputBtn.classList.remove('active');
        toast('تعذّر بدء الإدخال الصوتي.', 'error');
      }
    });
  }

  /* ---------- Char counter ---------- */
  function updateCharCount() {
    const len = dom.sourceText.value.length;
    dom.charCount.textContent = `${len} / ${MAX_CHARS}`;
    dom.charCount.classList.toggle('over', len > MAX_CHARS);
  }

  /* ---------- Settings UI ---------- */
  function fillSettingsUI() {
    dom.apiKeyInput.value = state.settings.apiKey;
    dom.endpointInput.value = state.settings.endpoint;
  }

  function setConnectionStatus(text, type = '') {
    dom.connectionStatus.className = 'connection-status' + (type ? ' ' + type : '');
    dom.connectionStatusText.textContent = text;
  }

  async function testConnection() {
    const endpoint = normalizeEndpoint(dom.endpointInput.value);
    const apiKey = dom.apiKeyInput.value.trim();

    if (!endpoint) {
      setConnectionStatus('أدخل عنوان Endpoint أولاً.', 'err');
      return;
    }
    setConnectionStatus('جارٍ اختبار الاتصال…', 'loading');
    dom.testConnectionBtn.disabled = true;

    try {
      const res = await fetch(endpoint + '/models', {
        headers: apiKey ? { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' } : { Accept: 'application/json' },
      });
      if (res.ok) {
        setConnectionStatus('الاتصال ناجح. الخدمة تستجيب.', 'ok');
      } else if (res.status === 401 || res.status === 403) {
        setConnectionStatus(`وصل الاتصال لكن المصادقة فشلت (${res.status}). تحقق من المفتاح.`, 'err');
      } else if (res.status === 404) {
        setConnectionStatus('وصل الاتصال لكن /models غير موجود. تحقق من عنوان Endpoint.', 'err');
      } else {
        setConnectionStatus(`استجابة غير متوقعة (${res.status}).`, 'err');
      }
    } catch {
      setConnectionStatus('فشل الاتصال. قد يكون السبب CORS أو الشبكة أو عنوان غير صحيح.', 'err');
    } finally {
      dom.testConnectionBtn.disabled = false;
    }
  }

  /* ---------- Event bindings ---------- */
  function bindEvents() {
    if (dom.engineBtns) {
      dom.engineBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
          setEngine(btn.dataset.engine);
        });
      });
    }

    dom.swapBtn.addEventListener('click', () => {
      const s = dom.sourceLang.value;
      const t = dom.targetLang.value;
      if (s === 'auto') {
        if (t === 'ar') dom.sourceLang.value = 'en';
        else dom.sourceLang.value = t;
        dom.targetLang.value = 'ar';
      } else {
        dom.sourceLang.value = t;
        dom.targetLang.value = s;
      }
      toast('تم تبديل اللغتين.');
    });

    dom.sourceText.addEventListener('input', updateCharCount);

    dom.clearBtn.addEventListener('click', () => {
      dom.sourceText.value = '';
      updateCharCount();
      dom.sourceText.focus();
    });
    dom.clearAllBtn.addEventListener('click', () => {
      dom.sourceText.value = '';
      updateCharCount();
      resetOutput();
      setStatus('');
      toast('تم مسح الكل.');
    });

    if (dom.importBtn && dom.fileInput) {
      dom.importBtn.addEventListener('click', () => {
        dom.fileInput.click();
      });
    }
    dom.fileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        if (typeof text === 'string') {
          dom.sourceText.value = text.slice(0, MAX_CHARS);
          updateCharCount();
          toast('تم استيراد الملف بنجاح.');
        } else {
          toast('تعذّر قراءة محتوى الملف.', 'error');
        }
        dom.fileInput.value = '';
      };
      reader.onerror = () => {
        toast('حدث خطأ أثناء قراءة الملف.', 'error');
        dom.fileInput.value = '';
      };
      reader.readAsText(file);
    });

    dom.pasteBtn.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (text) {
          dom.sourceText.value = text.slice(0, MAX_CHARS);
          updateCharCount();
          toast('تم اللصق.');
        } else toast('الحافظة فارغة.', 'error');
      } catch {
        toast('تعذّر الوصول إلى الحافظة. الصق يدوياً.', 'error');
      }
    });

    dom.translateBtn.addEventListener('click', doTranslate);
    dom.retranslateBtn.addEventListener('click', () => {
      if (state.currentResult) {
        dom.sourceText.value = state.currentResult.sourceText;
        dom.sourceLang.value = state.currentResult.sourceLang;
        dom.targetLang.value = state.currentResult.targetLang;
        updateCharCount();
        doTranslate();
      }
    });

    dom.copyBtn.addEventListener('click', () => copyText(dom.outputText.textContent));
    dom.speakBtn.addEventListener('click', speakOutput);
    dom.shareBtn.addEventListener('click', shareResult);
    dom.favBtn.addEventListener('click', () => {
      if (!state.currentResult) return;
      toggleFavorite(state.currentResult);
    });

    dom.sourceText.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        doTranslate();
      }
    });

    dom.modelSelectorBtn.addEventListener('click', openModelModal);
    dom.refreshModelsBtn.addEventListener('click', fetchModels);
    dom.modelSearchInput.addEventListener('input', debounce(renderModelList, 150));
    dom.confirmModelBtn.addEventListener('click', confirmModel);

    dom.typeSelectorBtn.addEventListener('click', openTypeModal);
    dom.confirmTypeBtn.addEventListener('click', confirmType);

    dom.settingsBtn.addEventListener('click', () => {
      fillSettingsUI();
      setConnectionStatus('لم يتم اختبار الاتصال بعد.');
      openModal(dom.settingsModal);
    });
    dom.toggleApiKeyBtn.addEventListener('click', () => {
      const isPass = dom.apiKeyInput.type === 'password';
      dom.apiKeyInput.type = isPass ? 'text' : 'password';
      dom.eyeIconShow.style.display = isPass ? 'none' : '';
      dom.eyeIconHide.style.display = isPass ? '' : 'none';
    });
    dom.saveSettingsBtn.addEventListener('click', () => {
      state.settings.apiKey = dom.apiKeyInput.value.trim();
      state.settings.endpoint = normalizeEndpoint(dom.endpointInput.value) || 'https://api.openai.com/v1';
      dom.endpointInput.value = state.settings.endpoint;
      saveSettings();
    });
    dom.testConnectionBtn.addEventListener('click', testConnection);
    dom.deleteKeyBtn.addEventListener('click', () => {
      if (confirm('هل أنت متأكد من حذف مفتاح API؟')) {
        state.settings.apiKey = '';
        dom.apiKeyInput.value = '';
        saveSettings();
        setConnectionStatus('تم حذف المفتاح.', '');
        toast('تم حذف المفتاح.');
      }
    });

    dom.themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    dom.historyToggleBtn.addEventListener('click', () => {
      dom.historySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    dom.historyTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        state.historyTab = tab.dataset.historyTab;
        dom.historyTabs.forEach((t) => {
          const active = t === tab;
          t.classList.toggle('active', active);
          t.setAttribute('aria-selected', String(active));
        });
        renderHistory();
      });
    });

    if (dom.historySearchInput) {
      dom.historySearchInput.addEventListener('input', debounce((e) => {
        state.historyQuery = e.target.value;
        renderHistory();
      }, 150));
    }
    dom.clearHistoryBtn.addEventListener('click', () => {
      if (state.historyTab === 'history') {
        if (confirm('حذف كل السجل؟')) {
          state.history = [];
          persistHistory();
          renderHistory();
          toast('تم حذف السجل.');
        }
      } else {
        if (confirm('حذف كل المفضلة؟')) {
          state.favorites = [];
          persistFavorites();
          renderHistory();
          toast('تم حذف المفضلة.');
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach((m) => closeModal(m));
      }
    });

    initVoiceInput();

    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }

  /* ---------- Init ---------- */
  function init() {
    cacheDom();
    initTheme();
    loadSettings();
    loadHistoryAndFavorites();
    initLanguageSelects();
    initEngine();
    initModalCloseButtons();
    bindEvents();

    const savedType = safeGet(LS_KEYS.type, 'natural');
    if (TRANSLATION_TYPES.some((t) => t.id === savedType)) state.type = savedType;
    updateSelectorLabels();

    renderHistory();
    updateCharCount();

    console.info('Premium Translate v1.1 initialized.');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
