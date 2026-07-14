import express, { Request, Response } from "express";
import cors from "cors";
import { Task, NewTask } from "./types";
import { tasks, getNextId } from "./data";

const app = express();
const PORT: number = 5000;

app.use(cors());
app.use(express.json());

app.get("/tasks", (req: Request, res: Response) => {
  res.json(tasks);
});

app.get("/tasks/:id", (req: Request, res: Response) => {
  const id: number = Number(req.params.id);
  const task: Task | undefined = tasks.find((t) => t.id === id);

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  res.json(task);
});

app.post("/tasks", (req: Request, res: Response) => {
  const body: NewTask = req.body;

  const newTask: Task = {
    id: getNextId(),
    title: body.title,
    description: body.description,
    completed: false,
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put("/tasks/:id", (req: Request, res: Response) => {
  const id: number = Number(req.params.id);
  const body: NewTask = req.body;
  const task: Task | undefined = tasks.find((t) => t.id === id);

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  task.title = body.title;
  task.description = body.description;

  res.json(task);
});

app.patch("/tasks/:id/toggle", (req: Request, res: Response) => {
  const id: number = Number(req.params.id);
  const task: Task | undefined = tasks.find((t) => t.id === id);

  if (!task) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  task.completed = !task.completed;
  res.json(task);
});

app.delete("/tasks/:id", (req: Request, res: Response) => {
  const id: number = Number(req.params.id);
  const index: number = tasks.findIndex((t) => t.id === id);

  if (index === -1) {
    res.status(404).json({ message: "Task not found" });
    return;
  }

  tasks.splice(index, 1);
  res.json({ message: "Task deleted" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});