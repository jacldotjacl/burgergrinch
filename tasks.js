// Task management functionality
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Task form submission
        const taskForm = document.getElementById('task-form');
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTaskSubmit(e.target);
        });

        // Task actions (edit/delete)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.edit-task')) {
                const taskId = e.target.closest('.edit-task').dataset.id;
                this.editTask(taskId);
            } else if (e.target.closest('.delete-task')) {
                const taskId = e.target.closest('.delete-task').dataset.id;
                this.deleteTask(taskId);
            }
        });
    }

    handleTaskSubmit(form) {
        const formData = new FormData(form);
        const taskData = {
            id: formData.get('task-id') || Date.now().toString(),
            name: formData.get('task-name'),
            description: formData.get('task-description'),
            frequency: formData.get('task-frequency'),
            dueDate: formData.get('task-due-date'),
            priority: formData.get('task-priority'),
            status: formData.get('task-status') || 'pending',
            createdAt: formData.get('task-id') ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (formData.get('task-id')) {
            this.updateTask(taskData);
        } else {
            this.addTask(taskData);
        }

        // Close modal and reset form
        document.getElementById('task-modal').classList.remove('active');
        form.reset();
    }

    addTask(task) {
        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        this.scheduleNotification(task);
    }

    updateTask(updatedTask) {
        const index = this.tasks.findIndex(task => task.id === updatedTask.id);
        if (index !== -1) {
            this.tasks[index] = { ...this.tasks[index], ...updatedTask };
            this.saveTasks();
            this.renderTasks();
            this.scheduleNotification(updatedTask);
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.cancelNotification(taskId);
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            const form = document.getElementById('task-form');
            form.elements['task-id'].value = task.id;
            form.elements['task-name'].value = task.name;
            form.elements['task-description'].value = task.description;
            form.elements['task-frequency'].value = task.frequency;
            form.elements['task-due-date'].value = task.dueDate;
            form.elements['task-priority'].value = task.priority;
            form.elements['task-status'].value = task.status;

            document.getElementById('task-modal').classList.add('active');
        }
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    renderTasks() {
        const taskList = document.getElementById('task-list');
        taskList.innerHTML = '';

        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            taskList.appendChild(taskElement);
        });
    }

    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-card';
        taskElement.id = `task-${task.id}`;
        taskElement.draggable = true;
        taskElement.dataset.status = task.status;

        taskElement.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${task.name}</h3>
                <span class="task-status status-${task.status}">${task.status}</span>
            </div>
            <p>${task.description}</p>
            <div class="task-details">
                <p><strong>Due:</strong> ${new Date(task.dueDate).toLocaleDateString()}</p>
                <p><strong>Priority:</strong> ${task.priority}</p>
                <p><strong>Frequency:</strong> ${task.frequency}</p>
            </div>
            <div class="task-actions">
                <button class="icon-button edit-task" data-id="${task.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="icon-button delete-task" data-id="${task.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        return taskElement;
    }

    scheduleNotification(task) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const dueDate = new Date(task.dueDate);
            const now = new Date();
            const timeUntilDue = dueDate - now;

            if (timeUntilDue > 0) {
                const notificationTime = new Date(dueDate);
                notificationTime.setDate(notificationTime.getDate() - 3); // Notify 3 days before

                if (notificationTime > now) {
                    const timeUntilNotification = notificationTime - now;
                    setTimeout(() => {
                        this.showNotification(task);
                    }, timeUntilNotification);
                }
            }
        }
    }

    cancelNotification(taskId) {
        // Implementation for canceling scheduled notifications
        // This would typically involve clearing any scheduled timeouts
    }

    showNotification(task) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Maintenance Task Due Soon', {
                body: `${task.name} is due in 3 days.`,
                icon: '/icons/icon-192x192.png'
            });
        }
    }
}

// Initialize task manager
const taskManager = new TaskManager(); 