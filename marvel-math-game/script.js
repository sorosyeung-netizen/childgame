const heroes = [
    { name: "Spider Man", id: "spiderman", icon: "images/spider.jpg", color: "#E23636", secondary: "#01539D", attack: "🕸️", hidden: false, category: "marvel" },
    { name: "Iron Man", id: "ironman", icon: "images/iron.jpg", color: "#AA0505", secondary: "#F1C40F", attack: "⚡", hidden: false, category: "marvel" },
    { name: "Black Panther", id: "panther", icon: "images/bao.jpg", color: "#2c2c2c", secondary: "#6A0DAD", attack: "🗡️", hidden: false, category: "marvel" },
    { name: "Captain America", id: "cap", icon: "images/Captain.jpg", color: "#003366", secondary: "#C0C0C0", attack: "🛡️", hidden: false, category: "marvel" },
    { name: "Boss", id: "boss", icon: "images/boss.jpg", color: "#8B0000", secondary: "#FFD700", attack: "💀", hidden: false, category: "marvel" },
    { name: "Doctor Strange", id: "doctor", icon: "images/doctor.jpg", color: "#4B0082", secondary: "#FFD700", attack: "🔮", hidden: false, category: "marvel" },
    { name: "Hulk", id: "hulk", icon: "images/green.jpg", color: "#006400", secondary: "#8B4513", attack: "💪", hidden: false, category: "marvel" },
    { name: "Thor", id: "thor", icon: "images/thor.jpg", color: "#4169E1", secondary: "#FFD700", attack: "⚡", hidden: false, category: "marvel" },
    { name: "Mario", id: "mario", icon: "images/m3.png", color: "#E52521", secondary: "#FFFFFF", attack: "🍄", hidden: false, category: "mario" },
    { name: "Luigi", id: "luigi", icon: "images/m4.png", color: "#00A651", secondary: "#FFFFFF", attack: "⭐", hidden: false, category: "mario" },
    { name: "Peach", id: "peach", icon: "images/peach.png", color: "#FFB6C1", secondary: "#FF69B4", attack: "👑", hidden: false, category: "mario" },
    { name: "Bowser", id: "bowser", icon: "images/bowser.png", color: "#8B4513", secondary: "#FFD700", attack: "🐢", hidden: false, category: "mario" },
    { name: "Petey Piranha", id: "petey", icon: "images/Petey Piranha.png", color: "#228B22", secondary: "#8B0000", attack: "🌿", hidden: false, category: "mario" },
    { name: "Toadsworth", id: "toadsworth", icon: "images/Toadsworth.png", color: "#DEB887", secondary: "#8B4513", attack: "🍄", hidden: false, category: "mario" },
    { name: "Wario", id: "wario", icon: "images/m5.png", color: "#FFD700", secondary: "#8B0000", attack: "💰", hidden: false, category: "mario" },
    { name: "Mickey", id: "mickey", icon: "images/mouse.jpg", color: "#FF0000", secondary: "#FFFF00", attack: "⭕", hidden: false, category: "other" },
    { name: "Pikachu", id: "pikachu", icon: "images/bikachao.jpg", color: "#FFD700", secondary: "#FF6347", attack: "⚡", hidden: true, category: "pokemon" }
];

let currentScore = 0;
let currentRound = 1;
let currentQuestion = {};
let playerHero = null;
let computerHero = null;
let playerHP = 100;
let computerHP = 100;
let isPlayerTurn = true;
let isGameOver = false;
let defeatedOpponents = [];
let selectedHeroId = null;
let questionStartTime = 0;
let questionTimer = null;
let totalDefeatedCount = parseInt(localStorage.getItem('totalDefeatedCount') || '0');
let pikachuUnlocked = localStorage.getItem('pikachuUnlocked') === 'true';

const questionText = document.getElementById('question-text');
const visualHint = document.getElementById('visual-hint');
const optionsArea = document.getElementById('options-area');
const feedbackArea = document.getElementById('feedback-area');
const scoreText = document.getElementById('score-text');
const roundText = document.getElementById('round-text');
const speakBtn = document.getElementById('speak-btn');
const resetBtn = document.getElementById('reset-btn');

