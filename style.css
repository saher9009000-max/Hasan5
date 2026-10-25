:root {
    --primary: #0d9488;
    --primary-hover: #0f766e;
    --primary-light: #ccfbf1;
    --primary-glow: rgba(13, 148, 136, 0.2);
    --bg: #ffffff;
    --surface: #f8fafc;
    --surface-hover: #f1f5f9;
    --surface-border: #e2e8f0;
    --text-main: #0f172a;
    --text-muted: #64748b;
    --text-inverse: #ffffff;
    --danger: #ef4444;
    --danger-bg: #fee2e2;
    --success: #10b981;
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    --radius-sm: 12px;
    --radius-md: 20px; 
    --radius-lg: 24px;
    --radius-full: 9999px;
    --transition: 0.3s ease;
    --header-height: 64px;
}

[data-theme="dark"] {
    --primary: #14b8a6; /* سيتم تحديثه ديناميكياً */
    --primary-hover: #0d9488;
    --primary-light: rgba(20, 184, 166, 0.15);
    --bg: #0f172a;
    --surface: #1e293b;
    --surface-hover: #334155;
    --surface-border: #334155;
    --text-main: #f8fafc;
    --text-muted: #94a3b8;
}

* { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

body {
    font-family: 'Tajawal', sans-serif;
    background-color: var(--bg);
    color: var(--text-main);
    line-height: 1.5;
    transition: background-color var(--transition), color var(--transition);
    overflow-x: hidden;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

button, input, select, textarea {
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    border: none;
    background: none;
    outline: none;
}

button { cursor: pointer; user-select: none; touch-action: manipulation; }
svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; flex-shrink: 0; }

.app-header {
    height: var(--header-height);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    background: var(--bg);
    border-bottom: 1px solid var(--surface-border);
    position: sticky;
    top: 0;
    z-index: 100;
}

.logo { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 1.2rem; color: var(--primary); }
.header-actions { display: flex; gap: 8px; }
.icon-btn { width: 40px; height: 40px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; color: var(--text-muted); transition: all var(--transition); }
.icon-btn:hover { background: var(--surface-hover); color: var(--primary); }

.main-content { flex: 1; padding: 16px; display: flex; flex-direction: column; gap: 16px; max-width: 800px; margin: 0 auto; width: 100%; }

.controls-container { display: flex; flex-direction: column; gap: 12px; }

.engine-selector { display: grid; grid-template-columns: 1fr 1fr; background: var(--surface); padding: 6px; border-radius: var(--radius-full); border: 1px solid var(--surface-border); }
.engine-btn { padding: 10px; border-radius: var(--radius-full); font-weight: 700; color: var(--text-muted); transition: all var(--transition); display: flex; align-items: center; justify-content: center; gap: 8px; }
.engine-btn.active { background: var(--bg); color: var(--primary); box-shadow: var(--shadow-sm); }

.ai-options { display: flex; flex-wrap: wrap; gap: 8px; transition: all var(--transition); }
.ai-options.hidden { display: none; }
.ai-option-btn { flex: 1 1 140px; display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: var(--surface); border: 1px solid var(--surface-border); border-radius: var(--radius-full); font-size: 0.9rem; font-weight: 500; color: var(--text-main); min-width: 0; transition: border-color var(--transition); }
.ai-option-btn:hover { border-color: var(--primary); }
.btn-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; text-align: right; }

.translation-card { background: var(--bg); border-radius: var(--radius-lg); box-shadow: var(--shadow-md); border: 1px solid var(--surface-border); overflow: hidden; display: flex; flex-direction: column; }
.lang-bar { display: flex; align-items: center; padding: 12px; background: var(--surface); border-bottom: 1px solid var(--surface-border); gap: 8px; }
.lang-select { flex: 1; position: relative; min-width: 0; }
.lang-select select { width: 100%; padding: 12px 16px; background: var(--bg); border: 1px solid var(--surface-border); border-radius: var(--radius-full); font-weight: 700; appearance: none; cursor: pointer; }
.swap-btn { width: 44px; height: 44px; border-radius: var(--radius-full); background: var(--bg); border: 1px solid var(--surface-border); color: var(--primary); display: flex; align-items: center; justify-content: center; transition: transform var(--transition); flex-shrink: 0; }
.swap-btn:active { transform: rotate(180deg); }

