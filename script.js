// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBUbayvLiyEgeijJhf5cqFs8zj6pw-rLIU",
    authDomain: "yugchat2-ce66e.firebaseapp.com",
    databaseURL: "https://yugchat2-ce66e-default-rtdb.firebaseio.com",
    projectId: "yugchat2-ce66e",
    storageBucket: "yugchat2-ce66e.firebasestorage.app",
    messagingSenderId: "66223203581",
    appId: "1:66223203581:web:841a53dba9f41e349f8a94"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Game constants
const BOARD_SIZE = 15;
const CELL_SIZE = 30;
const STONE_RADIUS = 12;

// DOM Elements
const homePage = document.getElementById('homePage');
const modePage = document.getElementById('modePage');
const waitingPage = document.getElementById('waitingPage');
const onlineGamePage = document.getElementById('onlineGamePage');
const howToPlayPage = document.getElementById('howToPlayPage');
const helpPage = document.getElementById('helpPage');
const gamePage = document.getElementById('gamePage');

// Home Page Buttons
const playBtn = document.getElementById('playBtn');
const howToPlayBtn = document.getElementById('howToPlayBtn');
const helpBtn = document.getElementById('helpBtn');

// Mode Selection Buttons
const onlineBtn = document.getElementById('onlineBtn');
const computerBtn = document.getElementById('computerBtn');
const offlineBtn = document.getElementById('offlineBtn');
const backToHomeBtn = document.getElementById('backToHomeBtn');

// Online Buttons
const cancelOnlineBtn = document.getElementById('cancelOnlineBtn');
const quitOnlineGameBtn = document.getElementById('quitOnlineGameBtn');
const onlineBackToMenuBtn = document.getElementById('onlineBackToMenuBtn');
const onlinePlayAgainBtn = document.getElementById('onlinePlayAgainBtn');
const onlineResetBtn = document.getElementById('onlineResetBtn');
const onlineUndoBtn = document.getElementById('onlineUndoBtn');

// Back Buttons
const backFromHowToPlayBtn = document.getElementById('backFromHowToPlayBtn');
const backFromHelpBtn = document.getElementById('backFromHelpBtn');

// Game Buttons
const quitGameBtn = document.getElementById('quitGameBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');

// Game Elements (Offline)
const canvas = document.getElementById('gameBoard');
const ctx = canvas.getContext('2d');
const currentPlayerDisplay = document.getElementById('currentPlayer');
const gameStatusDisplay = document.getElementById('gameStatus');
const blackScoreDisplay = document.getElementById('blackScore');
const whiteScoreDisplay = document.getElementById('whiteScore');
const resetBtn = document.getElementById('resetBtn');
const undoBtn = document.getElementById('undoBtn');
const winnerModal = document.getElementById('winnerModal');
const winnerMessage = document.getElementById('winnerMessage');
const playAgainBtn = document.getElementById('playAgainBtn');

// Game Elements (Online)
const onlineCanvas = document.getElementById('onlineGameBoard');
const onlineCtx = onlineCanvas.getContext('2d');
const onlineCurrentPlayerDisplay = document.getElementById('onlineCurrentPlayer');
const onlineGameStatusDisplay = document.getElementById('onlineGameStatus');
const onlineBlackScoreDisplay = document.getElementById('onlineBlackScore');
const onlineWhiteScoreDisplay = document.getElementById('onlineWhiteScore');
const onlineWinnerModal = document.getElementById('onlineWinnerModal');
const onlineWinnerMessage = document.getElementById('onlineWinnerMessage');

// Game state (Offline)
let board = [];
let currentPlayer = 'black'; // 'black' or 'white'
let gameActive = true;
let moveHistory = [];
let scores = { black: 0, white: 0 };
let gameMode = 'offline'; // 'online', 'computer', 'offline'
let computerThinking = false; // Flag to prevent human moves while computer is thinking

// Game state (Online)
let onlineBoard = [];
let onlineCurrentPlayer = 'black';
let onlineGameActive = true;
let onlineMoveHistory = [];
let onlineScores = { black: 0, white: 0 };
let onlineGameId = null;
let onlinePlayerId = null; // Unique ID for this player
let onlinePlayerColor = null; // 'black' or 'white'
let onlineOpponentConnected = false;
let matchmakingTimeout = null;