const playerCard = document.getElementById('player-card');
const computerCard = document.getElementById('computer-card');
const playerHeroImg = document.getElementById('player-hero-img');
const computerHeroImg = document.getElementById('computer-hero-img');
const playerName = document.getElementById('player-name');
const computerName = document.getElementById('computer-name');
const playerHPFill = document.getElementById('player-hp-fill');
const computerHPFill = document.getElementById('computer-hp-fill');
const playerHPText = document.getElementById('player-hp');
const computerHPText = document.getElementById('computer-hp');
const damageEffect = document.getElementById('damage-effect');

const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

function playSound(type) {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    if (type === 'correct') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'wrong') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } else if (type === 'spiderman-attack') {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.15);
        osc2.frequency.setValueAtTime(1200, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(3000, audioCtx.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc1.start();
        osc2.start();
        osc1.stop(audioCtx.currentTime + 0.4);
        osc2.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'ironman-attack') {
        const osc = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc2.type = 'square';
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
        osc2.frequency.setValueAtTime(2000, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(4000, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc2.start();
        osc.stop(audioCtx.currentTime + 0.5);
        osc2.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'panther-attack') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1500, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.6, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    } else if (type === 'cap-attack') {
        const osc = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc2.type = 'square';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.setValueAtTime(400, audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(300, audioCtx.currentTime + 0.2);
        osc2.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc2.frequency.setValueAtTime(800, audioCtx.currentTime + 0.1);
        osc2.frequency.setValueAtTime(600, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc2.start();
        osc.stop(audioCtx.currentTime + 0.4);
        osc2.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'boss-attack') {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(80, audioCtx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.2);
        osc2.frequency.setValueAtTime(60, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc1.start();
        osc2.start();
        osc1.stop(audioCtx.currentTime + 0.5);
        osc2.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'doctor-attack') {
        const osc = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sine';
        osc2.type = 'triangle';
        osc.frequency.setValueAtTime(1000, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.3);
        osc.frequency.exponentialRampToValueAtTime(500, audioCtx.currentTime + 0.5);
        osc2.frequency.setValueAtTime(1500, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(3000, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
        osc.start();
        osc2.start();
        osc.stop(audioCtx.currentTime + 0.6);
        osc2.stop(audioCtx.currentTime + 0.6);
    } else if (type === 'hulk-attack') {
        const osc1 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc1.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.6, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'thor-attack') {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.1);
        osc1.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
        osc2.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1600, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc1.start();
        osc2.start();
        osc1.stop(audioCtx.currentTime + 0.5);
        osc2.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'mario-attack') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(330, audioCtx.currentTime);
        osc.frequency.setValueAtTime(392, audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(523, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'luigi-attack') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'peach-attack') {
        const osc = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sine';
        osc2.type = 'triangle';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.2);
        osc2.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc2.start();
        osc.stop(audioCtx.currentTime + 0.5);
        osc2.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'mickey-attack') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.setValueAtTime(400, audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(500, audioCtx.currentTime + 0.2);
        osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'bowser-attack') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'petey-attack') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.setValueAtTime(150, audioCtx.currentTime + 0.2);
        osc.frequency.setValueAtTime(200, audioCtx.currentTime + 0.4);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
    } else if (type === 'toadsworth-attack') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, audioCtx.currentTime);
        osc.frequency.setValueAtTime(500, audioCtx.currentTime + 0.1);
        osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.2);
        osc.frequency.setValueAtTime(700, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    } else if (type === 'wario-attack') {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const osc = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                osc.type = 'square';
                osc.frequency.setValueAtTime(800 + i * 200, audioCtx.currentTime);
                gainNode.gain.setValueAtTime(0.15, audioCtx.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.15);
            }, i * 80);
        }
    } else if (type === 'pikachu-attack') {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(800, audioCtx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(2000, audioCtx.currentTime + 0.1);
        osc1.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.2);
        osc2.frequency.setValueAtTime(1200, audioCtx.currentTime);
        osc2.frequency.exponentialRampToValueAtTime(3000, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc1.start();
        osc2.start();
        osc1.stop(audioCtx.currentTime + 0.4);
        osc2.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'damage') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } else if (type === 'victory') {
        [0, 0.15, 0.3].forEach((delay, i) => {
            const o = audioCtx.createOscillator();
            const g = audioCtx.createGain();
            o.connect(g);
            g.connect(audioCtx.destination);
            o.type = 'sine';
            o.frequency.setValueAtTime([523, 659, 784][i], audioCtx.currentTime + delay);
            g.gain.setValueAtTime(0.3, audioCtx.currentTime + delay);
            g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + delay + 0.3);
            o.start(audioCtx.currentTime + delay);
            o.stop(audioCtx.currentTime + delay + 0.3);
        });
    } else if (type === 'defeat') {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
    }
}

