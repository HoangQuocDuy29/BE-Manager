import { Router } from 'express';
import { SqlEntityManager } from '@mikro-orm/postgresql';
import { TaskController } from '../controllers/task.controller';
import { TaskService } from '../services/task.service';
import { TaskRepository } from '../repositories/task.repository';

export async function createTaskRouter(em: SqlEntityManager) {
  const router = Router();

  const repo = new TaskRepository(em);
  const service = new TaskService(repo);
  const controller = new TaskController(service);

  router.get('/', controller.getAll.bind(controller));
  router.get('/:id', controller.getOne.bind(controller));
  router.post('/', controller.create.bind(controller));
  router.put('/:id', controller.update.bind(controller));
  router.delete('/:id', controller.delete.bind(controller));

  return router;
}
