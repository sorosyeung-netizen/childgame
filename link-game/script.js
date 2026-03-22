const fruits = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🥝', '🍌', '🍉', '🍍', '🥭', '🍐', '🫐', '🍈', '🥥'];
const BOARD_SIZE = 8;
const BASE_TIME = 120;

const levels = [
    { level: 1, time: 120, fruitTypes: 8, obstacles: 0, targetScore: 500 },
    { level: 2, time: 110, fruitTypes: 10, obstacles: 2, targetScore: 800 },
    { level: 3, time: 100, fruitTypes: 12, obstacles: 4, targetScore: 1200 },
    { level: 4, time: 90, fruitTypes: 14, obstacles: 6, targetScore: 1600 },
    { level: 5, time: 80, fruitTypes: 16, obstacles: 8, targetScore: 2000 }
];

const achievementList = [
    { id: 'first_win', name: '初次勝利', desc: '完成第1關', icon: '🎉' },
    { id: 'combo_5', name: '連擊新手', desc: '達成5連擊', icon: '⚡' },
    { id: 'combo_10', name: '連擊大師', desc: '達成10連擊', icon: '🔥' },
    { id: 'speed_demon', name: '閃電手速', desc: '5秒內完成配對', icon: '💨' },
    { id: 'level_3', name: '關卡達人', desc: '到達第3關', icon: '🎯' },
    { id: 'level_5', name: '遊戲大師', desc: '通關第5關', icon: '👑' },
    { id: 'score_5000', name: '高分玩家', desc: '總分達到5000', icon: '🏆' },
    { id: 'no_hint', name: '獨立思考', desc: '不使用提示過關', icon: '🧠' },
    { id: 'perfect', name: '完美通關', desc: '獲得3星評價', icon: '⭐' },
    { id: 'bomb_master', name: '爆破專家', desc: '使用炸彈消除10個', icon: '💣' }
];

let board = [];
let selectedCell = null;
let score = 0;
let combo = 1;
let timeLeft = BASE_TIME;
let timer = null;
let hintCount = 3;
let shuffleCount = 3;
let isGameOver = false;
let currentLevel = 1;
let totalScore = 0;
let maxCombo = 0;
let hintUsed = false;
let bombCount = 1;
let bombTotalRemoved = 0;
let freezeCount = 1;
let magicCount = 1;
let isFrozen = false;
let frozenTimer = null;
let matchStartTime = 0;
let unlockedAchievements = JSON.parse(localStorage.getItem('linkGameAchievements') || '[]');
let newAchievementsThisGame = [];

