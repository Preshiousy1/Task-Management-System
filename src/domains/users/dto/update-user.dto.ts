import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

import { userRole } from '@/constants';

export class UpdateUserDto {
  @ApiProperty({
    title: 'First Name',
    description: "user's first name",
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(190)
  first_name?: string;

  @ApiProperty({
    title: 'Last Name',
    description: "user's last name",
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(190)
  last_name?: string;

  @ApiProperty({
    title: 'Email',
    example: 'john-lark@mail.com',
    description: "user's email address",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;

  @ApiProperty({
    title: 'Phone',
    example: '08012345678',
    description: "user's phone number",
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsPhoneNumber('NG')
  phone?: string;

  @ApiProperty({
    name: 'Role',
    description: "user's role. admin or user",
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsIn(Object.values(userRole))
  role?: string;

  public static hasOneOrMoreProps(updateUserDto: UpdateUserDto) {
    // Check that at least one property is provided
    return !(
      !updateUserDto.first_name &&
      !updateUserDto.last_name &&
      !updateUserDto.email &&
      !updateUserDto.phone &&
      !updateUserDto.role
    );
  }
}
