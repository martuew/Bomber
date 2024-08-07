const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const messageElement = document.getElementById("message");
const restartButton = document.getElementById("restartButton");

const timerElement = document.createElement("div");
document.body.insertBefore(timerElement, canvas); // Добавляем секундомер в DOM

const gridSize = 15;
const cellSize = 40;
const mineCount = 25;

let grid = [];
let revealed = [];
let flagged = [];
let gameOver = false;
let remainingCells;

let startTime = null;
let timerInterval = null;

function initGame() {
    // Сброс и начальная настройка секундомера
    timerElement.textContent = "Time: 0.00s";
    startTime = null;
    if (timerInterval) clearInterval(timerInterval);

    grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    revealed = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
    flagged = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
    gameOver = false;
    remainingCells = gridSize * gridSize - mineCount;
    messageElement.textContent = "";

    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        const x = Math.floor(Math.random() * gridSize);
        const y = Math.floor(Math.random() * gridSize);
        if (grid[x][y] !== 'B') {
            grid[x][y] = 'B';
            minesPlaced++;
        }
    }

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 'B') continue;
            let mineCount = 0;
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    const ni = i + dx;
                    const nj = j + dy;
                    if (ni >= 0 && ni < gridSize && nj >= 0 && nj < gridSize && grid[ni][nj] === 'B') {
                        mineCount++;
                    }
                }
            }
            grid[i][j] = mineCount;
        }
    }

    draw();
}

function updateTimer() {
    if (startTime !== null) {
        const elapsed = Date.now() - startTime;
        const seconds = (elapsed / 1000).toFixed(2); // Округление до сотых долей секунды
        timerElement.textContent = `Time: ${seconds}s`;
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            ctx.fillStyle = revealed[i][j] ? "#ddd" : "#aaa";
            ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            ctx.strokeStyle = "#fff";
            ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);
            if (revealed[i][j]) {
                if (grid[i][j] === 'B') {
                    ctx.fillStyle = "red";
                    ctx.fillText("B", i * cellSize + cellSize / 2 - 5, j * cellSize + cellSize / 2 + 5);
                } else if (grid[i][j] > 0) {
                    ctx.fillStyle = "black";
                    ctx.fillText(grid[i][j], i * cellSize + cellSize / 2 - 5, j * cellSize + cellSize / 2 + 5);
                }
            }
            if (flagged[i][j] && !revealed[i][j]) {
                ctx.fillStyle = "blue";
                ctx.fillText("F", i * cellSize + cellSize / 2 - 5, j * cellSize + cellSize / 2 + 5);
            }
        }
    }
}



function reveal(x, y) {
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize || revealed[x][y] || flagged[x][y]) {
        return;
    }

    if (startTime === null) {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 10); // Обновляем таймер каждую десятую секунды
    }

    revealed[x][y] = true;
    remainingCells--;

    if (grid[x][y] === 'B') {
        gameOver = true;
        messageElement.textContent = "YOU LOSE!";
        clearInterval(timerInterval); // Останавливаем секундомер
    } else if (remainingCells === 0) {
        messageElement.textContent = "YOU WIN!";
        clearInterval(timerInterval); // Останавливаем секундомер
    } else if (grid[x][y] === 0) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                reveal(x + dx, y + dy);
            }
        }
    }
    draw();

    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize || revealed[x][y] || flagged[x][y]) {
        return;
    }
    revealed[x][y] = true;
    remainingCells--;

    if (grid[x][y] === 'B') {
        gameOver = true;
        messageElement.textContent = "YOU LOSE!";
    } else if (remainingCells === 0) {
        messageElement.textContent = "YOU WIN!";
    } else if (grid[x][y] === 0) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                reveal(x + dx, y + dy);
            }
        }
    }
}

canvas.addEventListener("click", function(e) {
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    reveal(x, y);
    draw();
});

canvas.addEventListener("contextmenu", function(e) {
    e.preventDefault();
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    flagged[x][y] = !flagged[x][y];
    draw();
});

ctx.font = "20px Arial";
initGame();
