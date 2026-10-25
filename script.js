// ==========================================
// 1. البيانات والحالة (State)
// ==========================================
const state = {
    engine: 'normal', // 'normal' | 'ai'
    aiModel: '',
    aiModelFullName: '',
    aiType: 'natural',
    apiKey: localStorage.getItem('pt_apiKey') || '',
    endpoint: localStorage.getItem('pt_endpoint') || 'https://api.openai.com/v1',
    history: JSON.parse(localStorage.getItem('pt_history') || '[]'),
    favorites: JSON.parse(localStorage.getItem('pt_favorites') || '[]'),
    tempModels: [],
    selectedModelTemp: '',
    selectedTypeTemp: 'natural',
    currentTranslation: ''
};

// خريطة أنواع الترجمة
const translationTypes = {
    natural: { title: 'ترجمة طبيعية', desc: 'ترجمة سلسة وطبيعية تناسب الاستخدام اليومي.', prompt: 'Translate the following text naturally and idiomatically.' },
    literal: { title: 'ترجمة حرفية', desc: 'ترجمة مباشرة كلمة بكلمة مع الحفاظ على البنية.', prompt: 'Translate the following text literally, keeping the sentence structure as close to the original as possible.' },
    formal: { title: 'ترجمة رسمية', desc: 'مناسبة للخطابات والمراسلات الرسمية.', prompt: 'Translate the following text in a formal, professional, and polite tone.' },
    informal: { title: 'ترجمة غير رسمية', desc: 'لغة عامية وقريبة من الحديث اليومي.', prompt: 'Translate the following text in an informal, casual, and conversational tone.' },
    academic: { title: 'ترجمة أكاديمية', desc: 'دقيقة ومناسبة للأبحاث والمقالات العلمية.', prompt: 'Translate the following text in a precise, academic tone suitable for scholarly articles.' },
    professional: { title: 'ترجمة احترافية', desc: 'مصطلحات دقيقة تناسب مجال الأعمال والتقنية.', prompt: 'Translate the following text professionally, using accurate industry-specific terminology.' },
    explain: { title: 'شرح معنى النص', desc: 'لا تترجم فقط، بل اشرح المعنى والسياق.', prompt: 'Do not just translate. Explain the meaning and context of the following text in the target language clearly.' }
};

// اللغات
const languages = [
    { code: 'auto', name: 'اكتشاف تلقائي' },
    { code: 'ar', name: 'العربية' },
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'ru', name: 'Русский' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ko', name: '한국어' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'ur', name: 'اردو' },
    { code: 'fa', name: 'فارسی' },
    { code: 'it', name: 'Italiano' },
    { code: 'pt', name: 'Português' },
    { code: 'nl', name: 'Nederlands' },
    { code: 'pl', name: 'Polski' },
    { code: 'sv', name: 'Svenska' },
    { code: 'he', name: 'עברית' }
];

// ==========================================
// 2. العناصر (DOM Elements)
// ==========================================
const $ = id => document.getElementById(id);

// Theme & Nav
const html = document.documentElement;
const themeToggle = $('themeToggle');
const themeIcon = $('themeIcon');
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view-section');

// Controls
const engineBtns = document.querySelectorAll('.engine-btn');
const aiOptions = $('aiOptions');
const modelSelectBtn = $('modelSelectBtn');
const currentModelName = $('currentModelName');
const typeSelectBtn = $('typeSelectBtn');
const currentTypeName = $('currentTypeName');

// Translation Area
const sourceLang = $('sourceLang');
const targetLang = $('targetLang');
const swapBtn = $('swapBtn');
const sourceText = $('sourceText');
const charCount = $('charCount');
const pasteBtn = $('pasteBtn');
const clearBtn = $('clearBtn');
const resultText = $('resultText');
const translateBtn = $('translateBtn');

// Result Tools
const ttsBtn = $('ttsBtn');
const copyBtn = $('copyBtn');
const favBtn = $('favBtn');
const shareBtn = $('shareBtn');

