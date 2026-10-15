# Telemetry Tasks 🚀

A modern, component-based task management interface featuring a futuristic glassmorphism UI. Developed as part of **Lab 3: Introduction to React.js**, this project demonstrates functional state management, component-driven architecture, and data persistence using React Hooks.

## ✨ Features

* **Component-Based Architecture:** Built with a modular structure separating concerns across `TaskList`, `TaskItem`, and `AddTaskForm` components.
* **State Persistence:** Utilizes the `useEffect` hook and `localStorage` API to ensure your task sequences are saved across browser reloads.
* **Operational Validation:** Implements real-time error flagging, state-driven UI changes, and CSS glitch animations to prevent empty task submissions.
* **Futuristic UI/UX:** A custom-designed, dark-mode glassmorphism aesthetic featuring deep-space gradients, neon accents, and smooth interactive state transitions.

## 🛠️ Tech Stack

* **Core:** React.js (Functional Components, Hooks)
* **Build Tool:** Vite
* **Styling:** Vanilla CSS3 (Custom Variables, Flexbox, Animations)

## 🗂️ Component Architecture

Data and props flow through the application using the following component tree:

```text
App (Manages global state and localStorage)
 ├── AddTaskForm (Handles local input state and submission validation)
 └── TaskList (Iterates through task arrays)
      └── TaskItem (Renders individual tasks and handles complete/delete actions)