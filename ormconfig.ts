import dotenv from 'dotenv';
import { DataSource } from 'typeorm';

import { SnakeNamingStrategy } from './src/snake-naming.strategy';

dotenv.config();

export const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.SQL_DB_HOST,
  port: Number(process.env.SQL_DB_PORT),
  username: process.env.SQL_DB_USERNAME,
  password: process.env.SQL_DB_PASSWORD,
  database: process.env.SQL_DB_DATABASE,
  namingStrategy: new SnakeNamingStrategy(),
  multipleStatements: true,
  subscribers: ['./src/database/mysql/subscribers/*.subscriber{.ts,.js}'],
  migrations: ['./src/database/mysql/migrations/*{.ts,.js}'],
  dateStrings: true,
});
