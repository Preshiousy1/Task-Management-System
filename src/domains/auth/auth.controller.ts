import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { RealIP } from 'nestjs-real-ip';
import { Repository } from 'typeorm';

import { AdminRoleGuard } from '@/guards/admin.guard';
import { authUser } from '@/utils/helpers/auth.helpers';

import { PublicRoute } from '../../decorators/public-route.decorator';
import type { UserRoleType } from '../../types';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { AuthUser } from './dto/auth-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
@ApiTags('Authentication')
@Controller({
  version: '1',
  path: 'auth',
})
export class AuthController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @PublicRoute()
  @Post('register')
  @ApiCreatedResponse({
    description: 'The user has been registered',
    type: AuthUser,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid input data from user',
  })
  async register(@Body() createUserDto: CreateUserDto) {
    const isUserCreated = await this.userService.hasUserBeenCreated(
      createUserDto,
    );

    if (isUserCreated) {
      throw new UnauthorizedException(
        'An account with one or more of the credentials already exists. Contact us if you already have a TMS account.',
      );
    }

    const user = await this.userService.createUser(createUserDto);

    return { data: AuthUser.create(user) };
  }

  @UseGuards(AdminRoleGuard)
  @Post('register-admin')
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: 'The user has been registered',
    type: AuthUser,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid input data from user',
  })
  async registerAdmin(@Body() createUserDto: CreateUserDto) {
    const isUserCreated = await this.userService.hasUserBeenCreated(
      createUserDto,
    );

    if (isUserCreated) {
      throw new UnauthorizedException(
        'An account with one or more of the credentials already exists. Contact us if you already have a TMS account.',
      );
    }

    const user = await this.userService.createAdmin(createUserDto);

    return { data: AuthUser.create(user) };
  }

  @PublicRoute()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'The user has been authenticated',
    type: LoginResponseDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid input data from user',
  })
  async login(@Body() userLoginDto: UserLoginDto, @RealIP() ip: string) {
    const [user, token, isFirstLogin] = await this.authService.validateUser(
      userLoginDto,
      ip,
    );

    return { data: LoginResponseDto.create(user, token, isFirstLogin) };
  }

  @PublicRoute()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Reset password email has been sent',
    type: LoginResponseDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid input data from user',
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    const message = await this.authService.forgotPassword(forgotPasswordDto);
    return { message };
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Password reset successfully',
    type: LoginResponseDto,
  })
  @ApiUnprocessableEntityResponse({
    description: 'Invalid input data from user',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const user = authUser();
    const status = await this.authService.resetPassword({
      user,
      password: resetPasswordDto.password,
    });
    if (status) {
      return { message: 'Password reset successfully' };
    }
  }

  @Get('user')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Get authenticated user data',
    type: AuthUser,
  })
  user(@Request() req): { data: AuthUser } {
    return {
      data: req.user as AuthUser,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOkResponse({
    description: "The user's access token has been refreshed",
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthenticated user' })
  async refresh() {
    const user = authUser();

    const randomStr = randomBytes(32).toString('hex');
    const updatedUser = await this.userRepository.save({
      id: user.id,
      token: randomStr,
    });

    const token = await this.authService.createAccessToken({
      userId: user.id,
      role: user.role as UserRoleType,
      userToken: updatedUser.token,
    });

    return { data: LoginResponseDto.create(user, token, false) };
  }
}
