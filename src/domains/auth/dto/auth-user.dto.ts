import { ApiProperty } from '@nestjs/swagger';

import { userRole } from '@/constants';
import type { User } from '@/domains/users/user.entity';

export class AuthUser {
  constructor(user: User) {
    this.id = user.id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.full_name = `${this.first_name} ${this.last_name}`;
    this.email = user.email;
    this.phone = user.phone;
    this.role = user.role;
    this.token = user.token;
    this.created_at = user.created_at;
    this.updated_at = user.updated_at;
    this.last_login = user.last_login;
  }

  @ApiProperty({
    title: 'User ID',
    description: 'The user ID of the account',
    example: 'cdf0c025-b66e-4387-a4bc-98b75d0bf9f5',
  })
  id: string;

  @ApiProperty({
    title: 'First Name',
    description: "The user's first name",
    example: 'John',
  })
  first_name: string;

  @ApiProperty({
    title: 'Last Name',
    description: "The user's last name",
    example: 'lark',
  })
  last_name: string;

  @ApiProperty({
    title: 'Full Name',
    description: "Concatenation of the user's first and last name",
    example: 'John Lark',
  })
  full_name: string;

  @ApiProperty({
    title: 'Email Address',
    description: "The user's email address",
    example: 'john-lark@mail.com',
  })
  email: string;

  @ApiProperty({
    title: 'Phone',
    description: "The user's phone",
    example: '08012345678',
  })
  phone: string;

  @ApiProperty({
    title: 'Role',
    description: "The user's role",
    enum: Object.values(userRole),
    default: userRole.User,
  })
  role: string;

  @ApiProperty({
    title: 'Token',
    description: "The user's unique login token",
    default: 'gffghhfdfthjjjnbbvvbhju',
  })
  token: string;

  @ApiProperty({
    title: 'Created Timestamp',
    description: 'Date registered in unix timestamp',
    example: 1_672_140_307,
  })
  created_at: number;

  @ApiProperty({
    title: 'Updated Timestamp',
    description: 'Last date updated in unix timestamp',
    example: 1_672_140_307,
  })
  updated_at: number;

  @ApiProperty({
    title: 'Last Login',
    description: 'Last time a user logged in',
    example: 1_672_140_307,
  })
  last_login: number | null;

  public static create(user: User) {
    return new this(user);
  }

  public static isAdmin(user: User | AuthUser) {
    return user.role === userRole.Admin;
  }

  public static isResourceOwner(user: User | AuthUser, ownerId: string) {
    return user.id === ownerId;
  }

  public static isAdminOrResourceOwner(user: User | AuthUser, userId: string) {
    return AuthUser.isAdmin(user) || AuthUser.isResourceOwner(user, userId);
  }
}
