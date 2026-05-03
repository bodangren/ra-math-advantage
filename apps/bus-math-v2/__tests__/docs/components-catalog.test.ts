import { describe, expect, it } from 'vitest';

import { activityRegistry, getActivityComponent } from '../../lib/activities/registry';

describe('activity registry consistency', () => {
  it('every registry key resolves to a non-null component', () => {
    for (const key of Object.keys(activityRegistry)) {
      const component = getActivityComponent(key);
      expect(component, `key "${key}" should resolve`).not.toBeNull();
    }
  });

  it('unknown key returns null', () => {
    expect(getActivityComponent('nonexistent-key-xyz')).toBeNull();
  });

  it('registry is non-empty', () => {
    expect(Object.keys(activityRegistry).length).toBeGreaterThan(0);
  });
});
