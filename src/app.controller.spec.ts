import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let app: TestingModule;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
  });

  describe('get hello', () => {
    it('should return "Task Management System!"', () => {
      const appController = app.get(AppController);
      expect(appController.getHello()).toBe('Task Management System!');
    });
  });
});
