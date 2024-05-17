import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { AuthenticatorController } from './authenticator.controller';
import { AuthenticatorService } from './authenticator.service';

@Module({
  imports: [UsersModule],
  providers: [AuthenticatorService, UsersService],
  controllers: [AuthenticatorController],
})
export class AuthenticatorModule {}
