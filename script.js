// ==================== 1. البيانات والثوابت ====================
const LANGUAGES = {
    auto: "اكتشاف تلقائي", ar: "العربية", en: "الإنجليزية", fr: "الفرنسية",
    es: "الإسبانية", de: "الألمانية", it: "الإيطالية", pt: "البرتغالية",
    ru: "الروسية", zh: "الصينية", ja: "اليابانية", ko: "الكورية",
    tr: "التركية", hi: "الهندية", ur: "الأردية", fa: "الفارسية",
    nl: "الهولندية", pl: "البولندية", sv: "السويدية", el: "اليونانية"
};

const TRANSLATION_TYPES = {
    natural: { title: "ترجمة طبيعية", desc: "ترجمة سلسة تحافظ على المعنى والسياق", icon: "M4 7h16M4 12h10M4 17h16", prompt: "Translate naturally, focusing on meaning and flow." },
    literal: { title: "ترجمة حرفية", desc: "ترجمة دقيقة قريبة من تركيب النص الأصلي", icon: "M4 7h16M4 12h10M4 17h16", prompt: "Translate literally, keeping as close to the source structure as possible." },
    formal: { title: "ترجمة رسمية", desc: "مناسبة للمراسلات والعمل", icon: "M4 7h16M4 12h10M4 17h16", prompt: "Translate formally, suitable for business and official correspondence." },
    casual: { title: "ترجمة غير رسمية", desc: "مناسبة للمحادثات اليومية", icon: "M4 7h16M4 12h10M4 17h16", prompt: "Translate casually, suitable for everyday conversations." },
    academic: { title: "ترجمة أكاديمية", desc: "مناسبة للنصوص العلمية والأكاديمية", icon: "M4 7h16M4 12h10M4 17h16", prompt: "Translate academically, suitable for scientific and scholarly texts." },
    explain: { title: "شرح المعنى", desc: "شرح معنى النص بدلاً من ترجمته حرفياً", icon: "M4 7h16M4 12h10M4 17h16", prompt: "Explain the meaning of the text instead of just translating it." }
};

// ==================== 2. حالة التطبيق ====================
let state = {
    engine: localStorage.getItem('turjuman_engine') || 'free',
    selectedModel: localStorage.getItem('turjuman_model') || null,
    translationType: localStorage.getItem('turjuman_type') || 'natural',
    apiKey: localStorage.getItem('turjuman_key') || '',
    endpoint: localStorage.getItem('turjuman_endpoint') || '',
    isTranslating: false,
    models: []
};

// ==================== 3. العناصر ====================
const $ = id => document.getElementById(id);
const els = {
    sourceLang: $('sourceLang'), targetLang: $('targetLang'),
    sourceText: $('sourceText'), targetText: $('targetText'),
    btnTranslate: $('btnTranslate'), btnSwap: $('btnSwap'), btnClear: $('btnClear'),
    btnCopy: $('btnCopy'), btnMic: $('btnMic'), btnSpeakSource: $('btnSpeakSource'), btnSpeakTarget: $('btnSpeakTarget'),
    charCount: $('charCount'), statusBar: $('statusBar'),
    engineFree: $('engineFree'), engineAI: $('engineAI'),
    displayModel: $('displayModel'), displayType: $('displayType'),
    btnSelectModel: $('btnSelectModel'), btnSelectType: $('btnSelectType'),
    modalModel: $('modalModel'), modalType: $('modalType'), modalSettings: $('modalSettings'),
    modelList: $('modelList'), modelSearch: $('modelSearch'), btnRefreshModels: $('btnRefreshModels'),
    typeList: $('typeList'),
    inputEndpoint: $('inputEndpoint'), inputApiKey: $('inputApiKey'),
    btnSaveSettings: $('btnSaveSettings'), btnTestConn: $('btnTestConn'), btnToggleKey: $('btnToggleKey'),
    btnTheme: $('btnTheme'), btnHistory: $('btnHistory'), btnSettings: $('btnSettings'),
    btnFavorite: $('btnFavorite'), toastContainer: $('toastContainer')
};

// ==================== 4. التهيئة (Init) ====================
function init() {
    // تعبئة اللغات
    Object.entries(LANGUAGES).forEach(([code, name]) => {
        els.sourceLang.add(new Option(name, code));
        els.targetLang.add(new Option(name, code));
    });
    els.sourceLang.value = 'auto';
    els.targetLang.value = 'en';

    // تعبئة أنواع الترجمة
    renderTypes();

    // استعادة الحالة
    updateEngineUI();
    els.displayType.textContent = TRANSLATION_TYPES[state.translationType]?.title || 'ترجمة طبيعية';
    if (state.selectedModel) els.displayModel.textContent = state.selectedModel;
    
    // تعبئة الإعدادات
    els.inputEndpoint.value = state.endpoint;
    els.inputApiKey.value = state.apiKey;

    // المظهر
    if (localStorage.getItem('turjuman_theme') === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        els.btnTheme.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    }

    // ربط الأحداث
    bindEvents();
}

