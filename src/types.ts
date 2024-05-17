import type { userRole } from './constants';

export type Constructor<T, Arguments extends unknown[] = undefined[]> = new (
  ...arguments_: Arguments
) => T;

export type ObjectValues<T> = T[keyof T];

export type UserRoleType = ObjectValues<typeof userRole>;

export interface IPaginationOptions {
  page: number;
  limit: number;
  pagination: boolean;
  [x: string]: number | string | boolean;
}