function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'zh-TW';
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    }
}

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function showHeroSelection() {
    const heroGrid = document.getElementById('hero-grid');
    const selectionOverlay = document.getElementById('hero-selection-overlay');
    
    heroGrid.innerHTML = '';
    selectedHeroId = null;
    
    const categories = [
        { id: 'marvel', name: 'Marvel', icon: '🦸‍♂️' },
        { id: 'mario', name: 'Mario', icon: '🍄' },
        { id: 'pokemon', name: 'Pokemon', icon: '⚡' },
        { id: 'other', name: 'Others', icon: '🎮' }
    ];
    
    categories.forEach(cat => {
        const categoryBubble = document.createElement('div');
        categoryBubble.className = 'category-bubble';
        categoryBubble.innerHTML = `
            <div class="category-header">
                <span class="category-icon">${cat.icon}</span>
                <span class="category-name">${cat.name}</span>
            </div>
            <div class="category-heroes" id="category-${cat.id}"></div>
        `;
        heroGrid.appendChild(categoryBubble);
        
        const categoryContainer = document.getElementById(`category-${cat.id}`);
        
        heroes.filter(h => h.category === cat.id).forEach(hero => {
            const heroCard = document.createElement('div');
            heroCard.className = 'hero-select-card';
            heroCard.dataset.heroId = hero.id;
            
            const isLocked = hero.hidden && !pikachuUnlocked;
            
            if (isLocked) {
                heroCard.classList.add('locked');
                const remaining = 3 - totalDefeatedCount;
                heroCard.innerHTML = `
                    <div class="locked-icon">🔒</div>
                    <span>???</span>
                    <span class="unlock-hint">再打敗 ${remaining} 個對手解鎖</span>
                `;
                heroCard.onclick = null;
            } else {
                heroCard.innerHTML = `
                    <img src="${hero.icon}" alt="${hero.name}">
                    <span>${hero.name}</span>
                `;
                heroCard.onclick = () => selectHero(hero.id, heroCard);
            }
            
            categoryContainer.appendChild(heroCard);
        });
    });
    
    selectionOverlay.style.display = 'flex';
}

