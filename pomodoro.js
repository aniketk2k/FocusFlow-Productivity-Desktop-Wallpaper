// --- Pomodoro Logic ---
let currentPomodoroFont = localStorage.getItem('pomodoro-font') || "'Inter', sans-serif";

function applyPomodoroFont() {
    const pTimer = document.getElementById('pomodoro-time');
    if (pTimer) pTimer.style.fontFamily = currentPomodoroFont;
}

const pomodoroTimeEl = document.getElementById('pomodoro-time');
const pStartBtn = document.getElementById('pomodoro-start-btn');
const pResetBtn = document.getElementById('pomodoro-reset-btn');
const pTabs = document.querySelectorAll('.pomodoro-tab');

// Settings Elements used in logic (saved defaults)
const inputPomodoroFont = document.getElementById('pomodoro-font-select');

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

let pomoEndTime = 0;

function togglePomoTimer() {
    if (isPomoRunning) {
        clearInterval(pomoInterval);
        if (pStartBtn) pStartBtn.innerText = 'start';
    } else {
        pomoEndTime = Date.now() + (pomoTimeLeft * 1000);
        pomoInterval = setInterval(() => {
            pomoTimeLeft = Math.max(0, Math.floor((pomoEndTime - Date.now()) / 1000));
            updatePomoDisplay();

            if (pomoTimeLeft <= 0) {
                handlePomoComplete();
            }
        }, 1000);
        if (pStartBtn) pStartBtn.innerText = 'pause';
    }
    isPomoRunning = !isPomoRunning;
}

// Event Listeners for UI
if (pStartBtn) pStartBtn.addEventListener('click', togglePomoTimer);
if (pResetBtn) {
    pResetBtn.addEventListener('click', () => {
        if (isPomoRunning) togglePomoTimer();
        pomoTimeLeft = pSettings[pomoMode] * 60;
        updatePomoDisplay();
    });
}

pTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
        setPomoMode(e.target.dataset.mode);
    });
});

// Init
updatePomoDisplay();
applyPomodoroFont();
