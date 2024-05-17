import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config();

export const dataSource = new DataSource({
  type: 'better-sqlite3',
  database: process.env.SQL_TEST_DB_DATABASE as string,
  subscribers: ['./src/database/mysql/subscribers/*.subscriber{.ts,.js}'],
  migrations: ['./src/database/mysql/migrations/*{.ts,.js}'],
});
