/**
 * Sound management module for Number Game
 * Handles sound effects loading, playback and settings
 */
(function() {
    // Sound effect URLs - supporting multiple formats
    const soundEffects = {
        click: {
            mp3: 'sounds/click.mp3',
            ogg: 'sounds/click.ogg'
        },
        success: {
            mp3: 'sounds/success.mp3',
            ogg: 'sounds/success.ogg'
        },
        move: {
            mp3: 'sounds/move.mp3',
            ogg: 'sounds/move.ogg'
        },
        start: {
            mp3: 'sounds/start.mp3',
            ogg: 'sounds/start.ogg'
        }
    };
    
    // Audio element cache
    const audioElements = {};
    
    // Sound state
    let soundEnabled = true;
    
    // DOM element references
    let soundBtn;
    
    /**
     * Initialize sound system
     * Sets up audio elements, loads preferences, and attaches event listeners
     */
    function init() {
        // Ensure DOM element is available
        soundBtn = document.getElementById('soundBtn');
        if (!soundBtn) {
            console.error('Sound button element not found');
            return;
        }
        
        // Load sound state from local storage
        const savedSoundState = localStorage.getItem('numberGameSound');
        if (savedSoundState !== null) {
            soundEnabled = savedSoundState === 'true';
            updateSoundButtonIcon();
        }
        
        // Preload sound effects - with multi-format support
        for (const [name, formats] of Object.entries(soundEffects)) {
            const audio = new Audio();
            
            // Try loading different formats based on browser support
            if (typeof formats === 'string') {
                // Backward compatibility for single URL format
                audio.src = formats;
            } else {
                // New multi-format support
                if (audio.canPlayType('audio/mpeg')) {
                    audio.src = formats.mp3;
                } else if (audio.canPlayType('audio/ogg')) {
                    audio.src = formats.ogg;
                }
            }
            
            audio.preload = 'auto';
            audioElements[name] = audio;
            
            // Add error handling
            audio.addEventListener('error', (e) => {
                console.error(`Cannot load sound effect: ${name}`, e);
            });
        }
        
        // Set up event listeners
        soundBtn.addEventListener('click', toggleSound);
        
        // Add node click sound effect
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('node')) {
                playSound('move');
            }
        });
        
        // Add success sound effect - ensure original function exists
        if (typeof window.check === 'function') {
            const originalCheck = window.check;
            window.check = function() {
                const result = originalCheck.apply(this, arguments);
                if (result) {
                    playSound('success');
                }
                return result;
            };
        } else {
            console.error('Original check function not found');
        }
        
        // Add new game sound effect
        const refreshBtn = document.querySelector('.settings-number-refresh');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                playSound('start');
            });
        } else {
            console.error('Refresh button not found');
        }
        
        // Test sound system
        console.log('Sound system initialized');
        // Add a test sound effect
        setTimeout(() => playSound('click'), 1000);
    }
    
    /**
     * Play a sound effect by name
     * @param {string} name - The name of the sound to play
     */
    function playSound(name) {
        if (!soundEnabled || !audioElements[name]) {
            console.log(`Sound not played: ${name} (Enabled: ${soundEnabled})`);
            return;
        }
        
        try {
            // Clone audio element to allow overlapping playback
            const sound = audioElements[name].cloneNode();
            sound.volume = name === 'start' ? 0.3 : 0.5; // Lower volume for background music
            const playPromise = sound.play();
            
            // Handle autoplay policy
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error(`Failed to play sound: ${name}`, error);
                });
            }
            console.log(`Playing sound: ${name}`);
        } catch (error) {
            console.error(`Error playing sound: ${name}`, error);
        }
    }
    
    /**
     * Toggle sound on/off
     * Updates local storage preference and UI
     */
    function toggleSound() {
        soundEnabled = !soundEnabled;
        localStorage.setItem('numberGameSound', soundEnabled);
        updateSoundButtonIcon();
        
        // Play test sound effect
        if (soundEnabled) {
            playSound('click');
        }
        console.log(`Sound state: ${soundEnabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Update sound button icon based on current state
     */
    function updateSoundButtonIcon() {
        if (!soundBtn) return;
        
        const icon = soundBtn.querySelector('i');
        if (icon) {
            icon.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        }
    }
    
    // Ensure initialization after DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // If DOM is already loaded, initialize immediately
        init();
    }
    
    /**
     * Public API for sound management
     * Exposes methods for playing sounds and managing sound state
     */
    window.gameSound = {
        play: playSound,
        toggle: toggleSound,
        isEnabled: () => soundEnabled
    };
})();