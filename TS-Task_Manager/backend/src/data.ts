import { Task } from "./types";

export let tasks: Task[] = [];
export let nextId: number = 1;

export function getNextId(): number {
  const id = nextId;
  nextId = nextId + 1;
  return id;
}
