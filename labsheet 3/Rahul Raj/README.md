# Lab 3 — Introduction to React.js

**Student Name:** Rahul Raj  
**Course:** Full Stack Web Development Lab  
**Aim:** Build a component-based front end using React.

---

## 🎯 Syllabus Tasks Addressed

1. **Set up a React app**: Built with modern Vite + React 18+.
2. **Recreate the Lab 2 to-do app as React components**: Modular components created:
   - `<AddTaskForm />`: Input capture with real-time operational validation error flags.
   - `<TaskList />`: List container mapping tasks to child items.
   - `<TaskItem />`: Individual task presentation with status checkbox, priority badges, category tags, timestamp, and delete action.
   - `<FilterTabs />`: Filter navigation (All, Active, Completed, Clear Completed).
   - `<TaskMetrics />`: Live task completion statistics.
3. **Use `useState` and `useEffect` hooks for state and persistence**:
   - `useState` manages tasks state, filter view, and form error states.
   - `useEffect` automatically synchronizes and persists tasks to `localStorage`.
4. **Implement props-based communication between parent and child components**:
   - Parent `<App />` passes data downwards via props.
   - Children notify parent upwards using callback functions (`onAddTask`, `onToggleTask`, `onDeleteTask`).

---

## 🌳 Component Tree Diagram (Deliverable)

```text
                                  +-------------------+
                                  |     <App />       |
                                  | (useState, Effect)|
                                  +---------+---------+
                                            |
        +------------------+----------------+----------------+------------------+
        |                  |                                 |                  |
+-------v--------+  +------v-------+                 +-------v--------+  +------v-------+
| <AddTaskForm />|  | <FilterTabs />|                 |  <TaskList />  |  | <TaskMetrics/>|
|  - onAddTask   |  | - onFilter    |                 |   - tasks[]    |  |   - tasks[]   |
+----------------+  +--------------+                 +-------+--------+  +--------------+
                                                             |
                                                     +-------v--------+
                                                     |  <TaskItem />  |
                                                     |  (rendered xN) |
                                                     +----------------+
```

### Mermaid Architecture Diagram:
```mermaid
graph TD
    App["&lt;App /&gt; (Root State Engine)"] --> AddTaskForm["&lt;AddTaskForm /&gt; (Validation &amp; Input)"]
    App --> FilterTabs["&lt;FilterTabs /&gt; (Filter Tabs &amp; Counter)"]
    App --> TaskList["&lt;TaskList /&gt; (Task Items Container)"]
    App --> TaskMetrics["&lt;TaskMetrics /&gt; (Analytics &amp; Completion Rate)"]
    TaskList --> TaskItem["&lt;TaskItem /&gt; (Dynamic Task Row)"]

    AddTaskForm -.->|onAddTask(newTodo)| App
    FilterTabs -.->|onFilterChange(filter)| App
    TaskItem -.->|onToggle(id) / onDelete(id)| TaskList
    TaskList -.->|onToggleTask / onDeleteTask| App
```

---

## 🚀 How to Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```
