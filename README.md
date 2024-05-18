# Task Management System Backend

The Task Management System Backend skeleton has been built using `NestJs`, a NodeJs framework that aids in the development of robust, scalable applications.
For more information regarding NestJs, checkout the [NestJs Documentation](https://docs.nestjs.com/)

## Instructions

### Installation

First clone the project to your preferred directory

```bash
git clone https://github.com/Preshiousy1/Task-Management-System.git
```

Install Typescript & the NestJs CLI globally

```bash
npm install -g typescript @nestjs/cli
```

Install Node Modules

```bash
npm install
```

Run The build

```bash
npm run build
```

### Setup environment variables

We need to setup our environment variables to be able to make use of this application. A sample `.env.example` file has been provided. This can be found in the directory of the repository.

Make a copy of the sample env depending on your machine, and rename it to `.env`. Be sure to fill in the information to ensure the application is fully functional.

```bash
cp .env.example .env
```

Please note that JWT private and public keys can be generated at https://cryptotools.net/rsagen (4096 key length is preferred).

### Setup Database

This project makes use of an SQL (MySQL) database, and it is expected to be setup to ensure the smooth running of the application.

#### Local DB using Docker

Install Docker on your machine. Run the following command once Docker is up and running

```bash
docker-compose up -d
```

#### Mysql

The environment variables used have been added in the example env file, Mysql databases have their env variables prefixed with `SQL_`, specify the credentials in your `.env`.

### Database Migrations

This project uses TypeOrm to interact with the SQL database, and several scripts have been setup to make it easy to generate and run migrations. For more information about migrations, visit [TypeOrm Migrations](https://typeorm.io/migrations).

#### Scripts

##### Generate Migrations

This command generates migration files for entities that have not been persisted yet, or for changes to a persisted entity.

```bash
npm run migration:generate --name=FILE_NAME
```

##### Create Migrations

This command creates an empty migration file

```bash
npm run migration:create --name=FILE_NAME
```

##### Run Migrations

This command runs the migration files that have not persisted yet.

```bash
npm run migration:run
```

### Run Application

You can run the application by running the command

```bash
npm run start:dev
```

### Database Seeders

Database seeders are used to seed the database with test or default data. This has been implemented using [TypeORM Seeding](https://github.com/conceptadev/typeorm-seeding) package.

When setting up the server, you would need an admin account to access some features. An Admin & Application Seeder has been created. To seed the data, run the command:

```bash
npm run sql:seed:run-class --name=AdminSeeder
```

These are the admin details that will be created

```bash
  {
    first_name: 'TaskManager',
    last_name: 'Admin',
    email: 'admin@tms.com',
    role: 'admin',
    password: '6*i5MYEZM0d8',
  }
```

### App Versioning

App versioning has been enabled, and the current routes are v1 routes. e.g. `localhost:3000/v1/tasks`

### Testing

In order to test the application, make sure `.env.test` file is available, if not available, create one from the `.env.example` or `.env` file

```bash
cp .env.example .env.test
```

End-to-end tests make use of SQLite DB and as such, you should ensure the SQL database for testing has been set in the .env.test

```env
SQL_TEST_DB_DATABASE=tms_test_db
```

Use the commands below to run tests

```bash
npm run test:unit # Unit tests

npm run test:e2e # End to end tests

npm run test # runs both unit & e2e tests
```

#### E2E Testing Setup

E2E tests require a test application to run, together with a testing DB, as such, some testing methods have been written to make the setup easy. From the root directory navigate to `./test/setup/db`

- Remove DB Function

This function `removeDb` is used to delete the SQL database when it's no longer in use.
It is recommended you call it in one of the testing hooks:
at the start of `BeforeAll` (or `BeforeEach`) or the end of`AfterAll` (or `AfterEach`)

- Create Test DB Function

This function `createTestDatabase` is used to create the DB after is has been deleted, as well as run the migrations.
You're expected to run this at the pre-testing hooks `BeforeAll` or `BeforeEach` before the testing starts

- Authenticate Test User

Most routes we will be testing are auth-protected routes, which means the test has to be run with an authenticated user.
This `authAsRandomUser` function authenticates a random user and returns the user, as well as the jwt, and in doing so, allows us to test protected routes
by passing the jwt as a bearer token

#### App Setup

A helper function used to create an application for e2e test has been created to make it easier to setup and write tests. It should be noted that the test helper is only meant for tests without any mocked service or provider

### Documentation

API documentation has been setup using Swagger OPENAPI specs, to enable the documentation, you have to set the env variable:

```bash
ENABLE_DOCUMENTATION=true
```

You can now access the documentation by starting the server and visiting `/documentation`.
For more information on documentation, setup visit [NestJs OPENAPI Documentation](https://docs.nestjs.com/openapi/introduction)

## Coding Practice

This project employs several coding practices as recommended by Nestjs, as well as some internally agreed standards between the team

### Naming

In addition to the eslint configurations for naming, it has been decided that:

- Domains can be plural, except in cases that are not logical, e.g. `auth`
- Entities and Models should be singular e.g. `User`, `Task`
- Database tables and collections should be plural. e,g, `users`, `tasks`
- URLs are all lowercase and if need be separated by dash (-) and not underscore (\_).

### API Response

To ensure we have minimal payloads, only containing essential information, it has been agreed internally that we adopt the following standards

#### API Data Response

For responses containing resource data, we are expected to use the format

```ts
{
  data: RESOURCE_DATA,
}
```

For responses containing main resource data, as well as extra data or metadata e.g. pagination information, the format should be employed

```ts
{
  data: RESOURCE_DATA,
  meta: META_DATA,
}
```

#### API Message Response

For status responses, for example: updated/deleted responses, the data is not necessary, as such, the HTTP status code is used to determine if the operation was successful.
This means a 200 from the server on the updated route should mean it has been updated.
The response then can be:

```ts
{
  message: SUCCESSOR_INFO_MESSAGE,
}
```

## Task Scheduling

NestJs has support for task schedulers out of the box, and has provided a number of tools for us to make it easy to setup. For more information on Nestjs Scheduling, visit [NestJs Task Scheduling Docs](https://docs.nestjs.com/techniques/task-scheduling#declarative-cron-jobs).

### Cron Jobs

Cron jobs has been setup on the application, and to make it easy for us, a node script has been created to help us get started:

```bash
npm run jobs:create job-name
```

Running this command will create a job named `job-name.job.ts` in the `src/task-scheduler/jobs` directory, with it's contents looking like:

```ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class StubJobName {
  private readonly logger = new Logger(StubJobName.name);

  @Cron(CronExpression.EVERY_5_SECONDS)
  handleCron() {
    this.logger.debug('Called every 5 seconds');
  }
}
```

Once created, the job has to be registered for NestJs to discover and run it at the periods specified.
The job has to be registered in `src/task-scheduler/task-scheduler.module.ts` as a provider, otherwise NestJs will not execute the job.
