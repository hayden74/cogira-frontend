import type { EntityItem } from 'dynamodb-toolbox';
import type { userEntity } from '../data/usersEntity';

type DbUser = EntityItem<typeof userEntity>;

export type User = Omit<DbUser, 'entityType'>;
export type NewUser = Pick<User, 'firstName' | 'lastName'>;
export type UserListOptions = {
  limit?: number;
  nextToken?: string;
};
export type UserListResult = {
  users: User[];
  nextToken?: string;
};
