// src/config/mikro-orm.config.ts
import dotenv from 'dotenv';
dotenv.config(); // PHẢI ở dòng đầu tiên, trước mọi process.env
import { ReflectMetadataProvider } from '@mikro-orm/core';
import { Options, MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Task } from '../entities/Task';
import { User } from '../entities/user.entity';
import { TestUser } from '../entities/test-user.entity';

// ✅ Log kiểm tra entity đã import thành công
console.log("✅ User entity loaded:", User);
console.log("✅ TestUser entity loaded from config:", TestUser);
console.log({
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  entities: [Task, User, TestUser],
  debug: true,
});

// ✅ Cấu hình MikroORM
const config: Options<PostgreSqlDriver> = {
  driver: PostgreSqlDriver,
  metadataProvider: ReflectMetadataProvider,
  entities: [Task, User, TestUser], // ⚠️ Dùng import trực tiếp để tránh lỗi runtime
  entitiesTs: ['src/entities/*.ts'], // dành cho TS dev
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  debug: true,
};

export default config;

// ✅ Cho phép init ORM ở các file khác
export let orm: MikroORM;
export const initORM = async () => {
  orm = await MikroORM.init(config);
};
