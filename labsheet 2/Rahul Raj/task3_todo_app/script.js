/**
 * Lab Sheet 02 - Task 2.3: Interactive Todo Application
 * Student: Rahul Raj
 * Core Elements:
 *   1. Runtime Element Append Mechanisms (document.createElement -> append/prepend)
 *   2. Operational Validation Error Flags (Multi-condition input validation)
 *   3. Filter, Status Toggling, Metrics Calculation & LocalStorage Persistence
 */

(function () {
  'use strict';

  // DOM Selectors
  const todoForm = document.getElementById('todo-form');
  const taskInput = document.getElementById('task-input');
  const prioritySelect = document.getElementById('priority-select');
  const categorySelect = document.getElementById('category-select');
  const charCounter = document.getElementById('char-counter');
  const todoList = document.getElementById('todo-list');
  const emptyState = document.getElementById('empty-state');
  
  // Validation Flag Elements
  const flagContainer = document.getElementById('validation-flag-container');
  const flagMessage = document.getElementById('validation-error-message');
  const dismissFlagBtn = document.getElementById('dismiss-flag-btn');

  // Filter Buttons
  const filterTabs = document.querySelectorAll('.filter-tab');
  const clearCompletedBtn = document.getElementById('clear-completed-btn');

  // Metric Counters
  const totalCount = document.getElementById('total-count');
  const activeCount = document.getElementById('active-count');
  const completedCount = document.getElementById('completed-count');
  const metricTotal = document.getElementById('metric-total');
  const metricActive = document.getElementById('metric-active');
  const metricDone = document.getElementById('metric-done');
  const metricRate = document.getElementById('metric-rate');

  // Application State
  const STORAGE_KEY = 'rahul_raj_lab2_todos';
  let todos = [];
  let currentFilter = 'all';

  /**
   * Initialize and Load Saved Todos from LocalStorage
   */
  function initApp() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        todos = JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored tasks:', e);
        todos = [];
      }
    } else {
      // Default sample tasks highlighting syllabus features
      todos = [
        {
          id: 'task_' + Date.now() + '_1',
          text: 'Complete Lab Sheet 01 Semantic HTML Resume',
          priority: 'high',
          category: 'Full Stack',
          completed: true,
          createdAt: '18 Sep, 10:30'
        },
        {
          id: 'task_' + Date.now() + '_2',
          text: 'Implement CSS Flexbox Photo Grid with Fluid Mobile Wrapping',
          priority: 'medium',
          category: 'Architecture',
          completed: false,
          createdAt: '18 Sep, 14:15'
        }
      ];
      saveTodos();
    }

    renderAllTodos();
    updateMetrics();
  }

  /**
   * Save Tasks to LocalStorage
   */
  function saveTodos() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  /* ==========================================================================
     OPERATIONAL VALIDATION ERROR FLAGS ENGINE
     ========================================================================== */

  /**
   * Trigger and display operational validation error flag
   * @param {string} message - Specific error flag detail
   */
  function triggerValidationErrorFlag(message) {
    flagMessage.textContent = message;
    flagContainer.style.display = 'block';
    taskInput.classList.add('input-error');
    taskInput.focus();

    // Auto-dismiss after 6 seconds if not dismissed manually
    clearTimeout(triggerValidationErrorFlag.timeoutId);
    triggerValidationErrorFlag.timeoutId = setTimeout(() => {
      dismissValidationFlag();
    }, 6000);
  }

  /**
   * Dismiss the validation flag and reset error borders
   */
  function dismissValidationFlag() {
    flagContainer.style.display = 'none';
    taskInput.classList.remove('input-error');
  }

  dismissFlagBtn.addEventListener('click', dismissValidationFlag);

  /**
   * Validate Input against operational constraints
   * @param {string} text - Raw input string
   * @returns {boolean} - Returns true if valid, false if error flagged
   */
  function validateTaskInput(text) {
    const trimmed = text.trim();

    // 1. Check for empty or whitespace-only strings
    if (!trimmed || trimmed.length === 0) {
      triggerValidationErrorFlag('Operational Error: Task description cannot be empty or consist solely of whitespace characters.');
      return false;
    }

    // 2. Check for minimum required character threshold
    if (trimmed.length < 3) {
      triggerValidationErrorFlag(`Operational Error: Task length is insufficient (${trimmed.length}/3 chars). Please provide a descriptive title.`);
      return false;
    }

    // 3. Check for duplicates in active tasks
    const isDuplicate = todos.some(
      todo => todo.text.toLowerCase() === trimmed.toLowerCase() && !todo.completed
    );
    if (isDuplicate) {
      triggerValidationErrorFlag(`Operational Error: Duplicate task detected! "${trimmed}" is already an active task.`);
      return false;
    }

    // Validation passed
    dismissValidationFlag();
    return true;
  }

  /* ==========================================================================
     RUNTIME ELEMENT APPEND MECHANISMS (Core Syllabus Implementation)
     ========================================================================== */

  /**
   * Constructs a fully qualified DOM node using document.createElement()
   * and appends all necessary child layout structures, attributes, and events.
   * @param {Object} todo - The task data object
   * @returns {HTMLLIElement} - Ready-to-insert DOM node
   */
  function createTodoElement(todo) {
    // 1. Create root <li> container
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.id = todo.id;
    li.setAttribute('role', 'listitem');
    li.setAttribute('data-priority', todo.priority);
    li.setAttribute('data-category', todo.category);

    // 2. Create interactive Checkbox
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'todo-checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `Mark task "${todo.text}" as completed`);
    checkbox.addEventListener('change', () => toggleTodoStatus(todo.id));

    // 3. Create Details Container
    const details = document.createElement('div');
    details.className = 'todo-details';

    // 3a. Task Title
    const title = document.createElement('span');
    title.className = 'todo-title';
    title.textContent = todo.text;

    // 3b. Metadata Container (Priority Badge, Category, Timestamp)
    const meta = document.createElement('div');
    meta.className = 'todo-meta';

    // Priority Tag
    const priorityBadge = document.createElement('span');
    priorityBadge.className = `badge-tag priority-${todo.priority}`;
    priorityBadge.textContent = `${todo.priority.toUpperCase()}`;

    // Category Tag
    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'badge-category';
    categoryBadge.textContent = todo.category;

    // Creation Timestamp
    const timestamp = document.createElement('span');
    timestamp.className = 'todo-timestamp';
    timestamp.textContent = `&bull; ${todo.createdAt}`;
    timestamp.innerHTML = `&bull; <time>${todo.createdAt}</time>`;

    meta.appendChild(priorityBadge);
    meta.appendChild(categoryBadge);
    meta.appendChild(timestamp);

    details.appendChild(title);
    details.appendChild(meta);

    // 4. Create Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-delete';
    deleteBtn.title = 'Delete Task';
    deleteBtn.setAttribute('aria-label', `Delete task "${todo.text}"`);
    deleteBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="3 6 5 6 21 6"></polyline>
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      </svg>
    `;
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    // 5. Assemble all subnodes into root <li> element
    li.appendChild(checkbox);
    li.appendChild(details);
    li.appendChild(deleteBtn);

    return li;
  }

  /**
   * Runtime element append mechanism: Adds new task to memory and DOM
   */
  function handleAddTask(e) {
    e.preventDefault();
    const rawText = taskInput.value;

    // Run operational validation error flag checker
    if (!validateTaskInput(rawText)) {
      return;
    }

    const now = new Date();
    const timeFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ', ' +
                          now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newTodo = {
      id: 'task_' + Date.now(),
      text: rawText.trim(),
      priority: prioritySelect.value,
      category: categorySelect.value,
      completed: false,
      createdAt: timeFormatted
    };

    // Add to state
    todos.unshift(newTodo);
    saveTodos();

    // Runtime DOM append mechanism: Inject newly created element at the top of the list
    const domNode = createTodoElement(newTodo);
    todoList.prepend(domNode);

    // Reset Form Input
    taskInput.value = '';
    charCounter.textContent = '0/100';
    taskInput.focus();

    updateMetrics();
    checkEmptyState();
  }

  /**
   * Toggle task status (Active <-> Completed)
   */
  function toggleTodoStatus(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    todo.completed = !todo.completed;
    saveTodos();

    const domItem = document.getElementById(id);
    if (domItem) {
      if (todo.completed) {
        domItem.classList.add('completed');
      } else {
        domItem.classList.remove('completed');
      }

      // Re-apply filter visibility
      if (currentFilter === 'active' && todo.completed) {
        domItem.style.display = 'none';
      } else if (currentFilter === 'completed' && !todo.completed) {
        domItem.style.display = 'none';
      } else {
        domItem.style.display = 'flex';
      }
    }

    updateMetrics();
  }

  /**
   * Delete task with runtime removal transition
   */
  function deleteTodo(id) {
    const domItem = document.getElementById(id);
    if (domItem) {
      domItem.classList.add('fade-out');
      setTimeout(() => {
        todos = todos.filter(t => t.id !== id);
        saveTodos();
        domItem.remove();
        updateMetrics();
        checkEmptyState();
      }, 250);
    }
  }

  /**
   * Clear all completed tasks
   */
  function clearCompleted() {
    const completedTasks = todos.filter(t => t.completed);
    if (completedTasks.length === 0) return;

    completedTasks.forEach(task => {
      const domItem = document.getElementById(task.id);
      if (domItem) domItem.classList.add('fade-out');
    });

    setTimeout(() => {
      todos = todos.filter(t => !t.completed);
      saveTodos();
      renderAllTodos();
      updateMetrics();
    }, 250);
  }

  /**
   * Render all tasks according to current filter
   */
  function renderAllTodos() {
    todoList.innerHTML = '';

    const filtered = todos.filter(todo => {
      if (currentFilter === 'active') return !todo.completed;
      if (currentFilter === 'completed') return todo.completed;
      return true;
    });

    filtered.forEach(todo => {
      const node = createTodoElement(todo);
      todoList.appendChild(node);
    });

    checkEmptyState();
  }

  /**
   * Check and toggle empty state display
   */
  function checkEmptyState() {
    const visibleCount = todoList.querySelectorAll('.todo-item').length;
    emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  /**
   * Update all numeric badges and analytics metrics
   */
  function updateMetrics() {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Filter Badges
    totalCount.textContent = total;
    activeCount.textContent = active;
    completedCount.textContent = completed;

    // Metric Summary Numbers
    metricTotal.textContent = total;
    metricActive.textContent = active;
    metricDone.textContent = completed;
    metricRate.textContent = `${rate}%`;
  }

  /* ==========================================================================
     EVENT LISTENERS & BINDINGS
     ========================================================================== */

  // Form Submit
  todoForm.addEventListener('submit', handleAddTask);

  // Input Character Counter & Auto Error Clear
  taskInput.addEventListener('input', () => {
    const len = taskInput.value.length;
    charCounter.textContent = `${len}/100`;
    if (len >= 3 && taskInput.classList.contains('input-error')) {
      dismissValidationFlag();
    }
  });

  // Filter Tabs
  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      currentFilter = tab.getAttribute('data-filter');
      renderAllTodos();
    });
  });

  // Clear Completed
  clearCompletedBtn.addEventListener('click', clearCompleted);

  // Run on load
  initApp();

})();