const gameBoard = document.getElementById('game-board');
const scoreText = document.getElementById('score-text');
const comboText = document.getElementById('combo-text');
const timerText = document.getElementById('timer-text');
const totalScoreText = document.getElementById('total-score-text');
const levelText = document.getElementById('level-text');
const levelProgressBar = document.getElementById('level-progress-bar');
const feedbackArea = document.getElementById('feedback-area');
const hintBtn = document.getElementById('hint-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const bombBtn = document.getElementById('bomb-btn');
const freezeBtn = document.getElementById('freeze-btn');
const magicBtn = document.getElementById('magic-btn');
const hintCountEl = document.getElementById('hint-count');
const shuffleCountEl = document.getElementById('shuffle-count');
const bombCountEl = document.getElementById('bomb-count');
const freezeCountEl = document.getElementById('freeze-count');
const magicCountEl = document.getElementById('magic-count');
const restartBtn = document.getElementById('restart-btn');
const achievementBtn = document.getElementById('achievement-btn');
const gameOverOverlay = document.getElementById('game-over-overlay');
const achievementOverlay = document.getElementById('achievement-overlay');
const resultTitle = document.getElementById('result-title');
const finalScore = document.getElementById('final-score');
const levelReached = document.getElementById('level-reached');
const starsEl = document.getElementById('stars');
const newAchievementsEl = document.getElementById('new-achievements');
const playAgainBtn = document.getElementById('play-again-btn');
const nextLevelBtn = document.getElementById('next-level-btn');
const achievementListEl = document.getElementById('achievement-list');
const closeAchievementBtn = document.getElementById('close-achievement-btn');
const achievementPopup = document.getElementById('achievement-popup');

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const sounds = {
        select: () => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.15);
        },
        match: () => {
            [523, 659, 784].forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);
                gain.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.2);
                osc.start(audioCtx.currentTime + i * 0.1);
                osc.stop(audioCtx.currentTime + i * 0.1 + 0.2);
            });
        },
        combo: () => {
            const baseFreq = 784 + (combo * 50);
            [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2].forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(Math.min(freq, 2000), audioCtx.currentTime + i * 0.06);
                gain.gain.setValueAtTime(0.25, audioCtx.currentTime + i * 0.06);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.06 + 0.12);
                osc.start(audioCtx.currentTime + i * 0.06);
                osc.stop(audioCtx.currentTime + i * 0.06 + 0.12);
            });
        },
        wrong: () => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(200, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.3);
        },
        victory: () => {
            [523, 659, 784, 1047, 1319].forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.12);
                gain.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.12);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.12 + 0.25);
                osc.start(audioCtx.currentTime + i * 0.12);
                osc.stop(audioCtx.currentTime + i * 0.12 + 0.25);
            });
        },
        levelUp: () => {
            [523, 659, 784, 1047, 1319, 1568].forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.08);
                gain.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.08 + 0.15);
                osc.start(audioCtx.currentTime + i * 0.08);
                osc.stop(audioCtx.currentTime + i * 0.08 + 0.15);
            });
        },
        bomb: () => {
            for (let i = 0; i < 5; i++) {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(150 - i * 20, audioCtx.currentTime + i * 0.05);
                gain.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.05);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.05 + 0.2);
                osc.start(audioCtx.currentTime + i * 0.05);
                osc.stop(audioCtx.currentTime + i * 0.05 + 0.2);
            }
        },
        freeze: () => {
            [1200, 1400, 1600, 1800].forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);
                gain.gain.setValueAtTime(0.15, audioCtx.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.3);
                osc.start(audioCtx.currentTime + i * 0.1);
                osc.stop(audioCtx.currentTime + i * 0.1 + 0.3);
            });
        },
        magic: () => {
            [400, 600, 800, 1000, 800, 600, 400].forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.08);
                gain.gain.setValueAtTime(0.2, audioCtx.currentTime + i * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.08 + 0.15);
                osc.start(audioCtx.currentTime + i * 0.08);
                osc.stop(audioCtx.currentTime + i * 0.08 + 0.15);
            });
        },
        achievement: () => {
            [784, 988, 1175, 1480].forEach((freq, i) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.1);
                gain.gain.setValueAtTime(0.25, audioCtx.currentTime + i * 0.1);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.1 + 0.2);
                osc.start(audioCtx.currentTime + i * 0.1);
                osc.stop(audioCtx.currentTime + i * 0.1 + 0.2);
            });
        },
        shuffle: () => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(300, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.2);
            osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.4);
            gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.5);
        }
    };
    
    if (sounds[type]) {
        sounds[type]();
    }
}

function initGame(startLevel = 1) {
    currentLevel = startLevel;
    totalScore = 0;
    newAchievementsThisGame = [];
    startLevelGame();
}

function startLevelGame() {
    const levelConfig = levels[currentLevel - 1];
    
    board = [];
    selectedCell = null;
    score = 0;
    combo = 1;
    maxCombo = 0;
    timeLeft = levelConfig.time;
    hintCount = 3;
    shuffleCount = 3;
    bombCount = 1;
    bombTotalRemoved = 0;
    freezeCount = 1;
    magicCount = 1;
    isGameOver = false;
    hintUsed = false;
    isFrozen = false;
    
    if (frozenTimer) {
        clearTimeout(frozenTimer);
        frozenTimer = null;
    }
    
    updateDisplay();
    generateBoard();
    renderBoard();
    startTimer();
    
    gameOverOverlay.style.display = 'none';
    achievementOverlay.style.display = 'none';
    
    feedbackArea.innerHTML = `<span style="color: #FFD700;">🎮 關卡 ${currentLevel} 開始！</span>`;
    playSound('levelUp');
}

