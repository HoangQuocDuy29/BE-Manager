import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { taskSchema } from '../validators/task.validator';

export class TaskController {
  constructor(private readonly service: TaskService) {}

  getAll = async (req: Request, res: Response) => {
    const { assignee, priority, deadline } = req.query;

    const filters: any = {};
    if (assignee) filters.assignee = assignee;
    if (priority) filters.priority = priority;
    if (deadline) filters.deadline = new Date(deadline as string);

    const data = await this.service.getAll(filters);
    res.json(data);
  };

  getOne = async (req: Request, res: Response) => {
    const task = await this.service.getOne(+req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  };

  create = async (req: Request, res: Response) => {
    const result = taskSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);

    const task = await this.service.create(result.data);
    res.status(201).json(task);
  };

  update = async (req: Request, res: Response) => {
    const result = taskSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);

    try {
      const task = await this.service.update(+req.params.id, result.data);
      res.json(task);
    } catch (err) {
      res.status(404).json({ message: 'Task not found' });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.service.delete(+req.params.id);
      res.status(204).send();
    } catch (err) {
      res.status(404).json({ message: 'Task not found' });
    }
  };
}