// Modals
const modals = document.querySelectorAll('.modal-overlay');
const closeBtns = document.querySelectorAll('.close-btn, [data-close]');
const settingsBtn = $('settingsBtn');
const apiKeyInput = $('apiKeyInput');
const endpointInput = $('endpointInput');
const toggleKeyBtn = $('toggleKeyBtn');
const saveSettingsBtn = $('saveSettingsBtn');
const testConnBtn = $('testConnBtn');
const clearKeyBtn = $('clearKeyBtn');

const modelSearch = $('modelSearch');
const refreshModelsBtn = $('refreshModelsBtn');
const modelList = $('modelList');
const confirmModelBtn = $('confirmModelBtn');

const typeGrid = $('typeGrid');
const confirmTypeBtn = $('confirmTypeBtn');

// Toast
const toastContainer = $('toastContainer');

// ==========================================
// 3. وظائف مساعدة (Helpers)
// ==========================================

// إظهار إشعار
function showToast(msg, type = '') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = msg;
    toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// فتح/إغلاق النوافذ
function openModal(id) {
    $(id).classList.add('active');
}
function closeModal(id) {
    $(id).classList.remove('active');
}
closeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modalId = btn.getAttribute('data-close') || btn.closest('.modal-overlay').id;
        closeModal(modalId);
    });
});
modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal(modal.id);
    });
});

// ==========================================
// 4. التهيئة (Initialization)
// ==========================================
function init() {
    // الوضع الداكن
    const savedTheme = localStorage.getItem('pt_theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // تعبئة اللغات
    languages.forEach(lang => {
        const opt1 = new Option(lang.name, lang.code);
        const opt2 = new Option(lang.name, lang.code);
        sourceLang.add(opt1);
        targetLang.add(opt2);
    });
    sourceLang.value = 'auto';
    targetLang.value = 'ar';

    // تعبئة حقول الإعدادات
    apiKeyInput.value = state.apiKey;
    endpointInput.value = state.endpoint;

    // تعبئة أنواع الترجمة
    renderTypeCards();
    
    // تعبئة السجل والمفضلة
    renderHistory();
    renderFavorites();

    // تحديث اسم النموذج الافتراضي
    if(state.aiModel) {
        currentModelName.textContent = state.aiModel;
    }
}

// ==========================================
// 5. منطق الواجهة (UI Logic)
// ==========================================

// الوضع الداكن
function updateThemeIcon(theme) {
    themeIcon.innerHTML = theme === 'dark' 
        ? '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor"/>' 
        : '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
}
themeToggle.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    html.setAttribute('data-theme', next);
    localStorage.setItem('pt_theme', next);
    updateThemeIcon(next);
});

// التنقل بين الصفحات
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        const targetView = item.getAttribute('data-view');
        views.forEach(v => v.classList.remove('active'));
        $(`view-${targetView}`).classList.add('active');
    });
});

// اختيار المحرك
engineBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        engineBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.engine = btn.getAttribute('data-engine');
        
        if (state.engine === 'ai') {
            aiOptions.classList.remove('hidden');
        } else {
            aiOptions.classList.add('hidden');
        }
    });
});

// عدّاد الأحرف
sourceText.addEventListener('input', () => {
    charCount.textContent = sourceText.value.length;
});

// لصق ومسح
pasteBtn.addEventListener('click', async () => {
    try {
        const text = await navigator.clipboard.readText();
        sourceText.value = text;
        charCount.textContent = text.length;
    } catch (e) {
        showToast('تعذر الوصول إلى الحافظة', 'error');
    }
});
clearBtn.addEventListener('click', () => {
    sourceText.value = '';
    charCount.textContent = '0';
    resultText.textContent = 'الترجمة ستظهر هنا...';
    state.currentTranslation = '';
});

