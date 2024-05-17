import type { BaseEntity } from '../common/base-entity';
import type { BaseDto } from '../common/dto/base.dto';
import type { Constructor } from '../types';

export function UseDto(
  dtoClass: Constructor<BaseDto, [BaseEntity, unknown]>,
): ClassDecorator {
  return (ctor) => {
    ctor.prototype.dtoClass = dtoClass;
  };
}
