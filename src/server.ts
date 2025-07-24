import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();

import express from 'express';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './config/mikro-orm.config';
import { createTaskRouter } from './routes/task.route';
import { SqlEntityManager } from '@mikro-orm/postgresql';

const app = express();
app.use(cors()); 
app.use(express.json());



// Optional: Route kiểm tra root
app.get('/', (req, res) => {
  res.send('🎯 Task API is running!');
});

async function startServer() {
  try {
    const orm = await MikroORM.init(mikroConfig);
    console.log('✅ Connected to PostgreSQL');

    const em = orm.em.fork() as SqlEntityManager;

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
