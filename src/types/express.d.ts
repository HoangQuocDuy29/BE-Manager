// types/express.d.ts

import { User } from '../entities/user.entity'; // ⚠️ Cập nhật lại đường dẫn nếu cần

declare global {
  namespace Express {
    interface Request {
      user?: User; // 👈 Thêm thuộc tính user vào Request
    }
  }
}

export {}; // 👈 Bắt buộc để file được hiểu là module
