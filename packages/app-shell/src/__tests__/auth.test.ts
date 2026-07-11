import { describe, expect, it } from 'vitest';

import { usernameToEmail } from '../auth/AuthProvider';

describe('usernameToEmail', () => {
  it('maps a username to the stable internal identity domain', () => {
    expect(usernameToEmail('student.42')).toBe('student.42@internal.domain');
  });

  it('preserves the caller-provided username exactly', () => {
    expect(usernameToEmail('  MixedCase  ')).toBe('  MixedCase  @internal.domain');
  });
});
