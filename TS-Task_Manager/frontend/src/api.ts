import { Task, NewTask } from "./types";

const BASE_URL: string = "http://localhost:5000/tasks";

export async function getTasks(): Promise<Task[]> {
  const res = await fetch(BASE_URL);
  return res.json();
}

export async function createTask(task: NewTask): Promise<Task> {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return res.json();
}

export async function updateTask(id: number, task: NewTask): Promise<Task> {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  return res.json();
}

export async function toggleTask(id: number): Promise<Task> {
  const res = await fetch(`${BASE_URL}/${id}/toggle`, {
    method: "PATCH",
  });
  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
}