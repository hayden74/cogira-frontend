import { describe, it, expect, vi } from "vitest";
vi.mock("../../services/usersService");
import { baseHandler } from "../../index";
import { makeEvent } from "../fixtures/apiGateway";
import { expectJson } from "../utils/http";

describe("router: delegation", () => {
  it("delegates to users for any path (single-domain PoC)", async () => {
    const res = await baseHandler(
      makeEvent({ path: "/unknown", method: "GET" })
    );
    const body = expectJson(res, 200);
    expect(body.domain).toBe("users");
  });
});

describe("router: OPTIONS preflight (handled by API Gateway)", () => {
  it("Lambda does not handle OPTIONS (would be handled by API)", async () => {
    const res = await baseHandler(
      makeEvent({ path: "/users", method: "OPTIONS" })
    );
    // If invoked directly, it falls through to 404 in Lambda
    const body = expectJson(res, 404);
    expect(body.message).toBe("Not Found");
  });
});
