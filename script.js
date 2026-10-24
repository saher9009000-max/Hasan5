// 1. قاموس اللغات
const languages = {
    auto: "🔍 اكتشاف تلقائي", ar: "🇸🇦 العربية", en: "🇺🇸 الإنجليزية", fr: "🇫🇷 الفرنسية",
    es: "🇪🇸 الإسبانية", de: "🇩🇪 الألمانية", it: "🇮🇹 الإيطالية", pt: "🇵🇹 البرتغالية",
    ru: "🇷🇺 الروسية", zh: "🇨🇳 الصينية", ja: "🇯🇵 اليابانية", ko: "🇰🇷 الكورية",
    tr: "🇹🇷 التركية", hi: "🇮🇳 الهندية", ur: "🇵🇰 الأردية", fa: "🇮🇷 الفارسية",
    nl: "🇳🇱 الهولندية", pl: "🇵🇱 البولندية", sv: "🇸🇪 السويدية", el: "🇬🇷 اليونانية",
    he: "🇮🇱 العبرية", th: "🇹🇭 التايلاندية", vi: "🇻🇳 الفيتنامية", id: "🇮🇩 الإندونيسية"
};

// 2. عناصر DOM
const sourceLang = document.getElementById('sourceLang');
const targetLang = document.getElementById('targetLang');
const sourceText = document.getElementById('sourceText');
const targetText = document.getElementById('targetText');
const translateBtn = document.getElementById('translateBtn');
const swapBtn = document.getElementById('swapBtn');
const clearBtn = document.getElementById('clearBtn');
const copyBtn = document.getElementById('copyBtn');
const voiceBtn = document.getElementById('voiceBtn');
const speakSource = document.getElementById('speakSource');
const speakTarget = document.getElementById('speakTarget');
const fileInput = document.getElementById('fileInput');
const charCount = document.getElementById('charCount');
const statusEl = document.getElementById('status');
const themeToggle = document.getElementById('themeToggle');
const toast = document.getElementById('toast');
const aiToggle = document.getElementById('aiToggle');

// السجل والإعدادات
const historyBtn = document.getElementById('historyBtn');
const historyModal = document.getElementById('historyModal');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const uxModeToggle = document.getElementById('uxModeToggle');
const closeBtns = document.querySelectorAll('.close-btn');

// 3. تعبئة اللغات
function populateLanguages() {
    for (const [code, name] of Object.entries(languages)) {
        if (code !== 'auto') {
            sourceLang.add(new Option(name, code));
            targetLang.add(new Option(name, code));
        }
    }
    sourceLang.value = 'ar';
    targetLang.value = 'en';
}
populateLanguages();

// 4. نظام الثيمات (الألوان والوضع الليلي)
// الوضع الليلي
themeToggle.addEventListener('click', () => {
    const isDark = document.body.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.body.removeAttribute('data-theme');
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        localStorage.setItem('theme', 'light');
    } else {
        document.body.setAttribute('data-theme', 'dark');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        localStorage.setItem('theme', 'dark');
    }
});
if (localStorage.getItem('theme') === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// تغيير الألوان
document.querySelectorAll('.color-circle').forEach(circle => {
    circle.addEventListener('click', () => {
        const color = circle.getAttribute('data-color');
        if (color === 'purple') {
            document.body.removeAttribute('data-color');
        } else {
            document.body.setAttribute('data-color', color);
        }
        localStorage.setItem('themeColor', color);
    });
});
const savedColor = localStorage.getItem('themeColor');
if (savedColor && savedColor !== 'purple') {
    document.body.setAttribute('data-color', savedColor);
}

// 5. تبديل اللغات
swapBtn.addEventListener('click', () => {
    const temp = sourceLang.value;
    sourceLang.value = targetLang.value;
    targetLang.value = temp === 'auto' ? 'en' : temp;
});

// 6. أدوات النص
sourceText.addEventListener('input', () => {
    charCount.textContent = sourceText.value.length;
});

clearBtn.addEventListener('click', () => {
    sourceText.value = '';
    targetText.value = '';
    charCount.textContent = '0';
    statusEl.textContent = '';
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        sourceText.value = event.target.result;
        charCount.textContent = sourceText.value.length;
        showToast('تم استيراد الملف');
    };
    reader.readAsText(file);
});

copyBtn.addEventListener('click', () => {
    if (!targetText.value) return;
    navigator.clipboard.writeText(targetText.value);
    showToast('تم النسخ!');
});

// 7. الترجمة الصوتية (الميكروفون)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    voiceBtn.addEventListener('click', () => {
        if (voiceBtn.classList.contains('recording')) {
            recognition.stop();
            return;
        }
        recognition.lang = sourceLang.value === 'auto' ? 'ar-SA' : sourceLang.value;
        recognition.start();
        voiceBtn.classList.add('recording');
        voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
        statusEl.textContent = 'جاري الاستماع...';
    });
    recognition.onresult = (event) => {
        sourceText.value += event.results[0][0].transcript + ' ';
        charCount.textContent = sourceText.value.length;
    };
    recognition.onend = () => {
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        statusEl.textContent = '';
    };
} else {
    voiceBtn.style.display = 'none';
}

