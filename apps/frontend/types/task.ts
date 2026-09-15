export type TaskStatus = "OPEN" | "DONE" | "CANCELED";

export type Task = {
  id: string;
  title: string;
  status: TaskStatus;
  dueAt: string | null;
};
