import { vi } from 'vitest';

export const create = vi.fn(async (_user: any) => {});
export const getById = vi.fn(async (id: string) => ({
  id,
  createdAt: 't',
  modifiedAt: 't',
}));
export const listAll = vi.fn(async () => [
  { id: 'u1', createdAt: 't', modifiedAt: 't' },
  { id: 'u2', createdAt: 't', modifiedAt: 't' },
]);
export const update = vi.fn(async (_id: string, _patch: any) => {});
export const remove = vi.fn(async (_id: string) => {});
