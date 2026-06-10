import { z } from 'zod';

export const accessibilityPreferencesSchema = z.object({
  language: z.enum(['en', 'zh']).default('en'),
  fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
  highContrast: z.boolean().default(false),
  readingLevel: z.enum(['basic', 'intermediate', 'advanced']).default('intermediate'),
  showVocabulary: z.boolean().default(false),
});

export type AccessibilityPreferences = z.infer<typeof accessibilityPreferencesSchema>;

export const profileMetadataSchema = z.object({
  grade: z.number().optional(),
  schoolName: z.string().optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
  accessibility: accessibilityPreferencesSchema.optional(),
});

export type ProfileMetadata = z.infer<typeof profileMetadataSchema>;
