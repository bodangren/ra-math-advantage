/**
 * Frozen app-owned source inventory for the Danielson proficiency graph.
 *
 * This file is the import boundary. Production code consumes these records and
 * never reads the sibling project at runtime.
 */

export type ApprovedTlacSourceRow = {
  id: string;
  title: string;
  componentId: string;
  source: 'Teach Like a Champion 3.0';
  sourceLocation: string;
};

export type RuntimeSourceRow = {
  id: string;
  title: string;
  componentId: string;
  source: string;
  sourceLocation: string;
};

export const DANIELSON_SIBLING_COMMIT = '4ad319e57022ab8e334a594ee12c84a7a8886be7';

export const DANIELSON_SOURCE_SNAPSHOT = {
  siblingCommit: DANIELSON_SIBLING_COMMIT,
  frameworkSourceHash: '5c45ed005347e5ba6e951c406a05d1cca927f81be970031d5186d7eca4f6e853',
  standaloneSourceHash: '4704ae10511d27c4b3cc7951c0aadfe48558aa86e1148f8ba4f116383fe7cb1b',
  runtimeSourceHash: '9cecd83e24dfba10bcc6e765ae9b0a5a9083d08aff8b5e16c0b67b8b4220e705',
  frameworkSourceLocation: 'src/data/danielson.ts',
  standaloneSourceLocation: 'src/data/techniques/',
  runtimeSourceLocation: 'src/data/techniques.ts',
} as const;

/** The 63 reviewed standalone TLAC technique modules. */
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

