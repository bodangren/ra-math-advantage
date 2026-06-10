import { describe, expect, it } from 'vitest';

import { contentBlockSchema, phaseMetadataSchema } from '@/lib/schemas/phase-content';
import { lessonMetadataSchema } from '@/lib/schemas/lessons';
import { classMetadataSchema } from '@/lib/schemas/classes';
import { profileMetadataSchema } from '@/lib/schemas/profiles';
import { resourceMetadataSchema } from '@/lib/schemas/resources';
import { validationErrorSchema } from '@/lib/schemas/content-revisions';
import { organizationSettingsSchema } from '@/lib/schemas/organizations';
import { sessionSettingsSchema } from '@/lib/schemas/live-sessions';
import { liveResponseAnswerSchema } from '@/lib/schemas/live-responses';
import { submissionDataSchema } from '@/lib/schemas/activity-submissions';

describe('schema modules parity — re-homed from drizzle', () => {
  it('contentBlockSchema parses valid content blocks', () => {
    const markdownBlock = { id: 'block-1', type: 'markdown', content: 'Hello world' };
    expect(contentBlockSchema.safeParse(markdownBlock).success).toBe(true);

    const imageBlock = { id: 'block-2', type: 'image', props: { imageUrl: 'https://example.com/image.png', alt: 'An image' } };
    expect(contentBlockSchema.safeParse(imageBlock).success).toBe(true);
  });

  it('phaseMetadataSchema parses valid metadata', () => {
    const result = phaseMetadataSchema.safeParse({
      difficulty: 'medium',
      estimatedTime: 15,
    });
    expect(result.success).toBe(true);
  });

  it('lessonMetadataSchema parses valid metadata', () => {
    const result = lessonMetadataSchema.safeParse({
      tags: ['accounting', 'intro'],
      prerequisites: [],
    });
    expect(result.success).toBe(true);
  });

  it('classMetadataSchema parses valid metadata', () => {
    const result = classMetadataSchema.safeParse({
      subject: 'Business Math',
      gradeLevel: '9-12',
    });
    expect(result.success).toBe(true);
  });

  it('profileMetadataSchema parses valid metadata', () => {
    const result = profileMetadataSchema.safeParse({
      preferences: { theme: 'light' },
    });
    expect(result.success).toBe(true);
  });

  it('resourceMetadataSchema parses valid metadata', () => {
    const result = resourceMetadataSchema.safeParse({
      fileSize: 1024,
      mimeType: 'application/pdf',
    });
    expect(result.success).toBe(true);
  });

  it('validationErrorSchema parses valid errors', () => {
    const result = validationErrorSchema.safeParse({
      path: 'title',
      message: 'Title is required',
    });
    expect(result.success).toBe(true);
  });

  it('organizationSettingsSchema parses valid settings', () => {
    const result = organizationSettingsSchema.safeParse({
      defaultCurrency: 'USD',
      features: { srs: true },
    });
    expect(result.success).toBe(true);
  });

  it('sessionSettingsSchema parses valid settings', () => {
    const result = sessionSettingsSchema.safeParse({
      timeLimitSeconds: 300,
      allowLateJoin: true,
    });
    expect(result.success).toBe(true);
  });

  it('liveResponseAnswerSchema parses valid answers', () => {
    const textAnswer = { text: 'My answer' };
    expect(liveResponseAnswerSchema.safeParse(textAnswer).success).toBe(true);

    const choiceAnswer = { choiceId: 'choice-1' };
    expect(liveResponseAnswerSchema.safeParse(choiceAnswer).success).toBe(true);
  });

  it('submissionDataSchema parses valid submission data', () => {
    const result = submissionDataSchema.safeParse({
      contractVersion: 'practice.v1',
      activityId: 'activity-1',
      mode: 'independent_practice',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: new Date().toISOString(),
      answers: { q1: 'a1' },
      parts: [{
        partId: 'p1',
        rawAnswer: 'answer',
        isCorrect: true,
        score: 1,
        maxScore: 1,
      }],
      timing: {
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        wallClockMs: 60000,
        activeMs: 55000,
        idleMs: 5000,
        pauseCount: 0,
        focusLossCount: 0,
        visibilityHiddenCount: 0,
        confidence: 'high',
      },
    });
    expect(result.success).toBe(true);
  });
});
