import { describe, it, expect, vi } from 'vitest';
vi.mock('../data/usersRepo', () => ({
  create: vi.fn(),
  getById: vi.fn(async () => ({
    id: '1',
    firstName: 'A',
    lastName: 'B',
    createdAt: 't',
    modifiedAt: 't',
    entityType: 'USER',
  })),
  listAll: vi.fn(async () => ({
    items: [
      {
        id: '1',
        firstName: 'A',
        lastName: 'B',
        createdAt: 't',
        modifiedAt: 't',
        entityType: 'USER',
      },
    ],
  })),
  update: vi.fn(),
  remove: vi.fn(),
}));
vi.mock('dayjs', () => ({
  default: () => ({ toISOString: () => '2023-01-01T00:00:00.000Z' }),
}));
vi.mock('uuid', () => ({ v4: () => 'uuid-123' }));
import { createUser, getUser, listUsers } from '../services/usersService';

describe('usersService contract tests', () => {
  it('createUser returns user with required fields and correct types', async () => {
    const input = { firstName: 'Alice', lastName: 'Doe' };
    const result = await createUser(input);

    // Validate required fields exist
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('firstName', 'Alice');
    expect(result).toHaveProperty('lastName', 'Doe');
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('modifiedAt');

    // Validate field types
    expect(typeof result.id).toBe('string');
    expect(typeof result.firstName).toBe('string');
    expect(typeof result.lastName).toBe('string');
    expect(typeof result.createdAt).toBe('string');
    expect(typeof result.modifiedAt).toBe('string');

    // Validate ISO date format
    expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    expect(result.modifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('getUser returns null or user with complete schema', async () => {
    const result = await getUser('1');

    if (result !== null) {
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('modifiedAt');

      // Validate types
      expect(typeof result.id).toBe('string');
      expect(typeof result.firstName).toBe('string');
      expect(typeof result.lastName).toBe('string');
      expect(typeof result.createdAt).toBe('string');
      expect(typeof result.modifiedAt).toBe('string');
    }
  });

  it('listUsers returns array with consistent user schema', async () => {
    const result = await listUsers();

    expect(Array.isArray(result.users)).toBe(true);
    expect(result).toHaveProperty('nextToken');

    // If users exist, validate schema consistency
    result.users.forEach((user) => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('modifiedAt');
      expect(typeof user.id).toBe('string');
      expect(typeof user.createdAt).toBe('string');
      expect(typeof user.modifiedAt).toBe('string');
    });
  });

  it('validates data structure immutability', async () => {
    const input = { firstName: 'Alice', lastName: 'Doe' };
    const result = await createUser(input);

    // Original input should not be modified
    expect(input).toEqual({ firstName: 'Alice', lastName: 'Doe' });

    // Result should be a new object
    expect(result).not.toBe(input);
    expect(result.firstName).toBe(input.firstName);
    expect(result.lastName).toBe(input.lastName);
  });
});
