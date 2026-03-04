// tasks.js - Task Management System Logic

// State
let tasks = JSON.parse(localStorage.getItem('daily-tasks')) || [];
let currentStreak = parseInt(localStorage.getItem('task-streak')) || 0;
let lastCompletionDate = localStorage.getItem('last-completion-date');
let isEditMode = false;

// DOM Elements
const taskList = document.getElementById('task-list');
const completedTaskList = document.getElementById('completed-task-list');
const completedSection = document.getElementById('completed-section');
const newTaskInput = document.getElementById('new-task-input');
const completedCountEl = document.getElementById('completed-count');
const totalCountEl = document.getElementById('total-count');
const streakCountEl = document.getElementById('streak-count');
const addTaskBtnInline = document.querySelector('.add-task-inline-btn');
const addTaskBtn = document.getElementById('add-task-btn');
const editTaskBtn = document.getElementById('edit-task-btn');

function saveTasks() {
    localStorage.setItem('daily-tasks', JSON.stringify(tasks));
}

function renderTasks() {
    if (!taskList) return;
    taskList.innerHTML = '';
    if (completedTaskList) completedTaskList.innerHTML = '';

    let completedCount = 0;

    tasks.forEach((task) => {
        if (task.completed) completedCount++;

        const li = document.createElement('li');
        li.className = `task-item ${task.completed ? 'completed' : ''} ${task.pinned ? 'pinned' : ''}`;
        li.draggable = !isEditMode;
        li.dataset.id = task.id;

        const textElement = isEditMode
            ? `<input type="text" class="task-edit-input" value="${task.text}" onblur="updateTaskText(${task.id}, this.value)" onkeydown="if(event.key==='Enter') this.blur();">`
            : `<span class="task-text">${task.text}</span>`;

        const pinClass = task.pinned ? 'active-pin' : 'inactive-pin';
        const pinIcon = task.pinned ? 'fa-solid fa-thumbtack' : 'fa-solid fa-thumbtack fa-rotate-90';

        li.innerHTML = `
            <div class="task-checkbox ${task.completed ? 'checked' : ''}" onclick="toggleTask(${task.id})">
                <i class="fa-solid fa-check"></i>
            </div>
            ${textElement}
            <div class="task-item-actions">
                ${!task.completed ? `<button class="pin-task-btn ${pinClass}" onclick="togglePin(${task.id})"><i class="${pinIcon}"></i></button>` : ''}
                <button class="delete-task-btn" onclick="deleteTask(${task.id})"><i class="fa-solid fa-xmark"></i></button>
            </div>
        `;

        if (task.completed && completedTaskList) {
            completedTaskList.appendChild(li);
        } else {
            taskList.appendChild(li);
        }
    });

    if (completedSection) {
        completedSection.style.display = completedCount > 0 ? 'block' : 'none';
    }

    if (completedCountEl) completedCountEl.innerText = completedCount;
    if (totalCountEl) totalCountEl.innerText = tasks.length;

    checkStreak(completedCount, tasks.length);
}

function addTask(text) {
    if (!text.trim()) return;
    const newTask = {
        id: Date.now(),
        text: text.trim(),
        completed: false,
        pinned: false
    };

    // Add to top of unpinned
    const firstUnpinnedIdx = tasks.findIndex(t => !t.pinned && !t.completed);
    if (firstUnpinnedIdx === -1) {
        tasks.splice(tasks.filter(t => t.pinned && !t.completed).length, 0, newTask);
    } else {
        tasks.splice(firstUnpinnedIdx, 0, newTask);
    }

    saveTasks();
    renderTasks();
}

window.toggleTask = function (id) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    const task = tasks[idx];
    task.completed = !task.completed;

    tasks.splice(idx, 1);

    if (task.completed) {
        task.pinned = false; // unpin on complete
        tasks.push(task); // push to bottom
    } else {
        // Find insert position: uncompleted & unpinned.
        const firstUnpinnedIdx = tasks.findIndex(t => !t.pinned && !t.completed);
        const insertIdx = firstUnpinnedIdx === -1 ? tasks.filter(t => t.pinned && !t.completed).length : firstUnpinnedIdx;
        tasks.splice(insertIdx, 0, task);
    }

    saveTasks();
    renderTasks();
}

