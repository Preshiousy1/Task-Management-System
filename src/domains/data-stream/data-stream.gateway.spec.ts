import { Test } from '@nestjs/testing';
import { DataStreamGateway } from './data-stream.gateway';
import { INestApplication } from '@nestjs/common';
import { Socket, io } from 'socket.io-client';
import { mockedTask } from '../../utils/mocks/entities/task.mock';
import { Task } from '../tasks/entities/task.entity';

async function createNestApp(...gateways: any): Promise<INestApplication> {
  const testingModule = await Test.createTestingModule({
    providers: gateways,
  }).compile();
  return testingModule.createNestApplication();
}

async function eventReception(from: Socket, event: string): Promise<void> {
  return new Promise<void>((resolve) => {
    from.on(event, () => {
      resolve();
    });
  });
}

describe('DataStreamGateway', () => {
  let gateway: DataStreamGateway;
  let app: INestApplication;
  let ioClient: Socket;
  let task: Task;

  beforeAll(async () => {
    // Instantiate the app
    app = await createNestApp(DataStreamGateway);

    // Get the gateway and taskService instance from the app instance
    gateway = app.get<DataStreamGateway>(DataStreamGateway);

    // Create a new client that will interact with the gateway
    ioClient = io('http://localhost:3030', {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });

    //Create a new task
    task = mockedTask as Task;

    app.listen(3030);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should emit "pong" on "ping"', async () => {
    ioClient.on('pong', (data) => {
      expect(data).toBe('Hello world!');
    });

    ioClient.connect();
    await eventReception(ioClient, 'connect');

    ioClient.emit('ping', 'Hello world!');
    await eventReception(ioClient, 'pong');

    ioClient.disconnect();
  });

  describe('task-created', () => {
    it('should return the same task that was sent as data', async () => {
      ioClient.on('task-created', (data) => {
        expect(data).toStrictEqual(task);
      });

      ioClient.connect();
      await eventReception(ioClient, 'connect');

      ioClient.emit('task-created', task);
      await eventReception(ioClient, 'task-created');

      ioClient.disconnect();
    });
  });

  describe('task-updated', () => {
    it('should return the same task that was sent as data', async () => {
      ioClient.on('task-updated', (data) => {
        expect(data).toEqual(task.id);
      });

      ioClient.connect();
      await eventReception(ioClient, 'connect');

      ioClient.emit('task-updated', task.id);
      await eventReception(ioClient, 'task-updated');

      ioClient.disconnect();
    });
  });
});
