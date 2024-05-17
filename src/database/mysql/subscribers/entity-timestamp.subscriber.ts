import { getUnixTime } from 'date-fns';
import type {
  EntitySubscriberInterface,
  InsertEvent,
  SoftRemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { EventSubscriber } from 'typeorm';

/* eslint-disable @typescript-eslint/no-explicit-any */
@EventSubscriber()
export class EntityTimestampSubscriber implements EntitySubscriberInterface {
  static getCurrentTime() {
    return getUnixTime(new Date());
  }

  beforeInsert(event: InsertEvent<any>): void {
    if (!event.entity) {
      return;
    }

    if (!event.entity?.created_at) {
      event.entity.created_at = EntityTimestampSubscriber.getCurrentTime();
    }

    event.entity.updated_at = EntityTimestampSubscriber.getCurrentTime();
  }

  beforeUpdate(event: UpdateEvent<any>): void {
    if (!event.entity) {
      return;
    }

    event.entity.updated_at = EntityTimestampSubscriber.getCurrentTime();
  }

  beforeSoftRemove(event: SoftRemoveEvent<any>): void | Promise<any> {
    if (!event.entity) {
      return;
    }

    event.entity.deleted_at = Math.floor(Date.now() / 1000);
  }
}
