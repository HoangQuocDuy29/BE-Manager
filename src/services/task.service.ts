import { Task } from '../entities/Task';
import { TaskRepository } from '../repositories/task.repository';

export class TaskService {
  constructor(private readonly taskRepo: TaskRepository) {}

  async getAllTasks() {
    return await this.taskRepo.findAll();
  }

  async getTask(id: number) {
    return await this.taskRepo.findOne({ id });
  }

  async createTask(data: Partial<Task>) {
    const task = this.taskRepo.create(data);
    await this.taskRepo.persistAndFlush(task);
    return task;
  }

  async updateTask(id: number, data: Partial<Task>) {
    const task = await this.taskRepo.findOneOrFail({ id });
    Object.assign(task, data);
    await this.taskRepo.flush();
    return task;
  }

  async deleteTask(id: number) {
    const task = await this.taskRepo.findOneOrFail({ id });
    await this.taskRepo.removeAndFlush(task);
    return task;
  }
}
