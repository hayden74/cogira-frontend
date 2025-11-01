import dayjs from "dayjs";
import { v4 as uuidv4 } from "uuid";
import * as repo from "../data/usersRepo";
import type { NewUser, User } from "../types/user";

export async function createUser(input: NewUser): Promise<User> {
  const now = dayjs().toISOString();
  const user: User = {
    id: uuidv4(),
    createdAt: now,
    modifiedAt: now,
    ...input,
  };
  await repo.create(user);
  return {
    id: user.id,
    firstName: input.firstName,
    lastName: input.lastName,
    createdAt: now,
    modifiedAt: now,
  };
}

export async function getUser(id: string): Promise<User | null> {
  const u = await repo.getById(id);
  return u ? (u as User) : null;
}

export async function listUsers(): Promise<User[]> {
  const users = await repo.listAll();
  return users as unknown as User[];
}

export async function updateUser(
  id: string,
  input: Partial<NewUser>
): Promise<User | null> {
  const now = dayjs().toISOString();
  await repo.update(id, { ...input, modifiedAt: now });
  const updated = await repo.getById(id);
  return updated ?? null;
}

export async function deleteUser(id: string): Promise<void> {
  await repo.remove(id);
}