function bindEvents() {
    // الأزرار العلوية
    els.btnTheme.addEventListener('click', toggleTheme);
    els.btnSettings.addEventListener('click', () => openModal(els.modalSettings));
    els.btnHistory.addEventListener('click', () => showToast('قريباً: سجل الترجمات', 'info'));
    els.btnFavorite.addEventListener('click', () => showToast('قريباً: المفضلة', 'info'));

    // المحرك
    els.engineFree.addEventListener('click', () => setEngine('free'));
    els.engineAI.addEventListener('click', () => setEngine('ai'));

    // أدوات النص
    els.sourceText.addEventListener('input', () => els.charCount.textContent = els.sourceText.value.length);
    els.btnClear.addEventListener('click', () => { els.sourceText.value = ''; els.charCount.textContent = '0'; els.sourceText.focus(); });
    els.btnSwap.addEventListener('click', swapLanguages);
    els.btnCopy.addEventListener('click', copyResult);

    // النوافذ
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => closeModal($(btn.dataset.close)));
    });
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); });
    });

    // اختيار النموذج
    els.btnSelectModel.addEventListener('click', () => {
        if (state.engine !== 'ai') return showToast('الرجاء تفعيل محرك الذكاء الاصطناعي أولاً', 'error');
        openModal(els.modalModel);
        if (state.models.length === 0) fetchModels();
    });
    els.btnRefreshModels.addEventListener('click', fetchModels);
    els.modelSearch.addEventListener('input', renderModels);

    // اختيار النوع
    els.btnSelectType.addEventListener('click', () => openModal(els.modalType));

    // الإعدادات
    els.btnSaveSettings.addEventListener('click', saveSettings);
    els.btnTestConn.addEventListener('click', testConnection);
    els.btnToggleKey.addEventListener('click', () => {
        els.inputApiKey.type = els.inputApiKey.type === 'password' ? 'text' : 'password';
    });

    // الترجمة
    els.btnTranslate.addEventListener('click', translate);
}

// ==================== 5. الوظائف المنطقية ====================
function toggleTheme() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('turjuman_theme', 'light');
        els.btnTheme.innerHTML = '<svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('turjuman_theme', 'dark');
        els.btnTheme.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
    }
}

function setEngine(engine) {
    state.engine = engine;
    localStorage.setItem('turjuman_engine', engine);
    updateEngineUI();
}

function updateEngineUI() {
    if (state.engine === 'ai') {
        els.engineAI.classList.add('active');
        els.engineFree.classList.remove('active');
    } else {
        els.engineFree.classList.add('active');
        els.engineAI.classList.remove('active');
    }
}

function swapLanguages() {
    const s = els.sourceLang.value;
    const t = els.targetLang.value;
    if (s === 'auto') return showToast('لا يمكن تبديل الاكتشاف التلقائي', 'error');
    els.sourceLang.value = t;
    els.targetLang.value = s;
}

function renderTypes() {
    els.typeList.innerHTML = '';
    Object.entries(TRANSLATION_TYPES).forEach(([key, data]) => {
        const div = document.createElement('div');
        div.className = `type-item ${state.translationType === key ? 'selected' : ''}`;
        div.innerHTML = `
            <div class="type-icon"><svg viewBox="0 0 24 24"><path d="${data.icon}"/></svg></div>
            <div class="type-info">
                <h4>${data.title}</h4>
                <p>${data.desc}</p>
            </div>
        `;
        div.addEventListener('click', () => {
            state.translationType = key;
            localStorage.setItem('turjuman_type', key);
            els.displayType.textContent = data.title;
            renderTypes();
            closeModal(els.modalType);
        });
        els.typeList.appendChild(div);
    });
}

// ==================== 6. إدارة النوافذ (Modals) ====================
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}
function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ==================== 7. الإعدادات والاتصال ====================
function saveSettings() {
    state.endpoint = els.inputEndpoint.value.trim();
    state.apiKey = els.inputApiKey.value.trim();
    localStorage.setItem('turjuman_endpoint', state.endpoint);
    localStorage.setItem('turjuman_key', state.apiKey);
    showToast('تم حفظ الإعدادات بنجاح', 'success');
    closeModal(els.modalSettings);
}

async function testConnection() {
    const ep = els.inputEndpoint.value.trim().replace(/\/$/, '');
    const key = els.inputApiKey.value.trim();
    if (!ep || !key) return showToast('يرجى إدخال الرابط والمفتاح أولاً', 'error');

    els.btnTestConn.textContent = 'جاري الاختبار...';
    els.btnTestConn.disabled = true;
    try {
        const res = await fetch(`${ep}/models`, { headers: { 'Authorization': `Bearer ${key}` } });
        if (res.ok) showToast('الاتصال ناجح!', 'success');
        else {
            const err = await res.json();
            showToast(`فشل: ${err.error?.message || 'تأكد من المفتاح'}`, 'error');
        }
    } catch (e) {
        showToast('خطأ في الشبكة أو الرابط غير صحيح', 'error');
    } finally {
        els.btnTestConn.textContent = 'اختبار الاتصال';
        els.btnTestConn.disabled = false;
    }
}

