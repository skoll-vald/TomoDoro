export interface Task {
  id: string;
  text: string;
  completed: boolean;
  parentId?: string;
  createdAt: { seconds: number; nanoseconds: number; };
}
