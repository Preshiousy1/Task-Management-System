import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';

import { BaseDto } from '../../../common/dto/base.dto';
import type { User } from '../user.entity';

export class UserDto extends BaseDto {
  @ApiProperty({
    description: 'The first name of the user',
    example: 'John',
  })
  first_name: string;

  @ApiProperty({
    description: 'The last name of the user',
    example: 'Doe',
  })
  last_name: string;

  @ApiProperty({
    description: 'The full name of the user',
    example: 'John Doe',
  })
  full_name: string;

  @ApiProperty({
    description: 'The email of the user',
    example: faker.internet.email(),
  })
  email: string;

  @ApiProperty({
    description: 'The phone number of the user',
    example: faker.phone.number('080########'),
  })
  phone: string;

  @ApiProperty({
    description: 'The role of the user',
    example: 'admin',
  })
  role: string;

  @ApiProperty({
    description: 'The last login of the user',
    example: Date.now(),
  })
  last_login: number | null;

  constructor(user: User) {
    super(user);
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.full_name = `${this.first_name} ${this.last_name}`;
    this.email = user.email;
    this.phone = user.phone;
    this.role = user.role;
    this.last_login = user.last_login;
  }
}
