(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);

  /* ---------- Toast ---------- */
  let toastTimer = null;
  function showToast(message, type = '') {
    const toast = $('toast');
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.className = 'toast'; }, 2200);
  }

  /* ---------- 1) لصق مفتاح API ---------- */
  const apiKeyInput = $('apiKeyInput');
  const pasteBtn    = $('pasteBtn');

  pasteBtn.addEventListener('click', async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (!text) { showToast('الحافظة فارغة', 'error'); return; }
        apiKeyInput.value = text.trim();
        showToast('تم لصق مفتاح API', 'success');
      } else {
        apiKeyInput.focus();
        showToast('اللصق غير مدعوم — الصق يدويًا');
      }
    } catch (err) {
      apiKeyInput.focus();
      showToast('تعذر الوصول للحافظة — الصق يدويًا', 'error');
    }
  });

  /* ---------- 2) استيراد ملفات ---------- */
  const importBtn = $('importBtn');
  const fileInput = $('fileInput');
  const fileInfo  = $('fileInfo');

  importBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) { fileInfo.textContent = 'لم يتم اختيار ملف'; return; }

    const ext = file.name.split('.').pop().toLowerCase();
    const allowed = ['html', 'htm', 'json', 'csv'];
    if (!allowed.includes(ext)) {
      fileInfo.textContent = 'صيغة غير مدعومة';
      showToast('الرجاء اختيار HTML أو JSON أو CSV', 'error');
      return;
    }
    const sizeKb = (file.size / 1024).toFixed(1);
    fileInfo.textContent = `تم اختيار: ${file.name} (${sizeKb} KB)`;
    showToast('تم استيراد الملف بنجاح', 'success');
  });

  /* ---------- 3) ترجمة صوتية ---------- */
  const voiceBtn    = $('voiceBtn');
  const voiceStatus = $('voiceStatus');
  let recognizing   = false;
  let recognition   = null;

  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRec) {
    recognition = new SpeechRec();
    recognition.lang = 'ar-SA';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.addEventListener('result', (ev) => {
      const transcript = ev.results[0][0].transcript;
      voiceStatus.textContent = 'النص: ' + transcript;
      showToast('تم التعرف على الصوت', 'success');
    });
    recognition.addEventListener('error', () => {
      recognizing = false;
      voiceBtn.classList.remove('recording');
      voiceStatus.textContent = 'تعذر التعرف على الصوت';
      showToast('خطأ في التعرف الصوتي', 'error');
    });
    recognition.addEventListener('end', () => {
      recognizing = false;
      voiceBtn.classList.remove('recording');
    });
  } else {
    voiceStatus.textContent = 'التعرف الصوتي غير مدعوم على هذا المتصفح';
  }

  voiceBtn.addEventListener('click', () => {
    if (!recognition) { showToast('الميزة غير مدعومة', 'error'); return; }
    if (recognizing) { recognition.stop(); return; }
    try {
      recognition.start();
      recognizing = true;
      voiceBtn.classList.add('recording');
      voiceStatus.textContent = 'جارٍ الاستماع…';
    } catch (e) {
      showToast('تعذر بدء التسجيل', 'error');
    }
  });

  /* ---------- 4) الخامة ---------- */
  const materialSelect = $('materialSelect');
  materialSelect.addEventListener('change', () => {
    const labels = { text: 'نص', voice: 'صوت', image: 'صورة', document: 'مستند' };
    showToast('تم اختيار: ' + labels[materialSelect.value]);
  });

  /* ---------- 5) رابط SPI ---------- */
  const spiInput = $('spiInput');
  spiInput.addEventListener('blur', () => {
    const v = spiInput.value.trim();
    if (v && !/^https?:\/\//i.test(v)) {
      showToast('يجب أن يبدأ الرابط بـ http:// أو https://', 'error');
    }
  });

  /* ---------- 6) اختبار الاتصال ---------- */
  const testBtn    = $('testBtn');
  const testStatus = $('testStatus');

  testBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    const spi    = spiInput.value.trim();

    if (!apiKey) { testStatus.textContent = 'الرجاء إدخال مفتاح API أولًا'; showToast('مفتاح API مطلوب', 'error'); return; }
    if (!spi)    { testStatus.textContent = 'الرجاء إدخال رابط SPI أولًا'; showToast('رابط SPI مطلوب', 'error'); return; }
    if (!/^https?:\/\//i.test(spi)) { testStatus.textContent = 'صيغة رابط SPI غير صحيحة'; showToast('تحقق من رابط SPI', 'error'); return; }

    testBtn.disabled = true;
    testStatus.textContent = 'جارٍ اختبار الاتصال…';
    showToast('جارٍ الاختبار…');

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(spi, { method: 'GET', signal: controller.signal, mode: 'cors' });
      clearTimeout(timeout);

      if (res.ok) {
        testStatus.textContent = 'الاتصال ناجح ✓';
        showToast('تم الاتصال بنجاح', 'success');
      } else {
        testStatus.textContent = 'فشل الاتصال (' + res.status + ')';
        showToast('فشل الاتصال', 'error');
      }
    } catch (err) {
      testStatus.textContent = 'تعذر الاتصال — تحقق من الرابط';
      showToast('تعذر الاتصال', 'error');
    } finally {
      testBtn.disabled = false;
    }
  });
})();