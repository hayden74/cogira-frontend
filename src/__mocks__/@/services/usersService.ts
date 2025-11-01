import { vi } from "vitest";
import type { NewUser, User } from "../../../types/user";

export const createUser = vi.fn(
  async (input?: NewUser): Promise<User> => ({
    id: "mock-user-id",
    firstName: (input as any)?.firstName ?? "Mock",
    lastName: (input as any)?.lastName ?? "User",
    createdAt: "1970-01-01T00:00:00.000Z",
    modifiedAt: "1970-01-01T00:00:00.000Z",
  })
);

export const getUser = vi.fn(async (id: string): Promise<User | null> => ({
  id,
  firstName: "Mock",
  lastName: "User",
  createdAt: "1970-01-01T00:00:00.000Z",
  modifiedAt: "1970-01-01T00:00:00.000Z",
}));

export const listUsers = vi.fn(async (): Promise<User[]> => []);

export const updateUser = vi.fn(
  async (id: string, input: Partial<NewUser>): Promise<User> => ({
    id,
    firstName: (input as any)?.firstName ?? "Mock",
    lastName: (input as any)?.lastName ?? "User",
    createdAt: "1970-01-01T00:00:00.000Z",
    modifiedAt: "1970-01-01T00:00:00.000Z",
  })
);

export const deleteUser = vi.fn(async (_id: string): Promise<void> => {});
