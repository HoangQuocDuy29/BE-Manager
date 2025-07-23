// src/index.ts
import 'reflect-metadata';
import express from 'express';
import { MikroORM } from '@mikro-orm/core';
import mikroConfig from './config/mikro-orm.config';

const main = async () => {
  const orm = await MikroORM.init(mikroConfig);
  const app = express();
  app.use(express.json());

  // Simple test route
  app.get('/', (req, res) => {
    res.send('Task API is running');
  });

  const PORT = 3000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${5432}`);
  });
};

main().catch((err) => {
  console.error('Error starting server:', err);
});
