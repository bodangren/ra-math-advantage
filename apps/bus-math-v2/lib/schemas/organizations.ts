import { z } from 'zod';

export const organizationSettingsSchema = z.object({
  timezone: z.string().optional(),
  locale: z.string().optional(),
  branding: z.object({
    logoUrl: z.string().url().optional(),
    primaryColor: z.string().optional(),
  }).optional(),
  features: z.object({
    enableLivePolling: z.boolean().default(true),
    enableLeaderboards: z.boolean().default(true),
    enableAnalytics: z.boolean().default(true),
  }).optional(),
});

export type OrganizationSettings = z.infer<typeof organizationSettingsSchema>;
