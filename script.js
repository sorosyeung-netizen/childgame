const characters = [
    "m3.png",
    "m4.png",
    "m5.png"
];

const treeTypes = {
    apple: {
        name: "蘋果樹",
        fruit: "🍎"
    },
    pear: {
        name: "梨樹",
        fruit: "🍐"
    },
    durian: {
        name: "榴蓮樹",
        fruit: "🥥"
    },
    mango: {
        name: "芒果樹",
        fruit: "🥭"
    }
};

const STAGES_PER_TREE = 8;

const stageConfig = {
    0: { trunk: 5, leafSize: 10, leafLayers: 1, color: "#8BC34A", label: "萌芽" },
    1: { trunk: 10, leafSize: 18, leafLayers: 1, color: "#7CB342", label: "幼苗" },
    2: { trunk: 18, leafSize: 28, leafLayers: 2, color: "#689F38", label: "小樹" },
    3: { trunk: 28, leafSize: 40, leafLayers: 2, color: "#558B2F", label: "成長中" },
    4: { trunk: 40, leafSize: 55, leafLayers: 3, color: "#33691E", label: "茁壯" },
    5: { trunk: 55, leafSize: 70, leafLayers: 3, color: "#1B5E20", label: "成熟" },
    6: { trunk: 70, leafSize: 85, leafLayers: 4, color: "#2E7D32", label: "結果", fruitCount: 1 },
    7: { trunk: 85, leafSize: 100, leafLayers: 4, color: "#1B5E20", label: "完成", fruitCount: 3 }
};

let gameState = {
    currentTreeKey: 'apple',
    currentStage: 0,
    score: 0,
    isProcessing: false,
    completedTrees: []
};

let currentQuestion = {
    num1: 0,
    num2: 0,
    operator: '+',
    answer: 0
};

let audioCtx;

const group1 = document.getElementById('group1');
const group2 = document.getElementById('group2');
const operatorEl = document.getElementById('operator');
const optionBtn1 = document.getElementById('option-btn-1');
const optionBtn2 = document.getElementById('option-btn-2');
const scoreEl = document.getElementById('score');
const correctOverlay = document.getElementById('correct-overlay');
const wrongOverlay = document.getElementById('wrong-overlay');
const treeCompleteOverlay = document.getElementById('tree-complete-overlay');
const levelCompleteOverlay = document.getElementById('level-complete-overlay');

function initGame() {
    gameState = {
        currentTreeKey: 'apple',
        currentStage: 0,
        score: 0,
        isProcessing: false,
        completedTrees: []
    };
    
    updateScore();
    updateTreeInfo();
    updateTreeDisplay();
    generateQuestion();
    
    document.getElementById('tree-name-right').textContent = treeTypes.apple.name;
    document.getElementById('stage-label-right').textContent = '第 1 關';
    
    optionBtn1.addEventListener('click', () => checkAnswer(optionBtn1));
    optionBtn2.addEventListener('click', () => checkAnswer(optionBtn2));
    
    document.body.addEventListener('click', () => {
        initAudio();
    }, { once: true });
}

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function speakQuestion(num1, operator, num2) {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();

    const opText = operator === '+' ? '加' : '減';
    const text = `${num1} ${opText} ${num2} 等於幾多`;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-HK';
    utterance.rate = 0.8;
    utterance.pitch = 1.1;

    const voices = window.speechSynthesis.getVoices();
    const hkVoice = voices.find(v => v.lang === 'zh-HK' || v.lang === 'zh-Hant-HK');
    if (hkVoice) {
        utterance.voice = hkVoice;
    }

    window.speechSynthesis.speak(utterance);
}

function playSound(type) {
    if (!audioCtx) return;
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    if (type === 'correct') {
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1046.5, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    } else {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.5, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    }
}