// Page Navigation Functions
function showPage(page) {
    // Hide all pages
    homePage.classList.remove('active');
    modePage.classList.remove('active');
    waitingPage.classList.remove('active');
    onlineGamePage.classList.remove('active');
    howToPlayPage.classList.remove('active');
    helpPage.classList.remove('active');
    gamePage.classList.remove('active');
    
    // Show requested page
    page.classList.add('active');
}

// Set canvas dimensions
function setCanvasSize() {
    const size = (BOARD_SIZE - 1) * CELL_SIZE + 40;
    canvas.width = size;
    canvas.height = size;
    onlineCanvas.width = size;
    onlineCanvas.height = size;
}

// Initialize the offline game board
function initBoard() {
    board = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        board[i] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            board[i][j] = null;
        }
    }
    moveHistory = [];
    gameActive = true;
    currentPlayer = 'black';
    computerThinking = false;
    updateUI();
}

// Initialize the online game board
function initOnlineBoard() {
    onlineBoard = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        onlineBoard[i] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            onlineBoard[i][j] = null;
        }
    }
    onlineMoveHistory = [];
    onlineGameActive = true;
    onlineCurrentPlayer = 'black';
    updateOnlineUI();
}

// Draw the game board (Offline)
function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw wooden background
    ctx.fillStyle = '#deb887';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.2;
    
    const offset = 20;
    
    // Draw horizontal lines
    for (let i = 0; i < BOARD_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(offset, offset + i * CELL_SIZE);
        ctx.lineTo(offset + (BOARD_SIZE - 1) * CELL_SIZE, offset + i * CELL_SIZE);
        ctx.stroke();
    }
    
    // Draw vertical lines
    for (let j = 0; j < BOARD_SIZE; j++) {
        ctx.beginPath();
        ctx.moveTo(offset + j * CELL_SIZE, offset);
        ctx.lineTo(offset + j * CELL_SIZE, offset + (BOARD_SIZE - 1) * CELL_SIZE);
        ctx.stroke();
    }
    
    // Draw star points (hoshi)
    const starPoints = [3, 7, 11];
    ctx.fillStyle = '#000';
    for (let i of starPoints) {
        for (let j of starPoints) {
            ctx.beginPath();
            ctx.arc(offset + j * CELL_SIZE, offset + i * CELL_SIZE, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Draw stones
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j]) {
                drawStone(ctx, j, i, board[i][j]);
            }
        }
    }
}

// Draw the game board (Online)
function drawOnlineBoard() {
    onlineCtx.clearRect(0, 0, onlineCanvas.width, onlineCanvas.height);
    
    // Draw wooden background
    onlineCtx.fillStyle = '#deb887';
    onlineCtx.fillRect(0, 0, onlineCanvas.width, onlineCanvas.height);
    
    // Draw grid lines
    onlineCtx.strokeStyle = '#000';
    onlineCtx.lineWidth = 1.2;
    
    const offset = 20;
    
    // Draw horizontal lines
    for (let i = 0; i < BOARD_SIZE; i++) {
        onlineCtx.beginPath();
        onlineCtx.moveTo(offset, offset + i * CELL_SIZE);
        onlineCtx.lineTo(offset + (BOARD_SIZE - 1) * CELL_SIZE, offset + i * CELL_SIZE);
        onlineCtx.stroke();
    }
    
    // Draw vertical lines
    for (let j = 0; j < BOARD_SIZE; j++) {
        onlineCtx.beginPath();
        onlineCtx.moveTo(offset + j * CELL_SIZE, offset);
        onlineCtx.lineTo(offset + j * CELL_SIZE, offset + (BOARD_SIZE - 1) * CELL_SIZE);
        onlineCtx.stroke();
    }
    
    // Draw star points (hoshi)
    const starPoints = [3, 7, 11];
    onlineCtx.fillStyle = '#000';
    for (let i of starPoints) {
        for (let j of starPoints) {
            onlineCtx.beginPath();
            onlineCtx.arc(offset + j * CELL_SIZE, offset + i * CELL_SIZE, 3, 0, Math.PI * 2);
            onlineCtx.fill();
        }
    }
    
    // Draw stones
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (onlineBoard[i][j]) {
                drawStone(onlineCtx, j, i, onlineBoard[i][j]);
            }
        }
    }
}