// 8. الاستماع (Text to Speech)
function speak(text, lang) {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    window.speechSynthesis.speak(utterance);
}
speakSource.addEventListener('click', () => speak(sourceText.value, sourceLang.value === 'auto' ? 'ar' : sourceLang.value));
speakTarget.addEventListener('click', () => speak(targetText.value, targetLang.value));

// 9. دالة الترجمة (تدعم الذكاء الاصطناعي)
async function doTranslate() {
    const text = sourceText.value.trim();
    if (!text) { showToast('اكتب نصاً أولاً'); return; }

    let from = sourceLang.value;
    const to = targetLang.value;
    if (from === to) { showToast('اللغتان متطابقتان'); return; }
    if (from === 'auto') from = 'ar';

    statusEl.textContent = 'جاري الترجمة...';
    statusEl.className = 'status';
    translateBtn.disabled = true;
    
    const isAI = aiToggle.checked;
    translateBtn.innerHTML = isAI ? '<i class="fas fa-brain fa-spin"></i> جاري التفكير...' : '<i class="fas fa-spinner fa-spin"></i> جاري الترجمة...';

    try {
        let translatedText = "";
        
        // محاكاة الذكاء الاصطناعي (تأخير بسيط + تحسين النص)
        if (isAI) {
            await new Promise(r => setTimeout(r, 1500)); // محاكاة وقت التفكير
        }

        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.responseData && data.responseData.translatedText) {
            translatedText = data.responseData.translatedText;
            
            // إذا كان الذكاء الاصطناعي مفعل، نقوم بتحسين بسيط للنص (محاكاة)
            if (isAI) {
                translatedText = translatedText.trim();
                if (!translatedText.endsWith('.') && !translatedText.endsWith('؟') && !translatedText.endsWith('!')) {
                    translatedText += '.';
                }
            }
            
            targetText.value = translatedText;
            statusEl.textContent = isAI ? 'تمت الترجمة الذكية' : 'تمت الترجمة';
            statusEl.classList.add('success');
            saveToHistory(text, translatedText, from, to);
        } else {
            throw new Error('فشل');
        }
    } catch (error) {
        statusEl.textContent = 'حدث خطأ';
        statusEl.classList.add('error');
    } finally {
        translateBtn.disabled = false;
        translateBtn.innerHTML = '<i class="fas fa-language"></i> ترجم الآن';
    }
}
translateBtn.addEventListener('click', doTranslate);

// 10. سجل الترجمات
function saveToHistory(src, tgt, from, to) {
    let history = JSON.parse(localStorage.getItem('translationHistory')) || [];
    history.unshift({ src, tgt, from, to, date: new Date().toLocaleString('ar-EG') });
    if (history.length > 20) history.pop(); // نحتفظ بآخر 20 ترجمة فقط
    localStorage.setItem('translationHistory', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const history = JSON.parse(localStorage.getItem('translationHistory')) || [];
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-msg">لا توجد ترجمات سابقة.</p>';
        return;
    }
    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item" onclick="loadHistoryItem(${index})">
            <div class="h-langs">${languages[item.from] || item.from} ➔ ${languages[item.to] || item.to}</div>
            <div class="h-source">${item.src}</div>
            <div class="h-target">${item.tgt}</div>
        </div>
    `).join('');
}

function loadHistoryItem(index) {
    const history = JSON.parse(localStorage.getItem('translationHistory')) || [];
    const item = history[index];
    if (item) {
        sourceText.value = item.src;
        targetText.value = item.tgt;
        charCount.textContent = item.src.length;
        historyModal.classList.remove('show');
        showToast('تم استرجاع الترجمة');
    }
}

// مسح السجل
clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem('translationHistory');
    renderHistory();
    showToast('تم مسح السجل');
});

// فتح وإغلاق النوافذ
historyBtn.addEventListener('click', () => { renderHistory(); historyModal.classList.add('show'); });
settingsBtn.addEventListener('click', () => settingsModal.classList.add('show'));
closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        historyModal.classList.remove('show');
        settingsModal.classList.remove('show');
    });
});
// إغلاق عند النقر خارج النافذة
window.addEventListener('click', (e) => {
    if (e.target === historyModal) historyModal.classList.remove('show');
    if (e.target === settingsModal) settingsModal.classList.remove('show');
});

// 11. وضع تجربة المستخدم (UX Mode)
const uxMode = localStorage.getItem('uxMode') === 'true';
uxModeToggle.checked = uxMode;

uxModeToggle.addEventListener('change', () => {
    localStorage.setItem('uxMode', uxModeToggle.checked);
    if (uxModeToggle.checked) {
        showToast('تم تفعيل وضع تجربة المستخدم: مرحباً بك! جرب الترجمة الصوتية أو الذكاء الاصطناعي.');
    } else {
        showToast('تم إيقاف وضع تجربة المستخدم.');
    }
});

// إظهار رسالة ترحيبية إذا كان الوضع مفعل
if (uxMode) {
    setTimeout(() => {
        showToast('👋 مرحباً بك في LinguaAI! جرب تفعيل "الترجمة الذكية" للحصول على نتائج أفضل.');
    }, 1500);
}

// 12. الإشعارات
let toastTimer;
function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
}
