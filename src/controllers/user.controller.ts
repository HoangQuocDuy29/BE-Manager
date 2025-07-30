// File: src/controllers/user.controller.ts (MỚI)
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
  constructor(private readonly service: UserService) {}

  // GET /api/users - Lấy danh sách users với filters
  getAll = async (req: Request, res: Response) => {
    try {
      // Validate query parameters
      const filtersResult = userFiltersSchema.safeParse(req.query);
      if (!filtersResult.success) {
        return res.status(400).json({
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
      console.error('❌ Error in UserController.getAll:', error);
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
      console.error('❌ Error in UserController.getOne:', error);
      
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
      console.error('❌ Error in UserController.create:', error);
      
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
          message: 'Invalid user ID',
          errors: paramsResult.error.issues
        });
      }

      // Validate request body
      const bodyResult = updateUserSchema.safeParse(req.body);
      if (!bodyResult.success) {
        return res.status(400).json({
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
      console.error('❌ Error in UserController.update:', error);
      
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
      console.error('❌ Error in UserController.delete:', error);
      
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
      console.error('❌ Error in UserController.search:', error);
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
      console.error('❌ Error in UserController.getStats:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}