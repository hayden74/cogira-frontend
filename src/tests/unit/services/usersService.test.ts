import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../data/usersRepo", () => {
  return {
    create: vi.fn(async (_user: any) => {}),
    getById: vi.fn(async (_id: string) => ({
      id: _id,
      createdAt: "t",
      modifiedAt: "t",
    })),
    listAll: vi.fn(async () => [
      { id: "u1", createdAt: "t", modifiedAt: "t" },
      { id: "u2", createdAt: "t", modifiedAt: "t" },
    ]),
    update: vi.fn(async (_id: string, _patch: any) => {}),
    remove: vi.fn(async (_id: string) => {}),
  };
});
import * as repo from "../../../data/usersRepo";
vi.mock("dayjs", () => ({ default: () => ({ toISOString: () => "t" }) }));
vi.mock("uuid", () => ({ v4: () => "uuid-1" }));
import { createUser, getUser, listUsers, updateUser, deleteUser } from "../../../services/usersService";

describe("usersService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createUser returns object including provided first/last name", async () => {
    const input = { firstName: "Alice", lastName: "Doe" };
    const user = await createUser(input);
    expect(user).toMatchObject(input);
  });

  it("getUser delegates to repo.getById", async () => {
    const res = await getUser("abc");
    expect(res).toMatchObject({ id: "abc" });
    expect(repo.getById).toHaveBeenCalledWith("abc");
  });

  it("listUsers returns all users from repo", async () => {
    const res = await listUsers();
    expect(res).toHaveLength(2);
    expect(repo.listAll).toHaveBeenCalledTimes(1);
  });

  it("updateUser applies patch and returns updated user", async () => {
    // arrange: ensure getById returns updated object after update
    (repo.getById as any).mockResolvedValueOnce({
      id: "abc",
      firstName: "Bob",
      lastName: "Doe",
      createdAt: "t",
      modifiedAt: "t",
    });
    const res = await updateUser("abc", { firstName: "Bob" });
    expect(res).toMatchObject({ id: "abc", firstName: "Bob" });
    expect(repo.update).toHaveBeenCalledWith("abc", expect.objectContaining({ firstName: "Bob", modifiedAt: "t" }));
    expect(repo.getById).toHaveBeenCalledWith("abc");
  });

  it("updateUser returns null when repo has no record", async () => {
    (repo.getById as any).mockResolvedValueOnce(null);
    const res = await updateUser("missing", { lastName: "X" });
    expect(res).toBeNull();
  });

  it("deleteUser delegates to repo.remove", async () => {
    await deleteUser("abc");
    expect(repo.remove).toHaveBeenCalledWith("abc");
  });
});