// تبديل اللغات
swapBtn.addEventListener('click', () => {
    if (sourceLang.value === 'auto') {
        showToast('لا يمكن تبديل الاكتشاف التلقائي', 'error');
        return;
    }
    const temp = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = temp;
    
    // تبديل النصوص إن وجدت
    if (resultText.textContent !== 'الترجمة ستظهر هنا...') {
        const tempText = sourceText.value;
        sourceText.value = resultText.textContent;
        resultText.textContent = tempText;
        charCount.textContent = sourceText.value.length;
    }
});

// نافذة الإعدادات
settingsBtn.addEventListener('click', () => openModal('settingsModal'));
toggleKeyBtn.addEventListener('click', () => {
    apiKeyInput.type = apiKeyInput.type === 'password' ? 'text' : 'password';
});
saveSettingsBtn.addEventListener('click', () => {
    state.apiKey = apiKeyInput.value.trim();
    state.endpoint = endpointInput.value.trim() || 'https://api.openai.com/v1';
    localStorage.setItem('pt_apiKey', state.apiKey);
    localStorage.setItem('pt_endpoint', state.endpoint);
    showToast('تم حفظ الإعدادات بنجاح', 'success');
    closeModal('settingsModal');
});
clearKeyBtn.addEventListener('click', () => {
    if(confirm('هل أنت متأكد من حذف المفتاح؟')) {
        state.apiKey = '';
        apiKeyInput.value = '';
        localStorage.removeItem('pt_apiKey');
        showToast('تم حذف المفتاح');
    }
});
testConnBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    const ep = endpointInput.value.trim() || 'https://api.openai.com/v1';
    if(!key) return showToast('أدخل مفتاح API أولاً', 'error');
    
    testConnBtn.textContent = 'جاري...';
    try {
        const res = await fetch(`${ep}/models`, {
            headers: { 'Authorization': `Bearer ${key}` }
        });
        if(res.ok) showToast('الاتصال ناجح!', 'success');
        else showToast('فشل الاتصال، تحقق من المفتاح', 'error');
    } catch(e) {
        showToast('خطأ في الشبكة أو CORS', 'error');
    } finally {
        testConnBtn.textContent = 'اختبار';
    }
});

// نافذة اختيار النموذج
modelSelectBtn.addEventListener('click', async () => {
    if(!state.apiKey) {
        showToast('يرجى إدخال مفتاح API في الإعدادات أولاً', 'error');
        openModal('settingsModal');
        return;
    }
    openModal('modelModal');
    await fetchModels();
});
refreshModelsBtn.addEventListener('click', fetchModels);
modelSearch.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = state.tempModels.filter(m => m.id.toLowerCase().includes(term));
    renderModelList(filtered);
});
confirmModelBtn.addEventListener('click', () => {
    if(state.selectedModelTemp) {
        state.aiModel = state.selectedModelTemp;
        currentModelName.textContent = state.aiModel;
        currentModelName.title = state.aiModel;
        closeModal('modelModal');
        showToast('تم اختيار النموذج');
    }
});

async function fetchModels() {
    modelList.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">جاري التحميل...</div>';
    try {
        const res = await fetch(`${state.endpoint}/models`, {
            headers: { 'Authorization': `Bearer ${state.apiKey}` }
        });
        if(!res.ok) throw new Error('فشل الجلب');
        const data = await res.json();
        state.tempModels = data.data || [];
        if(state.tempModels.length === 0) throw new Error('لا توجد نماذج');
        renderModelList(state.tempModels);
    } catch(e) {
        modelList.innerHTML = '<div style="text-align:center; padding:20px; color:var(--danger);">تعذر جلب النماذج. تحقق من الإعدادات.</div>';
    }
}
function renderModelList(models) {
    modelList.innerHTML = '';
    models.forEach(m => {
        const div = document.createElement('div');
        div.className = `model-item ${m.id === state.selectedModelTemp ? 'selected' : ''}`;
        div.innerHTML = `<span style="font-size:0.85rem; word-break:break-all;">${m.id}</span>`;
        div.onclick = () => {
            state.selectedModelTemp = m.id;
            renderModelList(models);
        };
        modelList.appendChild(div);
    });
}

