const templatediv = document.getElementById("templatediv");
const input = document.getElementById("input");
const currenttime = document.getElementById("currenttime")
const besttime = document.getElementById("besttime")
const xoffset = "25vw";
let skipbuffer = [];
let inputText = "";
let startTime = null;

const filename = new URL(location.href).searchParams.get("file") || "cbt.txt";
const storageKey = 'besttime-' + filename;

fetch(filename).then(a => a.text()).then(articletext => {
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
    const bt = localStorage.getItem(storageKey);
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
        const bt = localStorage.getItem(storageKey);
        if (!bt || Number(bt) > time) {
            localStorage.setItem(storageKey, time.toString());
        }

        startTime = null;

        loadBestTime();

        inputText = "";
        input.innerText = inputText;
        setX();
    }
}

function skips() {
    // Clean skipbuffer
    skipbuffer = skipbuffer.filter(([_, t]) => new Date().getTime() - t < 10000);

    // AAI:
    // must be between /\bt\w+ i/i
    // skips 60 letters
    // 5 second window
    // TODO

    // DEER:
    // next requested letters must be /is/i
    // skips 4 words
    if (
        templatediv.innerText
            .slice(inputText.length - 4, inputText.length - 2)
            .toLowerCase() === 'is'
        && inputText
            .slice(-4)
            .toLowerCase() === 'deer'
        && templatediv.innerText.startsWith(inputText.slice(0, -4))
    ) {
        inputText = templatediv.innerText.slice(0, inputText.length)
            + templatediv.innerText.slice(inputText.length).split(' ').slice(0, 4).join(' ');
    }
}

setX();
loadBestTime();

document.onkeydown = function (event) {
    skipbuffer.push([event, new Date().getTime()]);
    if (event.key === "Backspace") {
        inputText = inputText.slice(0, -1);
    } else {
        const simplepress = /^.$/.test(event.key);
        if (event.key === "Space" || simplepress) {
            inputText += event.key;
        }
    }
    skips();
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