// Draw a stone
function drawStone(context, x, y, color) {
    const offsetX = 20;
    const offsetY = 20;
    const centerX = offsetX + x * CELL_SIZE;
    const centerY = offsetY + y * CELL_SIZE;
    
    // Draw stone
    context.beginPath();
    context.arc(centerX, centerY, STONE_RADIUS, 0, Math.PI * 2);
    
    if (color === 'black') {
        // Black stone with gradient
        const gradient = context.createRadialGradient(
            centerX - 4, centerY - 4, 1,
            centerX, centerY, STONE_RADIUS
        );
        gradient.addColorStop(0, '#555');
        gradient.addColorStop(1, '#000');
        context.fillStyle = gradient;
    } else {
        // White stone with gradient
        const gradient = context.createRadialGradient(
            centerX - 4, centerY - 4, 1,
            centerX, centerY, STONE_RADIUS
        );
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(1, '#ddd');
        context.fillStyle = gradient;
    }
    
    context.fill();
    
    // Draw stone border
    context.strokeStyle = '#333';
    context.lineWidth = 1;
    context.stroke();
}

// Convert mouse coordinates to board coordinates
function getBoardCoordinates(canvas, x, y) {
    const rect = canvas.getBoundingClientRect();
    const offsetX = 20;
    const offsetY = 20;
    
    const boardX = x - rect.left;
    const boardY = y - rect.top;
    
    const gridX = Math.round((boardX - offsetX) / CELL_SIZE);
    const gridY = Math.round((boardY - offsetY) / CELL_SIZE);
    
    if (gridX >= 0 && gridX < BOARD_SIZE && gridY >= 0 && gridY < BOARD_SIZE) {
        return { x: gridX, y: gridY };
    }
    
    return null;
}

// Check if a move is valid
function isValidMove(board, x, y) {
    return board[y][x] === null;
}

// Make a move (Offline)
function makeMove(x, y) {
    if (!gameActive || !isValidMove(board, x, y)) return false;
    
    // Save move to history
    moveHistory.push({ x, y, player: currentPlayer });
    
    // Place stone
    board[y][x] = currentPlayer;
    
    // Check for win
    if (checkWin(board, x, y, currentPlayer)) {
        endGame(currentPlayer);
        return true;
    }
    
    // Check for draw
    if (moveHistory.length === BOARD_SIZE * BOARD_SIZE) {
        endGame(null);
        return true;
    }
    
    // Switch player
    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    updateUI();
    
    // If computer mode and it's computer's turn, make computer move
    if (gameMode === 'computer' && currentPlayer === 'white' && gameActive) {
        setTimeout(makeComputerMove, 50); // Very short delay for better UX
    }
    
    return true;
}