// نافذة نوع الترجمة
typeSelectBtn.addEventListener('click', () => {
    if(state.engine === 'normal') {
        showToast('نوع الترجمة متاح فقط في وضع الذكاء الاصطناعي', 'error');
        return;
    }
    openModal('typeModal');
    state.selectedTypeTemp = state.aiType;
    renderTypeCards();
});
function renderTypeCards() {
    typeGrid.innerHTML = '';
    Object.keys(translationTypes).forEach(key => {
        const type = translationTypes[key];
        const div = document.createElement('div');
        div.className = `type-card ${key === state.selectedTypeTemp ? 'selected' : ''}`;
        div.innerHTML = `
            <svg viewBox="0 0 24 24"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
            <div class="type-card-title">${type.title}</div>
            <div class="type-card-desc">${type.desc}</div>
        `;
        div.onclick = () => {
            state.selectedTypeTemp = key;
            renderTypeCards();
        };
        typeGrid.appendChild(div);
    });
}
confirmTypeBtn.addEventListener('click', () => {
    state.aiType = state.selectedTypeTemp;
    currentTypeName.textContent = translationTypes[state.aiType].title;
    closeModal('typeModal');
});

// ==========================================
// 6. منطق الترجمة (Translation Logic)
// ==========================================

translateBtn.addEventListener('click', async () => {
    const text = sourceText.value.trim();
    if (!text) return showToast('يرجى إدخال نص للترجمة', 'error');

    if (state.engine === 'ai' && !state.apiKey) {
        showToast('يرجى إدخال مفتاح API أولاً', 'error');
        openModal('settingsModal');
        return;
    }
    if (state.engine === 'ai' && !state.aiModel) {
        showToast('يرجى اختيار نموذج الذكاء الاصطناعي أولاً', 'error');
        openModal('modelModal');
        return;
    }

    // حالة التحميل
    translateBtn.classList.add('loading');
    const originalBtnHtml = translateBtn.innerHTML;
    translateBtn.innerHTML = '<div class="spinner"></div> جاري الترجمة...';
    resultText.textContent = '...';

    try {
        let translated = '';
        if (state.engine === 'normal') {
            translated = await translateNormal(text, sourceLang.value, targetLang.value);
        } else {
            translated = await translateAI(text, sourceLang.value, targetLang.value);
        }

        resultText.textContent = translated;
        state.currentTranslation = translated;
        
        // حفظ في السجل
        saveToHistory(text, translated);

    } catch (error) {
        console.error(error);
        resultText.textContent = 'عذراً، حدث خطأ أثناء الترجمة.';
        showToast(error.message || 'فشلت الترجمة', 'error');
    } finally {
        translateBtn.classList.remove('loading');
        translateBtn.innerHTML = originalBtnHtml;
    }
});

