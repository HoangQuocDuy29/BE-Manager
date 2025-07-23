// src/config/mikro-orm.config.ts
import dotenv from 'dotenv';
dotenv.config(); // PHẢI ở dòng đầu tiên, trước mọi process.env

import { Options, MikroORM } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import { Task } from '../entities/Task'; // 👈 Bắt buộc phải import entity nếu không sẽ lỗi runtime

console.log({
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  entities: ['./src/entities'], // hoặc './src/entities' nếu dùng ts-node
  debug: true,
});

const config: Options<PostgreSqlDriver> = {
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  entities: [Task], // ⚠️ Dùng import trực tiếp thay vì string để MikroORM không bị lỗi
  debug: true,
};

export default config;

// ✅ Thêm export orm để các file khác (routes) dùng được sau khi đã init
export let orm: MikroORM;
export const initORM = async () => {
  orm = await MikroORM.init(config);
};
