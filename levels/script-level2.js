const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const messageElement = document.getElementById("message");
const restartButton = document.getElementById("restartButton");

const bombImage = new Image();
bombImage.src = '../images/bomb.png'; 

const flagImage = new Image();
flagImage.src = '../images/flag1.png'; 

const timerElement = document.createElement("div");
document.body.insertBefore(timerElement, canvas); // Добавляем секундомер в DOM

const gridSize = 20;
const cellSize = 30;
const mineCount = 40;

const bombImageWidth = 25; // ширина изображения бомбы
const bombImageHeight = 25; // высота изображения бомбы

const flagImageWidth = 22; // ширина изображения флага
const flagImageHeight = 22; // высота изображения флага

let grid = [];
let revealed = [];
let flagged = [];
let gameOver = false;
let remainingCells;

let startTime = null;
let timerInterval = null;

function initGame() {
    // Сброс и начальная настройка секундомера
    timerElement.textContent = "Time: 00:00:00";
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
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const milliseconds = Math.floor((elapsed % 1000) / 10);
        timerElement.textContent = `Time: ${pad(minutes, 2)}:${pad(seconds, 2)}:${pad(milliseconds, 2)}`;
    }
}

function pad(number, length) {
    return number.toString().padStart(length, '0');
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            ctx.fillStyle = revealed[i][j] ? "#ddd" : "#aaa";
            ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            ctx.strokeStyle = "#fff";
            ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);

            if (flagged[i][j] && !revealed[i][j]) {
                ctx.drawImage(flagImage, i * cellSize, j * cellSize, flagImageWidth, flagImageHeight);
            }

            if (revealed[i][j]) {
                if (grid[i][j] === 'B') {
                    ctx.drawImage(bombImage, i * cellSize, j * cellSize, bombImageWidth, bombImageHeight);
                } else if (grid[i][j] > 0) {
                    ctx.fillStyle = getColorForNumber(grid[i][j]);
                    ctx.fillText(grid[i][j], i * cellSize + cellSize / 2 - 5, j * cellSize + cellSize / 2 + 5);
                }
            }

            if (gameOver && grid[i][j] === 'B' && !revealed[i][j]) {
                // Бомбы не отображаются, если в клетке есть флаг
                if (!flagged[i][j]) {
                    ctx.drawImage(bombImage, i * cellSize, j * cellSize, bombImageWidth, bombImageHeight);
                }
            }
        }
    }
}

function getColorForNumber(number) {
    switch (number) {
        case 1: return "black";
        case 2: return "green";
        case 3: return "red";
        case 4: return "purple";
        case 5: return "maroon";
        case 6: return "teal";
        case 7: return "navy";
        default: return "black";
    }
}

function reveal(x, y) {
    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize || revealed[x][y] || flagged[x][y]) {
        return;
    }

    if (startTime === null) {
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 10); 
    }

    revealed[x][y] = true;
    remainingCells--;

    if (grid[x][y] === 'B') {
        gameOver = true;
        messageElement.textContent = "YOU LOSE!";
        clearInterval(timerInterval);
        draw(); 
        return;
    } else if (remainingCells === 0) {
        messageElement.textContent = "YOU WIN!";
        clearInterval(timerInterval); 
    } else if (grid[x][y] === 0) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                reveal(x + dx, y + dy);
            }
        }
    }
    draw();
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
