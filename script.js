/* ═══════════════════════════════════════════════════════
   ترجمان — التطبيق الكامل
   ═══════════════════════════════════════════════════════ */
'use strict';

// ─── الثوابت ───
const APP_VERSION = '1.0.0';
const STORAGE = {
  theme: 'tj_theme',
  settings: 'tj_settings',
  model: 'tj_model',
  modelsCache: 'tj_models_cache',
  type: 'tj_type',
  engine: 'tj_engine',
  history: 'tj_history',
  favorites: 'tj_favorites'
};
const MYMEMORY_API = 'https://api.mymemory.translated.net/get';
const LANG_NAMES_EN = {
  ar:'Arabic', en:'English', fr:'French', es:'Spanish', de:'German',
  tr:'Turkish', it:'Italian', pt:'Portuguese', ru:'Russian', ja:'Japanese',
  ko:'Korean', zh:'Chinese', hi:'Hindi', fa:'Persian', ur:'Urdu'
};
const LANG_SPEECH = {
  ar:'ar-SA', en:'en-US', fr:'fr-FR', es:'es-ES', de:'de-DE', tr:'tr-TR',
  it:'it-IT', pt:'pt-PT', ru:'ru-RU', ja:'ja-JP', ko:'ko-KR', zh:'zh-CN',
  hi:'hi-IN', fa:'fa-IR', ur:'ur-PK'
};
const TRANSLATION_TYPES = [
  { id:'normal', name:'ترجمة طبيعية', desc:'ترجمة سلسة تحافظ على المعنى والسياق', icon:'globe' },
  { id:'literal', name:'ترجمة حرفية', desc:'دقيقة لفظياً وقريبة من بنية الأصل', icon:'text' },
  { id:'formal', name:'ترجمة رسمية', desc:'لغة مهنية رسمية مناسبة للوثائق', icon:'briefcase' },
  { id:'informal', name:'ترجمة غير رسمية', desc:'لغة ودية يومية قريبة من الحديث', icon:'chat' },
  { id:'academic', name:'ترجمة أكاديمية', desc:'أسلوب علمي بمصطلحات متخصصة', icon:'book' },
  { id:'professional', name:'ترجمة احترافية', desc:'جودة عالية بمصطلحات صناعية دقيقة', icon:'star' },
  { id:'explain', name:'شرح معنى النص', desc:'يشرح المعنى بدلاً من الترجمة الحرفية', icon:'info' }
];
const TYPE_PROMPTS = {
  normal: 'Translate naturally and fluently, preserving meaning, tone, and context.',
  literal: 'Translate literally, staying as close as possible to the source structure and wording.',
  formal: 'Translate using formal, professional, polite language suitable for official documents.',
  informal: 'Translate using casual, friendly, everyday language.',
  academic: 'Translate using scholarly terminology and formal academic style.',
  professional: 'Translate with industry-appropriate terminology and high professional quality.',
  explain: 'Explain the meaning of this text clearly and thoroughly rather than translating it word-for-word.'
};

// ─── الحالة ───
const state = {
  engine: 'normal',
  selectedModel: null,
  selectedType: 'normal',
  pendingModel: null,
  pendingType: 'normal',
  isListening: false,
  isSpeaking: false,
  recognition: null,
  lastTranslation: null,
  currentSection: 'history',
  models: []
};

// ─── مساعدات ───
const $ = (id) => document.getElementById(id);
const create = (tag, cls, html) => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (html !== undefined) el.innerHTML = html;
  return el;
};

// ─── Toast ───
let toastTimer;
function showToast(message, type = 'info') {
  const toast = $('toast');
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

// ─── التخزين الآمن ───
function safeGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v === null ? fallback : JSON.parse(v);
  } catch { return fallback; }
}
function safeSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    showToast('تعذر الحفظ — مساحة التخزين ممتلئة', 'error');
    return false;
  }
}
function safeRemove(key) {
  try { localStorage.removeItem(key); } catch {}
}

