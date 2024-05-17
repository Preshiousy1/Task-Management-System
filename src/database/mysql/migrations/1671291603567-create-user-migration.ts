import type { MigrationInterface, QueryRunner } from 'typeorm';
import { Table } from 'typeorm';

export class CreateUserMigration1671291603567 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'first_name',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'last_name',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'phone',
            type: 'varchar',
            length: '20',
          },
          {
            name: 'password',
            type: 'varchar',
            length: '200',
            isNullable: true,
          },
          {
            name: 'role',
            type: 'varchar',
            length: '200',
          },
          {
            name: 'last_login',
            type: 'int',
            length: '15',
            isNullable: true,
          },
          {
            name: 'token',
            type: 'char',
            length: '200',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'int',
            width: 11,
          },
          {
            name: 'updated_at',
            type: 'int',
            width: 11,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users', true);
  }
}
