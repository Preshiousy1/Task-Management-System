import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import type { FindManyOptions, FindOptionsWhere } from 'typeorm';
import { In, Not, Repository } from 'typeorm';

import { ApiConfigService } from '@/configs/api-config/api-config.service';
import type { UserRoleType } from '@/types';
import { isAdmin, isAdminOrResourceOwner } from '@/utils/helpers/auth.helpers';

import { userRole } from '../../constants';
import type { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(ApiConfigService)
    private configService: ApiConfigService,
  ) {}

  async hasUserBeenCreated(createUserDto: CreateUserDto): Promise<boolean> {
    return this.userRepository.exist({
      where: [
        {
          email: createUserDto.email,
        },
        {
          phone: createUserDto.phone,
        },
      ],
    });
  }

  async findByIdentifiers(identifiers: {
    email: string;
    phone: string;
  }): Promise<User[]> {
    return this.userRepository.find({
      where: [
        {
          email: identifiers.email,
        },
        {
          phone: identifiers.phone,
        },
      ],
    });
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const randomStr = randomBytes(32).toString('hex');
    const userObj = {
      ...createUserDto,
      role: userRole.User,
      token: randomStr,
      password:
        createUserDto.password ??
        this.configService.get<string>('TMS_DEFAULT_PASSWORD'),
    };

    const userCreate = this.userRepository.create(userObj);

    const user = await this.userRepository.save(userCreate);

    return user;
  }

  async createAdmin(createUserDto: CreateUserDto): Promise<User> {
    if (!createUserDto.password) {
      throw new UnprocessableEntityException(
        'Admin Password must set on creation.',
      );
    }

    const userObj = {
      ...createUserDto,
      role: userRole.Admin,
    };

    const user = this.userRepository.create(userObj);

    return this.userRepository.save(user);
  }

  async registerUser(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.userRepository.findOne({
      where: {
        email: createUserDto.email,
        phone: createUserDto.phone,
      },
    });

    if (!user) {
      throw new NotFoundException('The user was not found');
    }

    return this.userRepository.save(user);
  }

  async find(options?: FindManyOptions<User>) {
    return this.userRepository.find(options || {});
  }

  async findByIdentifier(identifier: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: [{ email: identifier }, { phone: identifier }],
    });
  }

  async findByRole(role: UserRoleType): Promise<User[]> {
    return this.userRepository.find({
      where: [{ role }],
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOneBy({ id });
  }

  async findAuthUser(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
    });
  }

  async findUsersByIds(userIds: string[]): Promise<User[]> {
    return this.userRepository.findBy({ id: In(userIds) });
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const canUpdate = isAdminOrResourceOwner(id);

    if (!canUpdate) {
      throw new UnauthorizedException(
        'You do not permission to update resource',
      );
    }

    // strip off role prop if user is not admin
    if (!isAdmin()) {
      updateUserDto.role = undefined;
    }

    // avoid sql error caused by empty dto
    if (!UpdateUserDto.hasOneOrMoreProps(updateUserDto)) {
      throw new BadRequestException('At least one property must be provided');
    }

    const userRecord = await this.findById(id);

    if (!userRecord) {
      throw new NotFoundException('User does not exist');
    }

    const filterCriteria: Array<FindOptionsWhere<User>> = [];
    let conflictUser: User | null = null;

    if (updateUserDto.email || updateUserDto.phone) {
      if (updateUserDto.email) {
        filterCriteria.push({
          id: Not(id),
          email: In([updateUserDto.email]),
        });
      }

      if (updateUserDto.phone) {
        filterCriteria.push({
          id: Not(id),
          phone: In([updateUserDto.phone]),
        });
      }

      conflictUser = await this.userRepository.findOne({
        where: filterCriteria,
      });
    }

    if (conflictUser) {
      throw new BadRequestException(
        'User already exists with similar email and phone',
      );
    }

    return this.userRepository.update(id, updateUserDto);
  }

  async removeUser(id: string) {
    const userToDelete = await this.userRepository.findOneBy({ id });

    if (!userToDelete) {
      throw new NotFoundException('User was not found');
    }

    await this.userRepository.remove(userToDelete);

    return {
      success: true,
      message: 'User deleted Successfully',
    };
  }
}
