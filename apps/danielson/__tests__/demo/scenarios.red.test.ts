import { describe, expect, it } from 'vitest';

import {
  buildDemoScenario,
  DEMO_TEACHER_USERNAMES,
  DEMO_USERNAMES,
} from '../../lib/demo/scenarios';

const REFERENCE_TIME = Date.parse('2026-08-21T12:00:00.000Z');

describe('local Danielson demo scenarios', () => {
  it('builds the exact fictional organization and account roster', () => {
    const scenario = buildDemoScenario(REFERENCE_TIME);

    expect(scenario.organization).toEqual({
      slug: 'danielson-school',
      name: 'Haidian Kaiwen Academy',
      branding: {
        displayName: 'HDKWA',
        logoPath: '/brands/hdkwa-logo.png',
        primaryColor: '#003366',
        accentColor: '#C5A059',
      },
    });
    expect(scenario.accounts.map((account) => account.username)).toEqual([...DEMO_USERNAMES]);
    expect(scenario.teachers.map((teacher) => teacher.username)).toEqual([...DEMO_TEACHER_USERNAMES]);
    expect(scenario.accounts).toHaveLength(10);
    expect(scenario.teachers).toHaveLength(7);
  });

  it('defines the complete role matrix and department scope', () => {
    const scenario = buildDemoScenario(REFERENCE_TIME);
    const rolesByUsername = new Map(
      scenario.accounts.map((account) => [account.username, account.roles]),
    );

    expect(rolesByUsername.get('demo.sysadmin')).toEqual(['sysadmin']);
    expect(rolesByUsername.get('demo.slt')).toEqual(['slt', 'teacher']);
    expect(rolesByUsername.get('demo.head')).toEqual(['school_head']);
    expect(rolesByUsername.get('demo.hod.math')).toEqual(['hod', 'teacher']);
    expect(rolesByUsername.get('demo.coach.primary')).toEqual(['coach']);
    expect(rolesByUsername.get('demo.teacher.new')).toEqual(['teacher']);

    expect(scenario.departments).toEqual([
      { key: 'mathematics', name: 'Mathematics' },
      { key: 'primary-school', name: 'Primary School' },
    ]);
    expect(scenario.hodAssignment).toMatchObject({
      accountUsername: 'demo.hod.math',
      departmentKey: 'mathematics',
    });
    expect(scenario.coachAssignments.map((assignment) => assignment.teacherUsername)).toEqual([
      'demo.teacher.new',
      'demo.teacher.developing',
      'demo.teacher.growth',
    ]);
  });

  it('contains new, developing, experienced, PIP, GBF, HOD, and SLT scenarios', () => {
    const scenario = buildDemoScenario(REFERENCE_TIME);
    const teacher = (username: string) => scenario.teachers.find((item) => item.username === username);

    expect(teacher('demo.slt')).toMatchObject({ experience: 'experienced', pip: null });
    expect(teacher('demo.hod.math')).toMatchObject({ experience: 'experienced', pip: null });
    expect(teacher('demo.teacher.new')).toMatchObject({ experience: 'new', gbf: { state: 'in_progress' } });
    expect(teacher('demo.teacher.developing')).toMatchObject({
      experience: 'developing',
      expectedState: 'below_proficient',
      walkthroughPriorityCount: 3,
    });
    expect(teacher('demo.teacher.experienced')).toMatchObject({
      experience: 'experienced',
      expectedState: 'proficient',
      formalObservationTypes: ['formal_q1', 'formal_q4'],
    });
    expect(teacher('demo.teacher.pip')).toMatchObject({
      pip: { state: 'active', outcome: null, targetCount: 2 },
    });
    expect(teacher('demo.teacher.growth')).toMatchObject({
      pip: { state: 'closed', outcome: 'successful' },
      responseCount: 1,
    });
  });

  it('uses one reference clock and preserves the event order', () => {
    const scenario = buildDemoScenario(REFERENCE_TIME);
    const allDates = scenario.teachers.flatMap((teacher) => [
      ...teacher.observations.map((observation) => Date.parse(observation.observedAt)),
      ...(teacher.pip ? [Date.parse(teacher.pip.approvedAt), ...(teacher.pip.closedAt ? [Date.parse(teacher.pip.closedAt)] : [])] : []),
    ]);

    expect(allDates.every((date) => Number.isFinite(date))).toBe(true);
    expect(allDates.every((date) => date <= REFERENCE_TIME)).toBe(true);

    const experienced = scenario.teachers.find((teacher) => teacher.username === 'demo.teacher.experienced');
    expect(Date.parse(experienced!.observations[0].observedAt))
      .toBeLessThan(Date.parse(experienced!.observations[1].observedAt));

    const growth = scenario.teachers.find((teacher) => teacher.username === 'demo.teacher.growth');
    expect(Date.parse(growth!.pip!.approvedAt)).toBeLessThan(Date.parse(growth!.pip!.closedAt!));
    expect(growth!.observations.some((observation) => observation.rating === 3)).toBe(true);
  });

  it('contains only fictional demo identities and no credential secret', () => {
    const scenario = buildDemoScenario(REFERENCE_TIME);
    const serialized = JSON.stringify(scenario);

    expect(serialized).not.toContain('DANIELSON_DEMO_PASSWORD');
    expect(serialized).not.toContain('@');
    expect(serialized).not.toContain('real');
    expect(serialized).toContain('Casey Rivera');
    expect(serialized).toContain('Haidian Kaiwen Academy');
    expect(serialized).toContain('/brands/hdkwa-logo.png');
  });
});
