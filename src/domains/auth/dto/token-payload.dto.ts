import { ApiProperty } from '@nestjs/swagger';

export class TokenPayloadDto {
  constructor(data: { expiresIn: number; accessToken: string }) {
    this.expiresIn = data.expiresIn;
    this.accessToken = data.accessToken;
  }

  @ApiProperty({
    title: 'Expires In (secs)',
    description: 'The time in seconds that the access token will expire',
    example: 900,
  })
  expiresIn: number;

  @ApiProperty({
    title: 'Access Token (Bearer)',
    description: 'The bearer token used to authenticate requests',
    example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.s...',
  })
  accessToken: string;

  public static create(data: { expiresIn: number; accessToken: string }) {
    return new this(data);
  }
}
