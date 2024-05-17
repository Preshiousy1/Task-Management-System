const { SeedingSource } = require('@concepta/typeorm-seeding');
const {
  AdminSeeder,
} = require('./dist/database/mysql/seeders/create-admin.seeder');

const { DataSource } = require('typeorm');

require('dotenv').config();

module.exports = new SeedingSource({
  dataSource: new DataSource({
    type: 'mysql',
    host: process.env.SQL_DB_HOST,
    port: Number(process.env.SQL_DB_PORT),
    username: process.env.SQL_DB_USERNAME,
    password: process.env.SQL_DB_PASSWORD,
    database: process.env.SQL_DB_DATABASE,
    multipleStatements: true,
    subscribers: ['./dist/database/mysql/subscribers/*.subscriber{.ts,.js}'],
    entities: [
      './dist/domains/**/*.entity{.ts,.js}',
      './dist/domains/**/*.view-entity{.ts,.js}',
    ],
    dateStrings: true,
  }), // overridden if provided by CLI arg
  seeders: [AdminSeeder],
});