// Make a move (Online)
function makeOnlineMove(x, y) {
    // Check if it's our turn
    if (!onlineGameActive || onlineCurrentPlayer !== onlinePlayerColor) return false;
    
    // Check if move is valid
    if (!isValidMove(onlineBoard, x, y)) return false;
    
    // Save move to history
    onlineMoveHistory.push({ x, y, player: onlineCurrentPlayer });
    
    // Place stone locally
    onlineBoard[y][x] = onlineCurrentPlayer;
    
    // Send move to Firebase
    const moveData = {
        x: x,
        y: y,
        player: onlineCurrentPlayer,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    
    // Update game state in Firebase
    const updates = {};
    updates[`matchmaking/matches/${onlineGameId}/board/${y}/${x}`] = onlineCurrentPlayer;
    updates[`matchmaking/matches/${onlineGameId}/turn`] = onlineCurrentPlayer === 'black' ? 'white' : 'black';
    updates[`matchmaking/matches/${onlineGameId}/moves`] = onlineMoveHistory;
    
    database.ref().update(updates)
        .then(() => {
            console.log('Move sent to Firebase');
        })
        .catch(error => {
            console.error('Error sending move to Firebase:', error);
        });
    
    // Check for win
    if (checkWin(onlineBoard, x, y, onlineCurrentPlayer)) {
        endOnlineGame(onlineCurrentPlayer);
        return true;
    }
    
    // Check for draw
    if (onlineMoveHistory.length === BOARD_SIZE * BOARD_SIZE) {
        endOnlineGame(null);
        return true;
    }
    
    // Switch player locally
    onlineCurrentPlayer = onlineCurrentPlayer === 'black' ? 'white' : 'black';
    updateOnlineUI();
    
    return true;
}

// Check for win condition
function checkWin(board, x, y, player) {
    const directions = [
        [1, 0],   // horizontal
        [0, 1],   // vertical
        [1, 1],   // diagonal /
        [1, -1]   // diagonal \
    ];
    
    for (let [dx, dy] of directions) {
        let count = 1; // Count the current stone
        
        // Check in positive direction
        for (let i = 1; i <= 4; i++) {
            const nx = x + dx * i;
            const ny = y + dy * i;
            if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] === player) {
                count++;
            } else {
                break;
            }
        }
        
        // Check in negative direction
        for (let i = 1; i <= 4; i++) {
            const nx = x - dx * i;
            const ny = y - dy * i;
            if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] === player) {
                count++;
            } else {
                break;
            }
        }
        
        if (count >= 5) {
            return true;
        }
    }
    
    return false;
}

// Undo last move (Offline)
function undoMove() {
    if (moveHistory.length === 0 || !gameActive || computerThinking) return;
    
    const lastMove = moveHistory.pop();
    board[lastMove.y][lastMove.x] = null;
    
    // If it was computer's move, undo one more move (human's move)
    if (lastMove.player === 'white' && gameMode === 'computer' && moveHistory.length > 0) {
        const humanMove = moveHistory.pop();
        board[humanMove.y][humanMove.x] = null;
        currentPlayer = 'black';
    } else {
        // Switch back to previous player
        currentPlayer = lastMove.player;
    }
    
    updateUI();
    drawBoard();
}

// End the game (Offline)
function endGame(winner) {
    gameActive = false;
    computerThinking = false;
    
    if (winner) {
        scores[winner]++;
        winnerMessage.textContent = `${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!`;
        gameStatusDisplay.textContent = `${winner.charAt(0).toUpperCase() + winner.slice(1)} wins the game!`;
    } else {
        winnerMessage.textContent = "It's a draw!";
        gameStatusDisplay.textContent = "Game ended in a draw!";
    }
    
    updateScores();
    winnerModal.style.display = 'flex';
}

// End the game (Online)
function endOnlineGame(winner) {
    onlineGameActive = false;
    
    // Update game status in Firebase
    if (onlineGameId) {
        database.ref(`matchmaking/matches/${onlineGameId}/status`).set('finished');
        
        if (winner) {
            database.ref(`matchmaking/matches/${onlineGameId}/winner`).set(winner);
        }
    }
    
    if (winner) {
        onlineScores[winner]++;
        onlineWinnerMessage.textContent = `${winner.charAt(0).toUpperCase() + winner.slice(1)} wins!`;
        onlineGameStatusDisplay.textContent = `${winner.charAt(0).toUpperCase() + winner.slice(1)} wins the game!`;
    } else {
        onlineWinnerMessage.textContent = "It's a draw!";
        onlineGameStatusDisplay.textContent = "Game ended in a draw!";
    }
    
    updateOnlineScores();
    onlineWinnerModal.style.display = 'flex';
}

// Update UI elements (Offline)
function updateUI() {
    currentPlayerDisplay.textContent = currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1);
    currentPlayerDisplay.style.color = currentPlayer;
    gameStatusDisplay.textContent = `${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}'s turn`;
    
    // Show "Computer thinking..." message
    if (computerThinking) {
        gameStatusDisplay.textContent = "Computer thinking...";
    }
}

