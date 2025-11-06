import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import * as repo from '../../data/usersRepo';
import { USER_ENTITY_TYPE } from '../../data/usersEntity';
import type {
  NewUser,
  User,
  UserListOptions,
  UserListResult,
} from '../../types/user';
import type { UserItem } from '../../data/usersEntity';

const toUser = (item: UserItem | null): User | null => {
  if (!item) return null;
  // entityType is hidden but strip defensively in case it leaks through mocks
  const { entityType: _entityType, ...rest } = item as UserItem & {
    entityType?: string;
  };
  void _entityType; // ensure no-unused-vars lint rule
  return rest as User;
};

export async function createUser(input: NewUser): Promise<User> {
  const now = dayjs().toISOString();
  const user: User = {
    id: uuidv4(),
    createdAt: now,
    modifiedAt: now,
    ...input,
  };
  await repo.create({ ...user, entityType: USER_ENTITY_TYPE });
  return user;
}

export async function getUser(id: string): Promise<User | null> {
  const item = await repo.getById(id);
  return toUser(item);
}

export async function listUsers(
  options: UserListOptions = {}
): Promise<UserListResult> {
  const { items, nextToken } = await repo.listAll(options);
  const users = items
    .map((item) => toUser(item))
    .filter((item): item is User => Boolean(item));
  return {
    users,
    nextToken,
  };
}

export async function updateUser(
  id: string,
  input: Partial<NewUser>
): Promise<User | null> {
  const now = dayjs().toISOString();
  await repo.update(id, { ...input, modifiedAt: now });
  const updated = await repo.getById(id);
  return toUser(updated);
}

export async function deleteUser(id: string): Promise<void> {
  await repo.remove(id);
}
