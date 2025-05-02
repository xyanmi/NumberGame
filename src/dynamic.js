/**
 * UI controls and game dynamics for Number Game
 * Handles UI toggles, game timer, scoring, and modals
 */

/**
 * Toggle the boundary condition switch between periodic and fixed
 * @param {boolean} type - True for periodic boundary, false for fixed boundary
 */
function on_off(type){
    var btn = document.getElementsByClassName("btn-on")[0];
    var circle = document.getElementsByClassName("btn-on-circle")[0];
    var text = document.getElementsByClassName("btn-on-text")[0];
    
    if(!type){
        btn.style= "background-color: #ccc;"
        circle.style="left: 40px;background-color: #888;box-shadow: 0 0 10px #888;";
        text.style="right: 30px;color: #888;";
        text.innerText="Fix";
    } else {
        btn.style= ""
        circle.style="";
        text.style="";
        text.innerText="Pe";
    }
    btn.setAttribute("onclick", "on_off(" + !type + ")"); 
    btn.setAttribute("status", +type); 
}
on_off(true);

// Global game state variables
let timerInterval;
let seconds = 0;
let moveCount = 0;
let gameActive = false;
let gameStarted = false; // Flag to track if game has started
let currentConfetti = []; // Store confetti elements for cleanup

/**
 * Start the game timer
 * Resets and begins a new timer
 */
function startTimer() {
    stopTimer(); // Make sure to stop any existing timer first
    gameActive = true;
    gameStarted = true; // Mark that the game has started
    seconds = 0;
    updateTimerDisplay();
    timerInterval = setInterval(updateTimer, 1000);
}

/**
 * Update the timer by incrementing seconds
 * Called every second while game is active
 */
function updateTimer() {
    if (gameActive) {
        seconds++;
        updateTimerDisplay();
    }
}

/**
 * Update the timer display with formatted time
 * Converts seconds to MM:SS format
 */
function updateTimerDisplay() {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    document.getElementById('timer').textContent = display;
}

/**
 * Stop the game timer
 * Clears the interval and marks game as inactive
 */
function stopTimer() {
    gameActive = false;
    clearInterval(timerInterval);
    timerInterval = null;
}

/**
 * Reset the game state
 * Stops timer and resets move counter
 */
function resetGame() {
    stopTimer();
    resetMoves();
    gameStarted = false; // Reset the game started flag
    seconds = 0;
    updateTimerDisplay();
}

/**
 * Increment the move counter
 * Starts timer on first move if not already started
 */
function incrementMoves() {
    if (!gameStarted && gameActive === false) {
        // First move - start the timer
        startTimer();
    }
    
    if (gameActive) {
        moveCount++;
        document.getElementById('moves').textContent = moveCount;
    }
}

/**
 * Reset the move counter to zero
 */
function resetMoves() {
    moveCount = 0;
    document.getElementById('moves').textContent = moveCount;
}

// Difficulty level settings
const difficultySettings = {
    easy: {
        maxInitialValue: 2,
        defaultNodes: 4,
        defaultRows: 3,
        defaultCols: 3

    },
    medium: {
        maxInitialValue: 3,
        defaultNodes: 6,
        defaultRows: 5,
        defaultCols: 5
    },
    hard: {
        maxInitialValue: 3,
        defaultNodes: 9,
        defaultRows: 8,
        defaultCols: 8
    }
};

/**
 * Get the currently selected difficulty level
 * @returns {string} The current difficulty level (easy, medium, or hard)
 */
function getCurrentDifficulty() {
    const difficultySelect = document.getElementById('difficulty');
    return difficultySelect ? difficultySelect.value : 'medium';
}

/**
 * Update node count based on selected difficulty
 */
function updateNodesByDifficulty() {
    const difficulty = getCurrentDifficulty();
    const settings = difficultySettings[difficulty];
    
    if (settings) {
        document.getElementById('nodes-input').value = settings.defaultNodes;
        document.getElementById('rows-setting').value = settings.defaultRows;
        document.getElementById('cols-setting').value = settings.defaultCols;
    }
}

/**
 * Calculate score based on time, moves, and difficulty
 * @returns {number} The calculated score
 */
function calculateScore() {
    const difficulty = getCurrentDifficulty();
    const difficultyMultiplier = {
        easy: 1,
        medium: 1.5,
        hard: 2
    }[difficulty] || 1;
    
    // Calculate score based on time and move count
    const timeScore = Math.max(300 - seconds, 0);
    const moveScore = Math.max(200 - moveCount, 0);
    
    return Math.floor((timeScore + moveScore) * difficultyMultiplier);
}

/**
 * Update the score display with the current score
 * @param {number} score - The score to display
 */
function updateScoreDisplay(score) {
    document.getElementById('score').textContent = score;
}

/**
 * Show the success modal with game statistics
 * Displays time, moves, and score
 */
