import { BullModule } from '@nestjs/bull';
import { RedisMemoryServer } from 'redis-memory-server';

import { ApiConfigService } from '../../src/configs/api-config/api-config.service';
import { ConfigsModule } from '../../src/configs/configs.module';

let redisServer: RedisMemoryServer | undefined;
export const rootRedisTestModule = () =>
  BullModule.forRootAsync({
    imports: [ConfigsModule],
    useFactory: async (configService: ApiConfigService) => {
      if (!redisServer || redisServer.getInstanceInfo() === false) {
        redisServer = new RedisMemoryServer();
      }

      const host = await redisServer.getHost();
      const port = await redisServer.getPort();

      return {
        prefix: configService.get<string>('QUEUE_PREFIX'),
        redis: {
          host,
          port,
        },
      };
    },
    inject: [ApiConfigService],
  });

export const closeInRedisConnection = async () => {
  if (redisServer) {
    await redisServer.stop();
  }
};
