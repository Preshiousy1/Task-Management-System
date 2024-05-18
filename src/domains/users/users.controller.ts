import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { UpdateResult } from 'typeorm';

import { AdminRoleGuard } from '@/guards/admin.guard';
import { isAdminOrResourceOwner } from '@/utils/helpers/auth.helpers';

import type { AuthUser } from '../auth/dto/auth-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@ApiTags('Authentication')
@Controller({ path: 'users', version: '1' })
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(AdminRoleGuard)
  @Get('admin-users')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns array of admin users',
    type: [UserDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthenticated user' })
  async readAdminUsers(@Request() req) {
    const { id: userId } = req.user as AuthUser;

    if (!isAdminOrResourceOwner(userId)) {
      throw new ForbiddenException('Unauthorized');
    }

    const adminUsers = await this.usersService.findByRole('admin');

    return { data: UserDto.collection(adminUsers) };
  }

  @UseGuards(AdminRoleGuard)
  @Get('users')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Returns array of users',
    type: [UserDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthenticated user' })
  async readUsers(@Request() req) {
    const { id: userId } = req.user as AuthUser;

    if (!isAdminOrResourceOwner(userId)) {
      throw new ForbiddenException('Unauthorized');
    }

    const adminUsers = await this.usersService.findByRole('user');

    return { data: UserDto.collection(adminUsers) };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Return user matching the specified id',
    type: [UserDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async read(@Param('id') id: string) {
    if (!isAdminOrResourceOwner(id)) {
      throw new ForbiddenException('Unauthorized');
    }

    const user = await this.usersService.findAuthUser(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return { data: user.toDto() };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Update success message',
    type: String,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const result: UpdateResult = await this.usersService.updateUser(
      userId,
      updateUserDto,
    );

    if (!result.affected) {
      throw new BadRequestException('Unable to update user');
    }

    return { message: 'Updated' };
  }
}
