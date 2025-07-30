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

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.originalUrl}`);
  next();
});

// Test route
app.get('/', (req, res) => {
  res.send('🎯 Task API is running!');
});

async function startServer() {
  try {
    const orm = await MikroORM.init(mikroConfig);
    console.log('✅ Connected to PostgreSQL');

    const em = orm.em.fork() as SqlEntityManager;

    // Configure Passport
    configurePassport(passport, em);
    app.use(passport.initialize());

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
        message: "Route not found",
        path: req.originalUrl,
      });
    });

    // Error handler middleware
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('❌ Error:', err);
      res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
      });
    });

    // Start server
    app.listen(3000, () => {
      console.log('🚀 Server running at http://localhost:3000');
      console.log('📋 Available endpoints:');
      console.log('  - POST /api/auth/register');
      console.log('  - POST /api/auth/login');
      console.log('  - GET  /api/auth/me');
      console.log('  - GET  /api/tasks');
      console.log('  - GET  /api/users');
      console.log('  - POST /api/users');
      console.log('  - PUT  /api/users/:id');
      console.log('  - DELETE /api/users/:id');
      console.log('  - GET  /api/users/search');
      console.log('  - GET  /api/users/stats');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

startServer();