const state = {
    engine: 'normal',
    aiModel: '',
    aiType: 'natural',
    apiKey: localStorage.getItem('pt_apiKey') || '',
    endpoint: localStorage.getItem('pt_endpoint') || 'https://api.groq.com/openai/v1',
    history: JSON.parse(localStorage.getItem('pt_history') || '[]'),
    favorites: JSON.parse(localStorage.getItem('pt_favorites') || '[]'),
    tempModels: [],
    selectedModelTemp: '',
    selectedTypeTemp: 'natural',
    currentTranslation: ''
};

const translationTypes = {
    natural: { title: 'ترجمة طبيعية', desc: 'سلسة وطبيعية تناسب الاستخدام اليومي.', prompt: 'Translate the following text naturally and idiomatically.' },
    literal: { title: 'ترجمة حرفية', desc: 'مباشرة كلمة بكلمة.', prompt: 'Translate the following text literally.' },
    formal: { title: 'ترجمة رسمية', desc: 'للخطابات والمراسلات الرسمية.', prompt: 'Translate the following text in a formal tone.' },
    informal: { title: 'ترجمة غير رسمية', desc: 'لغة عامية.', prompt: 'Translate the following text in an informal tone.' },
    academic: { title: 'ترجمة أكاديمية', desc: 'دقيقة للأبحاث العلمية.', prompt: 'Translate in an academic tone suitable for scholarly articles.' },
    professional: { title: 'ترجمة احترافية', desc: 'لمجال الأعمال والتقنية.', prompt: 'Translate professionally, using accurate industry terminology.' },
    explain: { title: 'شرح معنى النص', desc: 'شرح السياق بدلاً من الترجمة الحرفية.', prompt: 'Explain the meaning and context of the following text in the target language clearly.' }
};

const languages = [
    { code: 'auto', name: 'اكتشاف تلقائي' }, { code: 'ar', name: 'العربية' },
    { code: 'en', name: 'English' }, { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' }, { code: 'de', name: 'Deutsch' },
    { code: 'tr', name: 'Türkçe' }, { code: 'ru', name: 'Русский' },
    { code: 'zh', name: '中文' }, { code: 'ja', name: '日本語' }
];

const $ = id => document.getElementById(id);
const html = document.documentElement;
const themeToggle = $('themeToggle'), themeIcon = $('themeIcon');
const navItems = document.querySelectorAll('.nav-item'), views = document.querySelectorAll('.view-section');
const engineBtns = document.querySelectorAll('.engine-btn'), aiOptions = $('aiOptions');
const modelSelectBtn = $('modelSelectBtn'), currentModelName = $('currentModelName');
const typeSelectBtn = $('typeSelectBtn'), currentTypeName = $('currentTypeName');
const sourceLang = $('sourceLang'), targetLang = $('targetLang'), swapBtn = $('swapBtn');
const sourceText = $('sourceText'), charCount = $('charCount'), pasteBtn = $('pasteBtn'), clearBtn = $('clearBtn');
const resultText = $('resultText'), translateBtn = $('translateBtn');
const ttsBtn = $('ttsBtn'), copyBtn = $('copyBtn'), favBtn = $('favBtn');
const modals = document.querySelectorAll('.modal-overlay'), closeBtns = document.querySelectorAll('.close-btn, [data-close]');
const settingsBtn = $('settingsBtn'), apiKeyInput = $('apiKeyInput'), endpointInput = $('endpointInput');
const toggleKeyBtn = $('toggleKeyBtn'), saveSettingsBtn = $('saveSettingsBtn'), testConnBtn = $('testConnBtn');
const modelSearch = $('modelSearch'), refreshModelsBtn = $('refreshModelsBtn'), modelList = $('modelList'), confirmModelBtn = $('confirmModelBtn');
const typeGrid = $('typeGrid'), confirmTypeBtn = $('confirmTypeBtn'), toastContainer = $('toastContainer');

function showToast(msg, type = '') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

function openModal(id) { $(id).classList.add('active'); }
function closeModal(id) { $(id).classList.remove('active'); }
closeBtns.forEach(btn => btn.addEventListener('click', () => closeModal(btn.getAttribute('data-close') || btn.closest('.modal-overlay').id)));
modals.forEach(modal => modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal.id); }));

