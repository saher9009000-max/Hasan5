/* =========================================================
   المترجم الذكي — Client-Side فقط
   - لا مفاتيح أو نماذج ثابتة
   - جلب النماذج تلقائياً من /models
   - طلبات متوافقة مع OpenAI / Groq (/chat/completions)
   ========================================================= */

const STORAGE_KEY = "smart_translator_settings_v1";

const state = {
  endpoint: "",
  apiKey: "",
  model: "",
  models: [],
  loading: false,
};

/* ---------- DOM ---------- */
const $ = (id) => document.getElementById(id);

const els = {
  // header
  modelSelect: $("modelSelect"),
  refreshModelsBtn: $("refreshModelsBtn"),
  openSettingsBtn: $("openSettingsBtn"),

  // main
  sourceLang: $("sourceLang"),
  targetLang: $("targetLang"),
  sourceText: $("sourceText"),
  outputText: $("outputText"),
  charCount: $("charCount"),
  statusMsg: $("statusMsg"),
  translateBtn: $("translateBtn"),
  swapBtn: $("swapBtn"),
  copyBtn: $("copyBtn"),
  clearBtn: $("clearBtn"),

  // settings modal
  settingsModal: $("settingsModal"),
  closeSettingsBtn: $("closeSettingsBtn"),
  endpointInput: $("endpointInput"),
  apiKeyInput: $("apiKeyInput"),
  saveSettingsBtn: $("saveSettingsBtn"),
  clearSettingsBtn: $("clearSettingsBtn"),
  settingsStatus: $("settingsStatus"),
};

/* ---------- Helpers ---------- */

function normalizeBase(url) {
  return (url || "").trim().replace(/\/+$/, "");
}

function setStatus(el, message, type = "") {
  el.textContent = message || "";
  el.classList.remove("error", "success");
  if (type) el.classList.add(type);
}

function setLoading(loading) {
  state.loading = loading;
  els.translateBtn.disabled = loading;
  els.translateBtn.querySelector("span").textContent = loading ? "جاري..." : "ترجم";
}

/* ---------- LocalStorage ---------- */

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.endpoint = normalizeBase(data.endpoint || "");
    state.apiKey = data.apiKey || "";
    state.model = data.model || "";

    els.endpointInput.value = state.endpoint;
    els.apiKeyInput.value = state.apiKey;
  } catch (err) {
    console.warn("تعذر قراءة الإعدادات المحفوظة:", err);
  }
}

function saveSettings() {
  const endpoint = normalizeBase(els.endpointInput.value);
  const apiKey = els.apiKeyInput.value.trim();

  if (!endpoint || !apiKey) {
    setStatus(els.settingsStatus, "الرجاء إدخال الرابط والمفتاح معاً.", "error");
    return false;
  }

  if (!/^https?:\/\//i.test(endpoint)) {
    setStatus(els.settingsStatus, "الرابط يجب أن يبدأ بـ http:// أو https://", "error");
    return false;
  }

  state.endpoint = endpoint;
  state.apiKey = apiKey;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ endpoint, apiKey, model: state.model })
  );

  setStatus(els.settingsStatus, "✓ تم الحفظ بنجاح.", "success");
  return true;
}

function persistModel(modelId) {
  state.model = modelId;
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    data.model = modelId;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (_) {}
}

/* ---------- Settings Modal ---------- */

function openSettings() {
  els.endpointInput.value = state.endpoint;
  els.apiKeyInput.value = state.apiKey;
  setStatus(els.settingsStatus, "");
  els.settingsModal.classList.remove("hidden");
  els.settingsModal.setAttribute("aria-hidden", "false");
  setTimeout(() => els.endpointInput.focus(), 50);
}

function closeSettings() {
  els.settingsModal.classList.add("hidden");
  els.settingsModal.setAttribute("aria-hidden", "true");
}

/* ---------- Dynamic Models Fetching ---------- */

function renderModelSelect(models) {
  els.modelSelect.innerHTML = "";

  if (!models.length) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "— لا توجد نماذج —";
    els.modelSelect.appendChild(opt);
    els.modelSelect.disabled = true;
    return;
  }

  models.forEach((id) => {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = id;
    els.modelSelect.appendChild(opt);
  });

  if (state.model && models.includes(state.model)) {
    els.modelSelect.value = state.model;
  } else {
    state.model = models[0];
    els.modelSelect.value = state.model;
    persistModel(state.model);
  }

  els.modelSelect.disabled = false;
}

async function fetchModels() {
  if (!state.endpoint || !state.apiKey) {
    setStatus(els.settingsStatus, "أدخل الرابط والمفتاح أولاً ثم احفظ.", "error");
    return;
  }

  els.refreshModelsBtn.disabled = true;
  setStatus(els.settingsStatus, "جاري تحميل النماذج...");

  try {
    const res = await fetch(`${state.endpoint}/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${state.apiKey}`,
      },
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`فشل تحميل النماذج (${res.status}). ${txt.slice(0, 150)}`);
    }

    const data = await res.json();
    const list = Array.isArray(data?.data)
      ? data.data.map((m) => m.id).filter(Boolean)
      : [];

    if (!list.length) throw new Error("لم يتم العثور على أي نموذج متاح.");

    state.models = list.sort((a, b) => a.localeCompare(b));
    renderModelSelect(state.models);

    setStatus(els.settingsStatus, `✓ تم تحميل ${list.length} نموذج.`, "success");
  } catch (err) {
    console.error(err);
    setStatus(els.settingsStatus, err.message || "خطأ في الاتصال.", "error");
  } finally {
    els.refreshModelsBtn.disabled = false;
  }
}

