/* eslint-disable @typescript-eslint/no-misused-promises */
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { mockedUsers } from '../../utils/mocks/entities/user.mock';
import { User } from '../users/user.entity';
import { AuthService } from './auth.service';
jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let user: User;
  let validateUser: jest.Mock;

  beforeEach(async () => {
    process.env.JWT_PRIVATE_KEY = 'private';
    process.env.JWT_PUBLIC_KEY = 'public';
    process.env.JWT_EXPIRATION_TIME = '15';

    user = mockedUsers[0];

    validateUser = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AuthService,
          useValue: {
            validateUser,
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockReturnValue(Promise.resolve(user)),
          },
        },
        {
          provide: getDataSourceToken(),
          useValue: {
            getRepository: jest.fn().mockReturnValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