function generateQuestion() {
    const randomChar = characters[Math.floor(Math.random() * characters.length)];
    
    const isAddition = Math.random() > 0.5;
    
    if (isAddition) {
        const num1 = Math.floor(Math.random() * 11);
        const num2 = Math.floor(Math.random() * (11 - num1));
        currentQuestion = {
            num1: num1,
            num2: num2,
            operator: '+',
            answer: num1 + num2
        };
    } else {
        const num1 = Math.floor(Math.random() * 11);
        const num2 = Math.floor(Math.random() * (num1 + 1));
        currentQuestion = {
            num1: num1,
            num2: num2,
            operator: '-',
            answer: num1 - num2
        };
    }
    
    renderImages(group1, currentQuestion.num1, randomChar);
    renderImages(group2, currentQuestion.num2, randomChar);
    operatorEl.textContent = currentQuestion.operator;
    
    setTimeout(() => {
        speakQuestion(currentQuestion.num1, currentQuestion.operator, currentQuestion.num2);
    }, 500);

    const correctAnswer = currentQuestion.answer;
    let wrongAnswer;
    
    do {
        wrongAnswer = Math.floor(Math.random() * 11);
    } while (wrongAnswer === correctAnswer);
    
    if (Math.random() > 0.5) {
        optionBtn1.textContent = correctAnswer;
        optionBtn1.dataset.val = correctAnswer;
        optionBtn2.textContent = wrongAnswer;
        optionBtn2.dataset.val = wrongAnswer;
    } else {
        optionBtn1.textContent = wrongAnswer;
        optionBtn1.dataset.val = wrongAnswer;
        optionBtn2.textContent = correctAnswer;
        optionBtn2.dataset.val = correctAnswer;
    }
    
    gameState.isProcessing = false;
}

function renderImages(container, count, imgSrc) {
    container.innerHTML = '';
    if (count === 0) {
        const zeroEl = document.createElement('div');
        zeroEl.textContent = '0';
        zeroEl.className = 'visual-zero';
        container.appendChild(zeroEl);
        return;
    }
    
    for (let i = 0; i < count; i++) {
        const img = document.createElement('img');
        img.src = imgSrc;
        img.className = 'count-img';
        img.style.animationDelay = `${i * 0.05}s`;
        container.appendChild(img);
    }
}

function checkAnswer(btn) {
    if (gameState.isProcessing) return;
    gameState.isProcessing = true;
    
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    const inputVal = parseInt(btn.dataset.val);
    
    if (inputVal === currentQuestion.answer) {
        handleCorrect();
    } else {
        handleWrong();
    }
}

function handleCorrect() {
    playSound('correct');
    gameState.score += 10;
    updateScore();
    gameState.currentStage++;

    updateTreeInfo();
    updateTreeDisplay();
    
    setTimeout(() => {
        if (gameState.currentStage >= STAGES_PER_TREE - 1) {
            completeTree();
        } else {
            generateQuestion();
        }
    }, 600);
}

function updateTreeInfo() {
    const treeData = treeTypes[gameState.currentTreeKey];
    document.getElementById('current-tree-name').textContent = treeData.name;
    document.getElementById('tree-name-right').textContent = treeData.name;
    document.getElementById('stage-label').textContent = `第 ${gameState.currentStage + 1} 關：${getStageName(gameState.currentStage)}`;
    document.getElementById('stage-label-right').textContent = `第 ${gameState.currentStage + 1} 關`;
    
    const progressPercent = (gameState.currentStage / (STAGES_PER_TREE - 1)) * 100;
    document.getElementById('tree-progress-fill').style.width = `${progressPercent}%`;
}

function getStageName(stage) {
    const names = ["萌芽", "幼苗", "小樹", "成長中", "茁壯", "成熟", "結果", "完成"];
    return names[stage] || "";
}

