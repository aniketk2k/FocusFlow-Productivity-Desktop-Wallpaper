// Set the date we're counting down to
let countDownDate = new Date("Feb 27, 2026 14:00:00").getTime();
const savedDate = localStorage.getItem('end-date');
if (savedDate) {
    countDownDate = parseInt(savedDate, 10);
}

let timerInterval;
const timerGrid = document.querySelector(".timer-grid");
const formatSelect = document.getElementById("format-select");

// Restore saved format or default
let currentFormat = localStorage.getItem('timer-format') || 'd:h:m:s';
let currentCountdownFont = localStorage.getItem('countdown-font') || "'Orbitron', sans-serif";
let currentPomodoroFont = localStorage.getItem('pomodoro-font') || "'Inter', sans-serif";

function applyCountdownFont() {
    document.querySelectorAll('.timer-number').forEach(el => {
        el.style.fontFamily = currentCountdownFont;
    });
}

function applyPomodoroFont() {
    const pTimer = document.getElementById('pomodoro-time');
    if (pTimer) pTimer.style.fontFamily = currentPomodoroFont;
}

if (formatSelect) {
    formatSelect.value = currentFormat;
    formatSelect.addEventListener('change', (e) => {
        currentFormat = e.target.value;
        localStorage.setItem('timer-format', currentFormat);
        renderGrid();
        updateTimer();
    });
}

function renderGrid() {
    let html = '';
    const parts = currentFormat.split(':');

    parts.forEach((part, index) => {
        let id, label;
        if (part === 'd') { id = 'days'; label = 'Days'; }
        else if (part === 'h') { id = 'hours'; label = 'Hours'; }
        else if (part === 'm') { id = 'minutes'; label = 'Minutes'; }
        else if (part === 's') { id = 'seconds'; label = 'Seconds'; }

        html += `
            <div class="timer-box">
                <span class="timer-number" id="${id}">00</span>
                <span class="timer-label">${label}</span>
            </div>
        `;

        if (index < parts.length - 1) {
            html += `<div class="separator">:</div>`;
        }
    });

    if (timerGrid) {
        timerGrid.innerHTML = html;
        let gridTemplate = '';
        for (let i = 0; i < parts.length; i++) {
            gridTemplate += '1fr ';
            if (i < parts.length - 1) gridTemplate += 'auto ';
        }
        timerGrid.style.gridTemplateColumns = gridTemplate.trim();
    }

    // Ensure font is applied to rebuilt elements
    applyCountdownFont();
}

// Initial render
renderGrid();
function updateTimer() {
    const now = new Date().getTime();
    const distance = countDownDate - now;

    if (distance < 0) {
        if (timerInterval) clearInterval(timerInterval);
        const titleEl = document.querySelector(".title");
        if (titleEl) titleEl.innerHTML = "EXAMS STARTED";
        if (timerGrid) timerGrid.style.display = "none";
        return;
    } else {
        if (timerGrid) timerGrid.style.display = "grid";
    }

    const d_val = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h_val = currentFormat.includes('d')
        ? Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        : Math.floor(distance / (1000 * 60 * 60));

    const m_val = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s_val = Math.floor((distance % (1000 * 60)) / 1000);

    const formatTime = (time) => time < 10 ? `0${time}` : time;

    const elDays = document.getElementById("days");
    if (elDays) elDays.innerText = formatTime(d_val);

    const elHours = document.getElementById("hours");
    if (elHours) elHours.innerText = formatTime(h_val);

    const elMinutes = document.getElementById("minutes");
    if (elMinutes) elMinutes.innerText = formatTime(m_val);

    const elSeconds = document.getElementById("seconds");
    if (elSeconds) elSeconds.innerText = formatTime(s_val);
}

// Update the count down every 1 second
updateTimer(); // Run immediately to avoid 1s delay
timerInterval = setInterval(updateTimer, 1000);

// Background Picker Logic
const bgUpload = document.getElementById('bg-upload');
const body = document.body;

