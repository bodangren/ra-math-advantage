import type { ProblemFamilyInput } from '@math-platform/practice-core';

import { MODULE1_PROBLEM_FAMILIES } from './module_1';
import { MODULE2_PROBLEM_FAMILIES } from './module_2';
import { MODULE3_PROBLEM_FAMILIES } from './module_3';
import { MODULE4_PROBLEM_FAMILIES } from './module_4';
import { MODULE5_PROBLEM_FAMILIES } from './module_5';
import { MODULE6_PROBLEM_FAMILIES } from './module_6';
import { MODULE7_PROBLEM_FAMILIES } from './module_7';
import { MODULE8_PROBLEM_FAMILIES } from './module_8';
import { MODULE9_PROBLEM_FAMILIES } from './module_9';

export const IM3_PROBLEM_FAMILIES: ProblemFamilyInput[] = [
  ...MODULE1_PROBLEM_FAMILIES,
  ...MODULE2_PROBLEM_FAMILIES,
  ...MODULE3_PROBLEM_FAMILIES,
  ...MODULE4_PROBLEM_FAMILIES,
  ...MODULE5_PROBLEM_FAMILIES,
  ...MODULE6_PROBLEM_FAMILIES,
  ...MODULE7_PROBLEM_FAMILIES,
  ...MODULE8_PROBLEM_FAMILIES,
  ...MODULE9_PROBLEM_FAMILIES,
];