function init() {
    const savedTheme = localStorage.getItem('pt_theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    languages.forEach(lang => {
        sourceLang.add(new Option(lang.name, lang.code));
        targetLang.add(new Option(lang.name, lang.code));
    });
    sourceLang.value = 'auto'; targetLang.value = 'ar';

    apiKeyInput.value = state.apiKey; endpointInput.value = state.endpoint;
    renderTypeCards(); renderHistory(); renderFavorites();
    if(state.aiModel) currentModelName.textContent = state.aiModel;
}

function updateThemeIcon(theme) {
    themeIcon.innerHTML = theme === 'dark' ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/>' : '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
}
themeToggle.addEventListener('click', () => {
    const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next); localStorage.setItem('pt_theme', next); updateThemeIcon(next);
});

navItems.forEach(item => item.addEventListener('click', () => {
    navItems.forEach(i => i.classList.remove('active')); item.classList.add('active');
    views.forEach(v => v.classList.remove('active')); $(`view-${item.getAttribute('data-view')}`).classList.add('active');
}));

engineBtns.forEach(btn => btn.addEventListener('click', () => {
    engineBtns.forEach(b => b.classList.remove('active')); btn.classList.add('active');
    state.engine = btn.getAttribute('data-engine');
    aiOptions.classList.toggle('hidden', state.engine !== 'ai');
}));

sourceText.addEventListener('input', () => charCount.textContent = sourceText.value.length);
pasteBtn.addEventListener('click', async () => {
    try { const text = await navigator.clipboard.readText(); sourceText.value = text; charCount.textContent = text.length; } catch (e) { showToast('تعذر اللصق', 'error'); }
});
clearBtn.addEventListener('click', () => { sourceText.value = ''; charCount.textContent = '0'; resultText.textContent = 'الترجمة ستظهر هنا...'; state.currentTranslation = ''; });

swapBtn.addEventListener('click', () => {
    if (sourceLang.value === 'auto') return showToast('لا يمكن تبديل الاكتشاف التلقائي', 'error');
    const temp = sourceLang.value; sourceLang.value = targetLang.value; targetLang.value = temp;
    if (resultText.textContent !== 'الترجمة ستظهر هنا...') {
        const tempText = sourceText.value; sourceText.value = resultText.textContent; resultText.textContent = tempText; charCount.textContent = sourceText.value.length;
    }
});

settingsBtn.addEventListener('click', () => openModal('settingsModal'));
toggleKeyBtn.addEventListener('click', () => apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password');
saveSettingsBtn.addEventListener('click', () => {
    state.apiKey = apiKeyInput.value.trim();
    state.endpoint = endpointInput.value.trim() || 'https://api.groq.com/openai/v1';
    localStorage.setItem('pt_apiKey', state.apiKey); localStorage.setItem('pt_endpoint', state.endpoint);
    showToast('تم حفظ الإعدادات بنجاح', 'success'); closeModal('settingsModal');
});

// اختبار الاتصال
testConnBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    const ep = (endpointInput.value.trim() || 'https://api.groq.com/openai/v1').replace(/\/+$/, '');
    if(!key) return showToast('أدخل مفتاح API أولاً', 'error');
    
    testConnBtn.textContent = 'جاري...';
    try {
        const res = await fetch(`${ep}/models`, { headers: { 'Authorization': `Bearer ${key}` } });
        if(res.ok) showToast('الاتصال ناجح! الرابط والمفتاح صحيحان.', 'success');
        else showToast('فشل الاتصال، تحقق من المفتاح أو الرابط', 'error');
    } catch(e) {
        showToast('خطأ في الشبكة أو CORS', 'error');
    } finally { testConnBtn.textContent = 'اختبار الاتصال'; }
});

// نافذة النماذج
modelSelectBtn.addEventListener('click', async () => {
    if(!state.apiKey) { showToast('يرجى إدخال مفتاح API في الإعدادات أولاً', 'error'); openModal('settingsModal'); return; }
    openModal('modelModal'); await fetchModels();
});
refreshModelsBtn.addEventListener('click', fetchModels);

modelSearch.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    renderModelList(state.tempModels.filter(m => m.id.toLowerCase().includes(term)));
});

confirmModelBtn.addEventListener('click', () => {
    if(state.selectedModelTemp) {
        state.aiModel = state.selectedModelTemp;
        currentModelName.textContent = state.aiModel;
        closeModal('modelModal'); showToast('تم اختيار النموذج');
    }
});