// Update UI elements (Online)
function updateOnlineUI() {
    onlineCurrentPlayerDisplay.textContent = onlineCurrentPlayer.charAt(0).toUpperCase() + onlineCurrentPlayer.slice(1);
    onlineCurrentPlayerDisplay.style.color = onlineCurrentPlayer;
    
    // Show appropriate status message
    if (!onlineOpponentConnected) {
        onlineGameStatusDisplay.textContent = "Waiting for opponent...";
    } else if (onlineCurrentPlayer === onlinePlayerColor) {
        onlineGameStatusDisplay.textContent = "Your turn";
    } else {
        onlineGameStatusDisplay.textContent = "Opponent's turn";
    }
}

// Update score displays (Offline)
function updateScores() {
    blackScoreDisplay.textContent = scores.black;
    whiteScoreDisplay.textContent = scores.white;
}

// Update score displays (Online)
function updateOnlineScores() {
    onlineBlackScoreDisplay.textContent = onlineScores.black;
    onlineWhiteScoreDisplay.textContent = onlineScores.white;
}

// Reset the game (Offline)
function resetGame() {
    initBoard();
    drawBoard();
    winnerModal.style.display = 'none';
}

// Reset the game (Online)
function resetOnlineGame() {
    initOnlineBoard();
    drawOnlineBoard();
    onlineWinnerModal.style.display = 'none';
    
    // If we're the game creator, create a new game in Firebase
    if (onlinePlayerColor === 'black' && onlineGameId) {
        // Initialize a new game board
        const newBoard = [];
        for (let i = 0; i < BOARD_SIZE; i++) {
            newBoard[i] = [];
            for (let j = 0; j < BOARD_SIZE; j++) {
                newBoard[i][j] = null;
            }
        }
        
        const gameData = {
            board: newBoard,
            turn: 'black',
            status: 'playing',
            moves: []
        };
        
        database.ref(`matchmaking/matches/${onlineGameId}`).update(gameData);
    }
}

// Start game based on mode
function startGame(mode) {
    gameMode = mode;
    
    if (mode === 'online') {
        startOnlineGame();
    } else {
        showPage(gamePage);
        initBoard();
        setCanvasSize();
        drawBoard();
    }
}

// Start online game
function startOnlineGame() {
    // Generate a unique player ID
    onlinePlayerId = 'player_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    
    showPage(waitingPage);
    
    // Add player to matchmaking
    findMatch();
}

