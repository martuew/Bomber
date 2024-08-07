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

const bombCounterElement = document.createElement("div");
bombCounterElement.style.position = "absolute";
bombCounterElement.style.top = "10px";
bombCounterElement.style.left = "10px";
bombCounterElement.style.fontSize = "20px";
bombCounterElement.style.color = "black";
document.body.insertBefore(bombCounterElement, canvas); // Добавляем счётчик бомб в DOM

const gridSize = 10;
const cellSize = 40;
const mineCount = 15;

const bombImageWidth = 35; // ширина изображения бомбы
const bombImageHeight = 35; // высота изображения бомбы

const flagImageWidth = 32; // ширина изображения флага
const flagImageHeight = 32; // высота изображения флага

let grid = [];
let revealed = [];
let flagged = [];
let gameOver = false;
let remainingCells;
let remainingMines; // Переменная для отслеживания количества оставшихся мин
let flagLimit = mineCount; // Лимит на количество флагов

let startTime = null;
let timerInterval = null;

function initGame() {
    // Сброс и начальная настройка секундомера
    timerElement.textContent = "Time: 0.00s";
    bombCounterElement.textContent = `Flags left: ${flagLimit}`; // Инициализация счётчика флагов
    startTime = null;
    if (timerInterval) clearInterval(timerInterval);

    grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(0));
    revealed = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
    flagged = Array(gridSize).fill(null).map(() => Array(gridSize).fill(false));
    gameOver = false;
    remainingCells = gridSize * gridSize - mineCount;
    remainingMines = mineCount; // Установка начального количества мин
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

function updateBombCounter() {
    bombCounterElement.textContent = `Flags left: ${flagLimit}`; // Обновляем счётчик флагов
}

function pad(number, length) {
    return number.toString().padStart(length, '0');
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            // Фон ячейки
            ctx.fillStyle = revealed[i][j] ? "#ddd" : "#aaa";
            ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            ctx.strokeStyle = "#fff";
            ctx.strokeRect(i * cellSize, j * cellSize, cellSize, cellSize);

            // Если ячейка помечена флагом и не открыта
            if (flagged[i][j] && !revealed[i][j]) {
                ctx.drawImage(flagImage, i * cellSize, j * cellSize, flagImageWidth, flagImageHeight);
            }

            // Если ячейка открыта
            if (revealed[i][j]) {
                if (grid[i][j] === 'B') {
                    // Если это бомба
                    ctx.drawImage(bombImage, i * cellSize, j * cellSize, bombImageWidth, bombImageHeight);
                } else if (grid[i][j] > 0) {
                    // Если это число
                    ctx.fillStyle = getColorForNumber(grid[i][j]);
                    ctx.fillText(grid[i][j], i * cellSize + cellSize / 2 - 5, j * cellSize + cellSize / 2 + 5);
                }
            }

            // Показать все бомбы, если игра закончена (поражение)
            if (gameOver && grid[i][j] === 'B' && !revealed[i][j]) {
                if (!flagged[i][j]) {
                    // Показать бомбу только если на ней нет флага
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
        if (checkWinCondition()) {
            messageElement.textContent = "YOU WIN!";
            clearInterval(timerInterval); // Останавливаем секундомер
        }
    } else if (grid[x][y] === 0) {
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                reveal(x + dx, y + dy);
            }
        }
    }
    draw(); // перемещено сюда
}

function updateFlaggedCells(x, y) {
    if (flagged[x][y]) {
        remainingMines--; // Уменьшаем количество оставшихся бомб
        flagLimit--; // Уменьшаем лимит флагов
    } else {
        remainingMines++; // Увеличиваем количество оставшихся бомб
        flagLimit++; // Увеличиваем лимит флагов
    }
    updateBombCounter();
    if (checkWinCondition()) {
        messageElement.textContent = "YOU WIN!";
        gameOver = true;
        clearInterval(timerInterval);
        draw();
    }
}

function checkWinCondition() {
    // Проверяем, установлены ли флаги на всех бомбах
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            if (grid[i][j] === 'B' && !flagged[i][j]) {
                return false;
            }
        }
    }
    return true;
}

canvas.addEventListener("click", function(e) {
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    reveal(x, y);
    draw(); // вызов draw
});

canvas.addEventListener("contextmenu", function(e) {
    e.preventDefault();
    if (gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    if (flagLimit > 0) { // Только если еще не исчерпан лимит флагов
        flagged[x][y] = !flagged[x][y];
        updateFlaggedCells(x, y); // Обновляем счётчик оставшихся бомб и проверяем условие выигрыша
        draw();
    }
});

ctx.font = "20px Arial";
initGame();
