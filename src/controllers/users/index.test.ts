import { describe, it, expect, vi } from 'vitest';
import { AppError } from '../../lib/errors';
vi.mock('../../services/usersService', () => ({
  createUser: vi.fn(async (input: any) => ({
    id: 'u-1',
    ...input,
    createdAt: 't',
    modifiedAt: 't',
  })),
  getUser: vi.fn(async (id: string) => ({
    id,
    createdAt: 't',
    modifiedAt: 't',
  })),
  listUsers: vi.fn(async () => ({ users: [], nextToken: undefined })),
  updateUser: vi.fn(async (id: string, input: any) => ({
    id,
    ...input,
    createdAt: 't',
    modifiedAt: 't',
  })),
  deleteUser: vi.fn(async (_id: string) => {}),
}));
import { makeEvent } from '../../tests/fixtures/apiGateway';
import { expectJson, getHeader } from '../../tests/utils/http';
import * as svc from '../../services/usersService';
import { usersHandlers } from './index';

describe('usersHandlers', () => {
  it('returns 200 for GET /users', async () => {
    const res = await usersHandlers(
      makeEvent({ path: '/users', method: 'GET' })
    );
    const body = expectJson(res, 200);
    expect(body).toMatchObject({ domain: 'users', method: 'GET', users: [] });
  });

  it('passes pagination params to service', async () => {
    await usersHandlers(
      makeEvent({
        path: '/users',
        method: 'GET',
        queryStringParameters: { limit: '10', nextToken: 'abc' },
      })
    );
    expect(svc.listUsers).toHaveBeenCalledWith({
      limit: 10,
      nextToken: 'abc',
    });
  });

  it('returns 201 for POST /users', async () => {
    const res = await usersHandlers(
      makeEvent({
        path: '/users',
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: { firstName: 'Alice', lastName: 'Doe' },
      })
    );
    const body = expectJson(res, 201);
    expect(body).toMatchObject({ domain: 'users', method: 'POST' });
    // ensure Location header is set by controller
    expect(getHeader(res, 'location')).toBe(`/users/u-1`);
  });

  it('returns 400 for POST /users with invalid body', async () => {
    await expect(
      usersHandlers(
        makeEvent({
          path: '/users',
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: { firstName: '' },
        })
      )
    ).rejects.toBeInstanceOf(AppError);
    await expect(
      usersHandlers(
        makeEvent({
          path: '/users',
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: { firstName: '' },
        })
      )
    ).rejects.toMatchObject({ status: 400 });
  });

  it('returns 200 for PUT /users/:id', async () => {
    const res = await usersHandlers(
      makeEvent({
        path: '/users/123',
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: { firstName: 'Bob' },
      })
    );
    expect(res.statusCode).toBe(200);
  });

  it('returns 204 for DELETE /users/:id', async () => {
    const res = await usersHandlers(
      makeEvent({
        path: '/users/123',
        method: 'DELETE',
      })
    );
    expect(res.statusCode).toBe(204);
    // No body expected for 204
    expect(res.body === undefined || res.body === '').toBe(true);
  });

  it('returns 200 for GET /users/:id', async () => {
    const res = await usersHandlers(
      makeEvent({ path: '/users/xyz', method: 'GET' })
    );
    const body = expectJson(res, 200);
    expect(body.user.id).toBe('xyz');
  });

  it('returns 404 when GET /users/:id not found', async () => {
    (svc.getUser as any).mockResolvedValueOnce(null);
    await expect(
      usersHandlers(makeEvent({ path: '/users/missing', method: 'GET' }))
    ).rejects.toMatchObject({ status: 404 });
  });

  it('rejects invalid limit parameter', async () => {
    await expect(
      usersHandlers(
        makeEvent({
          path: '/users',
          method: 'GET',
          queryStringParameters: { limit: 'not-a-number' },
        })
      )
    ).rejects.toBeInstanceOf(AppError);
  });

  it('rejects invalid pagination token', async () => {
    (svc.listUsers as any).mockRejectedValueOnce(
      new Error('Invalid pagination token')
    );
    await expect(
      usersHandlers(
        makeEvent({
          path: '/users',
          method: 'GET',
          queryStringParameters: { nextToken: 'bad-token' },
        })
      )
    ).rejects.toMatchObject({ status: 400 });
  });
});
