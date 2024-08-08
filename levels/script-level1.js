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

const gridSize = 10;
const cellSize = 40;
const mineCount = 10;

const bombImageWidth = 35; // ширина изображения бомбы
const bombImageHeight = 35; // высота изображения бомбы

const flagImageWidth = 35; // ширина изображения бомбы
const flagImageHeight = 35; // высота изображения бомбы

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
            if (revealed[i][j] || (gameOver && grid[i][j] === 'B')) { // Отображаем бомбы при gameOver
                if (grid[i][j] === 'B') {
                     // Рисуем изображение бомбы на всю клетку
                    ctx.drawImage(bombImage, 
                        0, 0, bombImage.width, bombImage.height, // Используем исходные размеры изображения
                        i * cellSize, j * cellSize, bombImageWidth, bombImageHeight // Размеры на канвасе
                    );               
                } else if (grid[i][j] > 0) {
                    // Устанавливаем цвет для цифр в зависимости от значения
                    switch (grid[i][j]) {
                        case 1:
                            ctx.fillStyle = "black"; // Цвет для 1
                            break;
                        case 2:
                            ctx.fillStyle = "green"; // Цвет для 2
                            break;
                        case 3:
                            ctx.fillStyle = "red"; // Цвет для 4
                            break;
                        case 4:
                            ctx.fillStyle = "purple"; // Цвет для 5
                            break;
                        case 5:
                            ctx.fillStyle = "maroon"; // Цвет для 6
                            break;
                        case 6:
                            ctx.fillStyle = "teal"; // Цвет для 7
                            break;
                        case 7:
                            ctx.fillStyle = "navy"; // Цвет для 8
                            break;
                        default:
                            ctx.fillStyle = "black"; // Цвет по умолчанию
                    }
                    ctx.fillText(grid[i][j], i * cellSize + cellSize / 2 - 5, j * cellSize + cellSize / 2 + 5);
                }
            }
            if (flagged[i][j] && !revealed[i][j]) {
                ctx.drawImage(flagImage, 
                        0, 0, flagImage.width, flagImage.height, // Используем исходные размеры изображения
                        i * cellSize, j * cellSize, flagImageWidth, flagImageHeight // Размеры на канвасе
                );
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
        draw(); // Перерисовываем поле, чтобы показать все бомбы
        return;
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
