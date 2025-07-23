// src/server.ts

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './config/mikro-orm.config';
import taskRoutes from './routes/task.route';

const app = express();
app.use(express.json());

// Debug log env variables
console.log('Loaded ENV:', {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
});

async function startServer() {
  try {
    const orm = await MikroORM.init(mikroConfig);
    console.log('✅ Connected to PostgreSQL');

    // Optional: Inject EntityManager into DI if needed globally
    // DI.em = orm.em;

    // Mount routes
    app.use('/api/tasks', taskRoutes);

    app.listen(3000, () => {
      console.log('🚀 Server running on http://localhost:3000');
    });

  } catch (err) {
    console.error('❌ Failed to connect to DB:', err);
    process.exit(1);
  }
}

startServer();