function selectHero(heroId, cardElement) {
    document.querySelectorAll('.hero-select-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    cardElement.classList.add('selected');
    selectedHeroId = heroId;
}

function startGameWithSelectedHero() {
    if (!selectedHeroId) {
        alert('請先選擇一個英雄！');
        return;
    }
    
    const selectionOverlay = document.getElementById('hero-selection-overlay');
    selectionOverlay.style.display = 'none';
    
    playerHero = heroes.find(h => h.id === selectedHeroId);
    
    selectNewOpponent();
    
    playerHP = 100;
    computerHP = 100;
    currentScore = 0;
    currentRound = 1;
    isGameOver = false;
    defeatedOpponents = [];
    
    updateCardDisplay();
    updateHPDisplay();
    updateScoreDisplay();
    
    generateQuestion();
}

function selectNewOpponent() {
    const availableOpponents = heroes.filter(h => 
        h.id !== playerHero.id && 
        !defeatedOpponents.includes(h.id) &&
        (!h.hidden || pikachuUnlocked)
    );
    
    if (availableOpponents.length === 0) {
        showAllDefeated();
        return;
    }
    
    computerHero = availableOpponents[getRandomNumber(0, availableOpponents.length - 1)];
}

function showAllDefeated() {
    isGameOver = true;
    playSound('victory');
    feedbackArea.innerHTML = '<span class="feedback-correct" style="font-size: 2rem;">🏆 恭喜！你擊敗了所有英雄！</span>';
    speak('太棒了！你是真正的英雄！');
}

function initGame() {
    showHeroSelection();
}

function updateCardDisplay() {
    playerHeroImg.src = playerHero.icon;
    computerHeroImg.src = computerHero.icon;
    playerName.textContent = playerHero.name;
    computerName.textContent = computerHero.name;
}

function updateHPDisplay() {
    playerHPFill.style.width = `${playerHP}%`;
    computerHPFill.style.width = `${computerHP}%`;
    playerHPText.textContent = Math.max(0, playerHP);
    computerHPText.textContent = Math.max(0, computerHP);
    
    playerHPFill.classList.remove('low', 'critical');
    computerHPFill.classList.remove('low', 'critical');
    
    if (playerHP <= 30) {
        playerHPFill.classList.add('critical');
    } else if (playerHP <= 50) {
        playerHPFill.classList.add('low');
    }
    
    if (computerHP <= 30) {
        computerHPFill.classList.add('critical');
    } else if (computerHP <= 50) {
        computerHPFill.classList.add('low');
    }
}

function updateScoreDisplay() {
    scoreText.textContent = `得分: ${currentScore}`;
    roundText.textContent = `回合: ${currentRound}`;
}

function generateQuestion() {
    if (isGameOver) return;
    
    const isAddition = Math.random() > 0.5;
    let num1, num2, answer, operator;

    if (isAddition) {
        num1 = getRandomNumber(0, 5);
        num2 = getRandomNumber(0, 5);
        while (num1 + num2 > 10) {
            num1 = getRandomNumber(0, 5);
            num2 = getRandomNumber(0, 5);
        }
        answer = num1 + num2;
        operator = '+';
    } else {
        num1 = getRandomNumber(1, 10);
        num2 = getRandomNumber(0, num1);
        answer = num1 - num2;
        operator = '-';
    }

    currentQuestion = { num1, num2, answer, operator };
    isPlayerTurn = true;
    
    displayQuestion();
    generateOptions(answer);
    
    setTimeout(() => {
        speak(`${num1} ${operator === '+' ? '加' : '減'} ${num2} 等於多少？`);
    }, 500);
}

function startQuestionTimer() {
}

function stopQuestionTimer() {
}

function updateTimerDisplay() {
}

function handleTimeout() {
    if (isGameOver) return;
    
    playSound('wrong');
    feedbackArea.innerHTML = '<span class="feedback-wrong">⏰ 超時了！被對手攻擊！</span>';
    
    disableOptions();
    
    setTimeout(() => computerAttack(), 500);
}

function disableOptions() {
    const options = optionsArea.querySelectorAll('.option-btn');
    options.forEach(btn => {
        btn.disabled = true;
    });
}

function displayQuestion() {
    const { num1, num2, operator } = currentQuestion;
    questionText.textContent = `${num1} ${operator} ${num2} = ?`;
    
    visualHint.innerHTML = '';
    
    const createIcons = (count, iconSrc) => {
        const container = document.createElement('div');
        container.className = 'icon-group';
        for (let i = 0; i < count; i++) {
            const img = document.createElement('img');
            img.src = iconSrc;
            img.className = 'hint-icon';
            container.appendChild(img);
        }
        return container;
    };

    if (operator === '+') {
        visualHint.appendChild(createIcons(num1, playerHero.icon));
        const opSpan = document.createElement('span');
        opSpan.textContent = ' ➕ ';
        opSpan.style.margin = '0 8px';
        visualHint.appendChild(opSpan);
        visualHint.appendChild(createIcons(num2, playerHero.icon));
    } else {
        visualHint.appendChild(createIcons(num1, playerHero.icon));
        const opSpan = document.createElement('span');
        opSpan.textContent = ' ➖ ';
        opSpan.style.margin = '0 8px';
        visualHint.appendChild(opSpan);
        visualHint.appendChild(createIcons(num2, playerHero.icon));
    }
}

function generateOptions(correctAnswer) {
    optionsArea.innerHTML = '';
    const options = new Set([correctAnswer]);
    
    while (options.size < 4) {
        let wrong = getRandomNumber(0, 10);
        if (wrong !== correctAnswer) {
            options.add(wrong);
        }
    }
    
    const optionsArray = Array.from(options).sort(() => Math.random() - 0.5);
    
    optionsArray.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => checkAnswer(opt, btn);
        optionsArea.appendChild(btn);
    });
}

