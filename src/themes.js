/**
 * Theme management module for Number Game
 * Handles theme selection, application, and persistence
 */
(function() {
    // Available theme options
    const themes = ['default', 'dark', 'neon', 'pastel', 'ocean', 'forest', 'sunset', 'minimal'];
    let currentTheme = 'default';
    
    // DOM element references
    const themeBtn = document.getElementById('themeBtn');
    const themeModal = document.getElementById('themeModal');
    const closeThemeBtn = document.getElementById('closeThemeBtn');
    const themeOptions = document.querySelectorAll('.theme-option');
    
    /**
     * Initialize theme functionality
     * Loads saved theme and sets up event listeners
     */
    function init() {
        // Load theme from local storage if available
        const savedTheme = localStorage.getItem('numberGameTheme');
        if (savedTheme && themes.includes(savedTheme)) {
            applyTheme(savedTheme);
        }
        
        // Set up event listeners
        themeBtn.addEventListener('click', openThemeModal);
        closeThemeBtn.addEventListener('click', closeThemeModal);
        
        themeOptions.forEach(option => {
            option.addEventListener('click', function() {
                const theme = this.getAttribute('data-theme');
                applyTheme(theme);
                closeThemeModal();
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === themeModal) {
                closeThemeModal();
            }
        });
        
        // Initialize theme preview elements
        initThemePreview();
    }
    
    /**
     * Initialize theme preview elements
     * Creates visual previews for each theme option
     */
    function initThemePreview() {
        // Add preview styles to each theme option
        themeOptions.forEach(option => {
            const theme = option.getAttribute('data-theme');
            const preview = document.createElement('div');
            preview.className = 'theme-preview';
            
            // Set gradient background based on theme
            switch(theme) {
                case 'default':
                    preview.style.background = 'linear-gradient(135deg, #7EEFEBFF 0%, #c3cfe2 100%)';
                    break;
                case 'dark':
                    preview.style.background = 'linear-gradient(135deg, #2c3e50 0%, #1a1a1a 100%)';
                    break;
                case 'neon':
                    preview.style.background = 'linear-gradient(135deg, #00c3ff 0%, #ff00e6 100%)';
                    break;
                case 'pastel':
                    preview.style.background = 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)';
                    break;
                case 'ocean':
                    preview.style.background = 'linear-gradient(135deg, #0083B0 0%, #00B4DB 100%)';
                    break;
                case 'forest':
                    preview.style.background = 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)';
                    break;
                case 'sunset':
                    preview.style.background = 'linear-gradient(135deg, #FF416C 0%, #FF9966 100%)';
                    break;
                case 'minimal':
                    preview.style.background = 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)';
                    break;
            }
            
            // Add preview to option if not already present
            if (!option.querySelector('.theme-preview')) {
                option.prepend(preview);
            }
        });
    }
    
    /**
     * Apply selected theme to the game
     * @param {string} theme - The theme name to apply
     */
    function applyTheme(theme) {
        // Remove all existing theme classes
        document.body.classList.remove(...themes.map(t => `${t}-theme`));
        
        // Add new theme class if not default
        if (theme !== 'default') {
            document.body.classList.add(`${theme}-theme`);
        }
        
        // Save theme preference to local storage
        localStorage.setItem('numberGameTheme', theme);
        currentTheme = theme;
        
        // Update active state on theme options
        themeOptions.forEach(option => {
            if (option.getAttribute('data-theme') === theme) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        // Apply theme-specific animations
        applyThemeAnimations(theme);
    }
    
    /**
     * Apply animations specific to the selected theme
     * @param {string} theme - The theme name
     */
    function applyThemeAnimations(theme) {
        // Remove all animation classes
        document.body.classList.remove('animate-dark', 'animate-neon', 'animate-pastel', 'animate-ocean', 'animate-forest', 'animate-sunset', 'animate-minimal');
        
        // Add theme-specific animation class
        if (theme !== 'default') {
            document.body.classList.add(`animate-${theme}`);
        }
    }
    
    /**
     * Open the theme selection modal
     */
    function openThemeModal() {
        themeModal.style.display = 'flex';
        
        // Add entrance animation
        themeModal.classList.remove('fade-out');
        themeModal.classList.add('fade-in');
    }
    
    /**
     * Close the theme selection modal
     */
    function closeThemeModal() {
        // Add exit animation
        themeModal.classList.remove('fade-in');
        themeModal.classList.add('fade-out');
        
        // Hide modal after animation completes
        setTimeout(() => {
            themeModal.style.display = 'none';
        }, 300);
    }
    
    // Initialize when DOM is fully loaded
    document.addEventListener('DOMContentLoaded', init);
    
    /**
     * Public API for theme management
     * Exposes methods for getting/setting themes
     */
    window.themeManager = {
        getTheme: () => currentTheme,
        setTheme: applyTheme,
        getAvailableThemes: () => [...themes]
    };
})();