import type { UserItem } from '../data/usersEntity';

type DbUser = UserItem;

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
