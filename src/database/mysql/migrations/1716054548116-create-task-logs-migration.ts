import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateTaskLogsMigration1716054548116
  implements MigrationInterface
{
  private tableName = 'task_logs';

  private tableIndices = [
    new TableIndex({
      name: 'INDEX_TASK_LOG_TASK',
      columnNames: ['task_id'],
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
          { name: 'tag', type: 'varchar', length: '100' },
          { name: 'value', type: 'text' },
          { name: 'meta', type: 'text' },
          { name: 'task_id', type: 'varchar', length: '100' },
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
