import { Column, PrimaryGeneratedColumn } from 'typeorm';

import type { Constructor } from '../types';
import type { BaseDto } from './dto/base.dto';

export abstract class BaseEntity<DTO extends BaseDto = BaseDto, O = never> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', width: 11, nullable: false, readonly: true })
  created_at: number;

  @Column({ type: 'int', width: 11, nullable: true })
  updated_at: number;

  private dtoClass?: Constructor<DTO, [BaseEntity, O?]>;

  toDto(options?: O): DTO {
    const dtoClass = this.dtoClass;

    if (!dtoClass) {
      throw new Error(
        `You need to use @UseDto on class (${this.constructor.name}) be able to call toDto function`,
      );
    }

    return new dtoClass(this, options);
  }
}
