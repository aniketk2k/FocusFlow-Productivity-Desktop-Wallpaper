// --- Main Application UI & Settings Logic ---

// Background Picker Logic
const bgUpload = document.getElementById('bg-upload');
const body = document.body;

// Load saved background
const savedBg = localStorage.getItem('custom-bg');
if (savedBg) {
    body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('${savedBg}')`;
}

if (bgUpload) {
    bgUpload.addEventListener('change', function (e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const bgUrl = e.target.result;
                body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('${bgUrl}')`;
                try {
                    localStorage.setItem('custom-bg', bgUrl);
                } catch (err) {
                    console.warn('Storage quota exceeded or disabled', err);
                }
            }
            reader.readAsDataURL(file);
        }
    });
}

// Mode Toggle Logic (Top Nav)
const navCountdownBtn = document.getElementById('nav-countdown-btn');
const navPomodoroBtn = document.getElementById('nav-pomodoro-btn');
const countdownCard = document.getElementById('countdown-container');
const pomodoroContainer = document.getElementById('pomodoro-container');

let currentAppMode = localStorage.getItem('app-mode') || 'countdown';

function updateModeUI() {
    // If Pomodoro is running and user switches to Countdown, pause it
    if (currentAppMode !== 'pomodoro' && typeof isPomoRunning !== 'undefined' && isPomoRunning) {
        if (typeof togglePomoTimer === 'function') togglePomoTimer();
    }

    if (currentAppMode === 'countdown') {
        if (navCountdownBtn) navCountdownBtn.classList.add('active');
        if (navPomodoroBtn) navPomodoroBtn.classList.remove('active');
        if (countdownCard) countdownCard.style.display = 'block';
        if (pomodoroContainer) pomodoroContainer.style.display = 'none';

        // Hide pomodoro-specific settings button on main screen, as it's now global
        const oldPSettingsBtn = document.getElementById('pomodoro-settings-btn');
        if (oldPSettingsBtn) oldPSettingsBtn.style.display = 'none';
    } else {
        if (navCountdownBtn) navCountdownBtn.classList.remove('active');
        if (navPomodoroBtn) navPomodoroBtn.classList.add('active');
        if (countdownCard) countdownCard.style.display = 'none';
        if (pomodoroContainer) pomodoroContainer.style.display = 'flex';

        // Hide pomodoro-specific settings button on main screen, as it's now global
        const oldPSettingsBtn = document.getElementById('pomodoro-settings-btn');
        if (oldPSettingsBtn) oldPSettingsBtn.style.display = 'none';
    }
}

if (navCountdownBtn) {
    navCountdownBtn.addEventListener('click', () => {
        currentAppMode = 'countdown';
        localStorage.setItem('app-mode', currentAppMode);
        updateModeUI();
    });
}

if (navPomodoroBtn) {
    navPomodoroBtn.addEventListener('click', () => {
        currentAppMode = 'pomodoro';
        localStorage.setItem('app-mode', currentAppMode);
        updateModeUI();
    });
}
updateModeUI();

// --- Settings Modal Interactions ---
const mainSettingsBtn = document.getElementById('main-settings-btn');
const pSettingsModal = document.getElementById('pomodoro-settings-modal');
const pCloseSettingsBtn = document.getElementById('close-settings-btn');
const pSaveSettingsBtn = document.getElementById('save-settings-btn');

// Ensure clicking the main gear opens the modal
if (mainSettingsBtn) {
    mainSettingsBtn.addEventListener('click', () => {
        // Sync inputs with current state
        if (document.getElementById('setting-pomodoro')) document.getElementById('setting-pomodoro').value = pSettings.pomodoro;
        if (document.getElementById('setting-short')) document.getElementById('setting-short').value = pSettings.shortBreak;
        if (document.getElementById('setting-long')) document.getElementById('setting-long').value = pSettings.longBreak;
        if (document.getElementById('setting-auto-sequence')) document.getElementById('setting-auto-sequence').checked = pSettings.autoSequence;

        if (document.getElementById('countdown-font-select') && typeof currentCountdownFont !== 'undefined') {
            document.getElementById('countdown-font-select').value = currentCountdownFont;
        }
        if (document.getElementById('pomodoro-font-select') && typeof currentPomodoroFont !== 'undefined') {
            document.getElementById('pomodoro-font-select').value = currentPomodoroFont;
        }

        if (pSettingsModal) pSettingsModal.style.display = 'flex';
    });
}

if (pCloseSettingsBtn) {
    pCloseSettingsBtn.addEventListener('click', () => {
        if (pSettingsModal) pSettingsModal.style.display = 'none';
    });
}

if (pSaveSettingsBtn) {
    pSaveSettingsBtn.addEventListener('click', () => {
        // Save Pomodoro durations
        pSettings.pomodoro = parseInt(document.getElementById('setting-pomodoro').value) || 25;
        pSettings.shortBreak = parseInt(document.getElementById('setting-short').value) || 5;
        pSettings.longBreak = parseInt(document.getElementById('setting-long').value) || 10;
        pSettings.autoSequence = document.getElementById('setting-auto-sequence').checked;

        localStorage.setItem('pomo-pomodoro', pSettings.pomodoro);
        localStorage.setItem('pomo-short', pSettings.shortBreak);
        localStorage.setItem('pomo-long', pSettings.longBreak);
        localStorage.setItem('pomo-auto', pSettings.autoSequence);

        // Reset Pomodoro timer to apply new settings if we are in that mode
        if (typeof pomoTimeLeft !== 'undefined' && typeof pSettings !== 'undefined' && typeof pomoMode !== 'undefined') {
            pomoTimeLeft = pSettings[pomoMode] * 60;
            // togglePomoTimer definition is in pomodoro.js, we call it if needed
            if (typeof isPomoRunning !== 'undefined' && isPomoRunning) {
                if (typeof togglePomoTimer === 'function') togglePomoTimer();
            }
            if (typeof updatePomoDisplay === 'function') updatePomoDisplay();
        }

        if (pSettingsModal) pSettingsModal.style.display = 'none';
    });
}
