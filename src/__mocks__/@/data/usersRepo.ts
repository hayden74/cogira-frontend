import { vi } from 'vitest';

export const create = vi.fn(async (_user: any) => {});
export const getById = vi.fn(async (id: string) => ({
  id,
  createdAt: 't',
  modifiedAt: 't',
  entityType: 'USER',
}));
export const listAll = vi.fn(async () => ({
  items: [
    { id: 'u1', createdAt: 't', modifiedAt: 't', entityType: 'USER' },
    { id: 'u2', createdAt: 't', modifiedAt: 't', entityType: 'USER' },
  ],
}));
export const update = vi.fn(async (_id: string, _patch: any) => {});
export const remove = vi.fn(async (_id: string) => {});
