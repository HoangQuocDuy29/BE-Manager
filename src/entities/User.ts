// 📁 BE: src/entities/User.ts
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class User {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true })
  email!: string;

  @Property()
  password!: string;

  @Property({ onCreate: () => new Date() })
  createdAt: Date = new Date(); // ✅ đảm bảo luôn có giá trị khởi tạo
}