// Find match - Main matchmaking function
function findMatch() {
    console.log('Finding match for player:', onlinePlayerId);
    
    // Add player to waiting list
    const playerRef = database.ref(`matchmaking/waiting/${onlinePlayerId}`);
    playerRef.set({
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
    
    // Set timeout to start vs AI if no opponent found
    matchmakingTimeout = setTimeout(() => {
        console.log('No opponent found, starting vs AI');
        // Remove from waiting list
        database.ref(`matchmaking/waiting/${onlinePlayerId}`).remove();
        
        // Start AI game instead
        startComputerGame();
    }, 10000); // 10 seconds timeout
    
    // Listen for matchmaking updates
    const waitingRef = database.ref('matchmaking/waiting');
    waitingRef.on('value', snapshot => {
        if (!snapshot.exists()) return;
        
        const players = snapshot.val();
        const playerIds = Object.keys(players);
        
        // Look for another waiting player who is not ourselves
        for (const id of playerIds) {
            if (id !== onlinePlayerId) {
                // Found a match! Create game
                createMatch(id);
                // Remove listeners
                waitingRef.off('value');
                // Clear timeout
                clearTimeout(matchmakingTimeout);
                return;
            }
        }
    });
}

// Create match with another player
function createMatch(opponentId) {
    console.log('Creating match between', onlinePlayerId, 'and', opponentId);
    
    // Generate unique game ID
    onlineGameId = 'match_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    
    // Determine player colors (first player is black, second is white)
    const isBlack = onlinePlayerId < opponentId;
    onlinePlayerColor = isBlack ? 'black' : 'white';
    
    // Create initial board
    const initialBoard = [];
    for (let i = 0; i < BOARD_SIZE; i++) {
        initialBoard[i] = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            initialBoard[i][j] = null;
        }
    }
    
    // Create game data
    const matchData = {
        player1: isBlack ? onlinePlayerId : opponentId,
        player2: isBlack ? opponentId : onlinePlayerId,
        board: initialBoard,
        turn: 'black',
        status: 'playing',
        moves: [],
        createdAt: firebase.database.ServerValue.TIMESTAMP
    };
    
    // Save match to database
    database.ref(`matchmaking/matches/${onlineGameId}`).set(matchData)
        .then(() => {
            console.log('Match created:', onlineGameId);
            
            // Remove both players from waiting list
            database.ref(`matchmaking/waiting/${onlinePlayerId}`).remove();
            database.ref(`matchmaking/waiting/${opponentId}`).remove();
            
            // Set up game listeners
            setupGameListeners();
            
            // Show game page
            showPage(onlineGamePage);
            initOnlineBoard();
            setCanvasSize();
            drawOnlineBoard();
            onlineOpponentConnected = true;
            updateOnlineUI();
        })
        .catch(error => {
            console.error('Error creating match:', error);
        });
}

// Set up Firebase listeners for online game
function setupGameListeners() {
    if (!onlineGameId) return;
    
    // Listen for game state updates
    database.ref(`matchmaking/matches/${onlineGameId}`).on('value', snapshot => {
        if (!snapshot.exists()) return;
        
        const gameData = snapshot.val();
        
        // Update board
        if (gameData.board) {
            onlineBoard = gameData.board;
        }
        
        // Update turn
        if (gameData.turn) {
            onlineCurrentPlayer = gameData.turn;
        }
        
        // Update moves
        if (gameData.moves) {
            onlineMoveHistory = gameData.moves;
        }
        
        // Check game status
        if (gameData.status === 'finished') {
            // Game is finished, check for winner
            if (gameData.winner) {
                endOnlineGame(gameData.winner);
            } else {
                endOnlineGame(null);
            }
            return;
        }
        
        // Redraw board and update UI
        drawOnlineBoard();
        updateOnlineUI();
    });
}

// Start computer game as fallback
function startComputerGame() {
    // Switch to computer mode
    gameMode = 'computer';
    
    // Show offline game page
    showPage(gamePage);
    initBoard();
    setCanvasSize();
    drawBoard();
    
    // Show message that no opponent was found
    alert('No opponent found. Starting game against computer.');
}

// Handle disconnection
function handleDisconnect() {
    if (onlinePlayerId) {
        // Remove player from waiting list
        database.ref(`matchmaking/waiting/${onlinePlayerId}`).remove();
    }
    
    if (onlineGameId) {
        // Remove game listeners
        database.ref(`matchmaking/matches/${onlineGameId}`).off('value');
    }
}

// Ultra-fast Computer AI - Simple but effective
function makeComputerMove() {
    if (!gameActive || currentPlayer !== 'white' || gameMode !== 'computer') return;
    
    computerThinking = true;
    updateUI();
    
    // Use very short setTimeout to allow UI to update before computation
    setTimeout(() => {
        const move = getSimpleComputerMove();
        
        if (move) {
            makeMove(move.x, move.y);
        }
        
        computerThinking = false;
        updateUI();
        drawBoard();
    }, 10);
}

// Ultra-simple but effective computer move selection
function getSimpleComputerMove() {
    // 1. Check for immediate win
    const winMove = findImmediateWin('white');
    if (winMove) return winMove;
    
    // 2. Check for immediate block
    const blockMove = findImmediateWin('black');
    if (blockMove) return blockMove;
    
    // 3. Find a good strategic move
    const strategicMove = findSimpleStrategicMove();
    if (strategicMove) return strategicMove;
    
    // 4. Fallback to random move near existing stones
    return getRandomMoveNearStones() || getRandomCenterMove();
}

// Find immediate winning or blocking move
function findImmediateWin(player) {
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] === null) {
                board[y][x] = player;
                if (checkWin(board, x, y, player)) {
                    board[y][x] = null;
                    return { x, y };
                }
                board[y][x] = null;
            }
        }
    }
    return null;
}

