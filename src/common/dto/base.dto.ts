import { ApiProperty } from '@nestjs/swagger';

import type { BaseEntity } from '../base-entity';

export class BaseDto {
  constructor(entity: BaseEntity, options?: { excludeFields?: boolean }) {
    if (!options?.excludeFields) {
      /* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
      /* eslint-disable @typescript-eslint/no-explicit-any */
      this.id = entity.id;
      this.created_at = entity.created_at;
      this.updated_at = entity.updated_at;
    }
  }

  @ApiProperty({
    title: 'ID',
    description: 'Resource ID',
    examples: [
      'cdf0c025-b66e-4387-a4bc-98b75d0bf9f5',
      '63c9bc39f3ea486ec87ea7d2',
    ],
    example: 'cdf0c025-b66e-4387-a4bc-98b75d0bf9f5',
  })
  id: string;

  @ApiProperty({
    title: 'Created Timestamp',
    description: 'Date created in unix timestamp',
    example: 1_672_140_307,
  })
  created_at: number;

  @ApiProperty({
    title: 'Updated Timestamp',
    description: 'Last date updated in unix timestamp',
    example: 1_672_140_307,
  })
  updated_at: number;

  public static collection(entities: BaseEntity[]) {
    return entities.map((entity) => entity.toDto());
  }
}