function checkAnswer(selected, btn) {
    if (isGameOver) return;
    
    stopQuestionTimer();
    disableOptions();
    
    if (selected === currentQuestion.answer) {
        playSound('correct');
        btn.classList.add('correct');
        feedbackArea.innerHTML = '<span class="feedback-correct">✅ 答對了！發動攻擊！</span>';
        setTimeout(() => playerAttack(), 500);
    } else {
        playSound('wrong');
        btn.classList.add('wrong');
        feedbackArea.innerHTML = '<span class="feedback-wrong">❌ 答錯了！換敵人攻擊！</span>';
        
        setTimeout(() => computerAttack(), 800);
    }
}

function playerAttack() {
    if (isGameOver) return;
    
    playSound(playerHero.id + '-attack');
    playerCard.classList.add('attacking');
    
    const damage = getRandomNumber(15, 30);
    
    setTimeout(() => {
        playerCard.classList.remove('attacking');
        showHeroEffect(playerHero.id);
        
        setTimeout(() => {
            computerCard.classList.add('hit');
            playSound('damage');
            
            computerHP = Math.max(0, computerHP - damage);
            updateHPDisplay();
            
            showDamageNumber(damage, computerCard);
            createHitParticles(computerCard, playerHero.id);
            
            const attackName = getAttackName(playerHero.id);
            feedbackArea.innerHTML = `<span class="feedback-attack">⚔️ ${playerHero.name} 使用 ${attackName}攻擊！造成 ${damage} 傷害！</span>`;
            
            setTimeout(() => {
                computerCard.classList.remove('hit');
                
                if (computerHP <= 0) {
                    computerDefeated();
                } else {
                    setTimeout(() => computerAttack(), 1200);
                }
            }, 800);
        }, 600);
    }, 400);
}

