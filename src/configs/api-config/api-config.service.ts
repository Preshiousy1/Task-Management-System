import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

@Injectable()
export class ApiConfigService {
  constructor(private configService: ConfigService) {}

  get nodeEnv(): string {
    return this.getString('NODE_ENV');
  }

  get isLocal(): boolean {
    return this.nodeEnv === 'local';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get documentationEnabled(): boolean {
    return this.getBoolean('ENABLE_DOCUMENTATION');
  }

  get authConfig() {
    return {
      privateKey: this.getString('JWT_PRIVATE_KEY'),
      publicKey: this.getString('JWT_PUBLIC_KEY'),
      jwtExpirationTime: this.getNumber('JWT_EXPIRATION_TIME'),
    };
  }

  get appConfig() {
    return {
      port: this.getString('PORT'),
    };
  }

  get throttleConfig() {
    return {
      ttl: this.getNumber('THROTTLE_TTL'),
      limit: this.getNumber('THROTTLE_LIMIT'),
    };
  }

  get sqlDbConfig(): TypeOrmModuleOptions {
    return this.isTest ? this.sqlTestDbConfig() : this.sqlAppDbConfig();
  }

  private sqlTestDbConfig(): TypeOrmModuleOptions {
    return {
      type: 'better-sqlite3',
      database: this.getString('SQL_TEST_DB_DATABASE'),
      entities: [],
      subscribers: ['./src/database/mysql/subscribers/*.subscriber.ts'],
      migrations: ['./src/database/mysql/migrations/*{.ts,.js}'],
      synchronize: false,
      autoLoadEntities: true,
    };
  }

  private sqlAppDbConfig(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.getString('SQL_DB_HOST'),
      port: this.getNumber('SQL_DB_PORT'),
      username: this.getString('SQL_DB_USERNAME'),
      password: this.getString('SQL_DB_PASSWORD'),
      database: this.getString('SQL_DB_DATABASE'),
      entities: [],
      subscribers: ['./dist/database/mysql/subscribers/*.subscriber.js'],
      synchronize: false,
      autoLoadEntities: true,
      multipleStatements: true,
      dateStrings: true,
    };
  }

  private getNumber(key: string): number {
    const value = this.get<number>(key);

    try {
      return Number(value);
    } catch {
      throw new Error(key + ' environment variable is not a number');
    }
  }

  private getBoolean(key: string): boolean {
    const value = this.get<string>(key);

    try {
      return Boolean(JSON.parse(value));
    } catch {
      throw new Error(key + ' env var is not a boolean');
    }
  }

  private getString(key: string): string {
    const value = this.get<string>(key);

    return value.replace(/\\n/g, '\n');
  }

  public get<T>(key: string): T | string {
    const value = this.configService.get<T>(key);

    return value || '';
  }
}
