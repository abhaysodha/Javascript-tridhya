import React, { useEffect, useState } from "react";
import "./app.css"
import { Task } from "./types";
import { getTasks, createTask, updateTask, toggleTask, deleteTask } from "./api";

function App(): JSX.Element {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks(): Promise<void> {
    const data = await getTasks();
    setTasks(data);
  }

  async function handleSubmit(e: React.FormEvent): Promise<void> {
    e.preventDefault();

    if (editId === null) {
      await createTask({ title, description });
    } else {
      await updateTask(editId, { title, description });
      setEditId(null);
    }

    setTitle("");
    setDescription("");
    loadTasks();
  }

  function handleEdit(task: Task): void {
    setEditId(task.id);
    setTitle(task.title);
    setDescription(task.description);
  }

  function handleCancelEdit(): void {
    setEditId(null);
    setTitle("");
    setDescription("");
  }

  async function handleToggle(id: number): Promise<void> {
    await toggleTask(id);
    loadTasks();
  }

  async function handleDelete(id: number): Promise<void> {
    await deleteTask(id);
    loadTasks();
  }

  const filteredTasks: Task[] = tasks.filter((task) =>
    task.title.toLowerCase().includes(search.toLowerCase())
  );

  const completedCount: number = tasks.filter((t) => t.completed).length;

  return (
    <div className="app">
      <div className="card">
        <h1>Task Manager</h1>
        <p className="subtitle">
          {tasks.length} total tasks &middot; {completedCount} completed
        </p>

        <form className="task-form" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <div className="form-buttons">
            <button type="submit" className="btn primary">
              {editId === null ? "Add Task" : "Update Task"}
            </button>
            {editId !== null && (
              <button type="button" className="btn secondary" onClick={handleCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <input
          type="text"
          placeholder="Search tasks..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <ul className="task-list">
          {filteredTasks.length === 0 && <p className="empty">No tasks found</p>}

          {filteredTasks.map((task) => (
            <li key={task.id} className={task.completed ? "task completed" : "task"}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task.id)}
              />
              <div className="task-info">
                <strong>{task.title}</strong>
                <p>{task.description}</p>
              </div>
              <div className="task-buttons">
                <button className="btn small" onClick={() => handleEdit(task)}>
                  Edit
                </button>
                <button className="btn small danger" onClick={() => handleDelete(task.id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App; 