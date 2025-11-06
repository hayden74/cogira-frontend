import {
  USER_ENTITY_INDEX,
  USER_ENTITY_TYPE,
  userRepository,
} from './usersEntity';
import type { UserItem } from './usersEntity';

type ListOptions = {
  limit?: number;
  nextToken?: string;
};

type ListResult = {
  items: UserItem[];
  nextToken?: string;
};

const encodeToken = (
  key?: Record<string, unknown> | undefined
): string | undefined =>
  key
    ? Buffer.from(JSON.stringify(key), 'utf-8').toString('base64')
    : undefined;

const decodeToken = (token?: string): Record<string, unknown> | undefined => {
  if (!token) return undefined;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return JSON.parse(decoded);
  } catch {
    throw new Error('Invalid pagination token');
  }
};

export async function getById(id: string): Promise<UserItem | null> {
  const { Item } = await userRepository.get({ id });
  return Item ?? null;
}

export async function create(user: UserItem): Promise<void> {
  const record =
    'entityType' in user ? user : { ...user, entityType: USER_ENTITY_TYPE };
  await userRepository.put(record as UserItem, {
    condition: { attr: 'id', exists: false },
  });
}

export async function listAll(options: ListOptions = {}): Promise<ListResult> {
  const { limit, nextToken } = options;
  const exclusiveStartKey = decodeToken(nextToken);
  const result = await userRepository.query(
    {
      index: USER_ENTITY_INDEX,
      partition: USER_ENTITY_TYPE,
    },
    {
      ...(limit !== undefined ? { limit } : {}),
      ...(exclusiveStartKey !== undefined ? { exclusiveStartKey } : {}),
    }
  );
  return {
    items: result.Items ?? [],
    nextToken: encodeToken(
      result.LastEvaluatedKey as Record<string, unknown> | undefined
    ),
  };
}

export async function update(
  id: string,
  attrs: Partial<UserItem>
): Promise<void> {
  const existing = await getById(id);
  if (!existing) return;
  const updated: UserItem = { ...existing, ...attrs, id };
  await userRepository.put(updated, {
    condition: { attr: 'id', exists: true },
  });
}

export async function remove(id: string): Promise<void> {
  await userRepository.delete({ id });
}
