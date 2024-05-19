import { Logger } from '@nestjs/common';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server } from 'socket.io';
import { Task } from '../tasks/entities/task.entity';
@WebSocketGateway({ cors: { origin: '*' } })
export class DataStreamGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(DataStreamGateway.name);

  @WebSocketServer() io: Server;

  afterInit() {
    this.logger.log('Initialized');
  }

  handleConnection(client: any, ...args: any[]) {
    const { sockets } = this.io.sockets;

    this.logger.log(`Client id: ${client.id} connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
  }

  handleDisconnect(client: any) {
    this.logger.log(`Client id:${client.id} disconnected`);
  }

  @SubscribeMessage('ping')
  handleMessage(client: any, data: any): { event: string; data: string } {
    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${data}`);
    return {
      event: 'pong',
      data,
    };
  }

  @SubscribeMessage('task-created') // subscribe to task-created event messages
  handleTaskCreated(@MessageBody() payload: Task): {
    event: string;
    data: Task;
  } {
    this.logger.log(`Task created: ${JSON.stringify(payload)}`);
    this.io.emit('task-created', payload); // broadcast a message to all clients
    return {
      event: 'task-created',
      data: payload,
    }; // return the same payload data
  }

  @SubscribeMessage('task-updated') // subscribe to task-updated event messages
  handleTaskUpdated(@MessageBody() payload: any): { event: string; data: any } {
    this.logger.log(`Task updated: ${JSON.stringify(payload)}`);
    this.io.emit('task-updated', payload);
    return {
      event: 'task-updated',
      data: payload,
    };
  }
}
