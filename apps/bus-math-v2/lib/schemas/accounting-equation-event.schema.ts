import { z } from 'zod';

const nonemptyText = z.string().trim().min(1);
const finiteNumber = z.number().finite();
const directionSchema = z.enum(['increase', 'decrease', 'no-effect']);
const categorySchema = z.enum(['Asset', 'Liability', 'Equity']);

const startingTotalsSchema = z.object({
  assets: finiteNumber,
  liabilities: finiteNumber,
  equity: finiteNumber,
}).strict();

const learnerAccountRowSchema = z.object({
  id: nonemptyText,
  label: nonemptyText,
}).strict();

const workedAccountRowSchema = learnerAccountRowSchema.extend({
  category: categorySchema,
}).strict();

const caseBase = z.object({
  id: nonemptyText,
  eventNarrative: nonemptyText,
  eventAmount: finiteNumber.nonnegative(),
  startingTotals: startingTotalsSchema,
});

function addDuplicateAccountIssue(
  eventCase: { accountRows: Array<{ id: string }> },
  ctx: z.RefinementCtx,
) {
  const ids = eventCase.accountRows.map((row) => row.id);
  if (new Set(ids).size !== ids.length) {
    ctx.addIssue({ code: 'custom', path: ['accountRows'], message: 'Account identifiers must be unique' });
  }
}

const workedCaseSchema = caseBase.extend({
  accountRows: z.array(workedAccountRowSchema).min(1),
  workedSolution: z.object({
    accountEffects: z.record(nonemptyText, directionSchema),
    endingTotals: startingTotalsSchema,
    equation: nonemptyText,
    explanation: nonemptyText,
  }).strict(),
}).strict().superRefine((eventCase, ctx) => {
  addDuplicateAccountIssue(eventCase, ctx);
  const accountIds = eventCase.accountRows.map((row) => row.id).sort();
  const effectIds = Object.keys(eventCase.workedSolution.accountEffects).sort();
  if (accountIds.length !== effectIds.length
    || accountIds.some((id, index) => id !== effectIds[index])) {
    ctx.addIssue({
      code: 'custom',
      path: ['workedSolution', 'accountEffects'],
      message: 'Worked account effects must match the case accounts',
    });
  }
});

const guidedCaseSchema = caseBase.extend({
  accountRows: z.array(learnerAccountRowSchema).min(1),
  guidedHints: z.array(nonemptyText).min(1).optional(),
}).strict().superRefine(addDuplicateAccountIssue);

const independentCaseSchema = caseBase.extend({
  accountRows: z.array(learnerAccountRowSchema).min(1),
}).strict().superRefine(addDuplicateAccountIssue);

function addDuplicateCaseIssue(
  draft: { cases: Array<{ id: string }> },
  ctx: z.RefinementCtx,
) {
  const ids = draft.cases.map((eventCase) => eventCase.id);
  if (new Set(ids).size !== ids.length) {
    ctx.addIssue({ code: 'custom', path: ['cases'], message: 'Case identifiers must be unique' });
  }
}

const sharedDraftFields = {
  activityId: nonemptyText,
  title: nonemptyText,
  description: nonemptyText,
};

const workedDraftSchema = z.object({
  ...sharedDraftFields,
  mode: z.literal('worked_example'),
  cases: z.array(workedCaseSchema).length(1),
}).strict().superRefine(addDuplicateCaseIssue);

const guidedDraftSchema = z.object({
  ...sharedDraftFields,
  mode: z.literal('guided_practice'),
  cases: z.array(guidedCaseSchema).min(1),
}).strict().superRefine(addDuplicateCaseIssue);

const independentDraftSchema = z.object({
  ...sharedDraftFields,
  mode: z.literal('independent_practice'),
  cases: z.array(independentCaseSchema).min(1),
}).strict().superRefine(addDuplicateCaseIssue);

export const accountingEquationEventPropsSchema = z.discriminatedUnion('mode', [
  workedDraftSchema,
  guidedDraftSchema,
  independentDraftSchema,
]);

export type AccountingEquationEventProps = z.infer<typeof accountingEquationEventPropsSchema>;
