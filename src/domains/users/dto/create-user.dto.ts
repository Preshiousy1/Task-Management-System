import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    title: 'First Name',
    description: "user's first name",
    example: 'John',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(190)
  first_name: string;

  @ApiProperty({
    title: 'Last Name',
    example: 'Lark',
    description: "user's last name",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(190)
  last_name: string;

  @ApiProperty({
    title: 'Email',
    example: 'john-lark@mail.com',
    description: "user's email address",
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    title: 'Phone',
    example: '08012345678',
    description: "user's phone number",
  })
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('NG')
  phone: string;

  @ApiProperty({
    title: 'Password',
    description: "user's password",
    example: 'N00bMaster69',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(200)
  password?: string;
}
