import { describe, it, expect, vi } from 'vitest';

describe('OpenAPI document merge', () => {
  it('includes users paths and schemas by default', async () => {
    const mod = await import('./openapi');
    const doc = (mod as any).openApiDocument;
    expect(doc.paths['/users']).toBeDefined();
    expect(doc.components.schemas.User).toBeDefined();
  });

  it('handles fragments with undefined paths/schemas (fallback branches)', async () => {
    vi.resetModules();
    vi.doMock('./users', () => ({ usersDoc: {} }));
    const mod = await import('./openapi');
    const doc = (mod as any).openApiDocument;
    // When usersDoc provides nothing, merged placeholders exist and are objects
    expect(typeof doc.paths).toBe('object');
    expect(typeof doc.components.schemas).toBe('object');
  });
});
