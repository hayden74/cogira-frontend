import { describe, it, expect } from "vitest";
import { parseEvent } from "@/lib/request";

const baseEvent = {
  version: "2.0",
  routeKey: "$default",
  rawPath: "/users",
  rawQueryString: "",
  headers: {},
  requestContext: { http: { method: "GET" } },
} as any;

describe("parseEvent", () => {
  it("parses JSON body and params when provided", () => {
    const event = {
      ...baseEvent,
      rawPath: "/users/123",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ a: 1 }),
      pathParameters: { id: "123" },
      isBase64Encoded: false,
    };
    const req = parseEvent(event);
    expect(req.method).toBe("GET");
    expect(req.path).toBe("/users/123");
    expect(req.params).toEqual({ id: "123" });
    expect(req.body).toEqual({ a: 1 });
  });
});
