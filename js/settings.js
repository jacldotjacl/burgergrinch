class SettingsManager {
    constructor() {
        this.settings = this.loadSettings();
        this.initializeEventListeners();
        this.applyTheme();
    }

    loadSettings() {
        return JSON.parse(localStorage.getItem('settings')) || {
            darkMode: false
        };
    }

    saveSettings() {
        localStorage.setItem('settings', JSON.stringify(this.settings));
    }

    initializeEventListeners() {
        const settingsButton = document.getElementById('settings-button');
        const settingsModal = document.getElementById('settings-modal');
        const cancelSettings = document.getElementById('cancel-settings');
        const darkModeToggle = document.getElementById('dark-mode-toggle');
        const testNotificationButton = document.getElementById('test-notification');
        const settingsForm = document.getElementById('settings-form');

        // Initialize dark mode toggle state
        darkModeToggle.checked = this.settings.darkMode;

        // Settings modal
        settingsButton.addEventListener('click', () => {
            settingsModal.classList.add('active');
        });

        cancelSettings.addEventListener('click', () => {
            settingsModal.classList.remove('active');
        });

        // Dark mode toggle
        darkModeToggle.addEventListener('change', (e) => {
            this.settings.darkMode = e.target.checked;
            this.applyTheme();
            this.saveSettings();
        });

        // Test notification
        testNotificationButton.addEventListener('click', () => {
            this.scheduleTestNotification();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('active');
            }
        });

        // Form submission
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            settingsModal.classList.remove('active');
        });
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', 
            this.settings.darkMode ? 'dark' : 'light'
        );
    }

    scheduleTestNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            // Schedule notification for 30 seconds from now
            setTimeout(() => {
                new Notification('Test Notification', {
                    body: 'This is a test notification from your maintenance tracker!',
                    icon: '/icons/icon-192x192.png',
                    requireInteraction: true
                });
            }, 30000);

            // Show immediate feedback
            alert('Test notification scheduled for 30 seconds from now!');
        } else {
            alert('Please enable notifications in your browser settings to use this feature.');
        }
    }
}

// Initialize settings manager
const settingsManager = new SettingsManager(); 
