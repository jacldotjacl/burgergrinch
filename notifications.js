// Notification management functionality
class NotificationManager {
    constructor() {
        this.initializeEventListeners();
        this.checkNotificationPermission();
    }

    initializeEventListeners() {
        const notificationForm = document.getElementById('notification-form');
        notificationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleNotificationSettings(e.target);
        });

        // Request notification permission when clicking the notification settings button
        document.getElementById('notification-settings').addEventListener('click', () => {
            this.requestNotificationPermission();
        });
    }

    async checkNotificationPermission() {
        if ('Notification' in window) {
            const permission = Notification.permission;
            const enableCheckbox = document.getElementById('enable-notifications');
            
            if (permission === 'granted') {
                enableCheckbox.checked = true;
            } else if (permission === 'denied') {
                enableCheckbox.checked = false;
                enableCheckbox.disabled = true;
            }
        }
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            try {
                const permission = await Notification.requestPermission();
                const enableCheckbox = document.getElementById('enable-notifications');
                
                if (permission === 'granted') {
                    enableCheckbox.checked = true;
                    this.registerServiceWorker();
                } else if (permission === 'denied') {
                    enableCheckbox.checked = false;
                    enableCheckbox.disabled = true;
                    alert('Please enable notifications in your browser settings to receive task reminders.');
                }
            } catch (error) {
                console.error('Error requesting notification permission:', error);
            }
        }
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }
    }

    handleNotificationSettings(form) {
        const formData = new FormData(form);
        const settings = {
            enabled: formData.get('enable-notifications') === 'on',
            reminderTime: formData.get('notification-time'),
            daysBeforeDue: parseInt(formData.get('notification-days'), 10)
        };

        this.saveNotificationSettings(settings);
        document.getElementById('notification-modal').classList.remove('active');

        if (settings.enabled) {
            this.requestNotificationPermission();
        }
    }

    saveNotificationSettings(settings) {
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
    }

    getNotificationSettings() {
        return JSON.parse(localStorage.getItem('notificationSettings')) || {
            enabled: true,
            reminderTime: '09:00',
            daysBeforeDue: 3
        };
    }

    async scheduleTaskNotification(task) {
        const settings = this.getNotificationSettings();
        
        if (!settings.enabled || !('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        const dueDate = new Date(task.dueDate);
        const reminderDate = new Date(dueDate);
        reminderDate.setDate(reminderDate.getDate() - settings.daysBeforeDue);

        // Set the reminder time
        const [hours, minutes] = settings.reminderTime.split(':');
        reminderDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);

        const now = new Date();
        const timeUntilReminder = reminderDate - now;

        if (timeUntilReminder > 0) {
            // Schedule the notification
            setTimeout(() => {
                this.showTaskNotification(task);
            }, timeUntilReminder);
        }
    }

    showTaskNotification(task) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification('Maintenance Task Reminder', {
                body: `${task.name} is due in ${this.getNotificationSettings().daysBeforeDue} days.`,
                icon: '/icons/icon-192x192.png',
                tag: `task-${task.id}`,
                requireInteraction: true
            });

            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        }
    }

    cancelTaskNotification(taskId) {
        if ('Notification' in window) {
            // Close any existing notifications for this task
            const notification = document.querySelector(`[data-task-id="${taskId}"]`);
            if (notification) {
                notification.close();
            }
        }
    }
}

// Initialize notification manager
const notificationManager = new NotificationManager(); 