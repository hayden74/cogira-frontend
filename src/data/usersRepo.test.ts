import { describe, it, expect, vi, beforeEach } from 'vitest';

const repositoryMocks = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
  query: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('./usersEntity', () => ({
  __esModule: true,
  userRepository: repositoryMocks,
  userEntity: {},
  USER_ENTITY_INDEX: 'ByEntityType',
  USER_ENTITY_TYPE: 'USER',
}));

import { create, getById, listAll, update, remove } from './usersRepo';

describe('usersRepo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(repositoryMocks).forEach((mock) => mock.mockReset());
  });

  it('getById returns item when found', async () => {
    const item = { id: 'u-1', createdAt: 't', modifiedAt: 't' };
    repositoryMocks.get.mockResolvedValueOnce({ Item: item });

    const res = await getById('u-1');

    expect(res).toEqual(item);
    expect(repositoryMocks.get).toHaveBeenCalledWith({ id: 'u-1' });
  });

  it('getById returns null when no item', async () => {
    repositoryMocks.get.mockResolvedValueOnce({});

    const res = await getById('missing');

    expect(res).toBeNull();
  });

  it('create stores the provided user via entity', async () => {
    const user = { id: 'u-2', createdAt: 't', modifiedAt: 't' };

    await create(user as any);

    expect(repositoryMocks.put).toHaveBeenCalledWith(
      expect.objectContaining({ ...user, entityType: 'USER' }),
      {
        condition: { attr: 'id', exists: false },
      }
    );
  });

  it('create surfaces conditional failures', async () => {
    const user = { id: 'u-3', createdAt: 't', modifiedAt: 't' };
    const error = new Error('ConditionalCheckFailedException');
    repositoryMocks.put.mockRejectedValueOnce(error);

    await expect(create(user as any)).rejects.toThrow(error);
    expect(repositoryMocks.put).toHaveBeenCalledWith(
      expect.objectContaining({ ...user, entityType: 'USER' }),
      {
        condition: { attr: 'id', exists: false },
      }
    );
  });

  it('listAll queries the GSI and returns items with token', async () => {
    const items = [
      { id: 'a', createdAt: 't', modifiedAt: 't' },
      { id: 'b', createdAt: 't', modifiedAt: 't' },
    ];
    repositoryMocks.query.mockResolvedValueOnce({
      Items: items,
      LastEvaluatedKey: { id: 'b' },
    });

    const res = await listAll({ limit: 25 });

    expect(res.items).toEqual(items);
    expect(res.nextToken).toBeDefined();
    expect(repositoryMocks.query).toHaveBeenCalledWith(
      {
        index: 'ByEntityType',
        partition: 'USER',
      },
      { limit: 25 }
    );
  });

  it('listAll throws on invalid pagination token', async () => {
    await expect(listAll({ nextToken: '!!!' })).rejects.toThrow(
      'Invalid pagination token'
    );
  });

  it('listAll forwards decoded pagination token', async () => {
    repositoryMocks.query.mockResolvedValueOnce({ Items: [] });
    const token = Buffer.from(JSON.stringify({ id: 'x' }), 'utf-8').toString(
      'base64'
    );

    await listAll({ nextToken: token });

    expect(repositoryMocks.query).toHaveBeenCalledWith(
      {
        index: 'ByEntityType',
        partition: 'USER',
      },
      expect.objectContaining({ exclusiveStartKey: { id: 'x' } })
    );
  });

  it('update merges existing item and persists', async () => {
    const existing = {
      id: 'u-1',
      createdAt: 't',
      modifiedAt: 't',
      firstName: 'Alice',
    };
    repositoryMocks.get.mockResolvedValueOnce({ Item: existing });

    await update('u-1', { lastName: 'Smith' } as any);

    expect(repositoryMocks.put).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'u-1',
        firstName: 'Alice',
        lastName: 'Smith',
      }),
      {
        condition: { attr: 'id', exists: true },
      }
    );
  });

  it('update is a no-op when item is missing', async () => {
    repositoryMocks.get.mockResolvedValueOnce({ Item: null });

    await update('missing', { lastName: 'Smith' } as any);

    expect(repositoryMocks.put).not.toHaveBeenCalled();
  });

  it('remove deletes by id', async () => {
    await remove('u-3');

    expect(repositoryMocks.delete).toHaveBeenCalledWith({ id: 'u-3' });
  });
});
