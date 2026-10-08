const MAX_ATTEMPTS = 10;
const HISTORY_KEY = 'numberPlayGameHistory';

let answer = Math.floor(Math.random() * 100) + 1;
let guesses = [];
let attemptsUsed = 0;
let gameEnded = false;
let gameHistory = loadGameHistory();

const guessForm = document.querySelector('.guess-form');
const guessInput = document.getElementById('number');
const submitButton = document.getElementById('submit_guess');
const restartButton = document.getElementById('restart');
const guessesLeft = document.getElementById('count_r');
const feedback = document.getElementById('low_high');
const previousGuesses = document.getElementById('previous_guess');
const historyList = document.getElementById('history-list');
const historyEmpty = document.getElementById('history-empty');

function loadGameHistory() {
    try {
        const savedHistory = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
        return Array.isArray(savedHistory) ? savedHistory.slice(0, 10) : [];
    } catch {
        return [];
    }
}

function renderGameHistory() {
    historyList.replaceChildren();
    historyEmpty.hidden = gameHistory.length > 0;

    gameHistory.forEach((game, index) => {
        const row = document.createElement('li');
        row.className = 'history-entry';

        const gameInfo = document.createElement('div');
        gameInfo.className = 'history-game-info';

        const gameNumber = document.createElement('span');
        gameNumber.className = 'history-game-number';
        gameNumber.textContent = `Game ${index + 1}`;

        const gameDate = document.createElement('time');
        gameDate.className = 'history-date';
        gameDate.dateTime = game.completedAt;
        gameDate.textContent = formatGameDate(game.completedAt);
        gameInfo.append(gameNumber, gameDate);

        const result = document.createElement('span');
        result.className = `result-chip ${game.won ? 'result-win' : 'result-loss'}`;
        result.textContent = game.won ? 'Won' : 'Lost';

        const attempts = document.createElement('span');
        attempts.className = 'history-attempts';
        attempts.textContent = `${game.attempts} ${game.attempts === 1 ? 'guess' : 'guesses'}`;

        const score = document.createElement('span');
        score.className = 'history-score';
        score.textContent = `${game.score} pts`;

        row.append(gameInfo, result, attempts, score);
        historyList.append(row);
    });
}

function formatGameDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';

    return new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
    }).format(date);
}

function saveFinishedGame(won) {
    const score = won ? MAX_ATTEMPTS - attemptsUsed + 1 : 0;
    const finishedGame = {
        completedAt: new Date().toISOString(),
        won,
        attempts: attemptsUsed,
        score,
    };

    gameHistory = [finishedGame, ...gameHistory].slice(0, 10);
    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(gameHistory));
    } catch {
        // Keep this session's history visible even if browser storage is unavailable.
    }
    renderGameHistory();
}

function finishGame(won) {
    gameEnded = true;
    submitButton.disabled = true;
    guessInput.disabled = true;
    saveFinishedGame(won);
}

function handleGuess(event) {
    event.preventDefault();
    if (gameEnded) return;

    const guess = Number(guessInput.value);
    if (!guessInput.value || !Number.isInteger(guess) || guess < 1 || guess > 100) {
        feedback.textContent = 'Please enter a whole number from 1 to 100.';
        feedback.style.color = '#ffcfaa';
        guessInput.focus();
        return;
    }

    guesses.push(guess);
    attemptsUsed += 1;
    previousGuesses.textContent = `[ ${guesses.join(', ')} ]`;

    if (guess === answer) {
        const score = MAX_ATTEMPTS - attemptsUsed + 1;
        feedback.textContent = `You got it! You scored ${score} ${score === 1 ? 'point' : 'points'}.`;
        feedback.style.color = '#8ce2bd';
        guessesLeft.textContent = MAX_ATTEMPTS - attemptsUsed;
        guessInput.value = '';
        finishGame(true);
        return;
    }

    const remaining = MAX_ATTEMPTS - attemptsUsed;
    guessesLeft.textContent = remaining;

    if (remaining === 0) {
        feedback.textContent = `Out of guesses. The number was ${answer}.`;
        feedback.style.color = '#ffcfaa';
        guessInput.value = '';
        finishGame(false);
        return;
    }

    feedback.textContent = guess < answer
        ? `The number is higher than ${guess}. Try again.`
        : `The number is lower than ${guess}. Try again.`;
    feedback.style.color = '#ffcfaa';
    guessInput.value = '';
    guessInput.focus();
}

function startNewGame() {
    answer = Math.floor(Math.random() * 100) + 1;
    guesses = [];
    attemptsUsed = 0;
    gameEnded = false;

    guessesLeft.textContent = MAX_ATTEMPTS;
    previousGuesses.textContent = '—';
    feedback.textContent = 'Start guessing';
    feedback.style.color = '';
    guessInput.value = '';
    guessInput.disabled = false;
    submitButton.disabled = false;
    guessInput.focus();
}

guessForm.addEventListener('submit', handleGuess);
restartButton.addEventListener('click', startNewGame);

renderGameHistory();
