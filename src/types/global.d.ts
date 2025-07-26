import type { MikroORM } from '@mikro-orm/core';
import type { User } from '../../../entities/user.entity'; // Đường dẫn đúng với cấu trúc của bạn

declare global {
  namespace NodeJS {
    interface Global {
      orm: MikroORM;
    }
  }

  // ✅ Cách mở rộng `globalThis` trực tiếp
  var orm: MikroORM;
  interface Request {
    user?: User;
  }
}

export {};
