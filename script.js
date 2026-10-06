const STORAGE_KEY = 'todo-list-items';

const todoForm = document.querySelector('#todoForm');
const todoInput = document.querySelector('#todoInput');
const prioritySelect = document.querySelector('#prioritySelect');
const todoList = document.querySelector('#todoList');
const taskCount = document.querySelector('#taskCount');
const clearAllBtn = document.querySelector('#clearAllBtn');
const filterButtons = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';

function loadTasks() {
  try {
    const storedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return Array.isArray(storedTasks) ? storedTasks : [];
  } catch (error) {
    console.error('Failed to load tasks:', error);
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function createTask(text, priority = 'normal') {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    priority,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

function getVisibleTasks(tasks) {
  if (currentFilter === 'active') {
    return tasks.filter((task) => !task.completed);
  }

  if (currentFilter === 'completed') {
    return tasks.filter((task) => task.completed);
  }

  return tasks;
}

function updateTaskCount(tasks) {
  const remaining = tasks.filter((task) => !task.completed).length;
  const total = tasks.length;

  if (total === 0) {
    taskCount.textContent = '0 tasks';
    return;
  }

  taskCount.textContent = `${remaining} of ${total} remaining`;
}

function renderTasks() {
  const tasks = loadTasks();
  const visibleTasks = getVisibleTasks(tasks);

  if (visibleTasks.length === 0) {
    todoList.innerHTML = '<li class="empty-state">No tasks to show. Add one above.</li>';
    updateTaskCount(tasks);
    return;
  }

  todoList.innerHTML = visibleTasks
    .map(
      (task) => `
        <li class="todo-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
          <input
            class="task-checkbox"
            type="checkbox"
            aria-label="Mark task as complete"
            ${task.completed ? 'checked' : ''}
          />

          <div class="task-main">
            <div class="task-row">
              <span class="task-text">${escapeHtml(task.text)}</span>
              <span class="priority-badge ${task.priority}">${task.priority}</span>
            </div>
          </div>

          <div class="todo-actions">
            <button class="toggle-btn" type="button">
              ${task.completed ? 'Undo' : 'Done'}
            </button>
            <button class="delete-btn" type="button">Delete</button>
          </div>
        </li>
      `,
    )
    .join('');

  updateTaskCount(tasks);
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function addTask(event) {
  event.preventDefault();

  const text = todoInput.value.trim();
  const priority = prioritySelect.value;

  if (!text) {
    todoInput.focus();
    return;
  }

  const tasks = loadTasks();
  tasks.unshift(createTask(text, priority));
  saveTasks(tasks);
  renderTasks();

  todoForm.reset();
  prioritySelect.value = 'normal';
  todoInput.focus();
}

function toggleTask(taskId) {
  const tasks = loadTasks();
  const updatedTasks = tasks.map((task) =>
    task.id === taskId ? { ...task, completed: !task.completed } : task,
  );

  saveTasks(updatedTasks);
  renderTasks();
}

function deleteTask(taskId) {
  const tasks = loadTasks().filter((task) => task.id !== taskId);
  saveTasks(tasks);
  renderTasks();
}

function clearCompleted() {
  const tasks = loadTasks().filter((task) => !task.completed);
  saveTasks(tasks);
  renderTasks();
}

function updateFilter(newFilter) {
  currentFilter = newFilter;

  filterButtons.forEach((button) => {
    const active = button.dataset.filter === newFilter;
    button.classList.toggle('active', active);
  });

  renderTasks();
}

todoForm.addEventListener('submit', addTask);

clearAllBtn.addEventListener('click', clearCompleted);

filterButtons.forEach((button) => {
  button.addEventListener('click', () => updateFilter(button.dataset.filter));
});

todoList.addEventListener('click', (event) => {
  const target = event.target;
  const taskItem = target.closest('.todo-item');

  if (!taskItem) return;

  const taskId = taskItem.dataset.id;

  if (target.classList.contains('delete-btn')) {
    deleteTask(taskId);
    return;
  }

  if (target.classList.contains('toggle-btn')) {
    toggleTask(taskId);
    return;
  }

  if (target.classList.contains('task-checkbox')) {
    toggleTask(taskId);
  }
});

renderTasks();
