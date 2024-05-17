import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { ApiConfigService } from '../../../configs/api-config/api-config.service';
import type { UserRoleType } from '../../../types';
import { UsersService } from '../../users/users.service';
import { AuthUser } from '../dto/auth-user.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ApiConfigService,
    private userService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.authConfig.privateKey,
    });
  }

  async validate(data: {
    userId: string;
    userToken: string;
    role: UserRoleType;
  }) {
    const user = await this.userService.findAuthUser(data.userId);

    if (!user || user.token !== data.userToken) {
      throw new UnauthorizedException();
    }

    return AuthUser.create(user);
  }
}
