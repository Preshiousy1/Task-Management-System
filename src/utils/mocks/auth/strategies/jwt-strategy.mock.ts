import { AuthUser } from '../../../../domains/auth/dto/auth-user.dto';
import type { User } from '../../../../domains/users/user.entity';

export const mockedJwtStrategy = (user: User) => ({
  validate: jest.fn().mockReturnValue(Promise.resolve(AuthUser.create(user))),
});
