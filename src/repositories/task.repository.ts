import { SqlEntityManager } from '@mikro-orm/postgresql';
import { Task } from '../entities/Task';
import { RequiredEntityData } from '@mikro-orm/core';

export class TaskRepository {
  constructor(private readonly em: SqlEntityManager) {}

  async findAll(filters: Partial<Task>) {
    const where: any = {};

    if (filters.assignee) {
      // Tìm gần đúng không phân biệt hoa thường
      where.assignee = { $ilike: `%${filters.assignee}%` };
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.deadline) {
      where.deadline = filters.deadline;
    }

    return this.em.find(Task, where);
  }

  findOne(id: number) {
    return this.em.findOne(Task, { id });
  }

  async create(data: RequiredEntityData<Task>) {
    const task = this.em.create(Task, data);
    await this.em.persistAndFlush(task);
    return task;
  }

  async update(id: number, data: Partial<Task>) {
    const task = await this.findOne(id);
    if (!task) throw new Error('Task not found');

    this.em.assign(task, data);
    await this.em.flush();
    return task;
  }

  async delete(id: number) {
    const task = await this.findOne(id);
    if (!task) throw new Error('Task not found');

    await this.em.removeAndFlush(task);
  }
}
