import type { userRole } from './constants';
import type { taskStatus, taskTypes } from './constants/tasks';

export type Constructor<T, Arguments extends unknown[] = undefined[]> = new (
  ...arguments_: Arguments
) => T;

export type ObjectValues<T> = T[keyof T];

export type UserRoleType = ObjectValues<typeof userRole>;
export type TaskStatus = ObjectValues<typeof taskStatus>;
export type TaskType = ObjectValues<typeof taskTypes>;

export interface IPaginationOptions {
  page: number;
  limit: number;
  pagination: boolean;
  [x: string]: number | string | boolean;
}
