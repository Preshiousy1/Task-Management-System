import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class Disable2faDto {
  @ApiProperty({
    title: 'Password',
    description: 'The name user password',
    example: 'n00bM@steR69',
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