function showHeroEffect(heroId) {
    const overlay = document.createElement('div');
    overlay.className = 'hero-effect-overlay effect-fullscreen';
    
    if (heroId === 'ironman') {
        overlay.classList.add('effect-ironman');
        const core = document.createElement('div');
        core.className = 'core';
        overlay.appendChild(core);
        const beam = document.createElement('div');
        beam.className = 'beam';
        overlay.appendChild(beam);
    } else if (heroId === 'spiderman') {
        overlay.classList.add('effect-spiderman');
        for(let i = 0; i < 5; i++) {
            const line = document.createElement('div');
            line.className = 'web-line';
            overlay.appendChild(line);
        }
        const web = document.createElement('div');
        web.className = 'web-net';
        web.textContent = '🕸️';
        overlay.appendChild(web);
    } else if (heroId === 'panther') {
        overlay.classList.add('effect-panther');
        const scratchContainer = document.createElement('div');
        scratchContainer.className = 'scratch-container';
        for(let i = 0; i < 5; i++) {
            const line = document.createElement('div');
            line.className = 'scratch-line';
            scratchContainer.appendChild(line);
        }
        overlay.appendChild(scratchContainer);
    } else if (heroId === 'cap') {
        overlay.classList.add('effect-cap');
        const shield = document.createElement('div');
        shield.className = 'shield';
        overlay.appendChild(shield);
    } else if (heroId === 'hulk') {
        overlay.classList.add('effect-hulk');
        const fist = document.createElement('div');
        fist.className = 'hulk-fist';
        fist.textContent = '👊';
        overlay.appendChild(fist);
    } else if (heroId === 'thor') {
        overlay.classList.add('effect-thor');
        const hammer = document.createElement('div');
        hammer.className = 'thor-hammer';
        hammer.textContent = '🔨';
        overlay.appendChild(hammer);
        for(let i = 0; i < 8; i++) {
            const lightning = document.createElement('div');
            lightning.className = 'lightning';
            overlay.appendChild(lightning);
        }
    } else if (heroId === 'doctor') {
        overlay.classList.add('effect-doctor');
        const portal = document.createElement('div');
        portal.className = 'doctor-portal';
        portal.textContent = '🌀';
        overlay.appendChild(portal);
    } else if (heroId === 'boss') {
        overlay.classList.add('effect-boss');
        for(let i = 0; i < 5; i++) {
                const laser = document.createElement('div');
                laser.className = 'boss-laser';
                const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];
                laser.style.background = colors[i];
                laser.style.animationDelay = `${i * 0.1}s`;
                overlay.appendChild(laser);
            }
    } else if (heroId === 'mario') {
        overlay.classList.add('effect-mario');
        const mushroom = document.createElement('div');
        mushroom.className = 'mario-mushroom';
        mushroom.textContent = '🍄';
        overlay.appendChild(mushroom);
        for(let i = 0; i < 8; i++) {
            const star = document.createElement('div');
            star.className = 'mario-star';
            star.textContent = '⭐';
            star.style.left = `${10 + i * 12}%`;
            star.style.animationDelay = `${i * 0.1}s`;
            overlay.appendChild(star);
        }
    } else if (heroId === 'luigi') {
        overlay.classList.add('effect-luigi');
        const fireball = document.createElement('div');
        fireball.className = 'luigi-fireball';
        fireball.textContent = '🔥';
        overlay.appendChild(fireball);
        for(let i = 0; i < 5; i++) {
            const spark = document.createElement('div');
            spark.className = 'luigi-spark';
            spark.style.animationDelay = `${i * 0.1}s`;
            overlay.appendChild(spark);
        }
    } else if (heroId === 'peach') {
        overlay.classList.add('effect-peach');
        const crown = document.createElement('div');
        crown.className = 'peach-crown';
        crown.textContent = '👑';
        overlay.appendChild(crown);
    } else if (heroId === 'bowser') {
        overlay.classList.add('effect-bowser');
        const shell = document.createElement('div');
        shell.className = 'bowser-shell';
        shell.textContent = '🐢';
        overlay.appendChild(shell);
    } else if (heroId === 'petey') {
        overlay.classList.add('effect-petey');
        const tongue = document.createElement('div');
        tongue.className = 'petey-tongue';
        overlay.appendChild(tongue);
    } else if (heroId === 'toadsworth') {
        overlay.classList.add('effect-toadsworth');
        const spore = document.createElement('div');
        spore.className = 'toadsworth-spore';
        spore.textContent = '🍄';
        overlay.appendChild(spore);
    } else if (heroId === 'wario') {
        overlay.classList.add('effect-wario');
        for (let i = 0; i < 8; i++) {
            const coin = document.createElement('div');
            coin.className = 'wario-coin';
            coin.textContent = '💰';
            coin.style.top = `${20 + Math.random() * 60}%`;
            coin.style.left = `${10 + Math.random() * 80}%`;
            coin.style.animationDelay = `${i * 0.1}s`;
            overlay.appendChild(coin);
        }
    } else if (heroId === 'mickey') {
        overlay.classList.add('effect-mickey');
        const circle = document.createElement('div');
        circle.className = 'mickey-circle';
        overlay.appendChild(circle);
        for(let i = 0; i < 3; i++) {
            const dot = document.createElement('div');
            dot.className = 'mickey-dot';
            dot.style.animationDelay = `${i * 0.15}s`;
            overlay.appendChild(dot);
        }
    } else if (heroId === 'pikachu') {
        overlay.classList.add('effect-pikachu');
        const lightning = document.createElement('div');
        lightning.className = 'pikachu-lightning';
        lightning.textContent = '⚡';
        overlay.appendChild(lightning);
        for(let i = 0; i < 8; i++) {
            const spark = document.createElement('div');
            spark.className = 'pikachu-spark';
            spark.style.left = `${10 + i * 12}%`;
            spark.style.animationDelay = `${i * 0.08}s`;
            overlay.appendChild(spark);
        }
    }
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        if (overlay.parentNode) {
            overlay.parentNode.removeChild(overlay);
        }
    }, 2000);
}

