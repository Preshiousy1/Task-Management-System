import { ConfigModule } from '@nestjs/config';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';

import { ApiConfigService } from './api-config.service';

describe('ApiConfigService', () => {
  let service: ApiConfigService;

  beforeEach(async () => {
    process.env.NODE_ENV = 'test';

    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiConfigService],
      imports: [ConfigModule],
    }).compile();

    service = module.get<ApiConfigService>(ApiConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('#nodeEnv - Node Environment', () => {
    it('should return the correct node environment', () => {
      expect(service.nodeEnv).toBe('test');
    });
  });

  describe('#isDevelopment - Check If Dev Environment', () => {
    it('should return true if in development node environment', () => {
      expect(service.isDevelopment).toBe(false);

      process.env.NODE_ENV = 'development';
      expect(service.isDevelopment).toBe(true);
    });
  });

  describe('#isLocal - Check If Local Environment', () => {
    it('should return true if in local node environment', () => {
      expect(service.isLocal).toBe(false);

      process.env.NODE_ENV = 'local';
      expect(service.isLocal).toBe(true);
    });
  });

  describe('#isTest - Check If Test Environment', () => {
    it('should return true if in local node environment', () => {
      expect(service.isTest).toBe(true);
    });
  });

  describe('#isProduction - Check If Production Environment', () => {
    it('should return true if in production node environment', () => {
      expect(service.isProduction).toBe(false);

      process.env.NODE_ENV = 'production';
      expect(service.isProduction).toBe(true);
    });
  });

  describe('#documentationEnabled - Check if documentation is enabled', () => {
    it('should return true/false if documentation is enabled/disabled', () => {
      process.env.ENABLE_DOCUMENTATION = 'false';
      expect(service.documentationEnabled).toBe(false);

      process.env.ENABLE_DOCUMENTATION = '0';
      expect(service.documentationEnabled).toBe(false);

      process.env.ENABLE_DOCUMENTATION = '1';
      expect(service.documentationEnabled).toBe(true);

      process.env.ENABLE_DOCUMENTATION = 'true';
      expect(service.documentationEnabled).toBe(true);
    });
  });

  describe('#authConfig - JWT Auth Config', () => {
    beforeEach(() => {
      process.env.JWT_PRIVATE_KEY = 'test-private-key';
      process.env.JWT_PUBLIC_KEY = 'test-public-key';
      process.env.JWT_EXPIRATION_TIME = '15';
    });

    it('should return the authentication config', () => {
      expect(service.authConfig).toMatchObject({
        privateKey: 'test-private-key',
        publicKey: 'test-public-key',
        jwtExpirationTime: 15,
      });
    });
  });

  describe('#appConfig - App Config', () => {
    beforeEach(() => {
      process.env.PORT = '3000';
    });

    it('should return the app config', () => {
      expect(service.appConfig).toMatchObject({
        port: '3000',
      });
    });
  });

  describe('#throttleConfig - Throttle Config', () => {
    beforeEach(() => {
      process.env.THROTTLE_TTL = '60';
      process.env.THROTTLE_LIMIT = '60';
    });

    it('should return the throttle config', () => {
      expect(service.throttleConfig).toMatchObject({
        ttl: 60,
        limit: 60,
      });
    });
  });

  describe('#sqlDbConfig - SQL Config', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'local';
      process.env.SQL_DB_HOST = 'localhost';
      process.env.SQL_DB_PORT = '3360';
      process.env.SQL_DB_USERNAME = 'test-username';
      process.env.SQL_DB_PASSWORD = 'test-password';
      process.env.SQL_DB_DATABASE = 'test-db';
    });

    it('should return the mysql db config', () => {
      expect(service.sqlDbConfig).toMatchObject({
        type: 'mysql',
        host: 'localhost',
        port: 3360,
        username: 'test-username',
        password: 'test-password',
        database: 'test-db',
        entities: [],
        synchronize: false,
        autoLoadEntities: true,
        multipleStatements: true,
        dateStrings: true,
      });
    });
  });

  describe('#get - Get config via key', () => {
    beforeEach(() => {
      process.env.PORT = '3000';
      process.env.ENABLE_DOCUMENTATION = 'true';
      process.env.JWT_EXPIRATION_TIME = '15';
    });

    it('should return the config with the provided key', () => {
      expect(service.get('PORT')).toBe('3000');
      expect(service.get('JWT_EXPIRATION_TIME')).toBe('15');
      expect(service.get('ENABLE_DOCUMENTATION')).toBe('true');
    });
  });
});
