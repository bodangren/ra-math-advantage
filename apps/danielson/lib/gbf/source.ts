import type {
  GbfActionStep,
  GbfPhase,
  GbfSource,
} from './contracts';
export {
  GBF_MAPPINGS,
  GBF_UNSEQUENCED_SKILL_IDS,
} from './mappings';

export const GBF_SOURCES: GbfSource[] = [
  {
    filename: 'get-better-faster-scope-sequence.pdf',
    pageCount: 5,
    purpose: 'sequence',
    note: 'The user identified this file as the GBF 2.0 scope and sequence. The file does not state an edition.',
  },
  {
    filename: 'Classroom-Insights-Handbook_25-26-1.pdf',
    pageCount: 5,
    purpose: 'implementation_example',
    note: 'This file is an implementation example. It does not define the GBF sequence.',
  },
  {
    filename: '../hdkwa-danielson/src/data/techniques/',
    pageCount: 0,
    purpose: 'skill_inventory',
    note: 'This directory supplied the 63 TLAC 3.0 skills in this app.',
    siblingCommit: '4ad319e57022ab8e334a594ee12c84a7a8886be7',
    recordCount: 63,
  },
];

export const GBF_PHASES: GbfPhase[] = [
  { phaseId: 'phase_1', name: 'Pre-teaching', sourcePage: 1 },
  { phaseId: 'phase_2', name: 'Days 1–30', sourcePage: 2 },
  { phaseId: 'phase_3', name: 'Days 31–60', sourcePage: 3 },
  { phaseId: 'phase_4', name: 'Days 61–90', sourcePage: 4 },
  { phaseId: 'stretch_it', name: 'Next steps', sourcePage: 5 },
];

const required = (
  actionStepId: string,
  phaseId: GbfActionStep['phaseId'],
  trajectory: GbfActionStep['trajectory'],
  trajectoryOrder: number,
  sourceNumber: number,
  name: string,
  sourcePage: number,
): GbfActionStep => ({
  actionStepId,
  phaseId,
  trajectory,
  trajectoryOrder,
  sourceNumber,
  name,
  sourcePage,
  status: 'required',
});

const preview = (actionStepId: string, name: string, previewOrder: number): GbfActionStep => ({
  actionStepId,
  phaseId: 'phase_1',
  trajectory: 'management',
  trajectoryOrder: 0,
  sourceNumber: null,
  name,
  sourcePage: 1,
  status: 'preview',
  previewOrder,
});

export const GBF_ACTION_STEPS: GbfActionStep[] = [
  required('phase_1.management.1', 'phase_1', 'management', 1, 1, 'Routines and Procedures 101', 1),
  required('phase_1.management.2', 'phase_1', 'management', 2, 2, 'Strong Voice', 1),
  preview('phase_1.management.preview.least-invasive-intervention', 'Least Invasive Intervention', 1),
  preview('phase_1.management.preview.narrate-positive', 'Narrate the Positive', 2),
  preview('phase_1.management.preview.build-momentum', 'Create a Challenge or Build Momentum', 3),
  preview('phase_1.management.preview.teacher-radar', 'Teacher Radar', 4),
  preview('phase_1.management.preview.do-it-again', 'Do It Again', 5),
  required('phase_1.rigor.1', 'phase_1', 'rigor', 1, 1, 'Develop Effective Lesson Plans 101', 1),
  required('phase_1.rigor.2', 'phase_1', 'rigor', 2, 2, 'Internalize Existing Lesson Plans', 1),
  required('phase_2.management.1', 'phase_2', 'management', 3, 1, 'What to Do', 2),
  required('phase_2.management.2', 'phase_2', 'management', 4, 2, 'Routines and Procedures 201', 2),
  required('phase_2.management.3', 'phase_2', 'management', 5, 3, 'Teacher Radar', 2),
  required('phase_2.management.4', 'phase_2', 'management', 6, 4, 'Whole-Class Reset', 2),
  required('phase_2.rigor.3', 'phase_2', 'rigor', 3, 3, 'Write the Exemplar', 2),
  required('phase_2.rigor.4', 'phase_2', 'rigor', 4, 4, 'Independent Practice', 2),
  required('phase_2.rigor.5', 'phase_2', 'rigor', 5, 5, 'Monitor Aggressively', 2),
  required('phase_3.management.5', 'phase_3', 'management', 7, 5, 'Build the Momentum', 3),
  required('phase_3.management.6', 'phase_3', 'management', 8, 6, 'Pacing', 3),
  required('phase_3.management.7', 'phase_3', 'management', 9, 7, 'Engage All Students', 3),
  required('phase_3.management.8', 'phase_3', 'management', 10, 8, 'Narrate the Positive', 3),
  required('phase_3.management.9', 'phase_3', 'management', 11, 9, 'Individual Student Corrections', 3),
  required('phase_3.rigor.6', 'phase_3', 'rigor', 6, 6, 'Habits of Evidence', 3),
  required('phase_3.rigor.7', 'phase_3', 'rigor', 7, 7, 'Check for Whole-Group Understanding', 3),
  required('phase_3.rigor.8', 'phase_3', 'rigor', 8, 8, 'Re-teaching 101 - Model', 3),
  required('phase_4.management.10', 'phase_4', 'management', 12, 10, 'Engaged Small Group Work', 4),
  required('phase_4.rigor.9', 'phase_4', 'rigor', 9, 9, 'Re-teaching 201 - Guided Discourse', 4),
  required('phase_4.rigor.10', 'phase_4', 'rigor', 10, 10, 'Universal Prompts', 4),
  required('phase_4.rigor.11', 'phase_4', 'rigor', 11, 11, 'Habits of Discussion', 4),
  required('stretch_it.rigor.12', 'stretch_it', 'rigor', 12, 12, 'Strategic Prompts', 5),
  required('stretch_it.rigor.13', 'stretch_it', 'rigor', 13, 13, 'Go Conceptual', 5),
];
