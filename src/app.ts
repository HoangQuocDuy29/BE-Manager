// filepath: e:\2_NodeJs\task-api\task-manager-be\src\app.ts
import express from 'express';
import taskRouter from './routes/task.route';

const app = express();
app.use(express.json());
app.use('/tasks', taskRouter);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});