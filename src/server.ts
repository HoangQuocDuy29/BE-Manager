import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import express from 'express';
import passport from 'passport';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './config/mikro-orm.config';
import { createTaskRouter } from './routes/task.route';
import { createUserRouter } from './routes/user.route';
import { authRouter } from './routes/auth.route';
import { configurePassport } from './config/passport-config';
import { SqlEntityManager } from '@mikro-orm/postgresql';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware (chỉ trong development)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Test route
app.get('/', (req, res) => {
  res.json({
    message: '🎯 Task API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    status: 'healthy'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
    }
  });
});

async function startServer() {
  try {
    // Initialize MikroORM
    console.log('🔄 Connecting to database...');
    const orm = await MikroORM.init(mikroConfig);
    console.log('✅ Connected to PostgreSQL');

    const em = orm.em.fork() as SqlEntityManager;

    // Configure Passport
    console.log('🔐 Configuring authentication...');
    configurePassport(passport, em);
    app.use(passport.initialize());

    // Setup routes
    console.log('🛣️  Setting up routes...');

    // Auth routes
    app.use('/api/auth', authRouter(em));

    // Task routes
    const taskRouter = await createTaskRouter(em);
    app.use('/api/tasks', taskRouter);

    // User routes
    const userRouter = await createUserRouter(em);
    app.use('/api/users', userRouter);

    // 404 handler - PHẢI ĐẶT SAU TẤT CẢ ROUTES
    app.use((req, res) => {
      console.warn(`⚠️ 404 Not Found: ${req.method} ${req.originalUrl}`);
      res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl,
        timestamp: new Date().toISOString()
      });
    });

    // Error handler middleware
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('❌ Error:', err.message);
      if (process.env.NODE_ENV === 'development') {
        console.error('Stack trace:', err.stack);
      }
      
      res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        timestamp: new Date().toISOString(),
        ...(process.env.NODE_ENV === 'development' && { error: err })
      });
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
      try {
        await orm.close();
        console.log('✅ Database connection closed');
        process.exit(0);
      } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Start server
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
      console.log('\n🚀 Server running at http://localhost:' + PORT);
      
      // Log all available endpoints
      console.log('\n📋 Available endpoints:');
      
      // Auth endpoints
      console.log('  Auth endpoints:');
      console.log('    - POST /api/auth/register (register new user)');
      console.log('    - POST /api/auth/login (user login)');
      console.log('    - GET  /api/auth/me (get current user info)');
      
      // Task endpoints
      console.log('  Task endpoints:');
      console.log('    - GET  /api/tasks (list tasks with filters)');
      console.log('    - POST /api/tasks (create new task)');
      console.log('    - PUT  /api/tasks/:id (update task)');
      console.log('    - DELETE /api/tasks/:id (delete task)');
      console.log('    - GET  /api/tasks/search (search tasks)');
      
      // User endpoints (comprehensive list)
      console.log('  User endpoints:');
      console.log('    - GET    /api/users (list users with pagination & filters)');
      console.log('    - GET    /api/users/stats (user statistics - admin only)');
      console.log('    - GET    /api/users/search (search users)');
      console.log('    - GET    /api/users/:id (get user by ID)');
      console.log('    - POST   /api/users (create new user - admin only)');
      console.log('    - PUT    /api/users/:id (update user)');
      console.log('    - DELETE /api/users/:id (delete user - admin only)');
      
      // System endpoints
      console.log('  System endpoints:');
      console.log('    - GET  / (API status)');
      console.log('    - GET  /health (health check)');
      
      console.log('\n💡 Tips:');
      console.log('  - Use POST /api/auth/login to get authentication token');
      console.log('  - Include "Authorization: Bearer <token>" header for protected routes');
      console.log('  - Admin endpoints require admin role permissions');
      console.log('  - All User endpoints support filtering, pagination, and search');
      
      console.log('\n📊 System Info:');
      console.log(`  - Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  - Node.js: ${process.version}`);
      console.log(`  - Memory: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`);
      
      console.log('\n🎉 Server is ready to accept connections!\n');
    });

    // Handle server errors
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
      } else {
        console.error('❌ Server error:', error);
      }
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();
