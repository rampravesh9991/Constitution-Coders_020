let timer;
let isRunning = false;
let workInterval = 25;
let shortBreak = 5;
let longBreak = 15;

document.getElementById('start').addEventListener('click', () => {
    if (!isRunning) {
        isRunning = true;
        startTimer(workInterval * 60);
    }
});

document.getElementById('reset').addEventListener('click', () => {
    resetTimer();
});

document.getElementById('work-interval').addEventListener('input', (e) => {
    workInterval = parseInt(e.target.value);
});

document.getElementById('short-break').addEventListener('input', (e) => {
    shortBreak = parseInt(e.target.value);
});

document.getElementById('long-break').addEventListener('input', (e) => {
    longBreak = parseInt(e.target.value);
});

function startTimer(duration) {
    let timer = duration, minutes, seconds;
    const interval = setInterval(() => {
        minutes = parseInt(timer / 60, 10);
        seconds = parseInt(timer % 60, 10);

        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        document.getElementById('minutes').textContent = minutes;
        document.getElementById('seconds').textContent = seconds;

        if (--timer < 0) {
            clearInterval(interval);
            isRunning = false;
            alert('Time is up!');
            // Automatically start break after work session
            startBreak();
        }
    }, 1000);
}

function startBreak() {
    let breakDuration = shortBreak * 60;
    if (confirm('Start short break?')) {
        startTimer(breakDuration);
    } else if (confirm('Start long break?')) {
        startTimer(longBreak * 60);
    } else {
        resetTimer();
    }
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    document.getElementById('minutes').textContent = '25';
    document.getElementById('seconds').textContent = '00';
}


// Fetch initial preferences from JSON Server
fetch('http://localhost:3000/preferences')
    .then(response => response.json())
    .then(data => {
        workInterval = data.workInterval;
        shortBreak = data.shortBreak;
        longBreak = data.longBreak;

        document.getElementById('work-interval').value = workInterval;
        document.getElementById('short-break').value = shortBreak;
        document.getElementById('long-break').value = longBreak;
    });

// Save preferences to JSON Server
function savePreferences() {
    const preferences = {
        workInterval: workInterval,
        shortBreak: shortBreak,
        longBreak: longBreak
    };

    fetch('http://localhost:3000/preferences', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
    });
}

document.getElementById('work-interval').addEventListener('input', (e) => {
    workInterval = parseInt(e.target.value);
    savePreferences();
});

document.getElementById('short-break').addEventListener('input', (e) => {
    shortBreak = parseInt(e.target.value);
    savePreferences();
});

document.getElementById('long-break').addEventListener('input', (e) => {
    longBreak = parseInt(e.target.value);
    savePreferences();
});
