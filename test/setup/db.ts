import { SeedingSource } from '@concepta/typeorm-seeding';
import { faker } from '@faker-js/faker';
import type { INestApplication } from '@nestjs/common';
import appRootPath from 'app-root-path';
import { exec } from 'child_process';
import fs from 'fs';
import type { Database } from 'sqlite3';
import { verbose } from 'sqlite3';
import request from 'supertest';
import { promisify } from 'util';

import { dataSource } from '../../ormconfig-test';
import { ApiConfigService } from '../../src/configs/api-config/api-config.service';
import { AdminSeeder } from '../../src/database/mysql/seeders/create-admin.seeder';
import { UsersService } from '../../src/domains/users/users.service';

export const removeDb = (databaseName?: string) => {
  try {
    databaseName =
      databaseName ||
      (process.env.SQL_TEST_DB_DATABASE as string) ||
      'tms_test_db';

    const path = appRootPath.resolve(`/${databaseName}`);

    if (!fs.existsSync(path)) {
      return;
    }

    fs.unlinkSync(path);
  } catch (error) {
    console.error(error);
  }
};

const execAsync = promisify(exec);

export const createTestDatabase = async (
  seedDb?: boolean,
  databaseName?: string,
): Promise<Database> =>
  new Promise((resolve, reject) => {
    databaseName =
      databaseName ||
      (process.env.SQL_TEST_DB_DATABASE as string) ||
      'tms_test_db';
    const sqlite = verbose();
    const db = new sqlite.Database(databaseName);

    db.on('error', (err) => {
      reject(err);
    });

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    db.on('open', async () => {
      try {
        await execAsync('npm run test:migration');

        if (seedDb) {
          const seedingSource = new SeedingSource({
            dataSource: dataSource.setOptions({
              entities: [
                './src/domains/**/*.entity{.ts,.js}',
                './src/domains/**/*.view-entity{.ts,.js}',
              ],
            }),
            seeders: [AdminSeeder],
          });

          await dataSource.initialize();

          await seedingSource.run.all();
        }

        resolve(db);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  });

export const authAsRandomUser = async (app: INestApplication) => {
  const userService = app.get<UsersService>(UsersService);
  const configService = app.get<ApiConfigService>(ApiConfigService);

  const user = await userService.createUser({
    first_name: faker.internet.userName(),
    last_name: faker.internet.userName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    password: configService.get<string>('TMS_DEFAULT_PASSWORD'),
  });

  const loginResponse = await request(app.getHttpServer())
    .post('/v1/auth/login')
    .send({
      identifier: user.email,
      password: configService.get<string>('TMS_DEFAULT_PASSWORD'),
    })
    .expect(200);

  return {
    user,
    jwt: loginResponse.body.data.token.accessToken as string,
  };
};

export const authAsRandomAdmin = async (app: INestApplication) => {
  const userService = app.get<UsersService>(UsersService);

  const user = await userService.createAdmin({
    first_name: faker.internet.userName(),
    last_name: faker.internet.userName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    password: 'password',
  });

  const loginResponse = await request(app.getHttpServer())
    .post('/v1/auth/login')
    .send({
      identifier: user.email,
      password: 'password',
    })
    .expect(200);

  return {
    user,
    jwt: loginResponse.body.data.token.accessToken as string,
  };
};
