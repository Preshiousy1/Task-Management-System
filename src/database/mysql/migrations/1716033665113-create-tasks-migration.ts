import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTasksMigration1716033665113 implements MigrationInterface {
  private tableName = 'tasks';

  private tableIndices = [
    new TableIndex({
      name: 'IDX_TASK_CREATOR',
      columnNames: ['created_by'],
    }),
    new TableIndex({
      name: 'IDX_TASK_OWNER',
      columnNames: ['owner_id'],
    }),
    new TableIndex({
      name: 'IDX_TASK_DEPENDS_ON',
      columnNames: ['dependent_task_id'],
    }),
  ];

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: this.tableName,
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '250',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'status',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'type',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'duration',
            type: 'int',
            width: 10,
          },
          {
            name: 'dependent_task_id',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'owner_id',
            type: 'varchar',
            length: '100',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'created_at',
            type: 'bigint',
            width: 11,
          },
          {
            name: 'updated_at',
            type: 'bigint',
            width: 11,
            isNullable: true,
          },
        ],
      }),
    );

    await queryRunner.createIndices(this.tableName, this.tableIndices);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndices(this.tableName, this.tableIndices);

    await queryRunner.dropTable(this.tableName);
  }
}