// ==================== 8. جلب النماذج ====================
async function fetchModels() {
    const ep = state.endpoint.replace(/\/$/, '');
    const key = state.apiKey;
    if (!ep || !key) {
        els.modelList.innerHTML = '<p style="text-align:center; color:var(--text-muted);">يرجى إعداد الاتصال أولاً من الإعدادات.</p>';
        return;
    }

    els.modelList.innerHTML = '<div style="text-align:center; padding:2rem;"><svg class="spinner" viewBox="0 0 24 24" style="width:30px;height:30px;stroke:var(--primary);"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg><p style="margin-top:1rem;">جاري التحميل...</p></div>';

    try {
        const res = await fetch(`${ep}/models`, { headers: { 'Authorization': `Bearer ${key}` } });
        if (!res.ok) throw new Error('فشل');
        const data = await res.json();
        state.models = data.data || data;
        renderModels();
    } catch (e) {
        els.modelList.innerHTML = '<p style="text-align:center; color:var(--danger);">فشل جلب النماذج. تأكد من الإعدادات.</p>';
    }
}

function renderModels() {
    const search = els.modelSearch.value.toLowerCase();
    const filtered = state.models.filter(m => (m.id || m.name).toLowerCase().includes(search));
    
    if (filtered.length === 0) {
        els.modelList.innerHTML = '<p style="text-align:center; color:var(--text-muted);">لا توجد نتائج.</p>';
        return;
    }

    els.modelList.innerHTML = '';
    filtered.forEach(m => {
        const id = m.id || m.name;
        const div = document.createElement('div');
        div.className = `model-item ${state.selectedModel === id ? 'selected' : ''}`;
        div.innerHTML = `<span>${id}</span><svg class="check" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`;
        div.addEventListener('click', () => {
            state.selectedModel = id;
            localStorage.setItem('turjuman_model', id);
            els.displayModel.textContent = id;
            renderModels();
            showToast(`تم اختيار: ${id}`, 'success');
            closeModal(els.modalModel);
        });
        els.modelList.appendChild(div);
    });
}

// ==================== 9. الترجمة ====================
async function translate() {
    if (state.isTranslating) return;
    const text = els.sourceText.value.trim();
    if (!text) return showToast('الرجاء إدخال نص للترجمة', 'error');

    const from = els.sourceLang.value;
    const to = els.targetLang.value;
    if (from === to) return showToast('اللغتان متطابقتان', 'error');

    state.isTranslating = true;
    els.btnTranslate.disabled = true;
    els.btnTranslate.innerHTML = '<svg class="spinner" viewBox="0 0 24 24" style="width:20px;height:20px;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> جاري الترجمة...';
    els.statusBar.textContent = '';

    try {
        let result = '';
        if (state.engine === 'ai') {
            result = await translateWithAI(text, from, to);
        } else {
            result = await translateFree(text, from, to);
        }
        
        els.targetText.innerHTML = result;
        els.statusBar.textContent = 'تمت الترجمة بنجاح';
        els.statusBar.className = 'status-bar success';
        
    } catch (error) {
        els.statusBar.textContent = error.message;
        els.statusBar.className = 'status-bar error';
        els.targetText.innerHTML = '<span class="result-placeholder" style="color:var(--danger)">حدث خطأ أثناء الترجمة.</span>';
    } finally {
        state.isTranslating = false;
        els.btnTranslate.disabled = false;
        els.btnTranslate.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 8l6 6m-6 0l6-6m-6 0h12M5 14h12"/></svg> ترجم الآن';
    }
}

async function translateFree(text, from, to) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.responseData && data.responseData.translatedText) {
        return data.responseData.translatedText;
    }
    throw new Error('فشل الاتصال بخدمة الترجمة المجانية');
}

async function translateWithAI(text, from, to) {
    if (!state.apiKey || !state.endpoint) throw new Error('يرجى إعداد الاتصال بالذكاء الاصطناعي أولاً');
    if (!state.selectedModel) throw new Error('يرجى اختيار نموذج من زر "النموذج"');

    const ep = state.endpoint.replace(/\/$/, '');
    const typePrompt = TRANSLATION_TYPES[state.translationType]?.prompt || 'Translate naturally.';

    const res = await fetch(`${ep}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.apiKey}`
        },
        body: JSON.stringify({
            model: state.selectedModel,
            messages: [
                { role: "system", content: `You are a professional translator. ${typePrompt} Translate the following text from ${from} to ${to}. Return ONLY the translated text, nothing else.` },
                { role: "user", content: text }
            ],
            temperature: 0.3
        })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'فشل الاتصال بالذكاء الاصطناعي');
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
        return data.choices[0].message.content;
    }
    throw new Error('تنسيق رد غير متوقع');
}

// ==================== 10. أدوات مساعدة ====================
function copyResult() {
    const text = els.targetText.innerText;
    if (!text || text === 'ستظهر الترجمة هنا...') return;
    navigator.clipboard.writeText(text).then(() => showToast('تم النسخ!', 'success'));
}

function showToast(msg, type = 'info') {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    els.toastContainer.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
}

// ==================== التشغيل ====================
init();
