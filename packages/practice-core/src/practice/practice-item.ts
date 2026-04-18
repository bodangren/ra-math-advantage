import { z } from 'zod';

/**
 * A practice item maps a specific activity to a problem family.
 *
 * Practice items are the concrete instances students interact with.
 * Multiple practice items can belong to the same problem family,
 * providing variant problem sets (e.g. "Set A", "Set B").
 */
export type PracticeItem = {
  /** Stable identifier for this practice item */
  practiceItemId: string;

  /** Reference to the activity in the activities table */
  activityId: string;

  /** Reference to the problem family this item belongs to */
  problemFamilyId: string;

  /** Label distinguishing this variant from others in the same family */
  variantLabel: string;
};

export const practiceItemSchema = z.object({
  practiceItemId: z.string().trim().min(1),
  activityId: z.string().trim().min(1),
  problemFamilyId: z.string().trim().min(1),
  variantLabel: z.string().trim().min(1),
});

export type PracticeItemInput = z.input<typeof practiceItemSchema>;
