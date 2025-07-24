import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { taskSchema } from '../validators/task.validator';

export class TaskController {
  constructor(private readonly service: TaskService) {}

  getAll = async (req: Request, res: Response) => {
    try {
      const { assignee, priority, deadline } = req.query;

      const filters: any = {};
      if (assignee) filters.assignee = assignee;
      if (priority) filters.priority = priority;

      // Validate deadline format (optional)
      if (deadline && !isNaN(Date.parse(deadline as string))) {
        filters.deadline = new Date(deadline as string);
      }

      const data = await this.service.getAll(filters);
      res.json(data);
    } catch (error) {
      console.error("❌ Error in getAll:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  getOne = async (req: Request, res: Response) => {
    try {
      const task = await this.service.getOne(+req.params.id);
      if (!task) return res.status(404).json({ message: 'Task not found' });
      res.json(task);
    } catch (err) {
      console.error("❌ Error in getOne:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  create = async (req: Request, res: Response) => {
    console.log("📥 Received from FE:", req.body);

    const result = taskSchema.safeParse(req.body);

    if (!result.success) {
      console.error("❌ Zod validation error:", result.error.issues);
      return res.status(400).json({
        message: "Invalid input",
        errors: result.error.issues,
      });
    }

    try {
      const task = await this.service.create(result.data);
      res.status(201).json(task);
    } catch (err) {
      console.error("🔥 Error creating task:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  search = async (req: Request, res: Response) => {
    try {
      const keyword = req.query.q?.toString().trim() || "";
      console.log("🔍 Search keyword:", keyword);

      const result = await this.service.searchTasks(keyword);
      res.json(result);
    } catch (error) {
      console.error("❌ Error in search:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };

  update = async (req: Request, res: Response) => {
    const result = taskSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json(result.error);
    }

    try {
      const task = await this.service.update(+req.params.id, result.data);
      res.json(task);
    } catch (err) {
      console.error("❌ Error updating task:", err);
      res.status(404).json({ message: 'Task not found' });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      await this.service.delete(+req.params.id);
      res.status(204).send();
    } catch (err) {
      console.error("❌ Error deleting task:", err);
      res.status(404).json({ message: 'Task not found' });
    }
  };
}