// [إصلاح] الجلب الديناميكي للنماذج من Groq/OpenAI
async function fetchModels() {
    const cleanEndpoint = state.endpoint.replace(/\/+$/, ''); // إزالة / الزائدة إن وجدت
    modelList.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">جاري جلب النماذج...</div>';
    try {
        const res = await fetch(`${cleanEndpoint}/models`, {
            headers: { 'Authorization': `Bearer ${state.apiKey}` }
        });
        if(!res.ok) throw new Error('فشل الجلب، تأكد من صحة الرابط');
        const data = await res.json();
        state.tempModels = data.data || [];
        if(state.tempModels.length === 0) throw new Error('لا توجد نماذج متاحة');
        
        // اختيار أول نموذج تلقائياً إذا لم يكن هناك نموذج محدد
        if (!state.selectedModelTemp) {
            state.selectedModelTemp = state.tempModels[0].id;
        }
        renderModelList(state.tempModels);
    } catch(e) {
        modelList.innerHTML = `<div style="text-align:center; padding:20px; color:var(--danger);">${e.message}</div>`;
    }
}

function renderModelList(models) {
    modelList.innerHTML = '';
    models.forEach(m => {
        const div = document.createElement('div');
        div.className = `model-item ${m.id === state.selectedModelTemp ? 'selected' : ''}`;
        div.innerHTML = `<span style="font-size:0.85rem; word-break:break-all;">${m.id}</span>`;
        div.onclick = () => { state.selectedModelTemp = m.id; renderModelList(models); };
        modelList.appendChild(div);
    });
}

// نافذة النوع
typeSelectBtn.addEventListener('click', () => {
    if(state.engine === 'normal') return showToast('نوع الترجمة متاح فقط في وضع AI', 'error');
    openModal('typeModal'); state.selectedTypeTemp = state.aiType; renderTypeCards();
});
function renderTypeCards() {
    typeGrid.innerHTML = '';
    Object.keys(translationTypes).forEach(key => {
        const type = translationTypes[key];
        const div = document.createElement('div');
        div.className = `type-card ${key === state.selectedTypeTemp ? 'selected' : ''}`;
        div.innerHTML = `<svg viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg><div class="type-card-title">${type.title}</div><div class="type-card-desc">${type.desc}</div>`;
        div.onclick = () => { state.selectedTypeTemp = key; renderTypeCards(); };
        typeGrid.appendChild(div);
    });
}
confirmTypeBtn.addEventListener('click', () => { state.aiType = state.selectedTypeTemp; currentTypeName.textContent = translationTypes[state.aiType].title; closeModal('typeModal'); });

// [إصلاح] طلب الترجمة ليتوافق مع Groq و OpenAI
translateBtn.addEventListener('click', async () => {
    const text = sourceText.value.trim();
    if (!text) return showToast('يرجى إدخال نص للترجمة', 'error');
    if (state.engine === 'ai' && !state.apiKey) { showToast('أدخل مفتاح API أولاً', 'error'); openModal('settingsModal'); return; }
    if (state.engine === 'ai' && !state.aiModel) { showToast('اختر نموذجاً أولاً', 'error'); openModal('modelModal'); return; }

    translateBtn.classList.add('loading');
    const originalBtnHtml = translateBtn.innerHTML;
    translateBtn.innerHTML = '<div class="spinner"></div> جاري الترجمة...';
    resultText.textContent = '...';

    try {
        let translated = (state.engine === 'normal') 
            ? await translateNormal(text, sourceLang.value, targetLang.value)
            : await translateAI(text, sourceLang.value, targetLang.value);

        resultText.textContent = translated;
        state.currentTranslation = translated;
        saveToHistory(text, translated);
    } catch (error) {
        console.error(error);
        resultText.textContent = 'عذراً، حدث خطأ.';
        showToast(error.message || 'فشلت الترجمة', 'error');
    } finally {
        translateBtn.classList.remove('loading');
        translateBtn.innerHTML = originalBtnHtml;
    }
});

async function translateNormal(text, from, to) {
    const src = from === 'auto' ? 'en' : from;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${src}|${to}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('فشل الاتصال بالخدمة العادية');
    const data = await res.json();
    if (data.responseData && data.responseData.translatedText) {
        const txt = document.createElement('textarea'); txt.innerHTML = data.responseData.translatedText; return txt.value;
    }
    throw new Error('تعذر الحصول على ترجمة');
}

