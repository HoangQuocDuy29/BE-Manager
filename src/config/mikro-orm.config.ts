import dotenv from 'dotenv';
dotenv.config(); // PHẢI đặt đầu tiên để đảm bảo process.env được thiết lập đúng

import { Options, MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Task } from '../entities/Task';
import { User } from '../entities/User'; // 👈 nhớ import cả User nếu bạn dùng trong auth

// Log thông tin config (giúp debug lỗi connect db)
console.log({
  driver: 'PostgreSqlDriver',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  entities: ['./src/entities'], // Đường dẫn dạng string không dùng runtime
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
  entities: [Task, User], // Import trực tiếp các Entity class để tránh lỗi runtime
  debug: true,
  migrations: {
    path: 'migrations', // thư mục chứa file migration
    pathTs: 'migrations', // để hỗ trợ file .ts
  },
};

export default config;

// ✅ Init ORM để tái sử dụng ở các nơi khác
export let orm: MikroORM;
export const initORM = async () => {
  orm = await MikroORM.init(config);
};
