import { describe, expect, it } from 'vitest';

import { countActiveSysadmins } from '../../lib/foundation/sysadmin-policy';

describe('active sysadmin policy', () => {
  it('does not count inactive accounts when protecting the final active sysadmin', () => {
    expect(countActiveSysadmins([
      { organizationId: 'org-a', isActive: true },
      { organizationId: 'org-a', isActive: false },
      { organizationId: 'org-b', isActive: true },
      null,
    ], 'org-a')).toBe(1);
  });
});
