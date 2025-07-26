import { User } from '../../../src/entities/user.entity';
import { MikroORM } from '@mikro-orm/core';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
declare global {
  var orm: MikroORM;
}
