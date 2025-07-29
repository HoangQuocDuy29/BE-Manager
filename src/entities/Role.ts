// 📁 BE: src/entities/Role.ts
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

// Enum cho các vai trò (Chỉ sử dụng để tạo các giá trị hợp lệ)
export enum RoleType {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity({ tableName: 'roles' }) // Đảm bảo bảng có tên 'roles'
export class Role {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  name!: string;  // Lưu 'admin' hoặc 'user' dưới dạng chuỗi
}
