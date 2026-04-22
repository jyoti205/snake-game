// ========// BOARD === Rows & Cloumn //========

const board = document.querySelector('.board');
const startButton = document.querySelector(".btn-start")
const modal = document.querySelector(".modal")
const startGameModal = document.querySelector(".start-game")
const gameOverModal = document.querySelector(".game-over")
const restartButton = document.querySelector(".btn-restart")

const highScoreElement = document.querySelector("#high-score")
const scoreElement = document.querySelector("#score")
const timeElement = document.querySelector("#time")

const blockHeight = 15
const blockWidth = 15

let highScore = parseInt(localStorage.getItem("highScore") || 0)
let score = 0;
let seconds = 0;
let timerIntervalId = null;
let nextDirection = 'down';


highScoreElement.innerText = highScore;

let cols, rows;
let intervalId = null;
let food;

const blocks = []
let snake = [{
    x: 1, y: 3
}
]
let direction = 'down'


document.addEventListener("DOMContentLoaded", () => {
    cols = Math.floor(board.clientWidth / blockWidth);
    rows = Math.floor(board.clientHeight / blockHeight);

    food = spawnFood(); 

for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        const block = document.createElement('div');
        block.classList.add("block")
        board.appendChild(block);
        blocks[`${row}-${col}`] = block
    }
}
 blocks[`${food.x}-${food.y}`].classList.add("food");
});


function spawnFood() {
    let pos;
    do {
        pos = {
            x: Math.floor(Math.random() * rows),
            y: Math.floor(Math.random() * cols)
        };
    } while (snake && snake.some(seg => seg.x === pos.x && seg.y === pos.y));
    return pos;
}


function render() {
    direction = nextDirection; // apply buffered direction

    let head;
    if (direction === 'left')       head = { x: snake[0].x,     y: snake[0].y - 1 };
    else if (direction === 'right') head = { x: snake[0].x,     y: snake[0].y + 1 };
    else if (direction === 'down')  head = { x: snake[0].x + 1, y: snake[0].y     };
    else if (direction === 'up')    head = { x: snake[0].x - 1, y: snake[0].y     };

    // WALL COLLISION LOGIC

   if (head.x < 0 || head.x >= rows || head.y < 0 || head.y >= cols) {
        endGame();
        return;
    }

    if (snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        endGame();
        return;
    }

    // FOOD COMSUME LOGIC

snake.forEach(seg => blocks[`${seg.x}-${seg.y}`].classList.remove("fill"));

if (head.x === food.x && head.y === food.y) {
    snake.unshift(head); // tail mat hatao — snake bade

    blocks[`${food.x}-${food.y}`].classList.remove("food");
    food = spawnFood();
    blocks[`${food.x}-${food.y}`].classList.add("food");

    score += 10;
    scoreElement.innerText = score;

    if (score > highScore) {
        highScore = score;
        highScoreElement.innerText = highScore;
        localStorage.setItem("highScore", highScore.toString());
    }
} else {
    snake.unshift(head);
    snake.pop();
}

snake.forEach(seg => blocks[`${seg.x}-${seg.y}`].classList.add("fill"));
blocks[`${food.x}-${food.y}`].classList.add("food");

}

function startTimer() {
    seconds = 0;
    timerIntervalId = setInterval(() => {
        seconds++;
        const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
        const ss = String(seconds % 60).padStart(2, '0');
        timeElement.innerText = `${mm}-${ss}`;
    }, 1000);
}

function endGame() {
    clearInterval(intervalId);
    clearInterval(timerIntervalId);
    intervalId = null;

    modal.style.display = "flex";
    startGameModal.style.display = "none";
    gameOverModal.style.display = "flex";
}

function restartGame() {

    clearInterval(intervalId);
    clearInterval(timerIntervalId);

    blocks[`${food.x}-${food.y}`].classList.remove("food");
    snake.forEach(seg => blocks[`${seg.x}-${seg.y}`].classList.remove("fill"));

    score = 0;
    scoreElement.innerText = 0;
    timeElement.innerText = "00-00";

    direction = 'down';
    nextDirection = 'down';
    snake = [{ x: 1, y: 3 }];
    food = spawnFood();

    modal.style.display = "none";
    intervalId = setInterval(render, 150);
    startTimer();
}

startButton.addEventListener("click", () => {
    modal.style.display = "none";
    intervalId = setInterval(render, 300);
    startTimer();
});

restartButton.addEventListener("click", restartGame);


addEventListener("keydown", (event) => {
    if      (event.key === 'ArrowLeft'  && direction !== 'right') nextDirection = 'left';
    else if (event.key === 'ArrowRight' && direction !== 'left')  nextDirection = 'right';
    else if (event.key === 'ArrowDown'  && direction !== 'up')    nextDirection = 'down';
    else if (event.key === 'ArrowUp'    && direction !== 'down')  nextDirection = 'up';
});

// TOUCH CONTROL

document.getElementById('btn-up').addEventListener('click', () => {
    if (direction !== 'down') nextDirection = 'up';
});
document.getElementById('btn-down').addEventListener('click', () => {
    if (direction !== 'up') nextDirection = 'down';
});
document.getElementById('btn-left').addEventListener('click', () => {
    if (direction !== 'right') nextDirection = 'left';
});
document.getElementById('btn-right').addEventListener('click', () => {
    if (direction !== 'left') nextDirection = 'right';
});


// Swipe controls
let touchStartX = 0;
let touchStartY = 0;

addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
}, { passive: true });

addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return; // tap ignore

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0 && direction !== 'left')  nextDirection = 'right';
        else if (dx < 0 && direction !== 'right') nextDirection = 'left';
    } else {
        if (dy > 0 && direction !== 'up')   nextDirection = 'down';
        else if (dy < 0 && direction !== 'down') nextDirection = 'up';
    }
}, { passive: true });