function generateBoard() {
    const levelConfig = levels[currentLevel - 1];
    const totalCells = BOARD_SIZE * BOARD_SIZE;
    const obstacleCount = levelConfig.obstacles;
    const fruitCells = totalCells - obstacleCount;
    const pairsNeeded = fruitCells / 2;
    const fruitPairs = [];
    
    const availableFruits = fruits.slice(0, levelConfig.fruitTypes);
    
    for (let i = 0; i < pairsNeeded; i++) {
        const fruit = availableFruits[i % availableFruits.length];
        fruitPairs.push(fruit, fruit);
    }
    
    shuffleArray(fruitPairs);
    
    const obstaclePositions = [];
    while (obstaclePositions.length < obstacleCount) {
        const pos = Math.floor(Math.random() * totalCells);
        if (!obstaclePositions.includes(pos)) {
            obstaclePositions.push(pos);
        }
    }
    
    let fruitIdx = 0;
    for (let row = 0; row < BOARD_SIZE; row++) {
        board[row] = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cellIdx = row * BOARD_SIZE + col;
            if (obstaclePositions.includes(cellIdx)) {
                board[row][col] = '🪨';
            } else {
                board[row][col] = fruitPairs[fruitIdx++];
            }
        }
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function renderBoard() {
    gameBoard.innerHTML = '';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            const content = board[row][col];
            if (content) {
                if (content === '🪨') {
                    cell.classList.add('obstacle');
                    cell.textContent = content;
                } else {
                    cell.textContent = content;
                    cell.onclick = () => handleCellClick(row, col);
                }
            } else {
                cell.classList.add('empty');
            }
            
            gameBoard.appendChild(cell);
        }
    }
}

function handleCellClick(row, col) {
    if (isGameOver || !board[row][col] || board[row][col] === '🪨') return;
    
    if (!matchStartTime) {
        matchStartTime = Date.now();
    }
    
    const cell = getCellElement(row, col);
    
    if (selectedCell) {
        if (selectedCell.row === row && selectedCell.col === col) {
            cell.classList.remove('selected');
            selectedCell = null;
            return;
        }
        
        if (board[row][col] === board[selectedCell.row][selectedCell.col]) {
            if (canConnect(selectedCell.row, selectedCell.col, row, col)) {
                const timeTaken = (Date.now() - matchStartTime) / 1000;
                matchStartTime = 0;
                
                if (timeTaken <= 5) {
                    checkAchievement('speed_demon');
                }
                
                playSound('match');
                matchCells(selectedCell.row, selectedCell.col, row, col);
                return;
            } else {
                playSound('wrong');
                feedbackArea.innerHTML = '<span style="color: #f44336;">❌ 無法連接！再試一次！</span>';
            }
        } else {
            playSound('wrong');
            feedbackArea.innerHTML = '<span style="color: #f44336;">❌ 水果不同！</span>';
        }
        
        getCellElement(selectedCell.row, selectedCell.col).classList.remove('selected');
        selectedCell = null;
        
        cell.classList.add('selected');
        selectedCell = { row, col };
        playSound('select');
    } else {
        cell.classList.add('selected');
        selectedCell = { row, col };
        playSound('select');
        matchStartTime = Date.now();
    }
}

function getCellElement(row, col) {
    return gameBoard.children[row * BOARD_SIZE + col];
}

