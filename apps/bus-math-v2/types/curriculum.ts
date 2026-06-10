import type {
  ContentBlock as SchemaContentBlock,
  PhaseMetadata as SchemaPhaseMetadata,
} from '../lib/schemas/phase-content';
import { contentBlockSchema as schemaContentBlockSchema } from '../lib/schemas/phase-content';
import type {
  LessonMetadata as SchemaLessonMetadata,
  UnitAssessment as SchemaUnitAssessment,
  UnitContent as SchemaUnitContent,
  UnitDifferentiation as SchemaUnitDifferentiation,
  UnitDrivingQuestion as SchemaUnitDrivingQuestion,
  UnitResource as SchemaUnitResource,
  UnitLearningSequence as SchemaUnitLearningSequence,
  UnitObjectives as SchemaUnitObjectives,
  UnitPrerequisites as SchemaUnitPrerequisites,
  UnitStudentChoices as SchemaUnitStudentChoices,
  UnitIntroduction as SchemaUnitIntroduction,
} from '../lib/schemas/lessons';
import type { Phase as SchemaPhase, NewPhase as SchemaNewPhase } from '../lib/schemas/validators';

export const CURRICULUM_PHASE_COUNT = 6;
export const contentBlockSchema = schemaContentBlockSchema;

export type LessonRow = {
  id: string;
  unitNumber: number;
  title: string;
  slug: string;
  description: string | null;
  learningObjectives: string[] | null;
  orderIndex: number;
  metadata: LessonMetadata | null;
  createdAt: Date;
  updatedAt: Date;
};
export type NewLessonRow = Partial<LessonRow>;
export type PhaseRow = SchemaPhase;
export type NewPhaseRow = SchemaNewPhase;

export type LessonMetadata = SchemaLessonMetadata;
export type UnitContent = SchemaUnitContent;
export type UnitAssessment = SchemaUnitAssessment;
export type UnitDrivingQuestion = SchemaUnitDrivingQuestion;
export type UnitDifferentiation = SchemaUnitDifferentiation;
export type UnitIntroduction = SchemaUnitIntroduction;
export type UnitLearningSequence = SchemaUnitLearningSequence;
export type UnitObjectives = SchemaUnitObjectives;
export type UnitPrerequisites = SchemaUnitPrerequisites;
export type UnitResource = SchemaUnitResource;
export type UnitStudentChoices = SchemaUnitStudentChoices;
export type ContentBlock = SchemaContentBlock;
export type PhaseMetadata = SchemaPhaseMetadata;
