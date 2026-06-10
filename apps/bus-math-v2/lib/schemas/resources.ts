import { z } from 'zod';

export const resourceMetadataSchema = z.object({
  fileSize: z.number().optional(),
  mimeType: z.string().optional(),
  downloadCount: z.number().optional(),
});

export type ResourceMetadata = z.infer<typeof resourceMetadataSchema>;
