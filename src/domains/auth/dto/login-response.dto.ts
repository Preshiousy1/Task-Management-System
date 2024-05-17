import { ApiProperty } from '@nestjs/swagger';

import { AuthUser } from './auth-user.dto';
import { TokenPayloadDto } from './token-payload.dto';

export class LoginResponseDto {
  constructor(user: AuthUser, token: TokenPayloadDto, isFirstLogin: boolean) {
    this.user = user;
    this.token = token;
    this.isFirstLogin = isFirstLogin;
  }

  @ApiProperty({
    type: AuthUser,
  })
  user: AuthUser;

  @ApiProperty({
    type: TokenPayloadDto,
  })
  token: TokenPayloadDto;

  @ApiProperty({
    type: Boolean,
  })
  isFirstLogin: boolean;

  public static create(
    user: AuthUser,
    token: TokenPayloadDto,
    isFirstLogin: boolean,
  ) {
    return new this(user, token, isFirstLogin);
  }
}