function showSuccessModal() {
    stopTimer();
    
    // Calculate and update score
    const score = calculateScore();
    updateScoreDisplay(score);
    
    document.getElementById('finalTime').textContent = document.getElementById('timer').textContent;
    document.getElementById('finalMoves').textContent = moveCount;
    
    // Add score to success modal
    const scoreElement = document.createElement('p');
    scoreElement.innerHTML = `<i class="fas fa-star"></i> Score: <span>${score}</span>`;
    
    const statsDiv = document.querySelector('.stats-summary');
    // Remove old score element if exists
    const oldScore = statsDiv.querySelector('p:nth-child(3)');
    if (oldScore) {
        statsDiv.removeChild(oldScore);
    }
    statsDiv.appendChild(scoreElement);
    
    const modal = document.getElementById('successModal');
    modal.style.display = 'flex';
    
    // Add confetti effect and store elements
    currentConfetti = createConfetti();
    
    // Save high score
    saveHighScore(score);
}

/**
 * Save high score to local storage and display new record message if applicable
 * @param {number} score - The score to save
 */
function saveHighScore(score) {
    const difficulty = getCurrentDifficulty();
    const highScoreKey = `numberGame_highScore_${difficulty}`;
    
    const currentHighScore = localStorage.getItem(highScoreKey) || 0;
    
    if (score > currentHighScore) {
        localStorage.setItem(highScoreKey, score);
        
        // Display new record message
        const newRecordMsg = document.createElement('div');
        newRecordMsg.className = 'new-record';
        newRecordMsg.innerHTML = '<i class="fas fa-trophy"></i> New Record!';
        
        const modalContent = document.querySelector('.modal-content');
        modalContent.insertBefore(newRecordMsg, modalContent.firstChild);
    }
}

/**
 * Initialize the help modal with event listeners
 */
function initHelpModal() {
    const helpBtn = document.getElementById('helpBtn');
    const helpModal = document.getElementById('helpModal');
    const closeHelpBtn = document.getElementById('closeHelpBtn');
    
    helpBtn.addEventListener('click', function() {
        helpModal.style.display = 'flex';
    });
    
    closeHelpBtn.addEventListener('click', function() {
        helpModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });
}

/**
 * Initialize the settings modal with event listeners
 */
function initSettingsModal() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsBtn = document.getElementById('closeSettingsBtn');
    const applySettingsBtn = document.getElementById('applySettingsBtn');
    
    settingsBtn.addEventListener('click', function() {
        settingsModal.style.display = 'flex';
    });
    
    closeSettingsBtn.addEventListener('click', function() {
        settingsModal.style.display = 'none';
    });
    
    applySettingsBtn.addEventListener('click', function() {
        applyGameSettings();
        settingsModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === settingsModal) {
            settingsModal.style.display = 'none';
        }
    });
}

/**
 * Toggle between 1D and 2D game modes
 * @param {HTMLElement} btn - The dimension toggle button
 */
function toggleDimension(btn) {
    const status = btn.getAttribute('status');
    const newStatus = status === '1' ? '2' : '1';
    
    btn.setAttribute('status', newStatus);
    
    if (newStatus === '1') {
        btn.style = "";
        btn.querySelector('.btn-dimension-circle').style = "";
        btn.querySelector('.btn-dimension-text').style = "";
        btn.querySelector('.btn-dimension-text').innerText = "1D";
        
        // Show/hide relevant settings
        document.getElementById('nodesSettings').style.display = 'flex';
        document.getElementById('rowsSettings').style.display = 'none';
        document.getElementById('colsSettings').style.display = 'none';
    } else {
        btn.style = "background-color: #673AB7;";
        btn.querySelector('.btn-dimension-circle').style = "left: 33px;";
        btn.querySelector('.btn-dimension-text').style = "right: 30px;";
        btn.querySelector('.btn-dimension-text').innerText = "2D";
        
        // Show/hide relevant settings
        document.getElementById('nodesSettings').style.display = 'none';
        document.getElementById('rowsSettings').style.display = 'flex';
        document.getElementById('colsSettings').style.display = 'flex';
    }
}

/**
 * Apply game settings and start a new game
 * Validates input values and updates game configuration
 */