function showDamageNumber(damage, targetCard) {
    const rect = targetCard.getBoundingClientRect();
    const damageEl = document.createElement('div');
    damageEl.className = 'damage-text';
    damageEl.textContent = `-${damage}`;
    damageEl.style.left = `${rect.left + rect.width / 2}px`;
    damageEl.style.top = `${rect.top}px`;
    document.body.appendChild(damageEl);
    
    setTimeout(() => {
        if (damageEl.parentNode) {
            damageEl.parentNode.removeChild(damageEl);
        }
    }, 1000);
}

function createHitParticles(targetCard, heroId) {
    const rect = targetCard.getBoundingClientRect();
    const colors = {
        spiderman: ['#ffffff', '#cccccc', '#999999'],
        ironman: ['#AA0505', '#F1C40F', '#87CEEB'],
        panther: ['#6A0DAD', '#000000', '#9932CC'],
        cap: ['#003366', '#E23636', '#ffffff'],
        boss: ['#8B0000', '#FFD700', '#FF4500'],
        doctor: ['#4B0082', '#9400D3', '#FFD700'],
        hulk: ['#006400', '#8B4513', '#32CD32'],
        thor: ['#4169E1', '#FFD700', '#FFFFFF'],
        mario: ['#E52521', '#FFFFFF', '#FFD700'],
        luigi: ['#00A651', '#FFFFFF', '#90EE90'],
        peach: ['#FFB6C1', '#FF69B4', '#FF1493'],
        bowser: ['#8B4513', '#FFD700', '#FF6347'],
        petey: ['#228B22', '#8B0000', '#32CD32'],
        toadsworth: ['#DEB887', '#8B4513', '#F5DEB3'],
        wario: ['#FFD700', '#8B0000', '#DAA520'],
        mickey: ['#FF0000', '#FFFF00', '#FFFFFF'],
        pikachu: ['#FFD700', '#FF6347', '#FFFF00']
    };
    
    const particleColors = colors[heroId] || ['#ff4444', '#ff0000', '#ffff00'];
    
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.backgroundColor = particleColors[getRandomNumber(0, particleColors.length - 1)];
        particle.style.left = `${rect.left + rect.width / 2}px`;
        particle.style.top = `${rect.top + rect.height / 2}px`;
        
        const angle = (Math.PI * 2 / 12) * i;
        const distance = getRandomNumber(80, 150);
        particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
        particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 800);
    }
}

function getAttackName(heroId) {
    const attacks = {
        spiderman: '蜘蛛絲攻擊',
        ironman: '胸口雷射',
        panther: '爪子撕裂',
        cap: '盾牌反彈',
        boss: '惡魔衝擊',
        doctor: '傳送門',
        hulk: '巨人重拳',
        thor: '雷神之錘',
        mario: '超級蘑菇',
        luigi: '星星力量',
        peach: '公主皇冠',
        bowser: '龜殼攻擊',
        petey: '長舌頭攻擊',
        toadsworth: '孢子之力',
        wario: '金幣轟炸',
        mickey: '魔法圓圈',
        pikachu: '十萬伏特'
    };
    return attacks[heroId] || '普通攻擊';
}

function computerAttack() {
    if (isGameOver) return;
    
    playSound(computerHero.id + '-attack');
    computerCard.classList.add('attacking');
    
    const damage = getRandomNumber(10, 20);
    
    setTimeout(() => {
        computerCard.classList.remove('attacking');
        showHeroEffect(computerHero.id);
        
        setTimeout(() => {
            playerCard.classList.add('hit');
            playSound('damage');
            
            playerHP = Math.max(0, playerHP - damage);
            updateHPDisplay();
            
            showDamageNumber(damage, playerCard);
            createHitParticles(playerCard, computerHero.id);
            
            const attackName = getComputerAttackName(computerHero.id);
            feedbackArea.innerHTML = `<span class="feedback-damage">💥 ${computerHero.name} 使用 ${attackName}攻擊！造成 ${damage} 傷害！</span>`;
            
            setTimeout(() => {
                playerCard.classList.remove('hit');
                
                if (playerHP <= 0) {
                    playerDefeated();
                } else {
                    currentRound++;
                    updateScoreDisplay();
                    generateQuestion();
                }
            }, 800);
        }, 600);
    }, 400);
}