// ═══════════════════════════════════════════════════════
// 1) السمة
// ═══════════════════════════════════════════════════════
function initTheme() {
  const saved = safeGet(STORAGE.theme, 'light');
  applyTheme(saved);
}
function applyTheme(mode) {
  const effective = mode === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', effective);
  $('themeToggle').innerHTML = effective === 'dark'
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  safeSet(STORAGE.theme, mode);
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

// ═══════════════════════════════════════════════════════
// 2) محدد المحرك
// ═══════════════════════════════════════════════════════
function setEngine(engine) {
  state.engine = engine;
  safeSet(STORAGE.engine, engine);
  document.querySelectorAll('.engine-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.engine === engine);
  });
  const aiOptions = $('aiOptions');
  if (engine === 'ai') {
    aiOptions.classList.remove('hidden');
  } else {
    aiOptions.classList.add('hidden');
  }
}

// ═══════════════════════════════════════════════════════
// 3) الإعدادات
// ═══════════════════════════════════════════════════════
function getSettings() {
  return safeGet(STORAGE.settings, { apiKey: '', endpoint: '' });
}
function saveSettingsToStorage(settings) {
  safeSet(STORAGE.settings, settings);
}
function normalizeEndpoint(endpoint) {
  if (!endpoint) return '';
  let url = endpoint.trim().replace(/\/+$/, '');
  try {
    const u = new URL(url);
    if (u.pathname === '/' || u.pathname === '') {
      url = u.origin + '/v1';
    }
  } catch {}
  return url;
}
function updateSettingsStatus(type, text) {
  const status = $('connectionStatus');
  const textEl = $('statusText');
  status.className = 'status-indicator ' + type;
  textEl.textContent = text;
}
async function testConnection() {
  const key = $('apiKeyInput').value.trim();
  const endpoint = normalizeEndpoint($('endpointInput').value);
  if (!key || !endpoint) {
    updateSettingsStatus('error', 'أدخل المفتاح و Endpoint أولاً');
    return;
  }
  updateSettingsStatus('loading', 'جارٍ اختبار الاتصال...');
  try {
    const res = await fetch(endpoint + '/models', {
      headers: { 'Authorization': 'Bearer ' + key }
    });
    if (res.ok) {
      updateSettingsStatus('success', '✅ الاتصال ناجح — المفتاح صحيح');
      showToast('تم الاتصال بنجاح', 'success');
    } else if (res.status === 401 || res.status === 403) {
      updateSettingsStatus('error', '❌ المفتاح غير صحيح أو منتهي');
    } else {
      updateSettingsStatus('error', '❌ خطأ ' + res.status + ' — تحقق من الـ Endpoint');
    }
  } catch (err) {
    updateSettingsStatus('error', '❌ فشل الاتصال — قد يكون CORS أو الشبكة');
  }
}
function saveSettings() {
  const key = $('apiKeyInput').value.trim();
  const endpoint = normalizeEndpoint($('endpointInput').value);
  if (!key || !endpoint) {
    showToast('يرجى ملء الحقلين', 'error');
    return;
  }
  saveSettingsToStorage({ apiKey: key, endpoint });
  safeRemove(STORAGE.modelsCache);
  showToast('تم حفظ الإعدادات', 'success');
  closeModal('settingsModal');
}
function deleteKey() {
  if (!confirm('هل أنت متأكد من حذف مفتاح API؟')) return;
  saveSettingsToStorage({ apiKey: '', endpoint: '' });
  $('apiKeyInput').value = '';
  safeRemove(STORAGE.modelsCache);
  updateSettingsStatus('', 'تم حذف المفتاح');
  showToast('تم حذف المفتاح', 'success');
}
function openSettings() {
  const s = getSettings();
  $('apiKeyInput').value = s.apiKey || '';
  $('endpointInput').value = s.endpoint || '';
  updateSettingsStatus('', s.apiKey ? 'المفتاح محفوظ' : 'لم يتم الاختبار بعد');
  openModal('settingsModal');
}

// ═══════════════════════════════════════════════════════
// 4) النوافذ المنبثقة
// ═══════════════════════════════════════════════════════
function openModal(id) {
  const m = $(id);
  if (!m) return;
  m.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  const m = $(id);
  if (!m) return;
  m.classList.remove('open');
  document.body.style.overflow = '';
  if (id === 'modelModal') state.pendingModel = null;
  if (id === 'typeModal') state.pendingType = state.selectedType;
}

