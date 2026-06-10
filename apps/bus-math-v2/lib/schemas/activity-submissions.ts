import { z } from 'zod';

import { practiceSubmissionEnvelopeSchema } from '../practice/contract';

export const submissionDataSchema = practiceSubmissionEnvelopeSchema;

export type SubmissionData = z.infer<typeof submissionDataSchema>;
