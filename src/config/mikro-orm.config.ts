import dotenv from 'dotenv';
dotenv.config(); // PHẢI đặt đầu tiên để đảm bảo process.env được thiết lập đúng

import { Options, MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';

// Import tất cả entities
import { Task } from '../entities/Task';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { Ticket } from '../entities/Ticket';  // ← THÊM
import { LogWork } from '../entities/LogWork'; // ← THÊM

// Log thông tin config (giúp debug lỗi connect db)
console.log({
  driver: 'PostgreSqlDriver',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  entities: ['Task', 'User', 'Role', 'Ticket', 'LogWork'], // ← CẬP NHẬT
  debug: true,
});

// ✅ MikroORM config
const config: Options<PostgreSqlDriver> = {
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  
  // ← QUAN TRỌNG: Thêm tất cả entities
  entities: [Task, User, Role, Ticket, LogWork],
  entitiesTs: ['src/entities/**/*.ts'], // ← THÊM để MikroORM tìm entities
  
  debug: true,
  
  // ← QUAN TRỌNG: Cấu hình migrations
  migrations: {
    path: './src/migrations',     // ← Đường dẫn đúng
    pathTs: './src/migrations',   // ← Hỗ trợ TypeScript
    transactional: true,          // ← Chạy trong transaction
    disableForeignKeys: false,    // ← Giữ foreign keys
    allOrNothing: true,           // ← Rollback nếu có lỗi
    dropTables: false,            // ← Không xóa tables (an toàn)
    safe: true,                   // ← Mode an toàn
    emit: 'ts',                   // ← Tạo file .ts
  },

  // ← QUAN TRỌNG: Thêm Migrator extension
  extensions: [Migrator],
  
  // ← Các config khác cho development
  allowGlobalContext: true,
  validate: true,
  strict: true,
  
  // Pool settings cho PostgreSQL
  pool: {
    min: 2,
    max: 10,
  },
};

export default config;

// ✅ Init ORM để tái sử dụng ở các nơi khác
export let orm: MikroORM;
export const initORM = async () => {
  orm = await MikroORM.init(config);
};