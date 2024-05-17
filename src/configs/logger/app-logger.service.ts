import { ConsoleLogger, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApiConfigService } from '@/configs/api-config/api-config.service';

import type { CreateLogDto } from './dto/create-log.dto';
import { Log } from './log.entity';

/**
 * Transient logger service
 * This simply means that the context wouldn't be shared across the entire application
 * Thus, each service that injects this service will have its own context making it easier to trace logs
 */
@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService extends ConsoleLogger {
  private env: string = this.configService.get<string>('NODE_ENV');

  constructor(
    @InjectRepository(Log)
    private logRepo: Repository<Log>,
    private configService: ApiConfigService,
  ) {
    super();
  }

  private async create(data: CreateLogDto) {
    return this.logRepo.save(this.logRepo.create(data));
  }

  async error(message: string, stack?: string, ...optionalParams: string[]) {
    try {
      const log = await this.create({
        env: this.env,
        context: this.context,
        level: 'error',
        message,
        stack: stack?.toString(),
        data: JSON.stringify({ optionalParams }),
      });
    } catch (error) {
      console.error(error);
    }

    super.error(message, stack, ...optionalParams);
  }

  /**
   * Instead of using 'log', I am using info.
   * This will be our special type of logging to reduce DB usage and prevent us from logging unnecessary data
   */
  async info(message: string, ...optionalParams: string[]) {
    try {
      await this.create({
        env: this.env,
        context: this.context,
        level: 'info',
        message,
        data: JSON.stringify({ optionalParams }),
      });
    } catch (error) {
      console.error(error);
    }
  }

  async warn(message: string, ...optionalParams: string[]) {
    try {
      await this.create({
        env: this.env,
        context: this.context,
        level: 'warn',
        message,
        data: JSON.stringify({ optionalParams }),
      });
    } catch (error) {
      console.error(error);
    }

    super.warn(message, ...optionalParams);
  }

  async debug(message: string, ...optionalParams: string[]) {
    try {
      await this.create({
        env: this.env,
        context: this.context ?? 'AppLoggerService',
        level: 'debug',
        message,
        data: JSON.stringify({ optionalParams }),
      });
    } catch (error) {
      console.error(error);
    }

    super.debug(message, ...optionalParams);
  }

  async verbose(message: string, ...optionalParams: string[]) {
    try {
      await this.create({
        env: this.env,
        context: this.context,
        level: 'verbose',
        message,
        data: JSON.stringify({ optionalParams }),
      });
    } catch (error) {
      console.error(error);
    }

    super.verbose(message, ...optionalParams);
  }
}