function updateTreeDisplay() {
    const stage = stageConfig[gameState.currentStage];
    const treeData = treeTypes[gameState.currentTreeKey];
    
    const trunk = document.querySelector('.tree-trunk');
    const leaves = document.getElementById('leaves');
    const fruits = document.getElementById('fruits');
    const crown = document.getElementById('tree-crown');
    
    trunk.style.height = `${stage.trunk}px`;
    crown.className = 'tree-crown';
    
    if (gameState.currentStage >= 4) {
        crown.classList.add('tree-growing');
    }
    if (gameState.currentStage >= 6) {
        crown.classList.remove('tree-growing');
        crown.classList.add('tree-fruiting');
    }
    if (gameState.currentStage >= 7) {
        crown.classList.remove('tree-fruiting');
        crown.classList.add('tree-complete');
    }
    
    leaves.innerHTML = '';
    for (let i = 0; i < stage.leafLayers; i++) {
        const leaf = document.createElement('div');
        leaf.className = 'leaf-layer';
        const layerSize = stage.leafSize * (1 - i * 0.15);
        leaf.style.width = `${layerSize}px`;
        leaf.style.height = `${layerSize}px`;
        leaf.style.background = stage.color;
        leaf.style.transitionDelay = `${i * 0.1}s`;
        
        setTimeout(() => {
            leaf.style.opacity = 1;
            leaf.style.transform = 'scale(1)';
        }, 100 + i * 100);
        
        leaves.appendChild(leaf);
    }
    
    fruits.innerHTML = '';
    if (stage.fruitCount) {
        if (gameState.currentStage >= 7) {
            const row1 = document.createElement('div');
            row1.className = 'fruit-row';
            const fruit1 = document.createElement('span');
            fruit1.className = 'fruit';
            fruit1.textContent = treeData.fruit;
            fruit1.style.transitionDelay = '0.1s';
            setTimeout(() => { fruit1.style.opacity = 1; fruit1.style.transform = 'scale(1)'; }, 200);
            row1.appendChild(fruit1);
            fruits.appendChild(row1);

            const row2 = document.createElement('div');
            row2.className = 'fruit-row';
            for (let i = 0; i < 2; i++) {
                const fruitEl = document.createElement('span');
                fruitEl.className = 'fruit';
                fruitEl.textContent = treeData.fruit;
                fruitEl.style.transitionDelay = `${0.2 + i * 0.15}s`;
                setTimeout(() => { fruitEl.style.opacity = 1; fruitEl.style.transform = 'scale(1)'; }, 250 + i * 150);
                row2.appendChild(fruitEl);
            }
            fruits.appendChild(row2);
        } else {
            for (let i = 0; i < stage.fruitCount; i++) {
                const fruitEl = document.createElement('span');
                fruitEl.className = 'fruit';
                fruitEl.textContent = treeData.fruit;
                fruitEl.style.transitionDelay = `${i * 0.15}s`;
                setTimeout(() => {
                    fruitEl.style.opacity = 1;
                    fruitEl.style.transform = 'scale(1)';
                }, 200 + i * 150);
                fruits.appendChild(fruitEl);
            }
        }
    }
}

function completeTree() {
    const treeData = treeTypes[gameState.currentTreeKey];
    gameState.completedTrees.push(gameState.currentTreeKey);
    
    document.getElementById('tree-complete-title').textContent = `🎉 ${treeData.name}結果了！🎉`;
    
    const completeDisplay = document.getElementById('tree-complete-display');
    completeDisplay.innerHTML = '';
    
    const treeEmoji = document.createElement('div');
    treeEmoji.style.fontSize = '3rem';
    treeEmoji.style.marginBottom = '10px';
    treeEmoji.textContent = '🌳';
    completeDisplay.appendChild(treeEmoji);
    
    const fruitsDiv = document.createElement('div');
    fruitsDiv.style.fontSize = '1.5rem';
    for (let i = 0; i < 3; i++) {
        fruitsDiv.textContent += treeData.fruit + ' ';
    }
    completeDisplay.appendChild(fruitsDiv);
    
    treeCompleteOverlay.classList.remove('hidden');

    setTimeout(() => {
        treeCompleteOverlay.classList.add('hidden');
        
        const treeKeys = ['apple', 'pear', 'durian', 'mango'];
        const currentIndex = treeKeys.indexOf(gameState.currentTreeKey);
        
        if (currentIndex < treeKeys.length - 1) {
            gameState.currentTreeKey = treeKeys[currentIndex + 1];
            gameState.currentStage = 0;
            updateTreeInfo();
            updateTreeDisplay();
            generateQuestion();
        } else {
            showLevelComplete();
        }
    }, 2500);
}

function showLevelComplete() {
    const finalTreesEl = document.getElementById('final-trees');
    finalTreesEl.innerHTML = '';
    
    gameState.completedTrees.forEach(treeKey => {
        const treeData = treeTypes[treeKey];
        const treeSpan = document.createElement('span');
        treeSpan.textContent = `🌳 ${treeData.fruit} `;
        treeSpan.style.fontSize = '1.8rem';
        finalTreesEl.appendChild(treeSpan);
    });
    
    levelCompleteOverlay.classList.remove('hidden');
    
    setTimeout(() => {
        levelCompleteOverlay.classList.add('hidden');
        initGame();
    }, 5000);
}

function handleWrong() {
    playSound('wrong');
    wrongOverlay.classList.remove('hidden');
    
    setTimeout(() => {
        wrongOverlay.classList.add('hidden');
        generateQuestion();
    }, 1500);
}

function updateScore() {
    scoreEl.textContent = gameState.score;
}

initGame();
