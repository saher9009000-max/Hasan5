/* تنسيقات عامة للشريط العلوي والإعدادات */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f4f6f8;
  border-bottom: 1px solid #ddd;
}

.settings-btn {
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 5px;
  cursor: pointer;
}

.settings-panel {
  position: absolute;
  left: 20px;
  background: white;
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.1);
  z-index: 1000;
  width: 300px;
}

.hidden {
  display: none;
}

.setting-group {
  margin-bottom: 12px;
}

.setting-group label {
  display: block;
  margin-bottom: 5px;
  font-size: 13px;
  font-weight: bold;
}

.setting-group input, .setting-group select {
  width: 100%;
  padding: 6px;
  box-sizing: border-box;
}

/* قسم اللغات والترجمة بجانب بعض */
.languages-row, .translation-modes-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  margin: 15px 0;
}

.lang-box, .mode-box {
  flex: 1;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
}

.lang-box {
  text-align: center;
  font-weight: bold;
}

.active-lang {
  background-color: #e3f2fd;
  border-color: #90caf9;
}

/* الوضع الداكن / المائل للأزرق */
body.dark-theme {
  background-color: #121824;
  color: #e0e0e0;
}

body.dark-theme .top-bar {
  background-color: #1b2431;
  border-bottom-color: #2c3e50;
}

body.dark-theme .settings-panel,
body.dark-theme .lang-box,
body.dark-theme .mode-box {
  background-color: #1b2431;
  border-color: #2c3e50;
  color: #fff;
}
