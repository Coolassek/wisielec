const canvas = document.getElementById('hangman-canvas');
const ctx = canvas.getContext('2d');
const wordDisplay = document.getElementById('word-display');
const attemptsDisplay = document.getElementById('attempts-left');
const guessInput = document.getElementById('guess-input');
const guessButton = document.getElementById('guess-button');
const messageDisplay = document.getElementById('message');
const restartButton = document.getElementById('restart');


let selectedWord;
let attemptsLeft;
let guessedWord;
let guessedLetters;

async function getRandomWordFromAPI() {
    const backupWords = ['apple', 'banana', 'cherry', 'grape', 'orange', 'pear', 'peach', 'watermelon', 'blueberry'];

    try {
        const response = await fetch('https://random-word-api.herokuapp.com/wor');
        const data = await response.json();
        return data[0];
    } catch (error) {
        console.warn('Błąd API, używam słowa zapasowego:', error);
        return backupWords[Math.floor(Math.random() * backupWords.length)];
    }
}


function startGame() {
    getRandomWordFromAPI().then(word => {
        selectedWord = word.toLowerCase();
        attemptsLeft = 10;
        guessedWord = Array(selectedWord.length).fill('_');
        guessedLetters = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateDisplay();
        messageDisplay.textContent = '';
        restartButton.style.display = 'none';
        guessButton.disabled = false;
    });
}

function updateDisplay() {
    wordDisplay.textContent = guessedWord.join(' ');
    attemptsDisplay.textContent = `Attempts left: ${attemptsLeft}`;
}

function handleGuess() {
    const guess = guessInput.value.trim().toLowerCase();
    guessInput.value = '';
    if (guess.length !== 1 || !/^[a-ząćęłńóśźż]$/.test(guess)) {
        messageDisplay.textContent = 'Only letters!';
        return;
    }
    if (guessedLetters.includes(guess)) {
        messageDisplay.textContent = 'That letter has already been used!';
        return;
    }

    guessedLetters.push(guess);
    if (selectedWord.includes(guess)) {
        for (let i = 0; i < selectedWord.length; i++) {
            if (selectedWord[i] === guess) guessedWord[i] = guess;
        }
    } else {
        attemptsLeft--;
        drawHangman();
    }

    updateDisplay();
    checkGameOver();
}

function drawHangman() {
    const drawSteps = [
        () => { ctx.moveTo(10, 280); ctx.lineTo(190, 280); }, 
        () => { ctx.moveTo(50, 280); ctx.lineTo(50, 20); },   
        () => { ctx.moveTo(50, 20); ctx.lineTo(150, 20); },   
        () => { ctx.moveTo(150, 20); ctx.lineTo(150, 50); },  
        () => { ctx.arc(150, 70, 20, 0, Math.PI * 2); },      
        () => { ctx.moveTo(150, 90); ctx.lineTo(150, 170); },
        () => { ctx.moveTo(150, 100); ctx.lineTo(180, 130); },
        () => { ctx.moveTo(150, 100); ctx.lineTo(120, 130); },
        () => { ctx.moveTo(150, 170); ctx.lineTo(180, 210); },
        () => { ctx.moveTo(150, 170); ctx.lineTo(120, 210); }
    ];

    const stepIndex = 9 - attemptsLeft;
    if ( stepIndex >= 0 ) {
        ctx.beginPath();
        drawSteps[stepIndex]();
        ctx.stroke();
    }

}

let confettiInterval;

function startConfetti() {
    confettiInterval = setInterval(() => {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = `${Math.random() * 100}vw`;
        confetti.style.top = `-${Math.random() * 20 + 10}vh`; 
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        confetti.style.animationDuration = `${Math.random() * 1 + 1.5}s`;
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 2000);
    }, 50);
}

function stopConfetti() {
    clearInterval(confettiInterval);
    document.querySelectorAll('.confetti').forEach(confetti => confetti.remove());
}

function checkGameOver() {
    if (!guessedWord.includes('_')) {
        messageDisplay.textContent = 'Congrats!';
        winSound.play();
        startConfetti();
        restartButton.style.display = 'inline-block';
        guessButton.disabled = true;
    } else if (attemptsLeft === 0) {
        messageDisplay.textContent = `Game over! Hidden word: ${selectedWord}`;
        loseSound.play();
        restartButton.style.display = 'inline-block';
        guessButton.disabled = true;
    }
}

const winSound = new Audio('sounds/win.wav');
const loseSound = new Audio('sounds/lose.wav');

restartButton.addEventListener('click', () => {
    stopConfetti();
    startGame();
});

guessButton.addEventListener('click', handleGuess);
guessInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleGuess();
    }
});
startGame();
