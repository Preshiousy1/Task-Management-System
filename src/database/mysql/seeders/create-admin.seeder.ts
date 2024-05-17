import { Seeder } from '@concepta/typeorm-seeding';

import { userRole } from '../../../constants';
import { UserFactory } from '../factories/user.factory';

export class AdminSeeder extends Seeder {
  async run(): Promise<void> {
    const userFactory = this.factory(UserFactory);

    await userFactory.create({
      first_name: 'TaskManager',
      last_name: 'Admin',
      email: 'admin@tms.com',
      role: userRole.Admin,
      password: '6*i5MYEZM0d8',
    });
  }
}