function applyGameSettings() {
    const dimensionBtn = document.querySelector('.btn-dimension');
    const dimension = dimensionBtn.getAttribute('status');
    
    // Get setting values
    const nodes_element = document.getElementById('nodes-setting')
    const nodes = parseInt(nodes_element.value);
    const nodes_max = parseInt(nodes_element.max);
    const nodes_min = parseInt(nodes_element.min);

    const rows_element = document.getElementById('rows-setting')
    const rows = parseInt(rows_element.value);
    const rows_max = parseInt(rows_element.max);
    const rows_min = parseInt(rows_element.min);

    const cols_element = document.getElementById('cols-setting')
    const cols = parseInt(cols_element.value);
    const cols_max = parseInt(cols_element.max);
    const cols_min = parseInt(cols_element.min);

    const ns_element = document.getElementById('ns-setting')
    const ns = parseInt(ns_element.value);      
    const ns_max = parseInt(ns_element.max);
    const ns_min = parseInt(ns_element.min);

    // Validate input
    if (dimension === '1') {
        if (isNaN(nodes) || nodes < nodes_min || nodes > nodes_max) {
            alert(`The number of nodes must be an integer between ${nodes_min} and ${nodes_max}`);
            return;
        }
        
        // Update node count input
        document.getElementById('nodes-input').value = nodes;
    } else {
        if (isNaN(rows) || rows < rows_min || rows > rows_max) {
            alert(`The number of rows must be an integer between ${rows_min} and ${rows_max}`);
            return;
        }
        
        if (isNaN(cols) || cols < cols_min || cols > cols_max) {
            alert(`The number of columns must be an integer between ${cols_min} and ${cols_max}`);
            return;
        }
        
        // Calculate total nodes and update
        const totalNodes = rows * cols;
        document.getElementById('nodes-input').value = totalNodes;
    }
    
    if (isNaN(ns) || ns < ns_min || ns > ns_max) {
        alert(`The maximum value must be an integer between ${ns_min} and ${ns_max}`);
        return;
    }
    
    // Store game settings
    window.gameDimension = dimension;
    window.gameMaxValue = ns;
    
    // Start new game
    document.querySelector('.settings-number-refresh').click();
}

// Initialize game on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    resetGame(); // Reset but don't start
    
    // Handle refresh button clicks
    document.querySelector('.settings-number-refresh').addEventListener('click', function() {
        resetGame(); // Reset but don't start timer
    });
    
    // Initialize difficulty selector
    const difficultySelect = document.getElementById('difficulty');
    if (difficultySelect) {
        difficultySelect.addEventListener('change', function() {
            updateNodesByDifficulty();
            // Automatically start new game
            document.querySelector('.settings-number-refresh').click();
        });
    }
    
    // Initialize modals
    initHelpModal();
    initSettingsModal();
    window.toggleDimension = toggleDimension;
});

/**
 * Create confetti animation elements
 * @returns {Array} Array of created confetti elements
 */
function createConfetti() {
    const confettiCount = 200;
    const container = document.querySelector('body');
    const confettiElements = []; // Store all created confetti elements
    
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.animationDelay = Math.random() * 5 + 's';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        
        container.appendChild(confetti);
        confettiElements.push(confetti); // Add element to array
    }
    
    // Return created confetti elements array for later cleanup
    return confettiElements;
}

// Add node click animation and increment move counter
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('node')) {
        e.target.classList.add('clicked');
        setTimeout(() => {
            e.target.classList.remove('clicked');
        }, 500);
        incrementMoves();
    }
});

// Override the original generate function
const originalGenerate = window.generate;
window.generate = function() {
    resetGame(); // Reset game but don't start timer
    originalGenerate();
};

// Override the check function to show success modal
const originalCheck = window.check;
window.check = function() {
    const result = originalCheck();
    if (result) {
        gameActive = false; // Immediately mark game as inactive
        setTimeout(showSuccessModal, 300);
        // Sound is handled by sounds.js
    }
    return result;
};

// Play Again button handler
document.getElementById('playAgainBtn').addEventListener('click', function() {
    // Clear confetti effect
    clearConfetti();
    
    // Hide success modal
    document.getElementById('successModal').style.display = 'none';
    
    // Start new game
    document.querySelector('.settings-number-refresh').click();
});

// Add confetti animation styles
const style = document.createElement('style');
style.textContent = `
.confetti {
    position: fixed;
    width: 10px;
    height: 10px;
    top: -10px;
    border-radius: 0;
    animation: fall 6s linear infinite;
    z-index: 1000;
}

@keyframes fall {
    0% {
        top: -10px;
        transform: rotate(0deg) translateX(0);
        opacity: 1;
    }
    100% {
        top: 100vh;
        transform: rotate(720deg) translateX(100px);
        opacity: 0;
    }
}
`;
document.head.appendChild(style);

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', function() {
    resetGame(); // Reset but don't start
    
    // Handle refresh button clicks
    document.querySelector('.settings-number-refresh').addEventListener('click', function() {
        resetGame(); // Reset but don't start timer
    });
});

/**
 * Clear all confetti elements from the DOM
 */
function clearConfetti() {
    if (currentConfetti && currentConfetti.length > 0) {
        currentConfetti.forEach(confetti => {
            if (confetti && confetti.parentNode) {
                confetti.parentNode.removeChild(confetti);
            }
        });
        currentConfetti = [];
    }
}