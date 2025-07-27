import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import express from 'express';
import passport from 'passport';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './config/mikro-orm.config';
import { createTaskRouter } from './routes/task.route';
import { authRouter } from './routes/auth.route';
import { configurePassport } from './config/passport-config';
import { SqlEntityManager } from '@mikro-orm/postgresql';

const app = express();
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('🎯 Task API is running!');
});

async function startServer() {
  try {
    const orm = await MikroORM.init(mikroConfig);
    console.log('✅ Connected to PostgreSQL');

    const em = orm.em.fork() as SqlEntityManager;

    // 👉 Passport + Auth routes
    configurePassport(passport, em);
    app.use(passport.initialize());
    app.use('/api/auth', authRouter(em)); // ✅ FIXED

    // Task routes
    const taskRouter = await createTaskRouter(em);
    app.use('/api/tasks', taskRouter);

    app.listen(3000, () => {
      console.log('🚀 Server running at http://localhost:3000');
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

// 404 middleware
// app.use((req, res) => {
//   console.warn(`⚠️ 404 Not Found: ${req.method} ${req.originalUrl}`);
//   res.status(404).json({
//     message: "Route not found",
//     path: req.originalUrl,
//   });
// });

startServer();
