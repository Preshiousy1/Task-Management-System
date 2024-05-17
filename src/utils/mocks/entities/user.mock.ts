import { UserDto } from '../../../domains/users/dto/user.dto';
import type { User } from '../../../domains/users/user.entity';

export const mockedUsers: User[] = [
  {
    id: '2c4188a4-e584-473a-b835-3d5c14bd2ab7',
    first_name: 'John',
    last_name: 'Lark',
    email: 'john.lark@email.com',
    phone: '08041920209',
    password: '$2b$10$6.Zr15XmUiAsrafSfYYhVeFUUHe5TwsjWuhTI43iM5d3dbWqEKxri', // 12345678
    role: 'user',
    token: 'mock-token',
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
    last_login: null,

    setPassword() {
      if (this.password) {
        this.password =
          '$2b$10$6.Zr15XmUiAsrafSfYYhVeFUUHe5TwsjWuhTI43iM5d3dbWqEKxri';
      }
    },
    toDto() {
      return new UserDto(this as User);
    },
  },
  {
    id: '2c4188a4-e584-473a-b835-3d5c14bd2ab8',
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@email.com',
    phone: '08041920208',
    password: '$2b$10$6.Zr15XmUiAsrafSfYYhVeFUUHe5TwsjWuhTI43iM5d3dbWqEKxri', // 12345678
    role: 'user',
    token: 'mock-token2',
    created_at: Math.floor(Date.now() / 1000),
    updated_at: Math.floor(Date.now() / 1000),
    last_login: Math.floor(Date.now() / 1000),

    setPassword() {
      if (this.password) {
        this.password =
          '$2b$10$6.Zr15XmUiAsrafSfYYhVeFUUHe5TwsjWuhTI43iM5d3dbWqEKxri';
      }
    },
    toDto() {
      return new UserDto(this as User);
    },
  },
];
