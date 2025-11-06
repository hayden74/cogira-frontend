import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('./usersService', () => ({
  listUsers: vi.fn(async () => ({
    users: [
      { id: '1', firstName: 'A', lastName: 'B', createdAt: '', modifiedAt: '' },
    ],
    nextToken: 'token',
  })),
  getUser: vi.fn(async (id: string) =>
    id === 'exists'
      ? { id, firstName: 'A', lastName: 'B', createdAt: '', modifiedAt: '' }
      : null
  ),
  createUser: vi.fn(async (u: any) => ({
    id: 'new',
    ...u,
    createdAt: '',
    modifiedAt: '',
  })),
  updateUser: vi.fn(async (id: string, _u: any) =>
    id === 'exists'
      ? { id, firstName: 'A', lastName: 'B', createdAt: '', modifiedAt: '' }
      : null
  ),
  deleteUser: vi.fn(async () => {}),
}));
import type { AppRequest } from '../../lib/request';
import { AppError } from '../../lib/errors';
import { handleUsers } from './userController';

const makeReq = (over: Partial<AppRequest>): AppRequest => ({
  method: 'GET',
  path: '/users',
  rawPath: '/users',
  basePath: '',
  query: {},
  params: {},
  body: {},
  ...over,
});

const parseBody = (res: any) => (res.body ? JSON.parse(res.body) : undefined);

describe('users controller router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes GET /users to list', async () => {
    const res = await handleUsers(makeReq({ method: 'GET' }));
    expect(res.statusCode).toBe(200);
    const body = parseBody(res);
    expect(body.domain).toBe('users');
    expect(Array.isArray(body.users)).toBe(true);
    expect(body.nextToken).toBe('token');
  });

  it('routes GET /users/:id and returns 404 for missing', async () => {
    await expect(
      handleUsers(makeReq({ method: 'GET', params: { id: 'missing' } }))
    ).rejects.toMatchObject({ status: 404 });
    await expect(
      handleUsers(makeReq({ method: 'GET', params: { id: 'missing' } }))
    ).rejects.toBeInstanceOf(AppError);
  });

  it('POST /users validates body', async () => {
    await expect(
      handleUsers(
        makeReq({
          method: 'POST',
          body: { firstName: 'A' },
        })
      )
    ).rejects.toMatchObject({ status: 400 });
  });
});
