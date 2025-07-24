import { TaskRepository } from '../repositories/task.repository';

export class TaskService {
  constructor(private readonly repo: TaskRepository) {}

  getAll(filters: any) {
    return this.repo.findAll(filters);
  }

  getOne(id: number) {
    return this.repo.findOne(id);
  }

  create(data: any) {
    return this.repo.create(data);
  }

  update(id: number, data: any) {
    return this.repo.update(id, data);
  }

  delete(id: number) {
    return this.repo.delete(id);
  }
  searchTasks(keyword: string) {
  return this.repo.search(keyword); // repo.search là nơi xử lý thực tế
}

}
