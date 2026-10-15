# Lab Sheet 3: React State Management & Component Hierarchy (Todo SPA)

**Student Name:** Pulkit Goyal  
**CUID:** CU24250263  
**Roll Number:** 40  
**Section:** A  
**Course:** Full Stack Web Development (B.Tech CSE)  

---

## 1. Objective & Lab Questions
1. Build an interactive Single-Page Application (SPA) in **React** using Vite.
2. Master React state management using the **`useState` hook** and unidirectional data flow (props passing).
3. Implement core CRUD operations on tasks:
   - **Create:** Add new tasks with title, category, and priority.
   - **Read:** Display task list with filters (`All`, `Pending`, `Completed`).
   - **Update:** Toggle completion status and inline edit existing task names.
   - **Delete:** Remove tasks with confirmation and clear completed tasks in bulk.
4. Persist task state across browser refreshes using `localStorage` through `useEffect`.
5. Break down the UI into clean, reusable modular components: `TaskHeader`, `AddTaskForm`, `TaskFilters`, `TaskList`, and `TaskItem`.

---

## 2. Component Architecture
```
App (manages `tasks` state, filter, search, localStorage)
├── TaskHeader (shows student details, total & completed count)
├── AddTaskForm (form input, validation, onSubmit handler)
├── TaskFilters (filter buttons: All / Active / Completed, search bar)
└── TaskList (renders list or empty state)
    └── TaskItem (checkbox toggle, edit mode, delete button, priority badge)
```

---

## 3. How to Run Locally
```bash
# 1. Navigate to the project directory
cd 03-Lab-03-React-Todo-App

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 4. Key Concepts & Viva Answers (For Self-Demonstration)

### Q1: Why should React state never be modified directly (e.g. `tasks.push(newTask)`)?
- React uses shallow reference comparison to detect state changes and schedule UI re-renders. Modifying an existing array/object in place mutates the original reference, causing React to miss the update.
- Always use immutable update patterns: `setTasks([...tasks, newTask])` or `setTasks(prev => prev.filter(t => t.id !== id))`.

### Q2: What is the purpose of the `key` prop in React lists?
- The `key` prop gives each item in an array a stable identity across renders. It enables React's virtual DOM reconciliation algorithm to identify which specific items were added, updated, or removed, preserving component state and maximizing rendering performance.

### Q3: How does `useEffect` synchronize with `localStorage`?
- When the component mounts, an initial state initializer reads from `localStorage.getItem('tasks')`.
- A synchronization `useEffect` runs whenever the `tasks` dependency array changes, serializing the latest state to `localStorage.setItem('tasks', JSON.stringify(tasks))`.
