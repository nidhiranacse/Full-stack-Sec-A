import { useEffect, useState } from "react";
import AddTaskForm from "./components/AddTaskForm";
import TaskList from "./components/TaskList";
import "./App.css";

function App() {
    const [tasks, setTasks] = useState(() => {
        const savedTasks = localStorage.getItem("reactTasks");
        return savedTasks ? JSON.parse(savedTasks) : [];
    });
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        localStorage.setItem("reactTasks", JSON.stringify(tasks));
    }, [tasks]);

    const addTask = (text) => {
        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };

        setTasks([...tasks, newTask]);
    };

    const toggleTask = (id) => {
        setTasks(
            tasks.map((task) =>
                task.id === id
                    ? { ...task, completed: !task.completed }
                    : task
            )
        );
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter((task) => task.id !== id));
    };

    const editTask = (id, newText) => {
        setTasks(
            tasks.map((task) =>
                task.id === id
                    ? { ...task, text: newText }
                    : task
            )
        );
    };

    const clearCompleted = () => {
        setTasks(tasks.filter((task) => !task.completed));
    };

    const filteredTasks = tasks.filter((task) => {
        if (filter === "pending") return !task.completed;
        if (filter === "completed") return task.completed;
        return true;
    });

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const pendingTasks = totalTasks - completedTasks;

    return (
        <div className="app">
            <div className="todo-container">
                <header>
                    <h1>My Todo List</h1>
                    <p>Manage your daily tasks with React</p>
                </header>

                <AddTaskForm onAddTask={addTask} />

                <div className="stats">
                    <div>
                        <strong>{totalTasks}</strong>
                        <span>Total</span>
                    </div>
                    <div>
                        <strong>{pendingTasks}</strong>
                        <span>Pending</span>
                    </div>
                    <div>
                        <strong>{completedTasks}</strong>
                        <span>Completed</span>
                    </div>
                </div>

                <div className="filters">
                    <button
                        className={filter === "all" ? "active" : ""}
                        onClick={() => setFilter("all")}
                    >
                        All
                    </button>
                    <button
                        className={filter === "pending" ? "active" : ""}
                        onClick={() => setFilter("pending")}
                    >
                        Pending
                    </button>
                    <button
                        className={filter === "completed" ? "active" : ""}
                        onClick={() => setFilter("completed")}
                    >
                        Completed
                    </button>
                </div>

                <TaskList
                    tasks={filteredTasks}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                    onEdit={editTask}
                />

                {completedTasks > 0 && (
                    <button className="clear-button" onClick={clearCompleted}>
                        Clear Completed
                    </button>
                )}
            </div>
        </div>
    );
}

export default App;