function canConnect(r1, c1, r2, c2) {
    if (r1 === r2 && c1 === c2) return false;
    
    const visited = new Set();
    const queue = [[r1, c1, 0, -1]];
    visited.add(`${r1},${c1}`);
    
    const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    
    while (queue.length > 0) {
        const [r, c, turns, lastDir] = queue.shift();
        
        for (let d = 0; d < 4; d++) {
            const [dr, dc] = directions[d];
            const newTurns = lastDir === -1 || lastDir === d ? turns : turns + 1;
            
            if (newTurns > 2) continue;
            
            let nr = r + dr;
            let nc = c + dc;
            
            while (nr >= -1 && nr <= BOARD_SIZE && nc >= -1 && nc <= BOARD_SIZE) {
                if (nr === r2 && nc === c2) {
                    return true;
                }
                
                if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE) {
                    if (board[nr][nc] && board[nr][nc] !== '🪨') break;
                }
                
                const key = `${nr},${nc},${newTurns},${d}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push([nr, nc, newTurns, d]);
                }
                
                nr += dr;
                nc += dc;
            }
        }
    }
    
    return false;
}

function matchCells(r1, c1, r2, c2) {
    const cell1 = getCellElement(r1, c1);
    const cell2 = getCellElement(r2, c2);
    
    createParticles(cell1);
    createParticles(cell2);
    
    cell1.classList.add('matched');
    cell2.classList.add('matched');
    
    setTimeout(() => {
        board[r1][c1] = null;
        board[r2][c2] = null;
        cell1.classList.remove('selected', 'matched');
        cell2.classList.remove('selected', 'matched');
        cell1.classList.add('empty');
        cell2.classList.add('empty');
        cell1.textContent = '';
        cell2.textContent = '';
        cell1.onclick = null;
        cell2.onclick = null;
        
        score += 10 * combo;
        combo++;
        if (combo > maxCombo) maxCombo = combo;
        
        if (combo >= 6) {
            playSound('combo');
            feedbackArea.innerHTML = `<span style="color: #FFD700;">🔥 ${combo - 1}連擊！</span>`;
            if (combo >= 6) checkAchievement('combo_5');
            if (combo >= 11) checkAchievement('combo_10');
        }
        
        updateDisplay();
        checkWin();
        
        if (!isGameOver && !hasValidMoves()) {
            setTimeout(() => {
                if (shuffleCount > 0) {
                    feedbackArea.innerHTML = '<span style="color: #FF9800;">沒有可消除的配對了！自動重排...</span>';
                    shuffleBoard();
                } else {
                    endGame(false);
                }
            }, 500);
        }
    }, 400);
    
    selectedCell = null;
}

function createParticles(cell) {
    const rect = cell.getBoundingClientRect();
    const colors = ['#FF6B6B', '#FFE66D', '#4ECDC4', '#FF9F43', '#A8E6CF', '#FF8ED4'];
    
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${rect.left + rect.width / 2}px`;
        particle.style.top = `${rect.top + rect.height / 2}px`;
        particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        const angle = (Math.PI * 2 / 12) * i;
        const distance = 50 + Math.random() * 50;
        particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
        particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 800);
    }
}

function hasValidMoves() {
    const cells = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] && board[r][c] !== '🪨') {
                cells.push({ r, c, fruit: board[r][c] });
            }
        }
    }
    
    for (let i = 0; i < cells.length; i++) {
        for (let j = i + 1; j < cells.length; j++) {
            if (cells[i].fruit === cells[j].fruit) {
                if (canConnect(cells[i].r, cells[i].c, cells[j].r, cells[j].c)) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

function findHint() {
    const cells = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] && board[r][c] !== '🪨') {
                cells.push({ r, c, fruit: board[r][c] });
            }
        }
    }
    
    for (let i = 0; i < cells.length; i++) {
        for (let j = i + 1; j < cells.length; j++) {
            if (cells[i].fruit === cells[j].fruit) {
                if (canConnect(cells[i].r, cells[i].c, cells[j].r, cells[j].c)) {
                    return [cells[i], cells[j]];
                }
            }
        }
    }
    
    return null;
}

function showHint() {
    if (hintCount <= 0 || isGameOver) {
        feedbackArea.innerHTML = '<span style="color: #f44336;">提示次數已用完！</span>';
        return;
    }
    
    hintUsed = true;
    const hint = findHint();
    if (hint) {
        hintCount--;
        hintCountEl.textContent = hintCount;
        updateDisplay();
        
        const cell1 = getCellElement(hint[0].r, hint[0].c);
        const cell2 = getCellElement(hint[1].r, hint[1].c);
        
        cell1.classList.add('hint');
        cell2.classList.add('hint');
        
        setTimeout(() => {
            cell1.classList.remove('hint');
            cell2.classList.remove('hint');
        }, 2000);
        
        playSound('select');
        feedbackArea.innerHTML = '<span style="color: #4CAF50;">💡 提示：選擇閃爍的水果！</span>';
    } else {
        feedbackArea.innerHTML = '<span style="color: #FF9800;">沒有可連接的配對了！嘗試重排或結束遊戲</span>';
    }
}

function shuffleBoard() {
    if (shuffleCount <= 0 || isGameOver) return;
    
    shuffleCount--;
    shuffleCountEl.textContent = shuffleCount;
    playSound('shuffle');
    
    const fruits = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] && board[r][c] !== '🪨') {
                fruits.push(board[r][c]);
            }
        }
    }
    
    shuffleArray(fruits);
    
    let idx = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] && board[r][c] !== '🪨') {
                board[r][c] = fruits[idx++];
            }
        }
    }
    
    renderBoard();
    combo = 1;
    updateDisplay();
    
    feedbackArea.innerHTML = '<span style="color: #9C27B0;">🔀 已重新排列！</span>';
}

