// src/controllers/task.controller.ts
import { Request, Response } from 'express';
import { wrap } from '@mikro-orm/core';
import { DI } from '../utils/db.helper'; // giả sử bạn có export MikroORM instance
import { Task } from '../entities/Task';
import { createTaskSchema } from '../types/task.schema';

export const createTask = async (req: Request, res: Response) => {
  const parseResult = createTaskSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ errors: parseResult.error.format() });
  }

  const task = new Task();
  wrap(task).assign(parseResult.data); // gán trực tiếp với dữ liệu đã validate

  await DI.em.persistAndFlush(task);

  return res.status(201).json(task);
};