// [إصلاح] توافق تام مع Groq Chat Completions
async function translateAI(text, from, to) {
    const cleanEndpoint = state.endpoint.replace(/\/+$/, ''); // إزالة / الزائدة
    const langName = (code) => (languages.find(l => l.code === code) || {}).name || code;
    const prompt = translationTypes[state.aiType].prompt;
    const systemMsg = `You are a professional translator. ${prompt} Translate from ${from === 'auto' ? 'detected language' : langName(from)} to ${langName(to)}. Return ONLY the translated text.`;

    const res = await fetch(`${cleanEndpoint}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.apiKey}`
        },
        body: JSON.stringify({
            model: state.aiModel,
            messages: [
                { role: 'system', content: systemMsg },
                { role: 'user', content: text }
            ],
            temperature: 0.3
        })
    });

    if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || 'فشل الاتصال بمزود AI. تأكد من الرابط والمفتاح.');
    }
    const data = await res.json();
    return data.choices[0].message.content.trim();
}

// [إصلاح] زر السماع السريع
ttsBtn.addEventListener('click', () => {
    const text = state.currentTranslation || resultText.textContent;
    if (!text || text === 'الترجمة ستظهر هنا...') return showToast('لا يوجد نص لسماعه', 'error');

    // إيقاف أي قراءة سابقة فوراً لمنع التداخل
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const targetCode = targetLang.value;
    const langMap = {
        'ar': 'ar-SA', 'en': 'en-US', 'fr': 'fr-FR', 'es': 'es-ES', 'de': 'de-DE',
        'tr': 'tr-TR', 'ru': 'ru-RU', 'zh': 'zh-CN', 'ja': 'ja-JP'
    };
    utterance.lang = langMap[targetCode] || targetCode;
    
    // سرعة فائقة (1.2) لنطق سريع ومفهوم
    utterance.rate = 1.2; 
    utterance.pitch = 1;
    
    window.speechSynthesis.speak(utterance);
    showToast('جاري النطق السريع...', 'success');
});

copyBtn.addEventListener('click', async () => {
    if (!state.currentTranslation) return showToast('لا يوجد نص لنسخه', 'error');
    try { await navigator.clipboard.writeText(state.currentTranslation); showToast('تم النسخ بنجاح', 'success'); } catch (e) { showToast('فشل النسخ', 'error'); }
});

favBtn.addEventListener('click', () => {
    if (!state.currentTranslation) return showToast('لا يوجد نص للحفظ', 'error');
    if (state.favorites.some(f => f.text === state.currentTranslation)) return showToast('موجود بالفعل');
    state.favorites.unshift({ id: Date.now(), original: sourceText.value, text: state.currentTranslation });
    localStorage.setItem('pt_favorites', JSON.stringify(state.favorites));
    favBtn.classList.add('fav-active'); showToast('تمت الإضافة', 'success');
    renderFavorites(); setTimeout(() => favBtn.classList.remove('fav-active'), 1000);
});

function saveToHistory(original, translated) {
    state.history.unshift({ id: Date.now(), original, translated });
    if (state.history.length > 50) state.history.pop();
    localStorage.setItem('pt_history', JSON.stringify(state.history));
    renderHistory();
}
function renderHistory() {
    const list = $('historyList');
    if (state.history.length === 0) return list.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">السجل فارغ</div>';
    list.innerHTML = state.history.map(item => `
        <div class="history-item">
            <div class="history-text">${item.translated}</div>
            <div class="history-sub">${item.original}</div>
            <div class="history-actions">
                <button class="tool-btn" onclick="copyText('${item.translated.replace(/'/g, "\\'")}')">نسخ</button>
                <button class="tool-btn" onclick="deleteHistory(${item.id})" style="color:var(--danger)">حذف</button>
            </div>
        </div>
    `).join('');
}
function renderFavorites() {
    const list = $('favoritesList');
    if (state.favorites.length === 0) return list.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">المفضلة فارغة</div>';
    list.innerHTML = state.favorites.map(item => `
        <div class="history-item">
            <div class="history-text">${item.text}</div>
            <div class="history-sub">${item.original}</div>
            <div class="history-actions">
                <button class="tool-btn" onclick="copyText('${item.text.replace(/'/g, "\\'")}')">نسخ</button>
                <button class="tool-btn" onclick="deleteFav(${item.id})" style="color:var(--danger)">حذف</button>
            </div>
        </div>
    `).join('');
}
window.copyText = (text) => { navigator.clipboard.writeText(text); showToast('تم النسخ', 'success'); };
window.deleteHistory = (id) => { state.history = state.history.filter(i => i.id !== id); localStorage.setItem('pt_history', JSON.stringify(state.history)); renderHistory(); };
window.deleteFav = (id) => { state.favorites = state.favorites.filter(i => i.id !== id); localStorage.setItem('pt_favorites', JSON.stringify(state.favorites)); renderFavorites(); };

init();