import { BeforeInsert, Column, Entity } from 'typeorm';

import { BaseEntity } from '../../common/base-entity';
import { userRole } from '../../constants';
import { UseDto } from '../../decorators/use-dto.decorator';
import { generateHash } from '../../utils/helpers/hash.helpers';
import { UserDto } from './dto/user.dto';

@Entity({ name: 'users' })
@UseDto(UserDto)
export class User extends BaseEntity<UserDto> {
  @Column('varchar', { length: 200 })
  first_name: string;

  @Column('varchar', { length: 200 })
  last_name: string;

  @Column('varchar', { length: 200 })
  email: string;

  @Column('varchar', { length: 20 })
  phone: string;

  @Column('varchar', { length: 250, nullable: true })
  password?: string;

  @Column('varchar', { length: 20, default: userRole.User })
  role: string;

  @Column('varchar', { length: 100 })
  token: string;

  @Column({ type: 'int', width: 11, nullable: true })
  last_login: number | null;

  @BeforeInsert()
  public setPassword() {
    if (this.password) {
      this.password = generateHash(this.password);
    }
  }
}