.text-area-container { position: relative; min-height: 150px; display: flex; flex-direction: column; }
.text-area-container textarea { flex: 1; width: 100%; padding: 16px; resize: none; font-size: 1.1rem; line-height: 1.6; }
.text-area-tools { display: flex; align-items: center; justify-content: space-between; padding: 8px 16px; border-top: 1px solid var(--surface-border); background: var(--bg); }
.tool-group { display: flex; gap: 6px; flex-wrap: wrap; }
.tool-btn { padding: 6px 14px; border-radius: var(--radius-full); font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 4px; background: var(--surface); border: 1px solid var(--surface-border); }
.tool-btn:hover { background: var(--surface-hover); color: var(--text-main); }
.char-count { font-size: 0.8rem; color: var(--text-muted); }

.result-container { padding: 16px; min-height: 120px; border-top: 1px solid var(--surface-border); background: var(--surface); display: flex; flex-direction: column; gap: 12px; }
.result-text { font-size: 1.1rem; line-height: 1.6; color: var(--text-main); white-space: pre-wrap; word-break: break-word; flex: 1; }
.result-tools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: flex-start; }

.tts-btn { display: flex; align-items: center; gap: 8px; padding: 10px 20px; background: var(--primary-light); color: var(--primary); border-radius: var(--radius-full); font-weight: 700; font-size: 0.95rem; transition: all var(--transition); }
.tts-btn:hover { background: var(--primary); color: var(--text-inverse); }
.result-action-btn { width: 40px; height: 40px; border-radius: var(--radius-full); background: var(--bg); border: 1px solid var(--surface-border); color: var(--text-muted); display: flex; align-items: center; justify-content: center; }
.result-action-btn:hover { color: var(--primary); border-color: var(--primary); }
.result-action-btn.fav-active { color: var(--danger); border-color: var(--danger); background: var(--danger-bg); }

.main-translate-btn { width: 100%; padding: 16px; background: var(--primary); color: var(--text-inverse); border-radius: var(--radius-full); font-size: 1.1rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 12px var(--primary-glow); transition: all var(--transition); }
.main-translate-btn:hover { background: var(--primary-hover); transform: translateY(-2px); }
.main-translate-btn.loading { opacity: 0.7; pointer-events: none; }

.bottom-nav { display: flex; background: var(--bg); border-top: 1px solid var(--surface-border); padding-bottom: env(safe-area-inset-bottom); position: sticky; bottom: 0; z-index: 100; }
.nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 10px; color: var(--text-muted); font-size: 0.75rem; font-weight: 500; gap: 4px; transition: color var(--transition); }
.nav-item.active { color: var(--primary); }

.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: flex-end; justify-content: center; opacity: 0; pointer-events: none; transition: opacity var(--transition); }
@media (min-width: 640px) { .modal-overlay { align-items: center; } }
.modal-overlay.active { opacity: 1; pointer-events: auto; }
.modal-content { background: var(--bg); width: 100%; max-width: 500px; max-height: 90vh; border-radius: var(--radius-lg) var(--radius-lg) 0 0; display: flex; flex-direction: column; transform: translateY(100%); transition: transform var(--transition); box-shadow: var(--shadow-lg); }
@media (min-width: 640px) { .modal-content { border-radius: var(--radius-lg); transform: translateY(20px); } }
.modal-overlay.active .modal-content { transform: translateY(0); }
.modal-header { padding: 16px; border-bottom: 1px solid var(--surface-border); display: flex; align-items: center; justify-content: space-between; }
.modal-title { font-size: 1.1rem; font-weight: 700; }
.close-btn { width: 32px; height: 32px; border-radius: var(--radius-full); background: var(--surface); display: flex; align-items: center; justify-content: center; color: var(--text-muted); }
.modal-body { padding: 16px; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 16px; }

