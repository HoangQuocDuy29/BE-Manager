// File: src/routes/user.route.ts (MỚI)
import { Router } from 'express';
import { SqlEntityManager } from '@mikro-orm/postgresql';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { isAuthenticated } from '../middleware/isAuthenticated';

export async function createUserRouter(em: SqlEntityManager) {
  const router = Router();

  // Khởi tạo dependency injection chain: Repository -> Service -> Controller
  const repository = new UserRepository(em);
  const service = new UserService(repository);
  const controller = new UserController(service);

  // Apply authentication middleware to all user routes
  // Chỉ admin hoặc authenticated users mới có thể access user management
  router.use(isAuthenticated);

  // ⚠️ QUAN TRỌNG: Đặt routes cụ thể trước routes có parameters
  // GET /api/users/search - Tìm kiếm users
  router.get('/search', controller.search);
  
  // GET /api/users/stats - Thống kê users (for dashboard)
  router.get('/stats', controller.getStats);

  // CRUD Routes
  // GET /api/users - Lấy danh sách users với filters & pagination
  router.get('/', controller.getAll);
  
  // GET /api/users/:id - Lấy 1 user theo ID
  router.get('/:id', controller.getOne);
  
  // POST /api/users - Tạo user mới
  router.post('/', controller.create);
  
  // PUT /api/users/:id - Cập nhật user
  router.put('/:id', controller.update);
  
  // DELETE /api/users/:id - Xóa user (soft delete)
  // Query param: ?hard=true để hard delete
  router.delete('/:id', controller.delete);

  return router;
}