// Simple strategic move selection
function findSimpleStrategicMove() {
    let bestScore = -1;
    let bestMove = null;
    
    // Only check a limited number of positions to keep it fast
    const positionsToCheck = getLimitedPositions();
    
    for (const {x, y} of positionsToCheck) {
        if (board[y][x] === null) {
            const score = simpleEvaluatePosition(x, y);
            if (score > bestScore) {
                bestScore = score;
                bestMove = { x, y };
            }
        }
    }
    
    return bestMove;
}

// Get a limited set of positions to check (much faster)
function getLimitedPositions() {
    const positions = [];
    
    // Focus on positions near existing stones
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] !== null) {
                // Check adjacent positions
                for (let dy = -2; dy <= 2; dy++) {
                    for (let dx = -2; dx <= 2; dx++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
                            // Add position if not already in list
                            if (!positions.some(pos => pos.x === nx && pos.y === ny)) {
                                positions.push({ x: nx, y: ny });
                            }
                        }
                    }
                }
            }
        }
    }
    
    // If no positions near stones, use center area
    if (positions.length === 0) {
        for (let y = 6; y <= 8; y++) {
            for (let x = 6; x <= 8; x++) {
                positions.push({ x, y });
            }
        }
    }
    
    return positions;
}

// Simple position evaluation (much faster)
function simpleEvaluatePosition(x, y) {
    let score = 0;
    
    // Prefer center positions
    const center = Math.floor(BOARD_SIZE / 2);
    const distanceToCenter = Math.abs(x - center) + Math.abs(y - center);
    score += Math.max(0, 10 - distanceToCenter);
    
    // Simple pattern checking (only immediate neighbors)
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
    
    for (let [dx, dy] of directions) {
        let blackCount = 0;
        let whiteCount = 0;
        
        // Check one step in each direction
        for (let i = -1; i <= 1; i++) {
            if (i === 0) continue; // Skip the center position
            const nx = x + dx * i;
            const ny = y + dy * i;
            if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE) {
                if (board[ny][nx] === 'black') blackCount++;
                else if (board[ny][nx] === 'white') whiteCount++;
            }
        }
        
        // Score based on simple patterns
        if (whiteCount >= 3) score += 1000; // Good for computer
        else if (blackCount >= 3) score += 800; // Block human
        else if (whiteCount >= 2) score += 100;
        else if (blackCount >= 2) score += 80;
        else if (whiteCount >= 1) score += 10;
        else if (blackCount >= 1) score += 5;
    }
    
    return score;
}

// Get random move near existing stones
function getRandomMoveNearStones() {
    const moves = [];
    
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            if (board[y][x] !== null) {
                // Check adjacent positions
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue; // Skip the center
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < BOARD_SIZE && ny >= 0 && ny < BOARD_SIZE && board[ny][nx] === null) {
                            // Add move if not already in list
                            if (!moves.some(move => move.x === nx && move.y === ny)) {
                                moves.push({ x: nx, y: ny });
                            }
                        }
                    }
                }
            }
            // Limit search to prevent too much computation
            if (moves.length > 20) break;
        }
        if (moves.length > 20) break;
    }
    
    return moves.length > 0 ? moves[Math.floor(Math.random() * moves.length)] : null;
}

