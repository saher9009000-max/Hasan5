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
    if (!sourceLang || !targetLang) return;
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
if (themeToggle) {
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
}
if (localStorage.getItem('theme') === 'dark') {
    document.body.setAttribute('data-theme', 'dark');
    if (themeToggle) themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

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
if (swapBtn) {
    swapBtn.addEventListener('click', () => {
        const temp = sourceLang.value;
        sourceLang.value = targetLang.value;
        targetLang.value = temp === 'auto' ? 'en' : temp;
    });
}

// 6. أدوات النص
if (sourceText) {
    sourceText.addEventListener('input', () => {
        if (charCount) charCount.textContent = sourceText.value.length;
    });
}

if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        if (sourceText) sourceText.value = '';
        if (targetText) targetText.value = '';
        if (charCount) charCount.textContent = '0';
        if (statusEl) statusEl.textContent = '';
    });
}

if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (sourceText) {
                sourceText.value = event.target.result;
                if (charCount) charCount.textContent = sourceText.value.length;
            }
            showToast('تم استيراد الملف');
        };
        reader.readAsText(file);
    });
}

if (copyBtn) {
    copyBtn.addEventListener('click', () => {
        if (!targetText || !targetText.value) return;
        navigator.clipboard.writeText(targetText.value);
        showToast('تم النسخ!');
    });
}

// 7. الترجمة الصوتية (الميكروفون)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SpeechRecognition && voiceBtn) {
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    const langLocaleMap = {
        ar: 'ar-SA', en: 'en-US', fr: 'fr-FR', es: 'es-ES',
        de: 'de-DE', it: 'it-IT', pt: 'pt-PT', ru: 'ru-RU',
        zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR', tr: 'tr-TR',
        hi: 'hi-IN', ur: 'ur-PK', fa: 'fa-IR', nl: 'nl-NL',
        pl: 'pl-PL', sv: 'sv-SE', el: 'el-GR', he: 'he-IL',
        th: 'th-TH', vi: 'vi-VN', id: 'id-ID'
    };

    voiceBtn.addEventListener('click', () => {
        try {
            if (voiceBtn.classList.contains('recording')) {
                recognition.stop();
                return;
            }
            const currentLang = sourceLang ? sourceLang.value : 'ar';
            recognition.lang = (currentLang === 'auto' || !langLocaleMap[currentLang]) ? 'ar-SA' : langLocaleMap[currentLang];
            recognition.start();
            voiceBtn.classList.add('recording');
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
            if (statusEl) statusEl.textContent = 'جاري الاستماع...';
        } catch (err) {
            resetVoiceState();
        }
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (sourceText) {
            sourceText.value += (sourceText.value ? ' ' : '') + transcript;
            if (charCount) charCount.textContent = sourceText.value.length;
        }
    };

    recognition.onerror = () => {
        resetVoiceState();
    };

    recognition.onend = () => {
        resetVoiceState();
        if (statusEl && statusEl.textContent === 'جاري الاستماع...') {
            statusEl.textContent = '';
        }
    };

    function resetVoiceState() {
        voiceBtn.classList.remove('recording');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
    }
} else if (voiceBtn) {
    voiceBtn.style.display = 'none';
}

// 8. الاستماع للنص (زر السماعة - تم إصلاح وتفعيل النطق بشكل صحيح وآمن)
function speakText(text, langCode) {
    if (!text || !text.trim()) {
        showToast('لا يوجد نص للاستماع إليه');
        return;
    }
    
    if ('speechSynthesis' in window) {
        try {
            // إيقاف أي نطق سابق معلق لمنع تداخل الصوت
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = (langCode === 'auto' || !langCode) ? 'ar-SA' : langCode;
            utterance.rate = 1.0; // سرعة طبيعية

            window.speechSynthesis.speak(utterance);
        } catch (e) {
            showToast('تعذر تشغيل الصوت في هذا المتصفح');
        }
    } else {
        showToast('متصفحك لا يدعم ميزة الاستماع الصوتي');
    }
}

if (speakSource) {
    speakSource.addEventListener('click', () => {
        const text = sourceText ? sourceText.value : '';
        const lang = sourceLang ? sourceLang.value : 'ar';
        speakText(text, lang);
