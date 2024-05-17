import { ApiProperty } from '@nestjs/swagger';
import type { ValidationArguments } from 'class-validator';
import { IsNotEmpty, IsString } from 'class-validator';

import { User } from '@/domains/users/user.entity';

import { EntityExists } from '../../../validators/mysql/entity-exists.validator';

export class ForgotPasswordDto {
  @ApiProperty({
    title: 'User Identifier',
    description: "user's email address or phone number",
    example: '08012345678',
    examples: ['08012345678', 'john-lark@mail.com'],
  })
  @IsString()
  @IsNotEmpty()
  @EntityExists(
    [
      User,
      (args: ValidationArguments) => [
        {
          email: args.object[args.property],
        },
        {
          phone: args.object[args.property],
        },
      ],
    ],
    {
      message: 'Invalid credentials',
    },
  )
  identifier: string;
}