function getComputerAttackName(heroId) {
    const attacks = {
        spiderman: '蜘蛛陷阱',
        ironman: '微型飛彈',
        panther: '暗夜突襲',
        cap: '星條旗迴旋',
        boss: '黑暗之力',
        doctor: '魔法幻影',
        hulk: '狂怒破壞',
        thor: '雷電風暴',
        mario: '火焰衝刺',
        luigi: '綠色閃電',
        peach: '桃心攻擊',
        bowser: '巨殼撞擊',
        petey: '舌頭突刺',
        toadsworth: '蘑菇孢子',
        wario: '硬幣風暴',
        mickey: '米奇旋風',
        pikachu: '雷電光束'
    };
    return attacks[heroId] || '反擊攻擊';
}

function computerDefeated() {
    stopQuestionTimer();
    playSound('victory');
    
    computerCard.classList.add('defeated');
    feedbackArea.innerHTML = '<span class="feedback-correct" style="font-size: 2rem;">🏆 勝利！擊敗了 ' + computerHero.name + '！</span>';
    speak('勝利！太棒了！');
    
    defeatedOpponents.push(computerHero.id);
    totalDefeatedCount++;
    localStorage.setItem('totalDefeatedCount', totalDefeatedCount.toString());
    
    if (!pikachuUnlocked && totalDefeatedCount >= 3) {
        pikachuUnlocked = true;
        localStorage.setItem('pikachuUnlocked', 'true');
        setTimeout(() => {
            alert('🎉 恭喜解鎖隱藏角色：Pikachu！');
        }, 1500);
    }
    
    currentScore++;
    updateScoreDisplay();
    
    setTimeout(() => {
        computerCard.classList.remove('defeated');
        
        const availableOpponents = heroes.filter(h => 
            h.id !== playerHero.id && !defeatedOpponents.includes(h.id)
        );
        
        if (availableOpponents.length === 0) {
            showAllDefeated();
        } else {
            if (confirm('恭喜過關！是否繼續挑戰下一個敵人？')) {
                selectNewOpponent();
                computerHP = 100;
                updateCardDisplay();
                updateHPDisplay();
                isGameOver = false;
                generateQuestion();
            }
        }
    }, 2000);
}

function playerDefeated() {
    stopQuestionTimer();
    isGameOver = true;
    playSound('defeat');
    
    playerCard.classList.add('defeated');
    feedbackArea.innerHTML = '<span class="feedback-wrong" style="font-size: 2rem;">💀 敗北！被 ' + computerHero.name + ' 擊敗了！</span>';
    speak('失敗了...再接再厲！');
    
    setTimeout(() => {
        if (confirm('遊戲結束！是否重新開始？')) {
            resetBattle();
        }
    }, 2000);
}

function resetBattle() {
    stopQuestionTimer();
    playerCard.classList.remove('defeated');
    computerCard.classList.remove('defeated');
    defeatedOpponents = [];
    
    showHeroSelection();
}

speakBtn.onclick = () => {
    const { num1, num2, operator } = currentQuestion;
    speak(`${num1} ${operator === '+' ? '加' : '減'} ${num2} 等於多少？`);
};

resetBtn.onclick = () => {
    resetBattle();
};

const changeHeroBtn = document.getElementById('change-hero-btn');
if (changeHeroBtn) {
    changeHeroBtn.onclick = () => {
        stopQuestionTimer();
        showHeroSelection();
    };
}

document.addEventListener('DOMContentLoaded', () => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const startGameBtn = document.getElementById('start-game-btn');
    if (startGameBtn) {
        startGameBtn.onclick = startGameWithSelectedHero;
    }
    
    initGame();
});