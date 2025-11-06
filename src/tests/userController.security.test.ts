import { describe, it, expect, vi } from 'vitest';
vi.mock('../services/usersService', () => ({
  listUsers: vi.fn(async () => ({ users: [], nextToken: undefined })),
  getUser: vi.fn(async () => null),
  createUser: vi.fn(async (u: any) => ({
    id: 'new',
    ...u,
    createdAt: '',
    modifiedAt: '',
  })),
  updateUser: vi.fn(async () => null),
  deleteUser: vi.fn(async () => {}),
}));
import { handleUsers } from '../controllers/users/userController';
import { AppError } from '../lib/errors';
import type { AppRequest } from '../lib/request';

const makeReq = (over: Partial<AppRequest>): AppRequest => ({
  method: 'GET',
  path: '/users',
  query: {},
  params: {},
  body: {},
  ...over,
});

describe('userController security tests', () => {
  it('rejects POST with malicious script in firstName', async () => {
    await expect(
      handleUsers(
        makeReq({
          method: 'POST',
          body: { firstName: "<script>alert('xss')</script>", lastName: 'Doe' },
        })
      )
    ).rejects.toThrow();
  });

  it('rejects POST with oversized payload', async () => {
    const largeString = 'A'.repeat(10000);
    await expect(
      handleUsers(
        makeReq({
          method: 'POST',
          body: { firstName: largeString, lastName: 'Doe' },
        })
      )
    ).rejects.toBeInstanceOf(AppError);
  });

  it('handles missing required fields securely', async () => {
    await expect(
      handleUsers(
        makeReq({
          method: 'POST',
          body: {},
        })
      )
    ).rejects.toBeInstanceOf(AppError);
  });

  it('validates id parameter format', async () => {
    await expect(
      handleUsers(
        makeReq({
          method: 'GET',
          path: '/users/null',
          params: { id: 'null' },
        })
      )
    ).rejects.toBeInstanceOf(AppError);
  });
});