function useBomb() {
    if (bombCount <= 0 || isGameOver || !selectedCell) {
        feedbackArea.innerHTML = '<span style="color: #f44336;">請先選擇一個水果！</span>';
        return;
    }
    
    bombCount--;
    bombCountEl.textContent = bombCount;
    playSound('bomb');
    
    const { row, col } = selectedCell;
    const targetFruit = board[row][col];
    let removed = 0;
    
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] === targetFruit) {
                const cell = getCellElement(r, c);
                createParticles(cell);
                cell.classList.add('matched');
                setTimeout(() => {
                    board[r][c] = null;
                    cell.classList.remove('matched');
                    cell.classList.add('empty');
                    cell.textContent = '';
                    cell.onclick = null;
                }, 400);
                removed++;
            }
        }
    }
    
    score += removed * 5;
    bombTotalRemoved += removed;
    if (bombTotalRemoved >= 10) {
        checkAchievement('bomb_master');
    }
    
    feedbackArea.innerHTML = `<span style="color: #f44336;">💣 炸彈消除 ${removed} 個水果！</span>`;
    
    selectedCell = null;
    updateDisplay();
    
    setTimeout(() => {
        checkWin();
        if (!isGameOver && !hasValidMoves()) {
            if (shuffleCount > 0) {
                shuffleBoard();
            } else {
                endGame(false);
            }
        }
    }, 500);
}

function useFreeze() {
    if (freezeCount <= 0 || isGameOver) return;
    
    freezeCount--;
    freezeCountEl.textContent = freezeCount;
    playSound('freeze');
    
    isFrozen = true;
    
    const overlay = document.createElement('div');
    overlay.className = 'frozen-overlay';
    document.body.appendChild(overlay);
    
    feedbackArea.innerHTML = '<span style="color: #00BCD4;">❄️ 時間凍結 5 秒！</span>';
    
    frozenTimer = setTimeout(() => {
        isFrozen = false;
        overlay.remove();
        feedbackArea.innerHTML = '<span style="color: #4FC3F7;">時間恢復流動！</span>';
    }, 5000);
}

function useMagic() {
    if (magicCount <= 0 || isGameOver) return;
    
    magicCount--;
    magicCountEl.textContent = magicCount;
    playSound('magic');
    
    const hint = findHint();
    if (hint) {
        const allPairs = [];
        const cells = [];
        
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (board[r][c] && board[r][c] !== '🪨') {
                    cells.push({ r, c, fruit: board[r][c] });
                }
            }
        }
        
        for (let i = 0; i < cells.length; i++) {
            for (let j = i + 1; j < cells.length; j++) {
                if (cells[i].fruit === cells[j].fruit) {
                    if (canConnect(cells[i].r, cells[i].c, cells[j].r, cells[j].c)) {
                        allPairs.push([cells[i], cells[j]]);
                    }
                }
            }
        }
        
        allPairs.slice(0, 3).forEach((pair, idx) => {
            setTimeout(() => {
                const cell1 = getCellElement(pair[0].r, pair[0].c);
                const cell2 = getCellElement(pair[1].r, pair[1].c);
                
                cell1.classList.add('magic-highlight');
                cell2.classList.add('magic-highlight');
                
                setTimeout(() => {
                    cell1.classList.remove('magic-highlight');
                    cell2.classList.remove('magic-highlight');
                }, 2000);
            }, idx * 200);
        });
        
        feedbackArea.innerHTML = '<span style="color: #FF9800;">🔮 魔法顯示了可連接的配對！</span>';
    } else {
        feedbackArea.innerHTML = '<span style="color: #FF9800;">沒有可連接的配對！</span>';
    }
}

function startTimer() {
    if (timer) clearInterval(timer);
    
    timer = setInterval(() => {
        if (!isFrozen) {
            timeLeft--;
        }
        updateDisplay();
        
        if (timeLeft <= 0) {
            endGame(false);
        }
    }, 1000);
}

