import {
  APIGatewayProxyResult,
  APIGatewayProxyStructuredResultV2,
} from "aws-lambda";
import { expect } from "vitest";

export function normalizeHeaders(
  headers?: Record<string, string | number | boolean>
) {
  const out: Record<string, string> = {};
  if (!headers) return out;
  for (const [k, v] of Object.entries(headers)) {
    out[k.toLowerCase()] = String(v);
  }
  return out;
}

type AnyGatewayResult = APIGatewayProxyResult | APIGatewayProxyStructuredResultV2;

export function getHeader(res: AnyGatewayResult, name: string) {
  const headers = normalizeHeaders(res.headers);
  return headers[name.toLowerCase()];
}

export function expectJson(res: AnyGatewayResult, status?: number) {
  if (status !== undefined) expect(res.statusCode).toBe(status);
  const ct = getHeader(res, "content-type");
  expect(ct).toContain("application/json");
  const body = (res as any).body ?? "";
  expect(() => JSON.parse(body)).not.toThrow();
  return JSON.parse(body);
}
