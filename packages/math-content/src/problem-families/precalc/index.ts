import type { ProblemFamilyInput } from '@math-platform/practice-core';

import { UNIT1_PROBLEM_FAMILIES } from './unit_01';
import { UNIT2_PROBLEM_FAMILIES } from './unit_02';
import { UNIT3_PROBLEM_FAMILIES } from './unit_03';
import { UNIT4_PROBLEM_FAMILIES } from './unit_04';

export const PRECALC_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  ...UNIT1_PROBLEM_FAMILIES,
  ...UNIT2_PROBLEM_FAMILIES,
  ...UNIT3_PROBLEM_FAMILIES,
  ...UNIT4_PROBLEM_FAMILIES,
];
