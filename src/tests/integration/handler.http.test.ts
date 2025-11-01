import { describe, it, expect, vi } from "vitest";
vi.mock(
  "@/services/usersService",
  () => import("@/__mocks__/@/services/usersService")
);
import { handler } from "@/index";
import { makeEvent } from "@/tests/fixtures/apiGateway";
import { expectJson } from "@/tests/utils/http";

describe("HTTP integration: handler (middy + router)", () => {
  it("GET /users returns 200 with JSON", async () => {
    const event = makeEvent({ path: "/users", method: "GET" });
    const res = await handler(event, {} as any);
    const body = expectJson(res, 200);
    expect(body).toMatchObject({ domain: "users", method: "GET" });
  });

  it("POST /users (JSON) returns 201 and parses body", async () => {
    const event = makeEvent({
      path: "/users",
      method: "POST",
      headers: { "content-type": "application/json" },
      body: { firstName: "Alice", lastName: "Doe" },
    });
    const res = await handler(event as any, {} as any);
    const body = expectJson(res, 201);
    expect(body).toMatchObject({ domain: "users", method: "POST" });
  });
});
