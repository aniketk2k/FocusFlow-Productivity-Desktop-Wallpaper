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