/** Runtime rows whose IDs also occur in the standalone module inventory. */
export const RUNTIME_OVERLAP_SOURCE_INVENTORY: readonly RuntimeSourceRow[] = [
  { id: 'exemplar-planning', title: 'Exemplar Planning', componentId: '1a', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'knowledge-organizers', title: 'Knowledge Organizers', componentId: '1a', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'double-plan', title: 'The Double Plan', componentId: '1e', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'change-the-pace', title: 'Change the Pace', componentId: '1e', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'affirmative-checking', title: 'Affirmative Checking', componentId: '1f', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'standardize-format', title: 'Standardize the Format', componentId: '1f', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'positive-framing', title: 'Positive Framing', componentId: '2a', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'precise-praise', title: 'Precise Praise', componentId: '2a', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'joy-factor', title: 'The Joy Factor', componentId: '2a', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'culture-of-error', title: 'Culture of Error', componentId: '2b', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'strong-voice', title: 'Strong Voice', componentId: '2c', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'do-it-again', title: 'Do It Again', componentId: '2c', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'least-invasive-intervention', title: 'Least Invasive Intervention', componentId: '2d', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'art-of-consequence', title: 'Art of the Consequence', componentId: '2d', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'format-matters', title: 'Academic Sentence Practice', componentId: '3a', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'call-and-response', title: 'Choral Rehearsal', componentId: '3a', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'cold-call', title: 'Cold Call', componentId: '3b', source: 'Uncommon Schools', sourceLocation: 'src/data/techniques.ts' },
  { id: 'wait-time', title: 'Wait Time', componentId: '3b', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'no-opt-out', title: 'No Opt Out', componentId: '3b', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'stretch-it', title: 'Stretch It', componentId: '3b', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'turn-and-talk', title: 'Turn and Talk', componentId: '3c', source: 'Teaching Channel', sourceLocation: 'src/data/techniques.ts' },
  { id: 'everybody-writes', title: 'Everybody Writes', componentId: '3c', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'fase-reading', title: 'FASE Reading', componentId: '3c', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
];

/** The 40 runtime-only rows retained for source review. */
export const RUNTIME_SOURCE_INVENTORY: readonly RuntimeSourceRow[] = [
  { id: 'concept-mapping', title: 'Concept Mapping', componentId: '1a', source: 'Visible Learning', sourceLocation: 'src/data/techniques.ts' },
  { id: 'student-centered-research', title: 'The Student Perspective', componentId: '1b', source: 'Visible Learning', sourceLocation: 'src/data/techniques.ts' },
  { id: 'differentiated-instruction', title: 'Differentiated Paths', componentId: '1b', source: 'Marzano', sourceLocation: 'src/data/techniques.ts' },
  { id: 'cultural-competency', title: 'Culturally Responsive Design', componentId: '1b', source: 'Edutopia', sourceLocation: 'src/data/techniques.ts' },
  { id: 'learning-goals', title: 'Clear Learning Goals', componentId: '1c', source: 'Marzano', sourceLocation: 'src/data/techniques.ts' },
  { id: 'strategic-investment', title: 'Strategic Investment', componentId: '1c', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'student-friendly-rubrics', title: 'Success Criteria', componentId: '1c', source: 'Hattie', sourceLocation: 'src/data/techniques.ts' },
  { id: 'resource-curation', title: 'Curating Digital Resources', componentId: '1d', source: 'DangRenBo', sourceLocation: 'src/data/techniques.ts' },
  { id: 'case-study-analysis', title: 'Smart Case Studies', componentId: '1d', source: 'DangRenBo', sourceLocation: 'src/data/techniques.ts' },
  { id: 'professional-networks', title: 'Learning Networks', componentId: '1d', source: 'Edutopia', sourceLocation: 'src/data/techniques.ts' },
  { id: 'scaffolding-complex-tasks', title: 'Scaffolding', componentId: '1e', source: 'Edutopia', sourceLocation: 'src/data/techniques.ts' },
  { id: 'exit-tickets', title: 'The Exit Ticket', componentId: '1f', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'high-expectations', title: 'High Expectations', componentId: '2b', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'student-pride', title: 'The Wall of Excellence', componentId: '2b', source: 'Edutopia', sourceLocation: 'src/data/techniques.ts' },
  { id: 'tight-transitions', title: 'Tight Transitions', componentId: '2c', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'threshold', title: 'Threshold', componentId: '2c', source: 'Wong / TLAC', sourceLocation: 'src/data/techniques.ts' },
  { id: 'be-seen-looking', title: 'Be Seen Looking', componentId: '2d', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'invisible-columns-space', title: 'The Grid', componentId: '2e', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'front-table', title: 'The Front Table', componentId: '2e', source: 'DangRenBo', sourceLocation: 'src/data/techniques.ts' },
  { id: 'visual-aids', title: 'Anchor Charts', componentId: '2e', source: 'Edutopia', sourceLocation: 'src/data/techniques.ts' },
  { id: 'vocabulary-movement', title: 'Gesture Vocabulary', componentId: '3a', source: 'Uncommon Schools', sourceLocation: 'src/data/techniques.ts' },
  { id: 'ratio-thinking', title: 'The T/S Ratio', componentId: '3c', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'retrieval-practice-routine', title: 'Blast From the Past', componentId: '3d', source: 'Uncommon Schools', sourceLocation: 'src/data/techniques.ts' },
  { id: 'show-me-assessment', title: 'Show Me', componentId: '3d', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'self-assessment-checks', title: 'Confidence Scales', componentId: '3d', source: 'Marzano', sourceLocation: 'src/data/techniques.ts' },
  { id: 'plan-for-error-flex', title: 'Plan for Error', componentId: '3e', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'hinge-points-flex', title: 'Hinge Questions', componentId: '3e', source: 'Visible Learning', sourceLocation: 'src/data/techniques.ts' },
  { id: 'red-yellow-green', title: 'Traffic Light Checks', componentId: '3e', source: 'Teaching Channel', sourceLocation: 'src/data/techniques.ts' },
  { id: 'reflection-logs-4a', title: 'Before/After Reflection', componentId: '4a', source: 'HDKWA PD Portal', sourceLocation: 'src/data/techniques.ts' },
  { id: 'video-reflection', title: 'Video Self-Critique', componentId: '4a', source: 'Teaching Channel', sourceLocation: 'src/data/techniques.ts' },
  { id: 'smart-ledgers-4b', title: 'Progress Tracker', componentId: '4b', source: 'DangRenBo', sourceLocation: 'src/data/techniques.ts' },
  { id: 'gradebook-transparency', title: 'The Open Gradebook', componentId: '4b', source: 'Edutopia', sourceLocation: 'src/data/techniques.ts' },
  { id: 'home-contributions-4c', title: 'Home Learning Update', componentId: '4c', source: 'Visible Learning', sourceLocation: 'src/data/techniques.ts' },
  { id: 'newsletters', title: 'Instructional Updates', componentId: '4c', source: 'Edutopia', sourceLocation: 'src/data/techniques.ts' },
  { id: 'professional-community-4d', title: 'Schoolwide Contribution', componentId: '4d', source: 'Visible Learning', sourceLocation: 'src/data/techniques.ts' },
  { id: 'action-research-teams', title: 'Inquiry PLC', componentId: '4d', source: 'Marzano', sourceLocation: 'src/data/techniques.ts' },
  { id: 'professional-growth-4e', title: 'Continuous Growth (GROW)', componentId: '4e', source: 'Visible Learning', sourceLocation: 'src/data/techniques.ts' },
  { id: 'pd-leadership', title: 'The Master Teacher', componentId: '4e', source: 'DangRenBo', sourceLocation: 'src/data/techniques.ts' },
  { id: 'firm-calm-finesse-4f', title: 'Firm Calm Finesse', componentId: '4f', source: 'TLAC 3.0', sourceLocation: 'src/data/techniques.ts' },
  { id: 'advocacy', title: 'Student Advocacy', componentId: '4f', source: 'Edutopia', sourceLocation: 'src/data/techniques.ts' },
];

export const DANIELSON_SOURCE_INVENTORY = {
  ...DANIELSON_SOURCE_SNAPSHOT,
  approvedTlacSkills: APPROVED_TLAC_SOURCE_INVENTORY,
  runtimeOverlapTechniques: RUNTIME_OVERLAP_SOURCE_INVENTORY,
  runtimeOnlyTechniques: RUNTIME_SOURCE_INVENTORY,
} as const;

export const SOURCE_INVENTORY = DANIELSON_SOURCE_INVENTORY;

if (
  APPROVED_TLAC_SOURCE_INVENTORY.length !== 63
  || RUNTIME_OVERLAP_SOURCE_INVENTORY.length !== 23
  || RUNTIME_SOURCE_INVENTORY.length !== 40
) {
  throw new Error('Danielson source inventory counts are not frozen');
}
