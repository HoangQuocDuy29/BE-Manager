// 📁 BE: src/app.ts
import express from 'express';
import passport from 'passport';
import { MikroORM } from '@mikro-orm/core';
import ormConfig from './config/mikro-orm.config';
import { configurePassport } from './config/passport-config';
import { authRouter } from './routes/auth.route';

(async () => {
  const orm = await MikroORM.init(ormConfig);
  const em = orm.em.fork();

  const app = express();
  app.use(express.json());

  configurePassport(passport, em);
  app.use(passport.initialize());
   // ✅ Mount đúng path
  app.use('/api/auth', authRouter(em)); // ⬅️ rất quan trọng

  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
})();
