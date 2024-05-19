import { HttpService } from '@nestjs/axios';
import {
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { getUnixTime } from 'date-fns';
import { Repository } from 'typeorm';

import { userRole } from '@/constants';

import { ApiConfigService } from '../../configs/api-config/api-config.service';
import type { UserRoleType } from '../../types';
import { generateHash, validateHash } from '../../utils/helpers/hash.helpers';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthUser } from './dto/auth-user.dto';
import type { ForgotPasswordDto } from './dto/forgot-password.dto';
import { TokenPayloadDto } from './dto/token-payload.dto';
import type { UserLoginDto } from './dto/user-login.dto';

export interface IDecodedTokenTypes {
  userId: string;
  role: string;
  userToken: string;
  iat: number;
  exp: number;
}
@Injectable()
export class AuthService {
  private expiryDuration: number;

  constructor(
    private configService: ApiConfigService,
    private jwtService: JwtService,
    private usersService: UsersService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(HttpService)
    private readonly httpService: HttpService,
  ) {
    this.expiryDuration = 10;
  }

  async validateUser(
    userLoginDto: UserLoginDto,
  ): Promise<[AuthUser, TokenPayloadDto, boolean]> {
    const user = await this.usersService.findByIdentifier(
      userLoginDto.identifier,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    let isFirstLogin = false;

    if (user.role === userRole.User) {
      isFirstLogin = user.last_login === null;
    }

    const isPasswordValid = await validateHash(
      userLoginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const randomStr = randomBytes(32).toString('hex');
    await this.userRepository.update(user.id, {
      last_login: getUnixTime(Date.now()),
      token: randomStr,
    });

    const token = await this.createAccessToken({
      userId: user.id,
      role: user.role as UserRoleType,
      userToken: randomStr,
    });

    return [AuthUser.create(user), token, isFirstLogin];
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<string> {
    const user = await this.usersService.findByIdentifier(
      forgotPasswordDto.identifier,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const defaultPassword = this.configService.get<string>(
      'TMS_DEFAULT_PASSWORD',
    );
    const isReset = await this.resetPassword({
      user,
      password: defaultPassword,
    });

    if (isReset) {
      return `Password successfully reset to: ${defaultPassword}`;
    }

    return `Password reset unsuccessful`;
  }

  async resetPassword(data: {
    user: User | AuthUser;
    password: string;
  }): Promise<boolean> {
    const update = await this.userRepository.update(data.user.id, {
      password: generateHash(data.password),
    });

    if (update.affected) {
      await this.createAccessToken({
        userId: data.user.id,
        role: data.user.role as UserRoleType,
        userToken: data.user.token,
        expiration: this.expiryDuration,
      });
    }

    return Boolean(update.affected);
  }

  async createAccessToken(data: {
    userId: string;
    role: UserRoleType;
    userToken: string;
    expiration?: number;
  }): Promise<TokenPayloadDto> {
    return TokenPayloadDto.create({
      expiresIn:
        data.expiration ?? this.configService.authConfig.jwtExpirationTime,
      accessToken: await this.jwtService.signAsync({
        userId: data.userId,
        role: data.role,
        userToken: data.userToken,
      }),
    });
  }

  private validateToken(token: string) {
    try {
      return this.jwtService.verifyAsync(token);
    } catch (error) {
      throw new UnprocessableEntityException(error);
    }
  }
}
