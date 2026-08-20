/** App-owned TLAC skill data for the Danielson proficiency graph. */

export type ApprovedTlacSourceRow = {
  id: string;
  title: string;
  componentId: string;
  source: 'Teach Like a Champion 3.0';
  sourceLocation: string;
};

/** The 63 TLAC technique modules supplied by the prototype. */
export const APPROVED_TLAC_SOURCE_INVENTORY: readonly ApprovedTlacSourceRow[] = [
  { id: 'accountable-independent-reading', title: 'Accountable Independent Reading', componentId: '3c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/accountable-independent-reading.ts' },
  { id: 'active-observation', title: 'Active Observation', componentId: '3d', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/active-observation.ts' },
  { id: 'affirmative-checking', title: 'Affirmative Checking', componentId: '1f', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/affirmative-checking.ts' },
  { id: 'all-hands', title: 'All Hands', componentId: '3c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/all-hands.ts' },
  { id: 'art-of-consequence', title: 'Art of the Consequence', componentId: '2d', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/art-of-consequence.ts' },
  { id: 'art-of-the-sentence', title: 'Art of the Sentence', componentId: '3a', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/art-of-the-sentence.ts' },
  { id: 'batch-process', title: 'Batch Process', componentId: '3a', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/batch-process.ts' },
  { id: 'board-paper', title: 'Board = Paper', componentId: '2e', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/board-paper.ts' },
  { id: 'break-it-down', title: 'Break It Down', componentId: '3a', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/break-it-down.ts' },
  { id: 'brighten-the-lines', title: 'Brighten the Lines', componentId: '2c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/brighten-the-lines.ts' },
  { id: 'call-and-response', title: 'Call and Response', componentId: '3a', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/call-and-response.ts' },
  { id: 'change-the-pace', title: 'Change the Pace', componentId: '1e', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/change-the-pace.ts' },
  { id: 'circulate', title: 'Circulate', componentId: '2c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/circulate.ts' },
  { id: 'cold-call', title: 'Cold Call', componentId: '3b', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/cold-call.ts' },
  { id: 'culture-of-error', title: 'Culture of Error', componentId: '2b', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/culture-of-error.ts' },
  { id: 'delivery-moves', title: 'Delivery Moves', componentId: '3e', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/delivery-moves.ts' },
  { id: 'disciplined-discussion', title: 'Disciplined Discussion', componentId: '3b', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/disciplined-discussion.ts' },
  { id: 'do-it-again', title: 'Do It Again', componentId: '2c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/do-it-again.ts' },
  { id: 'do-now', title: 'Do Now', componentId: '3c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/do-now.ts' },
  { id: 'double-plan', title: 'The Double Plan', componentId: '1e', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/double-plan.ts' },
  { id: 'emotional-constancy', title: 'Emotional Constancy', componentId: '2a', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/emotional-constancy.ts' },
  { id: 'engineer-efficiency', title: 'Engineer Efficiency', componentId: '1e', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/engineer-efficiency.ts' },
  { id: 'every-minute-matters', title: 'Every Minute Matters', componentId: '1c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/every-minute-matters.ts' },
  { id: 'everybody-writes', title: 'Everybody Writes', componentId: '3c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/everybody-writes.ts' },
  { id: 'exemplar-planning', title: 'Exemplar Planning', componentId: '1a', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/exemplar-planning.ts' },
  { id: 'exit-ticket', title: 'Exit Ticket', componentId: '1f', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/exit-ticket.ts' },
  { id: 'fase-reading', title: 'FASE Reading', componentId: '3c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/fase-reading.ts' },
  { id: 'firm-calm-finesse', title: 'Firm, Calm Finesse', componentId: '2c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/firm-calm-finesse.ts' },
  { id: 'format-matters', title: 'Format Matters', componentId: '3a', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/format-matters.ts' },
  { id: 'front-the-writing', title: 'Front the Writing', componentId: '3a', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/front-the-writing.ts' },
  { id: 'habits-of-attention', title: 'Habits of Attention', componentId: '2b', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/habits-of-attention.ts' },
  { id: 'habits-of-discussion', title: 'Habits of Discussion', componentId: '3b', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/habits-of-discussion.ts' },
  { id: 'joy-factor', title: 'Joy Factor', componentId: '2a', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/joy-factor.ts' },
  { id: 'knowledge-organizers', title: 'Knowledge Organizers', componentId: '1a', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/knowledge-organizers.ts' },
  { id: 'least-invasive-intervention', title: 'Least Invasive Intervention', componentId: '2d', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/least-invasive-intervention.ts' },
  { id: 'make-expectations-visible', title: 'Make Expectations Visible', componentId: '2b', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/make-expectations-visible.ts' },
  { id: 'means-of-participation', title: 'Means of Participation', componentId: '3c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/means-of-participation.ts' },
  { id: 'no-opt-out', title: 'No Opt Out', componentId: '3b', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/no-opt-out.ts' },
  { id: 'own-and-track', title: 'Own and Track', componentId: '2b', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/own-and-track.ts' },
  { id: 'phrasing-fundamentals', title: 'Phrasing Fundamentals', componentId: '3a', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/phrasing-fundamentals.ts' },
  { id: 'plan-for-error', title: 'Plan for Error', componentId: '3e', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/plan-for-error.ts' },
  { id: 'positive-framing', title: 'Positive Framing', componentId: '2a', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/positive-framing.ts' },
  { id: 'precise-praise', title: 'Precise Praise', componentId: '2a', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/precise-praise.ts' },
  { id: 'radar-be-seen-looking', title: 'Radar and Be Seen Looking', componentId: '2d', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/radar-be-seen-looking.ts' },
  { id: 'regular-revision', title: 'Regular Revision', componentId: '3b', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/regular-revision.ts' },
  { id: 'replace-self-report', title: 'Replace Self-Report', componentId: '3d', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/replace-self-report.ts' },
  { id: 'retrieval-practice', title: 'Retrieval Practice', componentId: '3d', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/retrieval-practice.ts' },
  { id: 'right-is-right', title: 'Right Is Right', componentId: '3a', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/right-is-right.ts' },
  { id: 'routine-building', title: 'Routine Building', componentId: '2c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/routine-building.ts' },
  { id: 'show-call', title: 'Show Call', componentId: '3b', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/show-call.ts' },
  { id: 'show-me', title: 'Show Me', componentId: '3d', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/show-me.ts' },
  { id: 'silent-solo', title: 'Silent Solo', componentId: '3c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/silent-solo.ts' },
  { id: 'standardize-format', title: 'Standardize the Format', componentId: '1f', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/standardize-format.ts' },
  { id: 'stretch-it', title: 'Stretch It', componentId: '3b', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/stretch-it.ts' },
  { id: 'strong-voice', title: 'Strong Voice', componentId: '2c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/strong-voice.ts' },
  { id: 'take-the-steps', title: 'Take the Steps', componentId: '3c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/take-the-steps.ts' },
  { id: 'threshold-strong-start', title: 'Threshold & Strong Start', componentId: '2c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/threshold-strong-start.ts' },
  { id: 'turn-and-talk', title: 'Turn and Talk', componentId: '3c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/turn-and-talk.ts' },
  { id: 'wait-time', title: 'Wait Time', componentId: '3b', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/wait-time.ts' },
  { id: 'warm-strict', title: 'Warm-Strict', componentId: '2a', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/warm-strict.ts' },
  { id: 'what-to-do', title: 'What to Do', componentId: '2d', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/what-to-do.ts' },
  { id: 'without-apology', title: 'Without Apology', componentId: '2c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/without-apology.ts' },
  { id: 'work-the-clock', title: 'Work the Clock', componentId: '1c', source: 'Teach Like a Champion 3.0', sourceLocation: 'src/data/techniques/work-the-clock.ts' },
];


if (APPROVED_TLAC_SOURCE_INVENTORY.length !== 63) {
  throw new Error('The TLAC source inventory must contain 63 skills');
}
