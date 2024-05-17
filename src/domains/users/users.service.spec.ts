import { ConfigService } from '@nestjs/config';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ApiConfigService } from '../../configs/api-config/api-config.service';
import { userRole } from '../../constants';
import { mockedUsers } from '../../utils/mocks/entities/user.mock';
import { UserDto } from './dto/user.dto';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let user: User;
  let user2: User;
  let save: jest.Mock;
  let find: jest.Mock;

  beforeEach(async () => {
    save = jest.fn();
    find = jest.fn();
    user = mockedUsers[0];
    user2 = mockedUsers[0];

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        ConfigService,
        ApiConfigService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn().mockReturnValue(mockedUsers[0]),
            save,
            findOne: jest.fn().mockReturnValue(Promise.resolve(user2)),
            find,
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#registerUser - Add user', () => {
    beforeEach(() => {
      save = save.mockReturnValue(Promise.resolve(user2));
    });

    it('should register the user', async () => {
      const regUser = await service.registerUser({
        first_name: 'John',
        last_name: 'Lark',
        email: 'john.lark@email.com',
        phone: '08041920209',
      });
      expect(regUser).toEqual(user2);
    });
  });

  describe('#createUser - Create a new user', () => {
    beforeEach(() => {
      save = save.mockReturnValue(Promise.resolve(user));
    });

    it('should return the created user', async () => {
      const newUser = await service.createUser({
        first_name: 'John',
        last_name: 'Lark',
        email: 'john.lark@email.com',
        phone: '08041920209',
      });

      expect(newUser).toEqual(user);
    });
  });

  describe('#createAdmin - Create a new admin', () => {
    beforeEach(() => {
      user.role = userRole.Admin;
      save = save.mockReturnValue(Promise.resolve(user));
    });

    it('should return the created admin', async () => {
      const newUser = await service.createAdmin({
        first_name: 'John',
        last_name: 'Lark',
        email: 'john.lark@email.com',
        phone: '08041920209',
        password: '12345678',
      });

      expect(newUser).toEqual(user);
      expect(newUser.role).toBe(userRole.Admin);
    });
  });

  describe('#findByRole - read admin users', () => {
    beforeEach(() => {
      find.mockReturnValue(
        Promise.resolve([{ ...user, role: userRole.Admin }]),
      );
    });
    it('should return admin users', async () => {
      const users = await service.findByRole(userRole.Admin);
      expect(users[0].role).toBe(user.role);
      expect(UserDto.collection(users)).toEqual([user.toDto()]);
    });
  });
});