// Load saved background
const savedBg = localStorage.getItem('custom-bg');
if (savedBg) {
    body.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('${savedBg}')`;
}

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

// Date Picker Logic
const datePickerInput = document.getElementById('date-picker-input');
const datePickerBtn = document.getElementById('date-picker-btn');

const fp = flatpickr(datePickerInput, {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    defaultDate: new Date(countDownDate),
    onChange: function (selectedDates) {
        if (selectedDates.length > 0) {
            const newDate = selectedDates[0].getTime();
            countDownDate = newDate;
            localStorage.setItem('end-date', countDownDate.toString());

            // Restart interval to ensure smooth ticking
            if (timerInterval) clearInterval(timerInterval);
            updateTimer();
            timerInterval = setInterval(updateTimer, 1000);
        }
    }
});

datePickerBtn.addEventListener('click', () => {
    fp.open();
});

// Mode Toggle Logic (Top Nav)
const navCountdownBtn = document.getElementById('nav-countdown-btn');
const navPomodoroBtn = document.getElementById('nav-pomodoro-btn');
const countdownCard = document.getElementById('countdown-container');
const pomodoroContainer = document.getElementById('pomodoro-container');

let currentAppMode = localStorage.getItem('app-mode') || 'countdown';

function updateModeUI() {
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

// --- Pomodoro Logic ---
const pomodoroTimeEl = document.getElementById('pomodoro-time');
const pStartBtn = document.getElementById('pomodoro-start-btn');
const pResetBtn = document.getElementById('pomodoro-reset-btn');
const pSettingsBtn = document.getElementById('pomodoro-settings-btn');
const pTabs = document.querySelectorAll('.pomodoro-tab');

// Settings Elements
const pSettingsModal = document.getElementById('pomodoro-settings-modal');
const pCloseSettingsBtn = document.getElementById('close-settings-btn');
const pSaveSettingsBtn = document.getElementById('save-settings-btn');
const inputPomodoro = document.getElementById('setting-pomodoro');
const inputShort = document.getElementById('setting-short');
const inputLong = document.getElementById('setting-long');
const inputAuto = document.getElementById('setting-auto-sequence');
const inputCountdownFont = document.getElementById('countdown-font-select');
const inputPomodoroFont = document.getElementById('pomodoro-font-select');

// Live update font selections
if (inputCountdownFont) {
    inputCountdownFont.addEventListener('change', (e) => {
        currentCountdownFont = e.target.value;
        localStorage.setItem('countdown-font', currentCountdownFont);
        applyCountdownFont();
    });
}

if (inputPomodoroFont) {
    inputPomodoroFont.addEventListener('change', (e) => {
        currentPomodoroFont = e.target.value;
        localStorage.setItem('pomodoro-font', currentPomodoroFont);
        applyPomodoroFont();
    });
}

// Pomodoro State
let pSettings = {
    pomodoro: parseInt(localStorage.getItem('pomo-pomodoro')) || 25,
    shortBreak: parseInt(localStorage.getItem('pomo-short')) || 5,
    longBreak: parseInt(localStorage.getItem('pomo-long')) || 10,
    autoSequence: localStorage.getItem('pomo-auto') !== 'false' // default true
};

let pomoMode = 'pomodoro'; // 'pomodoro', 'shortBreak', 'longBreak'
let pomoTimeLeft = pSettings.pomodoro * 60;
let pomoInterval = null;
let isPomoRunning = false;
let completedPomodoros = 0;

function formatPomoTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function updatePomoDisplay() {
    if (pomodoroTimeEl) pomodoroTimeEl.innerText = formatPomoTime(pomoTimeLeft);
}

function setPomoMode(mode) {
    if (isPomoRunning) togglePomoTimer(); // pause if running

    pomoMode = mode;
    pomoTimeLeft = pSettings[mode] * 60;
    updatePomoDisplay();

    // Update active tab UI
    pTabs.forEach(tab => {
        if (tab.dataset.mode === mode) tab.classList.add('active');
        else tab.classList.remove('active');
    });
}

function handlePomoComplete() {
    togglePomoTimer(); // stop it

    if (pSettings.autoSequence) {
        if (pomoMode === 'pomodoro') {
            completedPomodoros++;
            if (completedPomodoros % 4 === 0) {
                setPomoMode('longBreak');
            } else {
                setPomoMode('shortBreak');
            }
        } else {
            // After any break, go back to pomodoro
            setPomoMode('pomodoro');
        }
        // Auto-start next sequence
        togglePomoTimer();
    } else {
        // Just reset the current mode's time
        pomoTimeLeft = pSettings[pomoMode] * 60;
        updatePomoDisplay();
    }
}

function togglePomoTimer() {
    if (isPomoRunning) {
        clearInterval(pomoInterval);
        pStartBtn.innerText = 'start';
    } else {
        pomoInterval = setInterval(() => {
            pomoTimeLeft--;
            updatePomoDisplay();

            if (pomoTimeLeft <= 0) {
                handlePomoComplete();
            }
        }, 1000);
        pStartBtn.innerText = 'pause';
    }
    isPomoRunning = !isPomoRunning;
}

// Event Listeners for UI
pStartBtn.addEventListener('click', togglePomoTimer);
pResetBtn.addEventListener('click', () => {
    if (isPomoRunning) togglePomoTimer();
    pomoTimeLeft = pSettings[pomoMode] * 60;
    updatePomoDisplay();
});

pTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        setPomoMode(e.target.dataset.mode);
    });
});

// Settings Modal interactions
const mainSettingsBtn = document.getElementById('main-settings-btn');
// Ensure clicking the main gear opens the modal
if (mainSettingsBtn) {
    mainSettingsBtn.addEventListener('click', () => {
        inputPomodoro.value = pSettings.pomodoro;
        inputShort.value = pSettings.shortBreak;
        inputLong.value = pSettings.longBreak;
        inputAuto.checked = pSettings.autoSequence;

        if (inputCountdownFont) inputCountdownFont.value = currentCountdownFont;
        if (inputPomodoroFont) inputPomodoroFont.value = currentPomodoroFont;

        pSettingsModal.style.display = 'flex';
    });
}

// In case old pomodoro gear button is still present, bind it too
if (pSettingsBtn) {
    pSettingsBtn.addEventListener('click', () => {
        if (mainSettingsBtn) mainSettingsBtn.click();
    });
}

pCloseSettingsBtn.addEventListener('click', () => {
    pSettingsModal.style.display = 'none';
});

pSaveSettingsBtn.addEventListener('click', () => {
    pSettings.pomodoro = parseInt(inputPomodoro.value) || 25;
    pSettings.shortBreak = parseInt(inputShort.value) || 5;
    pSettings.longBreak = parseInt(inputLong.value) || 10;
    pSettings.autoSequence = inputAuto.checked;

    if (inputCountdownFont) currentCountdownFont = inputCountdownFont.value;
    if (inputPomodoroFont) currentPomodoroFont = inputPomodoroFont.value;

    localStorage.setItem('pomo-pomodoro', pSettings.pomodoro);
    localStorage.setItem('pomo-short', pSettings.shortBreak);
    localStorage.setItem('pomo-long', pSettings.longBreak);
    localStorage.setItem('pomo-auto', pSettings.autoSequence);
    localStorage.setItem('countdown-font', currentCountdownFont);
    localStorage.setItem('pomodoro-font', currentPomodoroFont);

    applyCountdownFont();
    applyPomodoroFont();

    // Reset timer to apply new settings if we are in that mode
    pomoTimeLeft = pSettings[pomoMode] * 60;
    if (isPomoRunning) togglePomoTimer();
    updatePomoDisplay();

    pSettingsModal.style.display = 'none';
});

// Init
updatePomoDisplay();
applyPomodoroFont();
