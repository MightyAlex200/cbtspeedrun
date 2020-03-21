const templatediv = document.getElementById("templatediv");
const input = document.getElementById("input");
const currenttime = document.getElementById("currenttime")
const besttime = document.getElementById("besttime")
const xoffset = "25vw";
let inputText = "";
let startTime = null;

fetch("cbt.txt").then(a => a.text()).then(articletext => {
    templatediv.innerText = articletext.replace(/\n/g, ' ');
});

function setX() {
    const ow = input.offsetWidth;
    const left = `calc(${xoffset} - ${ow}px`;
    templatediv.style.left = left;
    input.style.left = left;
}

function getTimeStr(time) {
    // prefix zero
    function pfz(n) {
        let s = n.toString();
        if (s.length < 2) {
            return "0" + s;
        } else {
            return s;
        }
    }

    const minutes = pfz(Math.floor(time / 60000));
    const seconds = pfz(Math.floor(time / 1000) % 60);
    const deciseconds = pfz(Math.floor(time / 10) % 100);
    return `${minutes}:${seconds}:${deciseconds}`;
}

function loadBestTime() {
    const bt = localStorage.getItem('besttime');
    if (bt && !Number.isNaN(Number(bt))) {
        besttime.innerText = `Personal best: ${getTimeStr(Number(bt))}`;
    }
}

function updateTimer() {
    if (inputText === "") {
        startTime = null;
    } else if (!startTime) {
        startTime = new Date().getTime();
    }

    const time = startTime ? new Date().getTime() - startTime : 0;

    currenttime.innerText = `Current time: ${getTimeStr(time)}`;
    if (inputText === templatediv.innerText) {
        const bt = localStorage.getItem('besttime');
        if (!bt || Number(bt) > time) {
            localStorage.setItem('besttime', time.toString());
        }

        startTime = null;

        loadBestTime();

        inputText = "";
        input.innerText = inputText;
        setX();
    }
}

setX();
loadBestTime();

document.onkeydown = function (event) {
    if (event.key === "Backspace") {
        inputText = inputText.slice(0, -1);
    } else {
        const simplepress = /^.$/.test(event.key);
        if (event.key === "Space" || simplepress) {
            inputText += event.key;
        }
    }
    input.innerText = inputText;
    const misspelled = !templatediv.innerText.startsWith(inputText);
    input.style.backgroundColor = misspelled ? "#a00000" : "#00000000";
    setX();
};

function updateTimerAnim() {
    updateTimer();
    window.requestAnimationFrame(updateTimerAnim);
}

updateTimerAnim();

window.onresize = setX;