// الترجمة العادية (MyMemory API)
async function translateNormal(text, from, to) {
    const src = from === 'auto' ? 'en' : from; // MyMemory يتطلب لغة مصدر
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${src}|${to}`;
    
    const res = await fetch(url);
    if (!res.ok) throw new Error('فشل الاتصال بخادم الترجمة');
    const data = await res.json();
    
    if (data.responseData && data.responseData.translatedText) {
        // فك ترميز HTML
        const txt = document.createElement('textarea');
        txt.innerHTML = data.responseData.translatedText;
        return txt.value;
    }
    throw new Error('تعذر الحصول على ترجمة');
}

// الترجمة بالذكاء الاصطناعي (OpenAI Compatible)
async function translateAI(text, from, to) {
    const langName = (code) => (languages.find(l => l.code === code) || {}).name || code;
    const prompt = translationTypes[state.aiType].prompt;
    
    const systemMsg = `You are a professional translator. ${prompt} Translate from ${from === 'auto' ? 'detected language' : langName(from)} to ${langName(to)}. Return ONLY the translated text without any explanations, quotes, or extra text.`;

    const res = await fetch(`${state.endpoint}/chat/completions`, {
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
        throw new Error(errData.error?.message || 'خطأ في الاتصال بمزود الذكاء الاصطناعي');
    }

    const data = await res.json();
    return data.choices[0].message.content.trim();
}

// ==========================================
// 7. أدوات النتيجة (Result Tools)
// ==========================================

// السماع (TTS)
ttsBtn.addEventListener('click', () => {
    const text = state.currentTranslation || resultText.textContent;
    if (!text || text === 'الترجمة ستظهر هنا...') return showToast('لا يوجد نص لسماعه', 'error');

    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    const targetCode = targetLang.value;
    utterance.lang = targetCode === 'ar' ? 'ar-SA' : targetCode;
    utterance.rate = 1.1; // سرعة واضحة
    utterance.pitch = 1;
    
    window.speechSynthesis.speak(utterance);
    showToast('جاري النطق...', 'success');
});

// النسخ
copyBtn.addEventListener('click', async () => {
    if (!state.currentTranslation) return showToast('لا يوجد نص لنسخه', 'error');
    try {
        await navigator.clipboard.writeText(state.currentTranslation);
        showToast('تم النسخ بنجاح', 'success');
    } catch (e) {
        showToast('فشل النسخ', 'error');
    }
});

// المفضلة
favBtn.addEventListener('click', () => {
    if (!state.currentTranslation) return showToast('لا يوجد نص للحفظ', 'error');
    
    const isFav = state.favorites.some(f => f.text === state.currentTranslation);
    if (isFav) {
        showToast('موجود بالفعل في المفضلة');
        return;
    }

    state.favorites.unshift({
        id: Date.now(),
        original: sourceText.value,
        text: state.currentTranslation,
        from: sourceLang.value,
        to: targetLang.value
    });
    localStorage.setItem('pt_favorites', JSON.stringify(state.favorites));
    favBtn.classList.add('fav-active');
    showToast('تمت الإضافة للمفضلة', 'success');
    renderFavorites();
    setTimeout(() => favBtn.classList.remove('fav-active'), 1000);
});

// المشاركة
shareBtn.addEventListener('click', async () => {
    if (!state.currentTranslation) return showToast('لا يوجد نص لمشاركته', 'error');
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'ترجمة',
                text: `${sourceText.value}\n\n➡️\n\n${state.currentTranslation}`
            });
        } catch (e) {
            console.log('فشلت المشاركة');
        }
    } else {
        showToast('متصفحك لا يدعم المشاركة المباشرة', 'error');
    }
});

// ==========================================
// 8. السجل والمفضلة (History & Favorites)
// ==========================================

function saveToHistory(original, translated) {
    state.history.unshift({
        id: Date.now(),
        original,
        translated,
        from: sourceLang.value,
        to: targetLang.value,
        date: new Date().toLocaleString('ar-EG')
    });
    if (state.history.length > 50) state.history.pop(); // حد أقصى 50
    localStorage.setItem('pt_history', JSON.stringify(state.history));
    renderHistory();
}

function renderHistory() {
    const list = $('historyList');
    if (state.history.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">السجل فارغ</div>';
        return;
    }
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
    if (state.favorites.length === 0) {
        list.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-muted);">المفضلة فارغة</div>';
        return;
    }
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

// دوال مساعدة تُستدعى من HTML
window.copyText = (text) => {
    navigator.clipboard.writeText(text);
    showToast('تم النسخ', 'success');
};
window.deleteHistory = (id) => {
    state.history = state.history.filter(i => i.id !== id);
    localStorage.setItem('pt_history', JSON.stringify(state.history));
    renderHistory();
};
window.deleteFav = (id) => {
    state.favorites = state.favorites.filter(i => i.id !== id);
    localStorage.setItem('pt_favorites', JSON.stringify(state.favorites));
    renderFavorites();
};

// تشغيل التهيئة
init();