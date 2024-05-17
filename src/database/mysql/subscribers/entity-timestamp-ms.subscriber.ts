import type {
  EntitySubscriberInterface,
  InsertEvent,
  SoftRemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';

/* eslint-disable @typescript-eslint/no-explicit-any */
@EventSubscriber()
export class EntityTimestampMsSubscriber implements EntitySubscriberInterface {
  static getCurrentTime() {
    return Date.now();
  }

  beforeInsert(event: InsertEvent<any>): void {
    if (!event.entity) {
      return;
    }

    if (!event.entity?.created_at_ms) {
      event.entity.created_at_ms = EntityTimestampMsSubscriber.getCurrentTime();
    }

    event.entity.updated_at_ms = EntityTimestampMsSubscriber.getCurrentTime();
  }

  beforeUpdate(event: UpdateEvent<any>): void {
    if (!event.entity || !event.entity.created_at_ms) {
      return;
    }

    event.entity.updated_at_ms = EntityTimestampMsSubscriber.getCurrentTime();
  }

  beforeSoftRemove(event: SoftRemoveEvent<any>): void | Promise<any> {
    if (!event.entity || !event.entity.created_at_ms) {
      return;
    }

    event.entity.deleted_at_ms = EntityTimestampMsSubscriber.getCurrentTime();
  }
}
