// ===== 1. HTML Elements =====
const gameBoard = document.getElementById("game-board");
const movesDisplay = document.getElementById("moves");
const timerDisplay = document.getElementById("timer");
const pairsDisplay = document.getElementById("pairs");
const restartButton = document.getElementById("restart-btn");
const messageDisplay = document.getElementById("message");

// ===== 2. Emoji Pairs =====
const emojis = [
    "🍓", "🍕", "🐱", "🐼",
    "🍦", "🍩", "🐸", "🦋"
];

// ===== 3. Game Variables =====
let flippedCards = [];
let moves = 0;
let matchedPairs = 0;
let seconds = 0;
let timerInterval = null;
let mismatchTimeout = null;
let lockBoard = false;
let gameStarted = false;
let gameOver = false;
let celebrationTimeout = null;

// ===== 4. Shuffle Cards =====
function shuffleCards(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

// ===== 5. Timer =====
function startTimer() {
    if (gameStarted || gameOver) return;

    gameStarted = true;

    timerInterval = setInterval(() => {
        seconds++;

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        timerDisplay.textContent =
            String(minutes).padStart(2, "0") + ":" +
            String(remainingSeconds).padStart(2, "0");
    }, 1000);
}

// ===== 6. Create Card =====
function createCard(emoji) {
    const card = document.createElement("button");

    card.type = "button";
    card.classList.add("card");
    card.dataset.emoji = emoji;
    card.setAttribute("aria-label", "Hidden card");

    const front = document.createElement("span");
    front.classList.add("card-face", "card-front");
    front.textContent = "🍬";
    front.setAttribute("aria-hidden", "true");

    const back = document.createElement("span");
    back.classList.add("card-face", "card-back");
    back.textContent = emoji;
    back.setAttribute("aria-hidden", "true");

    card.append(front, back);

    card.addEventListener("click", () => {
        flipCard(card);
    });

    return card;
}

// ===== 7. Start / Restart Game =====
function startGame() {
    clearInterval(timerInterval);
    clearTimeout(mismatchTimeout);
    clearTimeout(celebrationTimeout);

    const oldRain = document.getElementById("candy-rain");

    if (oldRain) oldRain.remove();

    messageDisplay.classList.remove("win-celebration");

    moves = 0;
    matchedPairs = 0;
    seconds = 0;
    flippedCards = [];
    lockBoard = false;
    gameStarted = false;
    gameOver = false;
    timerInterval = null;
    mismatchTimeout = null;
    celebrationTimeout = null;

    movesDisplay.textContent = "0";
    timerDisplay.textContent = "00:00";
    pairsDisplay.textContent = "0 / 8";
    messageDisplay.textContent = "Ready? Let's play!";

    gameBoard.innerHTML = "";

    const shuffledEmojis = shuffleCards([
        ...emojis,
        ...emojis
    ]);

    shuffledEmojis.forEach((emoji) => {
        gameBoard.appendChild(createCard(emoji));
    });
}

// ===== 8. Flip Card =====
function flipCard(card) {
    if (lockBoard || gameOver) return;

    if (
        card.classList.contains("flipped") ||
        card.classList.contains("matched")
    ) {
        return;
    }

    startTimer();

    card.classList.add("flipped");
    card.setAttribute("aria-label", card.dataset.emoji);

    flippedCards.push(card);

    if (flippedCards.length === 2) {
        moves++;
        movesDisplay.textContent = moves;

        checkMatch();
    }
}

// ===== 9. Check Match =====
function checkMatch() {
    const firstCard = flippedCards[0];
    const secondCard = flippedCards[1];

    if (firstCard.dataset.emoji === secondCard.dataset.emoji) {
        handleMatch(firstCard, secondCard);
    } else {
        handleMismatch(firstCard, secondCard);
    }
}

// ===== 10. Matching Pair =====
function handleMatch(firstCard, secondCard) {
    firstCard.classList.add("matched");
    secondCard.classList.add("matched");

    firstCard.disabled = true;
    secondCard.disabled = true;

    firstCard.setAttribute("aria-label", "Matched " + firstCard.dataset.emoji);
    secondCard.setAttribute("aria-label", "Matched " + secondCard.dataset.emoji);

    matchedPairs++;
    pairsDisplay.textContent = matchedPairs + " / 8";

    flippedCards = [];

    if (matchedPairs === emojis.length) {
        gameOver = true;
        clearInterval(timerInterval);

        messageDisplay.textContent =
            "You won! 🏆 Time: " +
            timerDisplay.textContent +
            " | Moves: " + moves;

        celebrateWin();
    } else {
        messageDisplay.textContent = "Great job! 🎉";
    }
}

// ===== 11. Non-Matching Pair =====
function handleMismatch(firstCard, secondCard) {
    lockBoard = true;
    messageDisplay.textContent = "Not a match! Try again.";

    mismatchTimeout = setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");

        firstCard.setAttribute("aria-label", "Hidden card");
        secondCard.setAttribute("aria-label", "Hidden card");

        flippedCards = [];
        lockBoard = false;
        mismatchTimeout = null;

        messageDisplay.textContent = "Keep going! 💪";
    }, 800);
}

// ===== 12. Candy Rain Celebration =====
function celebrateWin() {
    const oldRain = document.getElementById("candy-rain");

    if (oldRain) oldRain.remove();

    const rain = document.createElement("div");
    rain.id = "candy-rain";
    rain.setAttribute("aria-hidden", "true");

    document.body.appendChild(rain);

    const candies = [
        "🍬", "🍭", "🍫", "🍡",
        "🍬", "🍭", "✨", "⭐", "💖"
    ];

    // Create 65 falling candy pieces
    for (let i = 0; i < 65; i++) {
        const candy = document.createElement("span");

        candy.classList.add("falling-candy");

        candy.textContent =
            candies[Math.floor(Math.random() * candies.length)];

        candy.style.setProperty(
            "--left",
            Math.random() * 100 + "%"
        );

        candy.style.setProperty(
            "--size",
            (20 + Math.random() * 24) + "px"
        );

        candy.style.setProperty(
            "--duration",
            (3 + Math.random() * 3) + "s"
        );

        candy.style.setProperty(
            "--delay",
            (Math.random() * 1.5) + "s"
        );

        rain.appendChild(candy);
    }

    messageDisplay.classList.remove("win-celebration");

    // Restart the message animation
    void messageDisplay.offsetWidth;

    messageDisplay.classList.add("win-celebration");

    celebrationTimeout = setTimeout(() => {
        rain.remove();
        messageDisplay.classList.remove("win-celebration");
        celebrationTimeout = null;
    }, 8000);
}

// ===== 13. Restart Button =====
restartButton.addEventListener("click", startGame);

// ===== 14. Start Game =====
startGame();
