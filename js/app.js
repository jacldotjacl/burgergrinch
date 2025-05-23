// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Main initialization function
function initializeApp() {
    // Register service worker for push notifications
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }

    // Initialize UI components
    initializeModals();
    initializeViewButtons();
    initializeTaskList();
    loadTasks();
}

// Modal handling
function initializeModals() {
    const taskModal = document.getElementById('task-modal');
    const notificationModal = document.getElementById('notification-modal');
    const addTaskButton = document.getElementById('add-task');
    const notificationSettingsButton = document.getElementById('notification-settings');
    const cancelTaskButton = document.getElementById('cancel-task');
    const cancelNotificationButton = document.getElementById('cancel-notification');

    // Task modal
    addTaskButton.addEventListener('click', () => {
        taskModal.classList.add('active');
    });

    cancelTaskButton.addEventListener('click', () => {
        taskModal.classList.remove('active');
    });

    // Notification modal
    notificationSettingsButton.addEventListener('click', () => {
        notificationModal.classList.add('active');
    });

    cancelNotificationButton.addEventListener('click', () => {
        notificationModal.classList.remove('active');
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            taskModal.classList.remove('active');
        }
        if (e.target === notificationModal) {
            notificationModal.classList.remove('active');
        }
    });
}

// View button handling
function initializeViewButtons() {
    const viewButtons = document.querySelectorAll('.view-button');
    viewButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            viewButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            // Filter tasks based on view
            filterTasks(button.dataset.view);
        });
    });
}

// Task list initialization
function initializeTaskList() {
    const taskList = document.getElementById('task-list');
    
    // Initialize drag and drop
    taskList.addEventListener('dragstart', handleDragStart);
    taskList.addEventListener('dragover', handleDragOver);
    taskList.addEventListener('drop', handleDrop);
    taskList.addEventListener('dragend', handleDragEnd);
}

// Drag and drop handlers
function handleDragStart(e) {
    if (e.target.classList.contains('task-card')) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', e.target.id);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    const taskCard = e.target.closest('.task-card');
    if (taskCard) {
        taskCard.classList.add('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    const taskList = document.getElementById('task-list');
    const draggedId = e.dataTransfer.getData('text/plain');
    const draggedElement = document.getElementById(draggedId);
    const dropTarget = e.target.closest('.task-card');

    if (dropTarget && draggedElement) {
        const rect = dropTarget.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        
        if (e.clientY < midpoint) {
            taskList.insertBefore(draggedElement, dropTarget);
        } else {
            taskList.insertBefore(draggedElement, dropTarget.nextSibling);
        }
    }

    // Remove drag-over class from all cards
    document.querySelectorAll('.task-card').forEach(card => {
        card.classList.remove('drag-over');
    });
}

function handleDragEnd(e) {
    if (e.target.classList.contains('task-card')) {
        e.target.classList.remove('dragging');
    }
}

// Task filtering
function filterTasks(view) {
    const tasks = document.querySelectorAll('.task-card');
    tasks.forEach(task => {
        if (view === 'all' || task.dataset.status === view) {
            task.style.display = 'block';
        } else {
            task.style.display = 'none';
        }
    });
}

// Load tasks from local storage
function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

// Create task element
function createTaskElement(task) {
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
