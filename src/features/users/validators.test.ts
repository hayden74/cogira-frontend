import { describe, it, expect } from 'vitest';
import {
  validateCreateUser,
  validateUpdateUser,
  formatValidationErrors,
} from './validators';

describe('users validators (AJV schemas)', () => {
  it('accepts valid CreateUser body', () => {
    const payload = { firstName: 'Alice', lastName: 'Doe' };
    const ok = validateCreateUser(payload);
    const errs = formatValidationErrors(validateCreateUser.errors);
    expect(ok).toBe(true);
    expect(errs.length).toBe(0);
  });

  it('rejects CreateUser with script tag and reports path', () => {
    const payload = {
      firstName: "<script>alert('x')</script>",
      lastName: 'Doe',
    };
    const ok = validateCreateUser(payload);
    const errs = formatValidationErrors(validateCreateUser.errors);
    expect(ok).toBe(false);
    expect(errs.length).toBeGreaterThan(0);
    // instancePath for failing property should be '/firstName'
    expect(errs[0].path).toContain('firstName');
  });

  it('accepts UpdateUser with single field and rejects empty object', () => {
    const good = validateUpdateUser({ firstName: 'Bob' });
    const bad = validateUpdateUser({});
    expect(good).toBe(true);
    expect(bad).toBe(false);
  });
});
