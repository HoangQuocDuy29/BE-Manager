// File: src/routes/user.route.ts (UPDATED với logging và improvements)
import { Router } from 'express';
import { SqlEntityManager } from '@mikro-orm/postgresql';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { isAuthenticated } from '../middleware/isAuthenticated';
import { isAdmin } from '../middleware/isAdmin'; // Thêm admin middleware

export async function createUserRouter(em: SqlEntityManager) {
  const router = Router();

  try {
    // Khởi tạo dependency injection chain: Repository -> Service -> Controller
    const repository = new UserRepository(em);
    const service = new UserService(repository);
    const controller = new UserController(service);

    // Log User API endpoints một lần duy nhất
    console.log('\n📋 User API endpoints:');
    console.log('  - GET    /api/users (list users with pagination & filters)');
    console.log('  - GET    /api/users/stats (user statistics - admin only)');
    console.log('  - GET    /api/users/search (search users)');
    console.log('  - GET    /api/users/:id (get user by ID)');
    console.log('  - POST   /api/users (create new user - admin only)');
    console.log('  - PUT    /api/users/:id (update user)');
    console.log('  - DELETE /api/users/:id (delete user - admin only)');

    // Apply authentication middleware to all user routes
    router.use(isAuthenticated);

    // ⚠️ QUAN TRỌNG: Đặt routes cụ thể trước routes có parameters
    
    // GET /api/users/search - Tìm kiếm users (authenticated users)
    router.get('/search', controller.search);
    
    // GET /api/users/stats - Thống kê users (admin only)
    router.get('/stats', isAdmin, controller.getStats);

    // CRUD Routes
    
    // GET /api/users - Lấy danh sách users với filters & pagination
    router.get('/', controller.getAll);
    
    // GET /api/users/:id - Lấy 1 user theo ID
    router.get('/:id', controller.getOne);
    
    // POST /api/users - Tạo user mới (admin only)
    router.post('/', isAdmin, controller.create);
    
    // PUT /api/users/:id - Cập nhật user (user có thể update chính mình, admin update bất kỳ ai)
    router.put('/:id', controller.update);
    
    // DELETE /api/users/:id - Xóa user (admin only)
    // Query param: ?hard=true để hard delete
    router.delete('/:id', isAdmin, controller.delete);

    console.log('✅ User routes initialized successfully');
    
    return router;

  } catch (error) {
    console.error('❌ Failed to initialize User routes:', error);
    throw error;
  }
}

// Export route info for main server logging
export const userRouteInfo = {
  prefix: '/api/users',
  routes: [
    { method: 'GET', path: '/', description: 'list users with pagination & filters', auth: 'authenticated' },
    { method: 'GET', path: '/stats', description: 'user statistics', auth: 'admin' },
    { method: 'GET', path: '/search', description: 'search users', auth: 'authenticated' },
    { method: 'GET', path: '/:id', description: 'get user by ID', auth: 'authenticated' },
    { method: 'POST', path: '/', description: 'create new user', auth: 'admin' },
    { method: 'PUT', path: '/:id', description: 'update user', auth: 'authenticated' },
    { method: 'DELETE', path: '/:id', description: 'delete user', auth: 'admin' }
  ]
};
