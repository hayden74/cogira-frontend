import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../../data/usersRepo", () => {
  return {
    create: vi.fn(async (_user: any) => {}),
    getById: vi.fn(async (_id: string) => ({
      id: _id,
      createdAt: "t",
      modifiedAt: "t",
    })),
  };
});

import * as repo from "../../../data/usersRepo";
vi.mock("dayjs", () => ({ default: () => ({ toISOString: () => "t" }) }));
vi.mock("uuid", () => ({ v4: () => "uuid-1" }));
import { createUser, getUser } from "../../../services/usersService";

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
});
