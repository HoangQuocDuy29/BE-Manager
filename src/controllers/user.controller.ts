// File: src/controllers/user.controller.ts (UPDATED - chỉ log API endpoints)
import { Request, Response } from 'express';
import { UserService } from '../services/user.service';
import { 
  createUserSchema, 
  updateUserSchema, 
  userFiltersSchema, 
  userIdSchema, 
  searchQuerySchema 
} from '../validators/user.validator';

export class UserController {
  constructor(private readonly service: UserService) {
    // Log available User API endpoints một lần khi khởi tạo
    console.log('\n📋 User API endpoints:');
    console.log('  - GET    /api/users (list users with pagination & filters)');
    console.log('  - GET    /api/users/stats (user statistics)');
    console.log('  - GET    /api/users/search (search users)');
    console.log('  - GET    /api/users/:id (get user by ID)');
    console.log('  - POST   /api/users (create new user)');
    console.log('  - PUT    /api/users/:id (update user)');
    console.log('  - DELETE /api/users/:id (delete user)');
  }

  // GET /api/users - Lấy danh sách users với filters
  getAll = async (req: Request, res: Response) => {
    try {
      // Validate query parameters
      const filtersResult = userFiltersSchema.safeParse(req.query);
      if (!filtersResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid query parameters',
          errors: filtersResult.error.issues
        });
      }

      const result = await this.service.getAllSanitized(filtersResult.data);
      
      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
        message: `Found ${result.pagination.total} users`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /api/users/:id - Lấy 1 user theo ID
  getOne = async (req: Request, res: Response) => {
    try {
      // Validate ID parameter
      const paramsResult = userIdSchema.safeParse(req.params);
      if (!paramsResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID',
          errors: paramsResult.error.issues
        });
      }

      const user = await this.service.getOne(paramsResult.data.id);
      
      res.json({
        success: true,
        data: user,
        message: 'User retrieved successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // POST /api/users - Tạo user mới
  create = async (req: Request, res: Response) => {
    try {
      // Validate request body
      const bodyResult = createUserSchema.safeParse(req.body);
      if (!bodyResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: bodyResult.error.issues
        });
      }

      const user = await this.service.create(bodyResult.data);
      
      res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // PUT /api/users/:id - Cập nhật user
  update = async (req: Request, res: Response) => {
    try {
      // Validate ID parameter
      const paramsResult = userIdSchema.safeParse(req.params);
      if (!paramsResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID',
          errors: paramsResult.error.issues
        });
      }

      // Validate request body
      const bodyResult = updateUserSchema.safeParse(req.body);
      if (!bodyResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid input data',
          errors: bodyResult.error.issues
        });
      }

      const user = await this.service.update(paramsResult.data.id, bodyResult.data);
      
      res.json({
        success: true,
        data: user,
        message: 'User updated successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      if (error instanceof Error && error.message.includes('already exists')) {
        return res.status(409).json({
          success: false,
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // DELETE /api/users/:id - Xóa user (soft delete)
  delete = async (req: Request, res: Response) => {
    try {
      // Validate ID parameter
      const paramsResult = userIdSchema.safeParse(req.params);
      if (!paramsResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid user ID',
          errors: paramsResult.error.issues
        });
      }

      // Check for hard delete query param
      const hardDelete = req.query.hard === 'true';
      
      const result = await this.service.delete(paramsResult.data.id, hardDelete);
      
      res.json({
        success: true,
        data: result,
        message: hardDelete ? 'User permanently deleted' : 'User deactivated successfully'
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /api/users/search - Tìm kiếm users
  search = async (req: Request, res: Response) => {
    try {
      // Validate query parameters
      const queryResult = searchQuerySchema.safeParse(req.query);
      if (!queryResult.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid search parameters',
          errors: queryResult.error.issues
        });
      }

      const { q, page = 1, limit = 10 } = queryResult.data;
      const result = await this.service.search(q, page, limit);
      
      res.json({
        success: true,
        data: result.users,
        pagination: result.pagination,
        message: `Found ${result.pagination.total} users matching "${q}"`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /api/users/stats - Lấy thống kê users (for dashboard)
  getStats = async (req: Request, res: Response) => {
    try {
      const stats = await this.service.getStats();
      
      res.json({
        success: true,
        data: stats,
        message: 'User statistics retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}
