import React, { useState, useEffect } from "react";


// AddTaskForm Component
function AddTaskForm({ onAddTask }) {

    const [text, setText] = useState("");

    function handleSubmit(e) {
        e.preventDefault();

        if (text.trim() === "") return;

        onAddTask(text);
        setText("");
    }

    return (
        <form onSubmit={handleSubmit}>

            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter a task"
            />

            <button type="submit">
                Add
            </button>

        </form>
    );
}


// TaskItem Component
function TaskItem({ task, onDelete, onToggle }) {

    return (
        <li>

            <span
                onClick={() => onToggle(task.id)}
                style={{
                    textDecoration: task.completed
                        ? "line-through"
                        : "none",
                    cursor: "pointer"
                }}
            >
                {task.text}
            </span>

            <button onClick={() => onDelete(task.id)}>
                Delete
            </button>

        </li>
    );
}


// TaskList Component
function TaskList({ tasks, onDelete, onToggle }) {

    return (
        <ul>

            {tasks.map((task) => (
                <TaskItem
                    key={task.id}
                    task={task}
                    onDelete={onDelete}
                    onToggle={onToggle}
                />
            ))}

        </ul>
    );
}


// Main App Component
function App() {

    const [tasks, setTasks] = useState(() => {
        return JSON.parse(localStorage.getItem("tasks")) || [];
    });


    // Save tasks whenever they change
    useEffect(() => {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }, [tasks]);


    function addTask(text) {

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };

        setTasks([...tasks, newTask]);
    }


    function deleteTask(id) {

        setTasks(
            tasks.filter((task) => task.id !== id)
        );
    }


    function toggleTask(id) {

        setTasks(
            tasks.map((task) =>
                task.id === id
                    ? {
                        ...task,
                        completed: !task.completed
                    }
                    : task
            )
        );
    }


    return (
            <>
            <style>{`

                * {
                    box-sizing: border-box;
                }

                body {
                    margin: 0;
                    font-family: Arial, sans-serif;
                    background: #e49898;
                }

                .app {
                    width: 450px;
                    max-width: 90%;
                    margin: 70px auto;
                    padding: 30px;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
                }

                h1 {
                    text-align: center;
                    margin-bottom: 25px;
                    color: #4d1c1c;
                }

                .task-form {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 25px;
                }

                .task-input {
                    flex: 1;
                    padding: 12px;
                    border: 1px solid #ccc;
                    border-radius: 6px;
                    font-size: 15px;
                    outline: none;
                }

                .task-input:focus {
                    border-color: #330d0d;
                }

                .add-btn {
                    padding: 12px 18px;
                    border: none;
                    border-radius: 6px;
                    background: #660d0d;
                    color: white;
                    cursor: pointer;
                }

                .add-btn:hover {
                    background: #f30505;
                }

                .task-list {
                    list-style: none;
                    padding: 0;
                    margin: 0;
                }

                .task-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    margin-bottom: 10px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    background: #fafafa;
                }

                .task-item span {
                    cursor: pointer;
                    font-size: 16px;
                }

                .completed {
                    text-decoration: line-through;
                    color: #888;
                }

                .delete-btn {
                    padding: 7px 12px;
                    border: none;
                    border-radius: 5px;
                    background: #444;
                    color: white;
                    cursor: pointer;
                }

                .delete-btn:hover {
                    background: #ea0e0e;
                }

                .empty {
                    text-align: center;
                    color: #888;
                }

            `}</style>

            <div className="app">

                <h1>React To-Do App</h1>

                <AddTaskForm
                    onAddTask={addTask}
                />

                <TaskList
                    tasks={tasks}
                    onDelete={deleteTask}
                    onToggle={toggleTask}
                />

            </div>
        </>
    );
}

export default App;