// ═══════════════════════════════════════════════════════
// 5) النماذج
// ═══════════════════════════════════════════════════════
async function loadModels(forceRefresh = false) {
  const settings = getSettings();
  if (!settings.apiKey || !settings.endpoint) {
    showToast('يرجى إعداد مفتاح API و Endpoint أولاً', 'error');
    openSettings();
    return [];
  }
  if (!forceRefresh) {
    const cached = safeGet(STORAGE.modelsCache, null);
    if (cached && cached.timestamp && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) {
      return cached.models;
    }
  }
  const endpoint = normalizeEndpoint(settings.endpoint);
  try {
    const res = await fetch(endpoint + '/models', {
      headers: { 'Authorization': 'Bearer ' + settings.apiKey }
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${errText.slice(0, 100)}`);
    }
    const data = await res.json();
    const list = data.data || data.models || [];
    const models = list.map(m => ({
      id: m.id || m.name || String(m),
      name: m.id || m.name || String(m)
    })).filter(m => m.id);
    safeSet(STORAGE.modelsCache, { models, timestamp: Date.now() });
    return models;
  } catch (e) {
    showToast('فشل جلب النماذج: ' + e.message.slice(0, 80), 'error');
    return [];
  }
}
async function openModelModal() {
  openModal('modelModal');
  state.pendingModel = state.selectedModel;
  const list = $('modelList');
  list.innerHTML = '<div class="empty-state"><p>جارٍ التحميل...</p></div>';
  $('confirmModelBtn').disabled = true;
  const models = await loadModels(false);
  renderModels(models);
}
function renderModels(models) {
  state.models = models;
  const list = $('modelList');
  const query = ($('modelSearch').value || '').toLowerCase().trim();
  const filtered = models.filter(m => !query || m.name.toLowerCase().includes(query));
  if (filtered.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>' + (models.length === 0 ? 'لا توجد نماذج متاحة' : 'لا نتائج مطابقة') + '</p></div>';
    return;
  }
  list.innerHTML = '';
  filtered.forEach(m => {
    const item = create('button', 'model-item' + (m.id === state.pendingModel ? ' selected' : ''), '');
    item.type = 'button';
    item.dataset.modelId = m.id;
    item.innerHTML = `
      <div class="model-check">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <div class="model-name" title="${escapeHtml(m.name)}">${escapeHtml(m.name)}</div>
    `;
    item.addEventListener('click', () => {
      state.pendingModel = m.id;
      list.querySelectorAll('.model-item').forEach(x => x.classList.remove('selected'));
      item.classList.add('selected');
      $('confirmModelBtn').disabled = false;
    });
    list.appendChild(item);
  });
  if (state.pendingModel) $('confirmModelBtn').disabled = false;
}
function confirmModel() {
  if (!state.pendingModel) return;
  state.selectedModel = state.pendingModel;
  safeSet(STORAGE.model, state.selectedModel);
  updateModelDisplay();
  closeModal('modelModal');
  showToast('تم اختيار النموذج', 'success');
}
function updateModelDisplay() {
  const el = $('modelValue');
  if (state.selectedModel) {
    el.textContent = state.selectedModel;
    el.classList.remove('empty');
  } else {
    el.textContent = 'لم يتم الاختيار';
    el.classList.add('empty');
  }
}
async function refreshModels() {
  const btn = $('refreshModelsBtn');
  btn.classList.add('loading');
  btn.disabled = true;
  const models = await loadModels(true);
  btn.classList.remove('loading');
  btn.disabled = false;
  renderModels(models);
  if (models.length) showToast('تم تحديث النماذج (' + models.length + ')', 'success');
}

// ═══════════════════════════════════════════════════════
// 6) نوع الترجمة
// ═══════════════════════════════════════════════════════
function getIcon(name) {
  const icons = {
    globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
    text: '<path d="M4 7V4h16v3"/><line x1="12" y1="4" x2="12" y2="20"/><line x1="8" y1="20" x2="16" y2="20"/>',
    briefcase: '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
    chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>'
  };
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (icons[name] || icons.info) + '</svg>';
}
function renderTypeCards() {
  const grid = $('typeGrid');
  grid.innerHTML = '';
  state.pendingType = state.selectedType;
  TRANSLATION_TYPES.forEach(t => {
    const card = create('button', 'type-card' + (t.id === state.pendingType ? ' selected' : ''), '');
    card.type = 'button';
    card.dataset.typeId = t.id;
    card.innerHTML = `
      ${getIcon(t.icon)}
      <div class="type-info">
        <span class="type-name">${t.name}</span>
        <span class="type-desc">${t.desc}</span>
      </div>
      <div class="type-check">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
    `;
    card.addEventListener('click', () => {
      state.pendingType = t.id;
      grid.querySelectorAll('.type-card').forEach(x => x.classList.remove('selected'));
      card.classList.add('selected');
    });
    grid.appendChild(card);
  });
}
function openTypeModal() {
  renderTypeCards();
  openModal('typeModal');
}
function confirmType() {
  state.selectedType = state.pendingType;
  safeSet(STORAGE.type, state.selectedType);
  const type = TRANSLATION_TYPES.find(t => t.id === state.selectedType);
  $('typeValue').textContent = type ? type.name : 'طبيعية';
  closeModal('typeModal');
  showToast('تم اختيار نوع الترجمة', 'success');
}

// ═══════════════════════════════════════════════════════
// 7) الترجمة العادية (MyMemory)
// ═══════════════════════════════════════════════════════
function splitText(text, maxLen) {
  if (text.length <= maxLen) return [text];
  const chunks = [];
  const paragraphs = text.split(/\n\s*\n/);
  let current = '';
  for (const para of paragraphs) {
    if ((current + '\n\n' + para).length > maxLen && current) {
      chunks.push(current.trim());
      current = '';
    }
    if (para.length > maxLen) {
      const sentences = para.match(/[^.!?؟]+[.!?؟]+|[^.!?؟]+$/g) || [para];
      for (const s of sentences) {
        if ((current + ' ' + s).length > maxLen && current) {
          chunks.push(current.trim());
          current = '';
        }
        current += (current ? ' ' : '') + s;
      }
    } else {
      current += (current ? '\n\n' : '') + para;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
async function translateChunk(text, src, tgt) {
  const url = `${MYMEMORY_API}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(src)}|${encodeURIComponent(tgt)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  if (data.responseStatus === 403 || data.responseStatus === 429) {
    throw new Error('تجاوزت حد الخدمة المجانية — حاول لاحقاً');
  }
  const translated = data.responseData?.translatedText || '';
  if (!translated) throw new Error('لا توجد ترجمة');
  return translated;
}
async function translateNormal(text, src, tgt) {
  if (text.length > 500) {
    showToast('النص طويل — سيتم تقسيمه لأجزاء', 'info');
  }
  const chunks = splitText(text, 450);
  const results = [];
  for (const chunk of chunks) {
    results.push(await translateChunk(chunk, src, tgt));
  }
  return results.join('\n\n');
}

// ═══════════════════════════════════════════════════════
// 8) الترجمة بالذكاء الاصطناعي
// ═══════════════════════════════════════════════════════
async function translateAI(text, src, tgt) {
  const settings = getSettings();
  if (!settings.apiKey || !settings.endpoint) {
    showToast('يرجى إعداد مفتاح API و Endpoint أولاً', 'error');
    openSettings();
    throw new Error('missing-settings');
  }
  if (!state.selectedModel) {
    showToast('يرجى اختيار نموذج أولاً', 'error');
    openModelModal();
    throw new Error('missing-model');
  }
  const endpoint = normalizeEndpoint(settings.endpoint);
  const typePrompt = TYPE_PROMPTS[state.selectedType] || TYPE_PROMPTS.normal;
  const srcName = LANG_NAMES_EN[src] || src;
  const tgtName = LANG_NAMES_EN[tgt] || tgt;
  const systemPrompt = `You are a professional translator. ${typePrompt} Respond only with the ${state.selectedType === 'explain' ? 'explanation' : 'translation'} in ${tgtName}. Do not add explanations, notes, or quotes.`;
  const userPrompt = `Source language: ${srcName}\nTarget language: ${tgtName}\n\nText:\n${text}`;
  try {
    const res = await fetch(endpoint + '/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + settings.apiKey
      },
      body: JSON.stringify({
        model: state.selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3
      })
    });
    if (!res.ok) {
      if (res.status === 401) throw new Error('مفتاح API غير صحيح (401)');
      if (res.status === 404) throw new Error('النموذج غير متاح (404)');
      if (res.status === 429) throw new Error('تجاوزت حد الطلبات (429)');
      const errText = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${errText.slice(0, 80)}`);
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error('لم يتم استلام رد من النموذج');
    return content.trim();
  } catch (err) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      throw new Error('فشل الاتصال — قد يكون CORS أو الشبكة');
    }
    throw err;
  }
}

// ═══════════════════════════════════════════════════════
// 9) تنفيذ الترجمة الرئيسي
// ═══════════════════════════════════════════════════════
async function translate() {
  const text = $('sourceText').value.trim();
  if (!text) {
    showToast('أدخل نصاً للترجمة', 'error');
    return;
  }
  const src = $('sourceLang').value;
  const tgt = $('targetLang').value;
  if (src === tgt) {
    showToast('اختر لغتين مختلفتين', 'error');
    return;
  }
  const btn = $('translateBtn');
  btn.disabled = true;
  btn.classList.add('loading');
  const result = $('resultText');
  result.className = 'result-text';
  result.textContent = 'جارٍ الترجمة...';

  try {
    let translated;
    if (state.engine === 'ai') {
      translated = await translateAI(text, src, tgt);
    } else {
      translated = await translateNormal(text, src, tgt);
    }
    result.textContent = translated;
    result.className = 'result-text';
    state.lastTranslation = {
      source: text,
      target: translated,
      sourceLang: src,
      targetLang: tgt,
      engine: state.engine,
      model: state.engine === 'ai' ? state.selectedModel : null,
      type: state.engine === 'ai' ? state.selectedType : null,
      timestamp: Date.now()
    };
    addToHistory(state.lastTranslation);
    updateFavoriteBtn();
    showToast('تمت الترجمة بنجاح', 'success');
  } catch (err) {
    result.className = 'result-text error';
    result.textContent = '⚠️ ' + (err.message || 'فشلت الترجمة');
    showToast(err.message || 'فشلت الترجمة', 'error');
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
  }
}

// ═══════════════════════════════════════════════════════
// 10) الأدوات (نسخ، نطق، مشاركة، مفضلة)
// ═══════════════════════════════════════════════════════
async function copyResult() {
  const text = $('resultText').textContent;
  if (!text || text === 'الترجمة ستظهر هنا' || text.startsWith('⚠️')) {
    showToast('لا يوجد نص لنسخه', 'error');
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast('تم النسخ', 'success');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('تم النسخ', 'success');
  }
}
function speakResult() {
  const text = $('resultText').textContent;
  if (!text || text === 'الترجمة ستظهر هنا' || text.startsWith('⚠️')) {
    showToast('لا يوجد نص للنطق', 'error');
    return;
  }
  if (!('speechSynthesis' in window)) {
    showToast('النطق غير مدعوم', 'error');
    return;
  }
  const btn = $('speakBtn');
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    btn.classList.remove('active');
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = LANG_SPEECH[$('targetLang').value] || 'en-US';
  utterance.rate = 0.9;
  utterance.onend = () => btn.classList.remove('active');
  utterance.onerror = () => btn.classList.remove('active');
  btn.classList.add('active');
  window.speechSynthesis.speak(utterance);
  showToast('جارٍ النطق...', 'info');
}
async function shareResult() {
  const text = $('resultText').textContent;
  if (!text || text === 'الترجمة ستظهر هنا' || text.startsWith('⚠️')) {
    showToast('لا يوجد نص للمشاركة', 'error');
    return;
  }
  if (navigator.share) {
    try {
      await navigator.share({ text, title: 'ترجمان' });
    } catch (err) {
      if (err.name !== 'AbortError') showToast('تعذرت المشاركة', 'error');
    }
  } else {
    copyResult();
  }
}
function toggleFavorite() {
  if (!state.lastTranslation) {
    showToast('لا توجد ترجمة لحفظها', 'error');
    return;
  }
  const favorites = safeGet(STORAGE.favorites, []);
  const id = state.lastTranslation.timestamp;
  const existing = favorites.findIndex(f => f.timestamp === id);
  if (existing >= 0) {
    favorites.splice(existing, 1);
    safeSet(STORAGE.favorites, favorites);
    showToast('أُزيلت من المفضلة', 'info');
  } else {
    favorites.unshift(state.lastTranslation);
    if (favorites.length > 100) favorites.length = 100;
    safeSet(STORAGE.favorites, favorites);
    showToast('أُضيفت للمفضلة', 'success');
  }
  updateFavoriteBtn();
  renderFavorites();
}
function updateFavoriteBtn() {
  const btn = $('favoriteBtn');
  if (!state.lastTranslation) {
    btn.classList.remove('active');
    return;
  }
  const favorites = safeGet(STORAGE.favorites, []);
  const isFav = favorites.some(f => f.timestamp === state.lastTranslation.timestamp);
  btn.classList.toggle('active', isFav);
}

// ═══════════════════════════════════════════════════════
// 11) السجل والمفضلة
// ═══════════════════════════════════════════════════════
function addToHistory(item) {
  const history = safeGet(STORAGE.history, []);
  history.unshift(item);
  if (history.length > 50) history.length = 50;
  safeSet(STORAGE.history, history);
  renderHistory();
}
function renderHistory() {
  const history = safeGet(STORAGE.history, []);
  const container = $('historySection');
  if (history.length === 0) {
    container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><p>لا توجد ترجمات سابقة بعد</p></div>';
    return;
  }
  container.innerHTML = '';
  history.forEach(item => {
    container.appendChild(buildHistoryItem(item, false));
  });
}
function renderFavorites() {
  const favorites = safeGet(STORAGE.favorites, []);
  const container = $('favoritesSection');
  if (favorites.length === 0) {
    container.innerHTML = '<div class="empty-state"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><p>لا توجد عناصر في المفضلة</p></div>';
    return;
  }
  container.innerHTML = '';
  favorites.forEach(item => {
    container.appendChild(buildHistoryItem(item, true));
  });
}
function buildHistoryItem(item, isFavorite) {
  const el = create('div', 'history-item');
  const srcLang = $('sourceLang').querySelector('option[value="' + item.sourceLang + '"]')?.textContent || item.sourceLang;
  const tgtLang = $('targetLang').querySelector('option[value="' + item.targetLang + '"]')?.textContent || item.targetLang;
  const time = new Date(item.timestamp).toLocaleString('ar', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });
  el.innerHTML = `
    <div class="history-item-header">
      <span class="history-langs">${srcLang} ← ${tgtLang}${item.engine === 'ai' ? ' • AI' : ''}</span>
      <span class="history-time">${time}</span>
    </div>
    <div class="history-source">${escapeHtml(item.source)}</div>
    <div class="history-target">${escapeHtml(item.target)}</div>
    <div class="history-actions">
      <button class="tool-btn" data-action="reuse">استخدام</button>
      <button class="tool-btn" data-action="copy">نسخ</button>
      <button class="tool-btn" data-action="${isFavorite ? 'unfav' : 'fav'}">${isFavorite ? 'إزالة' : 'حفظ'}</button>
      <button class="tool-btn" data-action="delete">حذف</button>
    </div>
  `;
  el.querySelectorAll('.tool-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.action;
      if (action === 'reuse') {
        $('sourceText').value = item.source;
        $('sourceLang').value = item.sourceLang;
        $('targetLang').value = item.targetLang;
        updateCharCount();
        state.lastTranslation = item;
        $('resultText').className = 'result-text';
        $('resultText').textContent = item.target;
        updateFavoriteBtn();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        showToast('تم تحميل الترجمة', 'success');
      } else if (action === 'copy') {
        try {
          await navigator.clipboard.writeText(item.target);
          showToast('تم النسخ', 'success');
        } catch { showToast('تعذر النسخ', 'error'); }
      } else if (action === 'fav') {
        const favs = safeGet(STORAGE.favorites, []);
        if (!favs.some(f => f.timestamp === item.timestamp)) {
          favs.unshift(item);
          safeSet(STORAGE.favorites, favs);
          showToast('أُضيفت للمفضلة', 'success');
          renderFavorites();
          updateFavoriteBtn();
        }
      } else if (action === 'unfav') {
        const favs = safeGet(STORAGE.favorites, []);
        const idx = favs.findIndex(f => f.timestamp === item.timestamp);
        if (idx >= 0) {
          favs.splice(idx, 1);
          safeSet(STORAGE.favorites, favs);
          showToast('أُزيلت من المفضلة', 'info');
          renderFavorites();
          updateFavoriteBtn();
        }
      } else if (action === 'delete') {
        if (!confirm('حذف هذا العنصر؟')) return;
        const key = isFavorite ? STORAGE.favorites : STORAGE.history;
        const list = safeGet(key, []);
        const idx = list.findIndex(f => f.timestamp === item.timestamp);
        if (idx >= 0) {
          list.splice(idx, 1);
          safeSet(key, list);
          isFavorite ? renderFavorites() : renderHistory();
          showToast('تم الحذف', 'info');
        }
      }
    });
  });
  return el;
}
function switchSection(section) {
  state.currentSection = section;
  document.querySelectorAll('.section-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.section === section);
  });
  $('historySection').classList.toggle('hidden', section !== 'history');
  $('favoritesSection').classList.toggle('hidden', section !== 'favorites');
}

// ═══════════════════════════════════════════════════════
// 12) الأدوات المساعدة
// ═══════════════════════════════════════════════════════
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}
function updateCharCount() {
  const count = $('sourceText').value.length;
  $('charCount').textContent = count;
}

// ═══════════════════════════════════════════════════════
// 13) الصوت (Speech Recognition)
// ═══════════════════════════════════════════════════════
function startVoice(autoTranslate = false) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    showToast('الإدخال الصوتي غير مدعوم في هذا المتصفح', 'error');
    return;
  }
  if (state.isListening) {
    try { state.recognition?.stop(); } catch {}
    return;
  }
  const rec = new SR();
  state.recognition = rec;
  rec.lang = LANG_SPEECH[$('sourceLang').value] || 'ar-SA';
  rec.continuous = false;
  rec.interimResults = true;

  const btn = autoTranslate ? $('voiceTranslateBtn') : $('micBtn');
  btn.classList.add('listening');

  rec.onstart = () => {
    state.isListening = true;
    showToast('🎤 تحدث الآن...', 'info');
  };
  rec.onresult = (e) => {
    let transcript = '';
    for (let i = 0; i < e.results.length; i++) {
      transcript += e.results[i][0].transcript;
    }
    $('sourceText').value = transcript;
    updateCharCount();
  };
  rec.onend = () => {
    state.isListening = false;
    btn.classList.remove('listening');
    if (autoTranslate && $('sourceText').value.trim()) {
      translate();
    }
  };
  rec.onerror = (e) => {
    state.isListening = false;
    btn.classList.remove('listening');
    if (e.error !== 'aborted' && e.error !== 'no-speech') {
      showToast('خطأ صوتي: ' + e.error, 'error');
    }
  };
  rec.start();
}

// ═══════════════════════════════════════════════════════
// 14) استيراد الملفات
// ═══════════════════════════════════════════════════════
async function handleFileImport(file) {
  if (!file) return;
  const name = file.name.toLowerCase();
  const textExts = ['.txt', '.md', '.csv', '.srt', '.json', '.log', '.rtf'];
  const isText = textExts.some(ext => name.endsWith(ext)) || file.type.startsWith('text/');
  if (!isText) {
    showToast('صيغة غير مدعومة — يدعم التطبيق النصوص فقط (.txt, .md, .csv, .srt, .json)', 'error');
    return;
  }
  try {
    const text = await file.text();
    $('sourceText').value = text;
    updateCharCount();
    showToast('تم استيراد الملف (' + text.length + ' حرف)', 'success');
  } catch (e) {
    showToast('تعذر قراءة الملف', 'error');
  }
}

// ═══════════════════════════════════════════════════════
// 15) ربط الأحداث
// ═══════════════════════════════════════════════════════
function bindEvents() {
  $('themeToggle').addEventListener('click', toggleTheme);
  $('settingsBtn').addEventListener('click', openSettings);

  document.querySelectorAll('.engine-btn').forEach(btn => {
    btn.addEventListener('click', () => setEngine(btn.dataset.engine));
  });

  $('modelBtn').addEventListener('click', openModelModal);
  $('typeBtn').addEventListener('click', openTypeModal);
  $('confirmModelBtn').addEventListener('click', confirmModel);
  $('confirmTypeBtn').addEventListener('click', confirmType);
  $('refreshModelsBtn').addEventListener('click', refreshModels);
  $('modelSearch').addEventListener('input', () => renderModels(state.models));

  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal.id);
    });
  });

  $('toggleKeyBtn').addEventListener('click', () => {
    const inp = $('apiKeyInput');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
  $('testConnectionBtn').addEventListener('click', testConnection);
  $('saveSettingsBtn').addEventListener('click', saveSettings);
  $('deleteKeyBtn').addEventListener('click', deleteKey);

  $('swapBtn').addEventListener('click', () => {
    const s = $('sourceLang').value;
    $('sourceLang').value = $('targetLang').value;
    $('targetLang').value = s;
    const result = $('resultText');
    if (state.lastTranslation) {
      const t = $('sourceText').value;
      $('sourceText').value = result.textContent;
      result.textContent = t;
      updateCharCount();
    }
  });

  $('sourceText').addEventListener('input', updateCharCount);
  $('pasteBtn').addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) { showToast('الحافظة فارغة', 'info'); return; }
      $('sourceText').value = text;
      updateCharCount();
      showToast('تم اللصق', 'success');
    } catch {
      showToast('تعذر اللصق — فعّل إذن الحافظة', 'error');
    }
  });
  $('clearBtn').addEventListener('click', () => {
    if (!$('sourceText').value) return;
    $('sourceText').value = '';
    updateCharCount();
    $('resultText').className = 'result-text empty';
    $('resultText').textContent = 'الترجمة ستظهر هنا';
    state.lastTranslation = null;
    updateFavoriteBtn();
  });
  $('importBtn').addEventListener('click', () => $('fileInput').click());
  $('fileInput').addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (f) handleFileImport(f);
    e.target.value = '';
  });
  $('micBtn').addEventListener('click', () => startVoice(false));

  $('translateBtn').addEventListener('click', translate);
  $('voiceTranslateBtn').addEventListener('click', () => startVoice(true));
  $('retranslateBtn').addEventListener('click', translate);

  $('copyBtn').addEventListener('click', copyResult);
  $('speakBtn').addEventListener('click', speakResult);
  $('shareBtn').addEventListener('click', shareResult);
  $('favoriteBtn').addEventListener('click', toggleFavorite);

  document.querySelectorAll('.section-tab').forEach(tab => {
    tab.addEventListener('click', () => switchSection(tab.dataset.section));
  });
}

// ═══════════════════════════════════════════════════════
// 16) التهيئة
// ═══════════════════════════════════════════════════════
function init() {
  initTheme();

  const savedEngine = safeGet(STORAGE.engine, 'normal');
  setEngine(savedEngine);

  const savedModel = safeGet(STORAGE.model, null);
  if (savedModel) {
    state.selectedModel = savedModel;
    updateModelDisplay();
  }
  const savedType = safeGet(STORAGE.type, 'normal');
  state.selectedType = savedType;
  const type = TRANSLATION_TYPES.find(t => t.id === savedType);
  if (type) $('typeValue').textContent = type.name;

  bindEvents();
  renderHistory();
  renderFavorites();
  updateCharCount();

  console.log('%c🌐 ترجمان v' + APP_VERSION + ' جاهز', 'color:#14B8A6;font-weight:bold;font-size:14px');
}

document.addEventListener('DOMContentLoaded', init);
