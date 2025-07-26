/// <reference path="./types/global.d.ts" />
/// <reference path="./types/express/index.d.ts" />

import 'reflect-metadata';
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { MikroORM } from '@mikro-orm/core';
import { SqlEntityManager } from '@mikro-orm/postgresql';
import mikroConfig from './config/mikro-orm.config';

import authRoutes from './routes/auth.route';
import { createTaskRouter } from './routes/task.route';

const app = express();

// 🌐 Middlewares
app.use(cors());
app.use(express.json());

// 🔐 Public Routes
app.use('/api/auth', authRoutes);

// ✅ Health check route
app.get('/', (req, res) => {
  res.send('🎯 Task API is running!');
});

// 🚀 Start server
async function startServer() {
  try {
    const orm = await MikroORM.init(mikroConfig);
    console.log('✅ Connected to PostgreSQL');

    // Gán ORM vào biến toàn cục để dùng ở middleware & service
    global.orm = orm;

    const em = orm.em.fork() as SqlEntityManager;

    // Mount task routes (sau khi ORM sẵn sàng)
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

startServer();