function updateDisplay() {
    scoreText.textContent = `分數: ${score}`;
    comboText.textContent = `連擊: x${combo}`;
    timerText.textContent = `時間: ${timeLeft}s`;
    totalScoreText.textContent = `總分: ${totalScore + score}`;
    levelText.textContent = `關卡 ${currentLevel}`;
    
    const levelConfig = levels[currentLevel - 1];
    const progress = Math.min(100, (score / levelConfig.targetScore) * 100);
    levelProgressBar.style.width = `${progress}%`;
    
    hintCountEl.textContent = hintCount;
    shuffleCountEl.textContent = shuffleCount;
    bombCountEl.textContent = bombCount;
    freezeCountEl.textContent = freezeCount;
    magicCountEl.textContent = magicCount;
    
    hintBtn.disabled = hintCount <= 0;
    shuffleBtn.disabled = shuffleCount <= 0;
    bombBtn.disabled = bombCount <= 0;
    freezeBtn.disabled = freezeCount <= 0;
    magicBtn.disabled = magicCount <= 0;
}

function checkWin() {
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            if (board[r][c] && board[r][c] !== '🪨') return;
        }
    }
    
    endGame(true);
}

function endGame(won) {
    isGameOver = true;
    clearInterval(timer);
    if (frozenTimer) {
        clearTimeout(frozenTimer);
        isFrozen = false;
    }
    
    totalScore += score;
    
    const levelConfig = levels[currentLevel - 1];
    const starCount = won ? (timeLeft > levelConfig.time * 0.5 ? 3 : timeLeft > levelConfig.time * 0.25 ? 2 : 1) : 0;
    
    if (won) {
        playSound('victory');
        checkAchievement('first_win');
        if (!hintUsed) checkAchievement('no_hint');
        if (starCount === 3) checkAchievement('perfect');
        if (currentLevel >= 3) checkAchievement('level_3');
        if (currentLevel >= 5) checkAchievement('level_5');
        if (totalScore >= 5000) checkAchievement('score_5000');
    } else {
        playSound('wrong');
    }
    
    resultTitle.textContent = won ? '🎉 恭喜過關！' : '⏰ 時間到！';
    finalScore.textContent = `本關分數: ${score} | 總分: ${totalScore}`;
    levelReached.textContent = `到達關卡: ${currentLevel}`;
    starsEl.textContent = '⭐'.repeat(starCount) + '☆'.repeat(3 - starCount);
    
    if (newAchievementsThisGame.length > 0) {
        newAchievementsEl.innerHTML = `🏆 新成就: ${newAchievementsThisGame.join(', ')}`;
    } else {
        newAchievementsEl.innerHTML = '';
    }
    
    const canNextLevel = won && currentLevel < levels.length;
    nextLevelBtn.style.display = canNextLevel ? 'inline-block' : 'none';
    
    gameOverOverlay.style.display = 'flex';
}

function nextLevel() {
    currentLevel++;
    gameOverOverlay.style.display = 'none';
    startLevelGame();
}

function checkAchievement(id) {
    if (unlockedAchievements.includes(id)) return;
    
    const achievement = achievementList.find(a => a.id === id);
    if (!achievement) return;
    
    unlockedAchievements.push(id);
    newAchievementsThisGame.push(achievement.name);
    localStorage.setItem('linkGameAchievements', JSON.stringify(unlockedAchievements));
    
    playSound('achievement');
    achievementPopup.textContent = `🏆 成就解鎖: ${achievement.name}`;
    achievementPopup.classList.add('show');
    
    setTimeout(() => {
        achievementPopup.classList.remove('show');
    }, 3000);
}

function showAchievements() {
    achievementListEl.innerHTML = '';
    
    achievementList.forEach(achievement => {
        const item = document.createElement('div');
        const unlocked = unlockedAchievements.includes(achievement.id);
        item.className = `achievement-item ${unlocked ? 'unlocked' : 'locked'}`;
        item.innerHTML = `
            <div class="icon">${unlocked ? achievement.icon : '🔒'}</div>
            <div class="name">${achievement.name}</div>
            <div class="desc">${achievement.desc}</div>
        `;
        achievementListEl.appendChild(item);
    });
    
    achievementOverlay.style.display = 'flex';
}

hintBtn.onclick = showHint;
shuffleBtn.onclick = shuffleBoard;
bombBtn.onclick = useBomb;
freezeBtn.onclick = useFreeze;
magicBtn.onclick = useMagic;
restartBtn.onclick = () => initGame(1);
playAgainBtn.onclick = () => initGame(1);
nextLevelBtn.onclick = nextLevel;
achievementBtn.onclick = showAchievements;
closeAchievementBtn.onclick = () => {
    achievementOverlay.style.display = 'none';
};

document.addEventListener('DOMContentLoaded', () => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    initGame();
});
