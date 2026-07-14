export interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export type NewTask = Omit<Task, "id" | "completed">;