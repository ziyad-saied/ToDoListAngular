export interface GetAllTasks {
  content: GetTask[],
  totalPages: number,
}

export interface GetTask {
  id: number,
  title: string,
  description: string,
  dueDate: Date,
  isCompleted: boolean,
  createdAt:Date
}
