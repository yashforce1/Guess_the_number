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

    const rankedGames = [...gameHistory].sort((first, second) => {
        const attemptsDifference = first.attempts - second.attempts;
        if (attemptsDifference !== 0) return attemptsDifference;

        return Date.parse(second.completedAt) - Date.parse(first.completedAt);
    });

    rankedGames.forEach((game, index) => {
        const row = document.createElement('div');
        row.className = 'history-entry';
        row.setAttribute('role', 'listitem');

        const line = document.createElement('div');
        line.className = 'history-line';

        const rank = document.createElement('span');
        rank.className = 'history-rank';
        rank.textContent = `Rank ${index + 1}`;

        const gameDate = document.createElement('time');
        gameDate.className = 'history-date';
        gameDate.dateTime = game.completedAt;
        gameDate.textContent = formatGameDate(game.completedAt);

        const details = document.createElement('span');
        details.className = 'history-details';
        details.textContent = `Game ${index + 1} · Guesses: ${game.attempts} · Score: ${game.score} pts · ${game.won ? 'Won' : 'Lost'}`;

        line.append(rank, gameDate, details);
        row.append(line);
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
