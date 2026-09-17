import { v } from 'convex/values';
import { internalMutation, type MutationCtx } from '../_generated/server';
import { projectIM1VerbalToNumerical } from '@math-platform/math-content/knowledge-space';
import { IM1_TRANSLATION_NODE_ID } from '../activities';

const modes = ['worked_example', 'guided_practice', 'independent_practice'] as const;
const seeds = [1101, 1110, 1103] as const;

export const seedTranslationPilot = internalMutation({
  args: {},
  returns: v.array(v.id("activities")),
  handler: seedTranslationPilotHandler,
});

export async function seedTranslationPilotHandler(ctx: MutationCtx) {
    const now = Date.now();
    const ids = [];
    for (const [index, mode] of modes.entries()) {
      const stableActivityId = `${IM1_TRANSLATION_NODE_ID}.${mode}`;
      const seed = seeds[index];
      const projection = projectIM1VerbalToNumerical({ nodeId: IM1_TRANSLATION_NODE_ID, seed, difficulty: 1 }, mode, stableActivityId);
      const existing = await ctx.db.query('activities').withIndex('by_stable_activity_id', q => q.eq('stableActivityId', stableActivityId)).unique();
      const value = { stableActivityId, masteryNodeId: IM1_TRANSLATION_NODE_ID, learningEvidenceMode: mode, generatorSeed: seed, generatorDifficulty: 1, componentKey: projection.componentKey, displayName: `Numerical expressions: ${mode.replaceAll('_', ' ')}`, props: projection.props, gradingConfig: { autoGrade: true, partialCredit: false }, updatedAt: now };
      const contentChanged = existing !== null && JSON.stringify({ componentKey: existing.componentKey, displayName: existing.displayName, props: existing.props, gradingConfig: existing.gradingConfig, masteryNodeId: existing.masteryNodeId, learningEvidenceMode: existing.learningEvidenceMode, generatorSeed: existing.generatorSeed, generatorDifficulty: existing.generatorDifficulty }) !== JSON.stringify({ componentKey: value.componentKey, displayName: value.displayName, props: value.props, gradingConfig: value.gradingConfig, masteryNodeId: value.masteryNodeId, learningEvidenceMode: value.learningEvidenceMode, generatorSeed: value.generatorSeed, generatorDifficulty: value.generatorDifficulty });
      const id = existing ? (await ctx.db.patch(existing._id, { ...value, ...(contentChanged ? { approval: undefined, srsEligible: false } : {}) }), existing._id) : await ctx.db.insert('activities', { ...value, srsEligible: false, createdAt: now });
      const practiceItem = await ctx.db.query('practice_items').withIndex('by_problemFamilyId', q => q.eq('problemFamilyId', stableActivityId)).unique();
      const link = { practiceItemId: stableActivityId, activityId: id, problemFamilyId: stableActivityId, variantLabel: mode };
      if (practiceItem) await ctx.db.patch(practiceItem._id, link);
      else await ctx.db.insert('practice_items', link);
      ids.push(id);
    }
    return ids;
}
