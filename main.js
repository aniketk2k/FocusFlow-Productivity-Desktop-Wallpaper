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

// Settings Tabs Logic
const tabBtns = document.querySelectorAll('.settings-tab-btn');
const tabContents = document.querySelectorAll('.settings-tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        // Add active class to clicked
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        const targetEl = document.getElementById(targetId);
        if (targetEl) targetEl.classList.add('active');
    });
});

// Custom Select Logic
const customSelects = document.querySelectorAll('.custom-select-wrapper');

customSelects.forEach(wrapper => {
    const trigger = wrapper.querySelector('.custom-select');
    const optionsList = wrapper.querySelector('.custom-options');
    const options = wrapper.querySelectorAll('.custom-option');

    if (trigger && optionsList && options) {
        trigger.addEventListener('click', (e) => {
            // Close others
            customSelects.forEach(w => {
                if (w !== wrapper) {
                    const optList = w.querySelector('.custom-options');
                    if (optList) optList.classList.remove('open');
                }
            });
            optionsList.classList.toggle('open');
            e.stopPropagation();
        });

        options.forEach(option => {
            option.addEventListener('click', (e) => {
                trigger.innerText = option.innerText;
                trigger.setAttribute('data-value', option.getAttribute('data-value'));

                // Mark selected
                options.forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');

                optionsList.classList.remove('open');
                e.stopPropagation();
            });
        });
    }
});

// Close custom selects when clicking outside
document.addEventListener('click', () => {
    document.querySelectorAll('.custom-options').forEach(opt => opt.classList.remove('open'));
});

// Ensure clicking the main gear opens the modal
if (mainSettingsBtn) {
    mainSettingsBtn.addEventListener('click', () => {
        // Sync inputs with current state
        if (document.getElementById('setting-pomodoro')) document.getElementById('setting-pomodoro').value = pSettings.pomodoro;
        if (document.getElementById('setting-short')) document.getElementById('setting-short').value = pSettings.shortBreak;
        if (document.getElementById('setting-long')) document.getElementById('setting-long').value = pSettings.longBreak;
        if (document.getElementById('setting-auto-sequence')) document.getElementById('setting-auto-sequence').checked = pSettings.autoSequence;

        if (typeof currentFormat !== 'undefined') {
            const formatTrigger = document.getElementById('format-select-trigger');
            if (formatTrigger) {
                formatTrigger.setAttribute('data-value', currentFormat);
                const activeOpt = document.querySelector(`#format-select-options .custom-option[data-value="${currentFormat}"]`);
                if (activeOpt) formatTrigger.innerText = activeOpt.innerText;
            }
        }

        if (typeof currentCountdownFont !== 'undefined') {
            const cdFontTrigger = document.getElementById('countdown-font-select-trigger');
            if (cdFontTrigger) {
                cdFontTrigger.setAttribute('data-value', currentCountdownFont);
                const activeOpt = document.querySelector(`#countdown-font-select-options .custom-option[data-value="${currentCountdownFont}"]`);
                if (activeOpt) cdFontTrigger.innerText = activeOpt.innerText;
            }
        }

        if (typeof currentPomodoroFont !== 'undefined') {
            const pFontTrigger = document.getElementById('pomodoro-font-select-trigger');
            if (pFontTrigger) {
                pFontTrigger.setAttribute('data-value', currentPomodoroFont);
                const activeOpt = document.querySelector(`#pomodoro-font-select-options .custom-option[data-value="${currentPomodoroFont}"]`);
                if (activeOpt) pFontTrigger.innerText = activeOpt.innerText;
            }
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

        // Save formats and fonts
        const formatTrigger = document.getElementById('format-select-trigger');
        if (formatTrigger && typeof currentFormat !== 'undefined') {
            currentFormat = formatTrigger.getAttribute('data-value');
            localStorage.setItem('timer-format', currentFormat);
            if (typeof renderGrid === 'function') renderGrid();
            if (typeof updateTimer === 'function') updateTimer();
        }

        const cdFontTrigger = document.getElementById('countdown-font-select-trigger');
        if (cdFontTrigger && typeof currentCountdownFont !== 'undefined') {
            currentCountdownFont = cdFontTrigger.getAttribute('data-value');
            localStorage.setItem('countdown-font', currentCountdownFont);
            if (typeof applyCountdownFont === 'function') applyCountdownFont();
        }

        const pFontTrigger = document.getElementById('pomodoro-font-select-trigger');
        if (pFontTrigger && typeof currentPomodoroFont !== 'undefined') {
            currentPomodoroFont = pFontTrigger.getAttribute('data-value');
            localStorage.setItem('pomodoro-font', currentPomodoroFont);
            if (typeof applyPomodoroFont === 'function') applyPomodoroFont();
        }

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

// --- Lively Wallpaper API Integration ---
function livelyPropertyListener(name, val) {
    switch (name) {
        case "timerFormat":
            switch (val) {
                case 1:
                    if (typeof currentFormat !== 'undefined') currentFormat = "h:m:s";
                    break;
                case 0:
                default:
                    if (typeof currentFormat !== 'undefined') currentFormat = "d:h:m:s";
                    break;
            }
            if (typeof renderGrid === 'function') renderGrid();
            if (typeof updateTimer === 'function') updateTimer();
            break;
        case "countdownFont":
            const cFonts = ["'Orbitron', sans-serif", "'Inter', sans-serif", "'Roboto Mono', monospace", "'Space Mono', monospace", "'Share Tech Mono', monospace"];
            if (typeof currentCountdownFont !== 'undefined') currentCountdownFont = cFonts[val] || cFonts[0];
            if (typeof applyCountdownFont === 'function') applyCountdownFont();
            break;
        case "pomodoroFont":
            const pFonts = ["'Orbitron', sans-serif", "'Inter', sans-serif", "'Roboto Mono', monospace", "'Space Mono', monospace", "'Share Tech Mono', monospace"];
            if (typeof currentPomodoroFont !== 'undefined') currentPomodoroFont = pFonts[val] || pFonts[1];
            if (typeof applyPomodoroFont === 'function') applyPomodoroFont();
            break;
        case "targetDateText":
            if (typeof countDownDate !== 'undefined') {
                const parsed = new Date(val).getTime();
                if (!isNaN(parsed)) {
                    countDownDate = parsed;
                    if (typeof timerInterval !== 'undefined') clearInterval(timerInterval);
                    if (typeof updateTimer === 'function') {
                        updateTimer();
                        timerInterval = setInterval(updateTimer, 1000);
                    }
                }
            }
            break;
    }
}