window.togglePin = function (id) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    const task = tasks[idx];
    task.pinned = !task.pinned;

    tasks.splice(idx, 1);

    if (task.pinned) {
        tasks.unshift(task); // top
    } else {
        const firstUnpinnedIdx = tasks.findIndex(t => !t.pinned && !t.completed);
        const insertIdx = firstUnpinnedIdx === -1 ? tasks.filter(t => t.pinned && !t.completed).length : firstUnpinnedIdx;
        tasks.splice(insertIdx, 0, task);
    }

    saveTasks();
    renderTasks();
}

window.deleteTask = function (id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

window.updateTaskText = function (id, newText) {
    const task = tasks.find(t => t.id === id);
    if (task && newText.trim()) {
        task.text = newText.trim();
        saveTasks();
    }
}

function checkStreak(completed, total) {
    const today = new Date().toDateString();

    if (total > 0 && completed === total) {
        if (lastCompletionDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastCompletionDate === yesterday.toDateString()) {
                currentStreak++;
            } else if (lastCompletionDate !== today) {
                currentStreak = 1;
            }

            lastCompletionDate = today;
            localStorage.setItem('task-streak', currentStreak);
            localStorage.setItem('last-completion-date', lastCompletionDate);
        }
    } else if (lastCompletionDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastCompletionDate !== today && lastCompletionDate !== yesterday.toDateString()) {
            currentStreak = 0;
            localStorage.setItem('task-streak', currentStreak);
        }
    }

    if (streakCountEl) streakCountEl.innerText = currentStreak;
}

// Event Listeners
if (newTaskInput) {
    newTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(e.target.value);
            e.target.value = '';
        }
    });
}

if (addTaskBtnInline) {
    addTaskBtnInline.addEventListener('click', () => {
        addTask(newTaskInput.value);
        newTaskInput.value = '';
    });
}

if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
        if (newTaskInput) newTaskInput.focus();
    });
}

if (editTaskBtn) {
    editTaskBtn.addEventListener('click', () => {
        isEditMode = !isEditMode;
        if (isEditMode) {
            editTaskBtn.style.color = "white";
            editTaskBtn.style.background = "rgba(255, 255, 255, 0.3)";
        } else {
            editTaskBtn.style.color = "";
            editTaskBtn.style.background = "";
        }
        renderTasks();
    });
}

// Drag and drop for reordering
let draggedItem = null;

function handleDragStart(e) {
    if (isEditMode) {
        e.preventDefault();
        return;
    }
    if (e.target.tagName === 'LI') {
        draggedItem = e.target;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => e.target.classList.add('dragging'), 0);
    }
}

function handleDragEnd(e) {
    if (e.target.tagName === 'LI') {
        e.target.classList.remove('dragging');
        draggedItem = null;

        // Update task array order based on DOM
        const newTasks = [];

        // Gather from both lists to maintain one array
        document.querySelectorAll('#task-list .task-item').forEach(li => {
            const id = parseInt(li.dataset.id);
            const task = tasks.find(t => t.id === id);
            if (task) newTasks.push(task);
        });

        document.querySelectorAll('#completed-task-list .task-item').forEach(li => {
            const id = parseInt(li.dataset.id);
            const task = tasks.find(t => t.id === id);
            if (task) newTasks.push(task);
        });

        tasks = newTasks;
        saveTasks();
        renderTasks();
    }
}

function handleDragOver(e, container) {
    e.preventDefault();
    const afterElement = getDragAfterElement(container, e.clientY);
    if (draggedItem) {
        if (afterElement == null) {
            container.appendChild(draggedItem);
        } else {
            container.insertBefore(draggedItem, afterElement);
        }
    }
}

if (taskList) {
    taskList.addEventListener('dragstart', handleDragStart);
    taskList.addEventListener('dragend', handleDragEnd);
    taskList.addEventListener('dragover', e => handleDragOver(e, taskList));
}

if (completedTaskList) {
    completedTaskList.addEventListener('dragstart', handleDragStart);
    completedTaskList.addEventListener('dragend', handleDragEnd);
    completedTaskList.addEventListener('dragover', e => handleDragOver(e, completedTaskList));
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Init
renderTasks();
