import { EntityRepository } from '@mikro-orm/postgresql';
import { Task } from '../entities/Task';

export class TaskRepository extends EntityRepository<Task> {}
