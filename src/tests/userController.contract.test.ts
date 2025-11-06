import { describe, it, expect, vi } from 'vitest';
vi.mock('../features/users/usersService', () => ({
  listUsers: vi.fn(async () => ({
    users: [
      {
        id: '1',
        firstName: 'A',
        lastName: 'B',
        createdAt: '2023-01-01',
        modifiedAt: '2023-01-01',
      },
    ],
    nextToken: 'token',
  })),
  getUser: vi.fn(async () => ({
    id: '1',
    firstName: 'A',
    lastName: 'B',
    createdAt: '2023-01-01',
    modifiedAt: '2023-01-01',
  })),
  createUser: vi.fn(async (u: any) => ({
    id: 'new',
    ...u,
    createdAt: '2023-01-01',
    modifiedAt: '2023-01-01',
  })),
}));
import { handleUsers } from '../features/users/userController';
import type { AppRequest } from '../lib/request';

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

describe('userController contract tests', () => {
  it('GET /users response matches expected schema', async () => {
    const res = await handleUsers(makeReq({ method: 'GET' }));
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body).toHaveProperty('domain', 'users');
    expect(body).toHaveProperty('method', 'GET');
    expect(body).toHaveProperty('users');
    expect(body).toHaveProperty('nextToken', 'token');
    expect(Array.isArray(body.users)).toBe(true);

    // Validate user schema
    if (body.users.length > 0) {
      const user = body.users[0];
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('firstName');
      expect(user).toHaveProperty('lastName');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('modifiedAt');
    }
  });

  it('POST /users response includes Location header and correct schema', async () => {
    const res = await handleUsers(
      makeReq({
        method: 'POST',
        body: { firstName: 'Alice', lastName: 'Doe' },
      })
    );
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(201);
    expect(res.headers).toHaveProperty('Location');
    expect(res.headers.Location).toMatch(/^\/users\/.+/);
    expect(res.headers).toHaveProperty('Content-Type', 'application/json');

    // Validate response schema
    expect(body).toHaveProperty('domain', 'users');
    expect(body).toHaveProperty('method', 'POST');
    expect(body).toHaveProperty('user');
    expect(body.user).toHaveProperty('id');
    expect(body.user).toHaveProperty('firstName', 'Alice');
    expect(body.user).toHaveProperty('lastName', 'Doe');
  });

  it('GET /users/:id response matches user schema', async () => {
    const res = await handleUsers(
      makeReq({
        method: 'GET',
        params: { id: '1' },
      })
    );
    const body = JSON.parse(res.body);

    expect(res.statusCode).toBe(200);
    expect(body).toHaveProperty('domain', 'users');
    expect(body).toHaveProperty('method', 'GET');
    expect(body).toHaveProperty('user');

    // Validate user object schema
    expect(body.user).toHaveProperty('id', '1');
    expect(body.user).toHaveProperty('firstName');
    expect(body.user).toHaveProperty('lastName');
    expect(body.user).toHaveProperty('createdAt');
    expect(body.user).toHaveProperty('modifiedAt');
    expect(typeof body.user.firstName).toBe('string');
    expect(typeof body.user.lastName).toBe('string');
  });

  it('validates consistent error response schema', async () => {
    try {
      await handleUsers(
        makeReq({
          method: 'POST',
          body: {}, // Invalid - missing required fields
        })
      );
    } catch (error: any) {
      expect(error).toHaveProperty('status');
      expect(error).toHaveProperty('message');
      expect(typeof error.status).toBe('number');
      expect(typeof error.message).toBe('string');
    }
  });
});
