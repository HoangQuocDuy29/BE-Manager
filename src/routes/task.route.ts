// src/routes/task.route.ts
import { Router } from 'express';
import { createTask } from '../controllers/task.controller';

const router = Router();

router.post('/', createTask);

export default router;
