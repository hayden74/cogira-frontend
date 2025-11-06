import { describe, it, expect, vi } from 'vitest';
vi.mock('../../services/usersService', () => ({
  updateUser: vi.fn(async () => ({ id: 'x', firstName: 'A', lastName: 'B', createdAt: 't', modifiedAt: 't' })),
}));
import { handleUsers } from './userController';
import type { AppRequest } from '../../lib/request';

const makeReq = (over: Partial<AppRequest>): AppRequest => ({
  method: 'PATCH',
  path: '/users/x',
  rawPath: '/users/x',
  basePath: '',
  query: {},
  params: { id: 'x' },
  body: {},
  ...over,
});

describe('users controller: update validation', () => {
  it('rejects empty update payload (minProperties=1)', async () => {
    await expect(handleUsers(makeReq({ body: {} }))).rejects.toMatchObject({ status: 400 });
  });
});

