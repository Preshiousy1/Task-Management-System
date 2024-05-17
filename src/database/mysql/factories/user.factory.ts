/* eslint-disable @typescript-eslint/require-await */
import { Factory } from '@concepta/typeorm-seeding';
import { faker } from '@faker-js/faker';

import { userRole } from '@/constants';
import { User } from '@/domains/users/user.entity';

export class UserFactory extends Factory<User> {
  protected async entity(): Promise<User> {
    const user = new User();
    user.first_name = faker.internet.userName();
    user.last_name = faker.internet.userName();
    user.email = faker.internet.email();
    user.phone = faker.phone.number('080 #### ####');
    user.role = userRole.User;
    user.password = 'password';

    return user;
  }
}
