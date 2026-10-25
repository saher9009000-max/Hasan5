/* ══════════════════════════════════════════════════════
   Prompt Translation Studio — v1.0.0
   ══════════════════════════════════════════════════════ */

const APP_VERSION = 'v1.0.0 (Build 100)';

// ─── الحالة ───
const state = {
  theme: localStorage.getItem('pts_theme') || 'system',
  currentStage: '1',
};

// ─── عناصر ───
const $ = (id) => document.getElementById(id);
const toast = $('toast');

// ══════════════════════════════════════════════════════
// 1) السمة
// ══════════════════════════════════════════════════════
function getEffectiveTheme() {
  if (state.theme === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return state.theme;
}

function applyTheme() {
  const effective = getEffectiveTheme();
  document.documentElement.setAttribute('data-theme', effective);
  const btn = $('themeToggle');
  if (btn) btn.textContent = effective === 'dark' ? '☀️' : '🌙';
}

function setTheme(mode) {
  state.theme = mode;
  localStorage.setItem('pts_theme', mode);
  applyTheme();
}

window.matchMedia('(prefers-color-scheme: dark)')
  .addEventListener('change', () => {
    if (state.theme === 'system') applyTheme();
  });

// ══════════════════════════════════════════════════════
// 2) التنقل بين المراحل
// ══════════════════════════════════════════════════════
function switchStage(num) {
  state.currentStage = num;
  document.querySelectorAll('.stage').forEach((s) => {
    s.classList.toggle('active', s.dataset.stage === num);
  });
  document.querySelectorAll('.stage-tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.stage === num);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ══════════════════════════════════════════════════════
// 3) اللصق والنسخ والمسح
// ══════════════════════════════════════════════════════
async function pasteToElement(id) {
  const el = $(id);
  if (!el) return;
  try {
    const text = await navigator.clipboard.readText();
    if (!text) {
      showToast('الحافظة فارغة');
      return;
    }
    el.value = text;
    el.focus();
    el.dispatchEvent(new Event('input'));
    showToast('✅ تم اللصق (' + text.length + ' حرف)');
  } catch (err) {
    showToast('⚠️ المتصفح لا يسمح باللصق التلقائي — الصق يدويًا');
    el.focus();
  }
}

async function copyFromElement(id) {
  const el = $(id);
  if (!el) return;
  const text = el.value.trim();
  if (!text) {
    showToast('لا يوجد نص لنسخه');
    return;
  }
  try {
    await navigator.clipboard.writeText(text);
    showToast('✅ تم النسخ');
  } catch {
    el.select();
    document.execCommand('copy');
    showToast('✅ تم النسخ');
  }
}

function clearElement(id) {
  const el = $(id);
  if (!el) return;
  if (!el.value) return;
  if (confirm('هل تريد مسح هذا الحقل؟')) {
    el.value = '';
    showToast('🗑️ تم المسح');
  }
}

// ══════════════════════════════════════════════════════
// 4) توليد البرومبتات لكل مرحلة
// ══════════════════════════════════════════════════════
function getVal(id) {
  return ($(id)?.value || '').trim();
}

function buildStage1Prompt() {
  const source = getVal('s1p1');
  const context = getVal('s1p2');
  const notes = getVal('s1p3');

  if (!source) {
    showToast('الصق البرومبت الأصلي أولاً (1.1)');
    return '';
  }

  return `أنت مترجم ومحرر نصوص احترافي، متخصص في صياغة وترجمة البرومبتات والنصوص التقنية والتسويقية إلى العربية بدقة عالية.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 المهمة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ترجمة وتحسين البرومبت التالي إلى العربية الفصحى، بصياغة موجّهة للذكاء الاصطناعي (تعليمات واضحة + قيود + مخرجات متوقعة).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 البرومبت الأصلي
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${source}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ السياق والمتطلبات
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${context || 'العربية الفصحى، نبرة رسمية احترافية، 3 نسخ بديلة (رسمية/ودية/مختصرة).'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗒️ ملاحظات إضافية
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${notes || 'لا توجد ملاحظات إضافية.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 المخرجات المطلوبة (بالترتيب)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. نسخة عربية محسّنة جاهزة للاستخدام مباشرة
2. نسخة مشروحة توضح الاختيارات اللغوية والأسلوبية
3. 3 نسخ بديلة (رسمية، ودية، مختصرة) مع سبب ملاءمة كل منها
4. معجم مصطلحات مفتاحية (المصطلح الأصلي ← الترجمة الموصى بها + تفسير مختصر)
5. خطوات التدقيق والتحقق من الدقة السياقية
6. اقتراح آليات اختبار الترجمة مع النموذج

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 قواعد الصياغة للذكاء الاصطناعي
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- استخدم صيغة أوامر مباشرة (افعل، قدّم، تجنب)
- افصل التعليمات عن القيود بوضوح
- حدد المخرجات بدقة (شكل، طول، عدد)
- حافظ على المصطلحات التقنية واضحة
- فضّل التكييف الثقافي على الترجمة الحرفية عند التعارض

🚫 قيود:
- لا تختلق معلومات غير موجودة
- لا تحذف أجزاء من المصدر
- التزم بالفصحى مع مراعاة الطلاقة
- ابتعد عن الترجمة الآلية الجامدة`;
}

function buildStage2Prompt() {
  const raw = getVal('s2p1');
  const improved = getVal('s2p2');
  const variants = getVal('s2p3');
  const source = getVal('s1p1');
  const context = getVal('s1p2');

  if (!raw && !improved) {
    showToast('الصق الترجمة الخام (2.1) أو المحسّنة (2.2) أولاً');
    return '';
  }

  return `أنت محرر برومبتات خبير. المهمة: تحسين الترجمة العربية لتصبح موجّهة باحترافية للذكاء الاصطناعي.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 البرومبت الأصلي (للسياق)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${source || '(لم يتم تقديم المصدر)'}

⚙️ المتطلبات: ${context || 'فصحى، رسمية، واضحة، قابلة للاستخدام مباشرة'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 الترجمة الخام (تحتاج تحسين)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${raw || '(لم يتم تقديم ترجمة خام)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 النسخة المحسّنة سابقًا (إن وجدت)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${improved || '(لا توجد)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 النسخ البديلة السابقة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${variants || '(لا توجد)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 المطلوب: تحسين النسخة العربية لتكون
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. موجّهة لنموذج AI بصيغة أوامر واضحة
2. مقسمة إلى: (السياق + التعليمات + القيود + المخرجات + أمثلة إن لزم)
3. خالية من الغموض والترجمة الحرفية الجامدة
4. تستخدم مصطلحات تقنية دقيقة
5. تنتج 3 نسخ بديلة (رسمية، ودية، مختصرة) مع سبب ملاءمة كل واحدة

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 صيغة الإخراج
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
قدّم النتيجة في الأقسام التالية بوضوح:
▶ النسخة المحسّنة الرئيسية
▶ النسخة الرسمية البديلة
▶ النسخة الودية البديلة
▶ النسخة المختصرة البديلة
▶ ملاحظات التحسين (ما الذي تغيّر ولماذا)

🚫 لا تختلق محتوى جديدًا، حسّن الصياغة فقط`;
}

function buildStage3Prompt() {
  const finalVersion = getVal('s3p1');
  const explained = getVal('s3p2');
  const glossary = getVal('s3p3');
  const source = getVal('s1p1');

  if (!finalVersion && !explained) {
    showToast('الصق النسخة النهائية (3.1) أو المشروحة (3.2) أولاً');
    return '';
  }

  return `أنت مراجع ترجمات وبرومبتات محترف. المهمة: مراجعة وتسليم النسخة النهائية بجودة مؤسسية.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 البرومبت الأصلي
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${source || '(غير متوفر)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 النسخة النهائية المرشحة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${finalVersion || '(لم تُقدَّم)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 الشرح اللغوي الحالي
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${explained || '(غير متوفر)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📥 معجم المصطلحات الحالي
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${glossary || '(غير متوفر)'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📤 المخرجات المطلوبة
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1️⃣ النسخة النهائية الجاهزة
   - نظيفة، مصقولة، قابلة للنسخ والاستخدام فورًا
   - بصيغة برومبت احترافي موجّه للذكاء الاصطناعي

2️⃣ النسخة المشروحة
   - شرح الاختيارات اللغوية
   - لماذا فُضّلت الترجمة الحرفية أو التكييف الثقافي في كل موضع
   - توضيح المصطلحات التقنية

3️⃣ معجم المصطلحات النهائي
   - جدول: المصطلح الأصلي | الترجمة الموصى بها | التفسير

4️⃣ خطوات التدقيق (QA Checklist)
   - التحقق اللغوي (نحو/إملاء/أسلوب)
   - التحقق السياقي (ملاءمة الجمهور والغرض)
   - التحقق من الاتساق المصطلحي
   - التحقق من اكتمال المخرجات المطلوبة

5️⃣ آليات اختبار الترجمة مع النموذج
   - 3 اختبارات مقترحة (Test Cases) لقياس جودة البرومبت
   - معايير النجاح لكل اختبار
   - كيفية التعديل بناءً على النتائج

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 التسليم النهائي
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
قدّم النتيجة بتنسيق واضح وقابل للنسخ المباشر، مع فصل الأقسام بخطوط ━━━.

📌 الحد الأدنى للتسليم: نسخة جاهزة + شرح + معجم + خطة QA
📌 قابل للتعديل: نعم، بناءً على ملاحظات المستخدم`;
}

// ══════════════════════════════════════════════════════
// 5) عرض المخرجات
// ══════════════════════════════════════════════════════
function showOutput(stageNum, promptText) {
  if (!promptText) return;

  const box = $('output' + stageNum);
  if (!box) return;

  box.innerHTML = `
    <div class="output-header">
      <span class="output-title">📋 البرومبت الجاهز — المرحلة ${stageNum}</span>
      <button class="output-copy" onclick="copyPrompt('output${stageNum}')">نسخ</button>
    </div>
    <pre>${escapeHtml(promptText)}</pre>
  `;
  box.classList.add('show');
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showToast('✅ تم توليد البرومبت — اضغط "نسخ"');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

async function copyPrompt(outputId) {
  const box = $(outputId);
  if (!box) return;
  const pre = box.querySelector('pre');
  if (!pre) return;
  const text = pre.textContent;

  try {
    await navigator.clipboard.writeText(text);
    showToast('✅ تم نسخ البرومبت (' + text.length + ' حرف)');
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    showToast('✅ تم النسخ');
  }
}

// ══════════════════════════════════════════════════════
// 6) توليد برومبت المرحلة
// ══════════════════════════════════════════════════════
function handleGenerate(stageNum) {
  let prompt = '';
  if (stageNum === '1') prompt = buildStage1Prompt();
  else if (stageNum === '2') prompt = buildStage2Prompt();
  else if (stageNum === '3') prompt = buildStage3Prompt();

  if (prompt) showOutput(stageNum, prompt);
}

// ══════════════════════════════════════════════════════
// 7) Toast
// ══════════════════════════════════════════════════════
let toastTimer;
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2400);
}

// ══════════════════════════════════════════════════════
// 8) ربط الأحداث
// ══════════════════════════════════════════════════════
function bindEvents() {
  // السمة
  $('themeToggle')?.addEventListener('click', () => {
    const next = getEffectiveTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  // تبويبات المراحل
  document.querySelectorAll('.stage-tab').forEach((tab) => {
    tab.addEventListener('click', () => switchStage(tab.dataset.stage));
  });

  // أزرار اللصق والنسخ والمسح
  document.querySelectorAll('[data-paste]').forEach((btn) => {
    btn.addEventListener('click', () => pasteToElement(btn.dataset.paste));
  });

  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', () => copyFromElement(btn.dataset.copy));
  });

  document.querySelectorAll('[data-clear]').forEach((btn) => {
    btn.addEventListener('click', () => clearElement(btn.dataset.clear));
  });

  // أزرار التوليد
  document.querySelectorAll('[data-generate]').forEach((btn) => {
    btn.addEventListener('click', () => handleGenerate(btn.dataset.generate));
  });
}

// ══════════════════════════════════════════════════════
// 9) التهيئة
// ══════════════════════════════════════════════════════
function init() {
  applyTheme();
  bindEvents();
  console.log(
    `%c✦ Prompt Translation Studio ${APP_VERSION}`,
    'color:#7C3AED;font-weight:bold;font-size:13px'
  );
}

document.addEventListener('DOMContentLoaded', init);