// src/mikro-orm.config.ts
import dotenv from 'dotenv';
dotenv.config(); // PHẢI ở dòng đầu tiên, trước mọi process.env

import { Options } from '@mikro-orm/core';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';

console.log({
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  entities: ['./src/entities'], // hoặc './src/entities' nếu dùng ts-node
  debug: true,
})

const config: Options<PostgreSqlDriver> = {
  driver: PostgreSqlDriver,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  entities: ['./src/entities'], // hoặc './src/entities' nếu dùng ts-node
  debug: true,
};

export default config;
