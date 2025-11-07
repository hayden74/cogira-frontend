import { describe, it, expect } from 'vitest';

describe('OpenAPI document structure', () => {
  it('exposes a valid skeleton document', async () => {
    const mod = await import('./openapi');
    const doc = (mod as any).openApiDocument;
    expect(doc.openapi).toBe('3.0.3');
    expect(typeof doc.paths).toBe('object');
    expect(typeof doc.components.schemas).toBe('object');
  });
});
