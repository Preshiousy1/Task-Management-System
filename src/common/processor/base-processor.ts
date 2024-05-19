import { OnQueueCompleted, OnQueueFailed } from '@nestjs/bull';
import { Inject } from '@nestjs/common';
import { Job } from 'bull';

import { AppLoggerService } from '@/configs/logger/app-logger.service';

export abstract class BaseProcessor {
  constructor(
    @Inject(AppLoggerService)
    private logger: AppLoggerService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @OnQueueFailed()
  async onQueueFailed(job: Job, error: Error) {
    await this.logger.error(error.message, error.stack);
  }

  @OnQueueCompleted()
  async onQueueCompleted(job: Job) {
    await this.logger.info(`Job ${job.id} completed`, JSON.stringify(job));
  }
}