// Get random move in center area
function getRandomCenterMove() {
    const moves = [];
    for (let y = 5; y <= 9; y++) {
        for (let x = 5; x <= 9; x++) {
            if (board[y][x] === null) {
                moves.push({ x, y });
            }
        }
    }
    return moves.length > 0 ? moves[Math.floor(Math.random() * moves.length)] : null;
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Event Listeners for Navigation
    playBtn.addEventListener('click', () => showPage(modePage));
    howToPlayBtn.addEventListener('click', () => showPage(howToPlayPage));
    helpBtn.addEventListener('click', () => showPage(helpPage));

    // Mode Selection
    onlineBtn.addEventListener('click', () => startGame('online'));
    computerBtn.addEventListener('click', () => startGame('computer'));
    offlineBtn.addEventListener('click', () => startGame('offline'));

    // Back Navigation
    backToHomeBtn.addEventListener('click', () => showPage(homePage));
    backFromHowToPlayBtn.addEventListener('click', () => showPage(homePage));
    backFromHelpBtn.addEventListener('click', () => showPage(homePage));

    // Online Game Controls
    cancelOnlineBtn.addEventListener('click', () => {
        // Cancel online game search
        showPage(modePage);
        handleDisconnect();
        clearTimeout(matchmakingTimeout);
    });
    
    quitOnlineGameBtn.addEventListener('click', () => {
        showPage(modePage);
        handleDisconnect();
    });
    
    onlineBackToMenuBtn.addEventListener('click', () => {
        showPage(homePage);
        handleDisconnect();
    });
    
    onlinePlayAgainBtn.addEventListener('click', () => {
        onlineWinnerModal.style.display = 'none';
        resetOnlineGame();
    });
    
    onlineResetBtn.addEventListener('click', () => {
        resetOnlineGame();
    });
    
    onlineUndoBtn.addEventListener('click', () => {
        // In online mode, we can only undo our own moves
        // This would require more complex implementation with Firebase
        // For now, we'll just reset the game
        resetOnlineGame();
    });

    // Offline Game Controls
    resetBtn.addEventListener('click', resetGame);
    undoBtn.addEventListener('click', undoMove);
    quitGameBtn.addEventListener('click', () => showPage(homePage));
    backToMenuBtn.addEventListener('click', () => showPage(homePage));
    
    // Winner Modal Buttons
    playAgainBtn.addEventListener('click', () => {
        winnerModal.style.display = 'none';
        resetGame();
    });

    // Game Board Events (Offline)
    canvas.addEventListener('click', function(e) {
        if (!gameActive || computerThinking) return;
        
        // In computer mode, only allow human (black) to make moves
        if (gameMode === 'computer' && currentPlayer !== 'black') return;
        
        const coords = getBoardCoordinates(canvas, e.clientX, e.clientY);
        if (coords) {
            if (makeMove(coords.x, coords.y)) {
                drawBoard();
            }
        }
    });

    // Game Board Events (Online)
    onlineCanvas.addEventListener('click', function(e) {
        if (!onlineGameActive || !onlineOpponentConnected) return;
        
        // Only allow player to make moves when it's their turn
        if (onlineCurrentPlayer !== onlinePlayerColor) return;
        
        const coords = getBoardCoordinates(onlineCanvas, e.clientX, e.clientY);
        if (coords) {
            if (makeOnlineMove(coords.x, coords.y)) {
                drawOnlineBoard();
            }
        }
    });

    // Touch events for mobile (Offline)
    canvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (!gameActive || computerThinking) return;
        
        // In computer mode, only allow human (black) to make moves
        if (gameMode === 'computer' && currentPlayer !== 'black') return;
        
        const touch = e.touches[0];
        const coords = getBoardCoordinates(canvas, touch.clientX, touch.clientY);
        if (coords) {
            if (makeMove(coords.x, coords.y)) {
                drawBoard();
            }
        }
    });

    // Touch events for mobile (Online)
    onlineCanvas.addEventListener('touchstart', function(e) {
        e.preventDefault();
        if (!onlineGameActive || !onlineOpponentConnected) return;
        
        // Only allow player to make moves when it's their turn
        if (onlineCurrentPlayer !== onlinePlayerColor) return;
        
        const touch = e.touches[0];
        const coords = getBoardCoordinates(onlineCanvas, touch.clientX, touch.clientY);
        if (coords) {
            if (makeOnlineMove(coords.x, coords.y)) {
                drawOnlineBoard();
            }
        }
    });

    // Keyboard support for desktop testing
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space') {
            // Spacebar for undo
            if (gamePage.classList.contains('active')) {
                undoMove();
            }
        }
    });

    // Handle window resize
    window.addEventListener('resize', function() {
        setCanvasSize();
        if (gamePage.classList.contains('active')) {
            drawBoard();
        }
        if (onlineGamePage.classList.contains('active')) {
            drawOnlineBoard();
        }
    });

    // Handle page unload/disconnect
    window.addEventListener('beforeunload', function() {
        handleDisconnect();
    });

    // Initialize the game
    setCanvasSize();
    initBoard();
    drawBoard();
});