/* ---------- Translate ---------- */

function buildSystemPrompt() {
  return "You are a professional translator. Translate the user's text accurately. Return ONLY the translated text without explanations, quotes, or notes.";
}

function buildUserPrompt(text, sourceLang, targetLang) {
  const src = sourceLang === "auto" ? "the detected language" : sourceLang;
  return `Translate the following text from ${src} to ${targetLang}.\n\nText:\n${text}`;
}

async function translate() {
  const text = els.sourceText.value.trim();

  if (!text) {
    setStatus(els.statusMsg, "أدخل نصاً للترجمة أولاً.", "error");
    return;
  }
  if (!state.endpoint || !state.apiKey) {
    setStatus(els.statusMsg, "يرجى إعداد الاتصال من زر الإعدادات ⚙️", "error");
    openSettings();
    return;
  }
  if (!state.model) {
    setStatus(els.statusMsg, "لا يوجد نموذج محدد. اضغط ⟳ لتحديث النماذج.", "error");
    return;
  }

  setLoading(true);
  els.outputText.value = "";
  setStatus(els.statusMsg, "جاري الترجمة...");

  try {
    const res = await fetch(`${state.endpoint}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${state.apiKey}`,
      },
      body: JSON.stringify({
        model: state.model,
        messages: [
          { role: "system", content: buildSystemPrompt() },
          {
            role: "user",
            content: buildUserPrompt(
              text,
              els.sourceLang.value,
              els.targetLang.value
            ),
          },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`فشل الطلب (${res.status}): ${errText.slice(0, 200)}`);
    }

    const data = await res.json();
    const content =
      data?.choices?.[0]?.message?.content?.trim() ||
      data?.choices?.[0]?.text?.trim() ||
      "";

    if (!content) throw new Error("لم يُرجع النموذج أي نص.");

    els.outputText.value = content;
    setStatus(els.statusMsg, "✓ تمت الترجمة.", "success");
  } catch (err) {
    console.error(err);
    setStatus(els.statusMsg, err.message || "حدث خطأ أثناء الترجمة.", "error");
  } finally {
    setLoading(false);
  }
}

/* ---------- UI events ---------- */

function updateCharCount() {
  els.charCount.textContent = `${els.sourceText.value.length} حرف`;
}

function swapLanguages() {
  const src = els.sourceLang.value;
  const tgt = els.targetLang.value;

  if (src === "auto") {
    setStatus(els.statusMsg, "لا يمكن تبديل الكشف التلقائي. اختر لغة محددة.", "error");
    return;
  }

  els.sourceLang.value = tgt;
  els.targetLang.value = src;

  const srcText = els.sourceText.value;
  const outText = els.outputText.value;
  if (outText) {
    els.sourceText.value = outText;
    els.outputText.value = srcText;
    updateCharCount();
  }
}

async function copyOutput() {
  const text = els.outputText.value;
  if (!text) return;
  try {
    await navigator.clipboard.writeText(text);
    setStatus(els.statusMsg, "✓ تم نسخ الترجمة.", "success");
  } catch {
    setStatus(els.statusMsg, "تعذر النسخ.", "error");
  }
}

function clearAll() {
  els.sourceText.value = "";
  els.outputText.value = "";
  updateCharCount();
  setStatus(els.statusMsg, "");
  els.sourceText.focus();
}

/* ---------- Bindings ---------- */

function bindEvents() {
  els.openSettingsBtn.addEventListener("click", openSettings);
  els.closeSettingsBtn.addEventListener("click", closeSettings);
  els.settingsModal.addEventListener("click", (e) => {
    if (e.target === els.settingsModal) closeSettings();
  });

  els.saveSettingsBtn.addEventListener("click", async () => {
    if (!saveSettings()) return;
    await fetchModels();
  });

  els.clearSettingsBtn.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    state.endpoint = "";
    state.apiKey = "";
    state.model = "";
    state.models = [];
    els.endpointInput.value = "";
    els.apiKeyInput.value = "";
    els.modelSelect.innerHTML = '<option value="">— لا يوجد نموذج —</option>';
    els.modelSelect.disabled = true;
    setStatus(els.settingsStatus, "تم مسح البيانات.", "success");
  });

  els.refreshModelsBtn.addEventListener("click", fetchModels);

  els.modelSelect.addEventListener("change", (e) => {
    persistModel(e.target.value);
  });

  els.translateBtn.addEventListener("click", translate);

  els.sourceText.addEventListener("input", updateCharCount);

  els.sourceText.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      translate();
    }
  });

  els.swapBtn.addEventListener("click", swapLanguages);
  els.copyBtn.addEventListener("click", copyOutput);
  els.clearBtn.addEventListener("click", clearAll);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !els.settingsModal.classList.contains("hidden")) {
      closeSettings();
    }
  });
}

/* ---------- Init ---------- */

async function init() {
  bindEvents();
  updateCharCount();
  loadSettings();

  if (state.endpoint && state.apiKey) {
    await fetchModels();
  } else {
    // أول تشغيل: افتح الإعدادات تلقائياً لتجربة سلسة
    openSettings();
  }
}

document.addEventListener("DOMContentLoaded", init);