.input-group { display: flex; flex-direction: column; gap: 6px; }
.input-group label { font-size: 0.9rem; font-weight: 500; color: var(--text-muted); }
.input-group input { padding: 12px 16px; border: 1px solid var(--surface-border); border-radius: var(--radius-full); background: var(--surface); font-size: 1rem; }
.input-with-btn { display: flex; gap: 8px; }
.input-with-btn input { flex: 1; min-width: 0; }

.btn-secondary { padding: 12px 20px; background: var(--surface); border: 1px solid var(--surface-border); border-radius: var(--radius-full); font-weight: 500; color: var(--text-main); display: flex; align-items: center; justify-content: center; gap: 6px; white-space: nowrap; }
.btn-secondary:hover { background: var(--surface-hover); }
.btn-primary { padding: 12px 20px; background: var(--primary); color: var(--text-inverse); border-radius: var(--radius-full); font-weight: 700; width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background var(--transition); }
.btn-primary:hover { background: var(--primary-hover); }

.search-box { display: flex; gap: 8px; }
.search-box input { flex: 1; padding: 10px 16px; border: 1px solid var(--surface-border); border-radius: var(--radius-full); background: var(--surface); }
.model-list { display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; padding-left: 4px; }
.model-item { padding: 12px 16px; border: 1px solid var(--surface-border); border-radius: var(--radius-full); cursor: pointer; display: flex; align-items: center; justify-content: space-between; }
.model-item:hover { background: var(--surface); }
.model-item.selected { border-color: var(--primary); background: var(--primary-light); color: var(--primary); font-weight: 700; }

.type-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
@media (min-width: 400px) { .type-grid { grid-template-columns: 1fr 1fr; } }
.type-card { padding: 16px; border: 1px solid var(--surface-border); border-radius: var(--radius-lg); cursor: pointer; display: flex; flex-direction: column; gap: 8px; transition: all var(--transition); }
.type-card:hover { border-color: var(--primary); }
.type-card.selected { border-color: var(--primary); background: var(--primary-light); color: var(--primary); }
.type-card svg { color: var(--primary); width: 24px; height: 24px; }
.type-card-title { font-weight: 700; font-size: 1rem; }
.type-card-desc { font-size: 0.8rem; color: var(--text-muted); line-height: 1.4; }

.toast-container { position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; gap: 8px; z-index: 2000; width: 90%; max-width: 350px; pointer-events: none; }
.toast { background: var(--text-main); color: var(--bg); padding: 12px 20px; border-radius: var(--radius-full); font-size: 0.9rem; font-weight: 500; text-align: center; box-shadow: var(--shadow-lg); animation: slideUp 0.3s ease forwards; display: flex; align-items: center; justify-content: center; gap: 8px; }
.toast.success { background: var(--success); color: white; }
.toast.error { background: var(--danger); color: white; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.spinner { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.hidden { display: none !important; }
.view-section { display: none; flex-direction: column; gap: 16px; }
.view-section.active { display: flex; }
.history-item { padding: 16px; background: var(--surface); border: 1px solid var(--surface-border); border-radius: var(--radius-md); display: flex; flex-direction: column; gap: 8px; }
.history-text { font-size: 0.95rem; font-weight: 700; }
.history-sub { font-size: 0.85rem; color: var(--text-muted); }
.history-actions { display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px; }

/* تنسيق دوائر الألوان */
.color-dot {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid transparent;
    cursor: pointer;
    transition: transform 0.2s, border-color 0.2s;
    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}
.color-dot:hover {
    transform: scale(1.15);
}
.color-dot.active {
    border-color: var(--text-main);
    transform: scale(1.1);
}