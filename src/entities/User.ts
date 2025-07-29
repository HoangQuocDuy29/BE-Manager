// 📁 BE: src/entities/User.ts
import { Entity, PrimaryKey, Property, ManyToOne } from '@mikro-orm/core';
import { Role } from './Role';  // Import Role entity

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  email!: string;

  @Property()
  password!: string;

  @ManyToOne(() => Role)  // Mối quan hệ với bảng 'roles'
  role!: Role;  // 'role' là đối tượng Role (chứa thông tin về 'admin' hoặc 'user')

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date(); // ✅ đảm bảo luôn có giá trị khởi tạo
}
