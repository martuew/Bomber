document.addEventListener('DOMContentLoaded', () => {
    const gridSize = 10; // Размер сетки
    const numMines = 10; // Количество мин
    let startTime = null;
    let timerInterval = null;
    let revealed = [];
    let mines = [];
    let gameOver = false;

    const gameContainer = document.getElementById('game-container');
    const timerElement = document.getElementById('timer');
    const startButton = document.getElementById('start-button');

    function initGame() {
        gameContainer.innerHTML = '';
        revealed = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
        mines = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
        gameOver = false;
        startTime = null;
        clearInterval(timerInterval);
        timerElement.textContent = 'Time: 00:00:00';

        // Расставляем мины случайным образом
        for (let i = 0; i < numMines; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * gridSize);
                y = Math.floor(Math.random() * gridSize);
            } while (mines[x][y]);
            mines[x][y] = true;
        }

        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                const cell = document.createElement('div');
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.addEventListener('click', () => reveal(x, y));
                gameContainer.appendChild(cell);
            }
        }

        startButton.disabled = false;
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

    function countMines(x, y) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (x + i >= 0 && x + i < gridSize && y + j >= 0 && y + j < gridSize) {
                    if (mines[x + i][y + j]) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    function reveal(x, y) {
        if (x < 0 || x >= gridSize || y < 0 || y >= gridSize || revealed[x][y] || gameOver) {
            return;
        }

        if (startTime === null) {
            startTime = Date.now();
            timerInterval = setInterval(updateTimer, 10);
        }

        revealed[x][y] = true;
        const cell = gameContainer.children[x * gridSize + y];
        cell.style.backgroundColor = '#bbb';

        if (mines[x][y]) {
            gameOver = true;
            clearInterval(timerInterval);
            cell.style.backgroundColor = 'red';
            showEndMessage('YOU LOSE!');
            return;
        }

        const minesCount = countMines(x, y);

        if (minesCount > 0) {
            cell.textContent = minesCount;
            cell.classList.add(`bomb-${minesCount}`);
        } else {
            // Рекурсивно открываем соседние клетки
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    reveal(x + i, y + j);
                }
            }
        }

        if (checkWin()) {
            gameOver = true;
            clearInterval(timerInterval);
            showEndMessage('YOU WIN!');
        }

        updateDisplay();
    }

    function checkWin() {
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                if (!revealed[x][y] && !mines[x][y]) {
                    return false;
                }
            }
        }
        return true;
    }

    function updateDisplay() {
        // Обновите отображение, если необходимо
    }

    function showEndMessage(message) {
        const endMessage = document.createElement('div');
        endMessage.textContent = message;
        endMessage.className = 'end-message';
        document.body.insertBefore(endMessage, gameContainer);
        
        const restartButton = document.createElement('button');
        restartButton.textContent = 'RESTART';
        restartButton.addEventListener('click', () => {
            document.body.removeChild(endMessage);
            initGame();
        });
        document.body.insertBefore(restartButton, gameContainer);
    }

    startButton.addEventListener('click', initGame);

    initGame();
});
