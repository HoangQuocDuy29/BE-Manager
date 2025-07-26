import { Router } from 'express';
import { SqlEntityManager } from '@mikro-orm/postgresql';
import { TaskController } from '../controllers/task.controller';
import { TaskService } from '../services/task.service';
import { TaskRepository } from '../repositories/task.repository';
import { authenticate } from '../middlewares/auth.middleware';

export async function createTaskRouter(em: SqlEntityManager) {
  const router = Router();

  // Khởi tạo repo - service - controller
  const repo = new TaskRepository(em);
  const service = new TaskService(repo);
  const controller = new TaskController(service);

  // ⚠️ Route công khai: search (nếu bạn muốn public)
  router.get('/search', controller.search.bind(controller));

  // ✅ Các route cần xác thực JWT
  router.use(authenticate); // Áp dụng middleware cho tất cả các route bên dưới

  router.get('/', controller.getAll.bind(controller));
  router.get('/:id', controller.getOne.bind(controller));
  router.post('/', controller.create.bind(controller));
  router.put('/:id', controller.update.bind(controller));
  router.delete('/:id', controller.delete.bind(controller));

  // Ví dụ route riêng cho user đã đăng nhập
  router.get('/me', controller.getAll.bind(controller));

  return router;
}
