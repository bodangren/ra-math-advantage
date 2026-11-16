/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activities from "../activities.js";
import type * as auth from "../auth.js";
import type * as course from "../course.js";
import type * as learningEvidence from "../learningEvidence.js";
import type * as public_ from "../public.js";
import type * as seed from "../seed.js";
import type * as seed_lesson_phases from "../seed/lesson_phases.js";
import type * as seed_objective_policies from "../seed/objective_policies.js";
import type * as seed_seed_class_lessons from "../seed/seed_class_lessons.js";
import type * as seed_seed_demo_env from "../seed/seed_demo_env.js";
import type * as seed_seed_demo_progress from "../seed/seed_demo_progress.js";
import type * as seed_seed_lesson_1_1 from "../seed/seed_lesson_1_1.js";
import type * as seed_seed_lesson_1_10 from "../seed/seed_lesson_1_10.js";
import type * as seed_seed_lesson_1_11 from "../seed/seed_lesson_1_11.js";
import type * as seed_seed_lesson_1_12 from "../seed/seed_lesson_1_12.js";
import type * as seed_seed_lesson_1_13 from "../seed/seed_lesson_1_13.js";
import type * as seed_seed_lesson_1_14 from "../seed/seed_lesson_1_14.js";
import type * as seed_seed_lesson_1_2 from "../seed/seed_lesson_1_2.js";
import type * as seed_seed_lesson_1_3 from "../seed/seed_lesson_1_3.js";
import type * as seed_seed_lesson_1_4 from "../seed/seed_lesson_1_4.js";
import type * as seed_seed_lesson_1_5 from "../seed/seed_lesson_1_5.js";
import type * as seed_seed_lesson_1_6 from "../seed/seed_lesson_1_6.js";
import type * as seed_seed_lesson_1_7 from "../seed/seed_lesson_1_7.js";
import type * as seed_seed_lesson_1_8 from "../seed/seed_lesson_1_8.js";
import type * as seed_seed_lesson_1_9 from "../seed/seed_lesson_1_9.js";
import type * as seed_seed_lesson_2_1 from "../seed/seed_lesson_2_1.js";
import type * as seed_seed_lesson_2_10 from "../seed/seed_lesson_2_10.js";
import type * as seed_seed_lesson_2_11 from "../seed/seed_lesson_2_11.js";
import type * as seed_seed_lesson_2_12 from "../seed/seed_lesson_2_12.js";
import type * as seed_seed_lesson_2_13 from "../seed/seed_lesson_2_13.js";
import type * as seed_seed_lesson_2_14 from "../seed/seed_lesson_2_14.js";
import type * as seed_seed_lesson_2_15 from "../seed/seed_lesson_2_15.js";
import type * as seed_seed_lesson_2_2 from "../seed/seed_lesson_2_2.js";
import type * as seed_seed_lesson_2_3 from "../seed/seed_lesson_2_3.js";
import type * as seed_seed_lesson_2_4 from "../seed/seed_lesson_2_4.js";
import type * as seed_seed_lesson_2_5 from "../seed/seed_lesson_2_5.js";
import type * as seed_seed_lesson_2_6 from "../seed/seed_lesson_2_6.js";
import type * as seed_seed_lesson_2_7 from "../seed/seed_lesson_2_7.js";
import type * as seed_seed_lesson_2_8 from "../seed/seed_lesson_2_8.js";
import type * as seed_seed_lesson_2_9 from "../seed/seed_lesson_2_9.js";
import type * as seed_seed_lesson_3_1 from "../seed/seed_lesson_3_1.js";
import type * as seed_seed_lesson_3_10 from "../seed/seed_lesson_3_10.js";
import type * as seed_seed_lesson_3_11 from "../seed/seed_lesson_3_11.js";
import type * as seed_seed_lesson_3_12 from "../seed/seed_lesson_3_12.js";
import type * as seed_seed_lesson_3_13 from "../seed/seed_lesson_3_13.js";
import type * as seed_seed_lesson_3_14 from "../seed/seed_lesson_3_14.js";
import type * as seed_seed_lesson_3_15 from "../seed/seed_lesson_3_15.js";
import type * as seed_seed_lesson_3_2 from "../seed/seed_lesson_3_2.js";
import type * as seed_seed_lesson_3_3 from "../seed/seed_lesson_3_3.js";
import type * as seed_seed_lesson_3_4 from "../seed/seed_lesson_3_4.js";
import type * as seed_seed_lesson_3_5 from "../seed/seed_lesson_3_5.js";
import type * as seed_seed_lesson_3_6 from "../seed/seed_lesson_3_6.js";
import type * as seed_seed_lesson_3_7 from "../seed/seed_lesson_3_7.js";
import type * as seed_seed_lesson_3_8 from "../seed/seed_lesson_3_8.js";
import type * as seed_seed_lesson_3_9 from "../seed/seed_lesson_3_9.js";
import type * as seed_seed_lesson_4_1 from "../seed/seed_lesson_4_1.js";
import type * as seed_seed_lesson_4_10 from "../seed/seed_lesson_4_10.js";
import type * as seed_seed_lesson_4_11 from "../seed/seed_lesson_4_11.js";
import type * as seed_seed_lesson_4_12 from "../seed/seed_lesson_4_12.js";
import type * as seed_seed_lesson_4_13 from "../seed/seed_lesson_4_13.js";
import type * as seed_seed_lesson_4_14 from "../seed/seed_lesson_4_14.js";
import type * as seed_seed_lesson_4_2 from "../seed/seed_lesson_4_2.js";
import type * as seed_seed_lesson_4_3 from "../seed/seed_lesson_4_3.js";
import type * as seed_seed_lesson_4_4 from "../seed/seed_lesson_4_4.js";
import type * as seed_seed_lesson_4_5 from "../seed/seed_lesson_4_5.js";
import type * as seed_seed_lesson_4_6 from "../seed/seed_lesson_4_6.js";
import type * as seed_seed_lesson_4_7 from "../seed/seed_lesson_4_7.js";
import type * as seed_seed_lesson_4_8 from "../seed/seed_lesson_4_8.js";
import type * as seed_seed_lesson_4_9 from "../seed/seed_lesson_4_9.js";
import type * as seed_seed_lesson_standards from "../seed/seed_lesson_standards.js";
import type * as seed_seed_objective_policies from "../seed/seed_objective_policies.js";
import type * as seed_seed_standards from "../seed/seed_standards.js";
import type * as seed_types from "../seed/types.js";
import type * as selectedLearningEvidence from "../selectedLearningEvidence.js";
import type * as student from "../student.js";
import type * as teacher from "../teacher.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  auth: typeof auth;
  course: typeof course;
  learningEvidence: typeof learningEvidence;
  public: typeof public_;
  seed: typeof seed;
  "seed/lesson_phases": typeof seed_lesson_phases;
  "seed/objective_policies": typeof seed_objective_policies;
  "seed/seed_class_lessons": typeof seed_seed_class_lessons;
  "seed/seed_demo_env": typeof seed_seed_demo_env;
  "seed/seed_demo_progress": typeof seed_seed_demo_progress;
  "seed/seed_lesson_1_1": typeof seed_seed_lesson_1_1;
  "seed/seed_lesson_1_10": typeof seed_seed_lesson_1_10;
  "seed/seed_lesson_1_11": typeof seed_seed_lesson_1_11;
  "seed/seed_lesson_1_12": typeof seed_seed_lesson_1_12;
  "seed/seed_lesson_1_13": typeof seed_seed_lesson_1_13;
  "seed/seed_lesson_1_14": typeof seed_seed_lesson_1_14;
  "seed/seed_lesson_1_2": typeof seed_seed_lesson_1_2;
  "seed/seed_lesson_1_3": typeof seed_seed_lesson_1_3;
  "seed/seed_lesson_1_4": typeof seed_seed_lesson_1_4;
  "seed/seed_lesson_1_5": typeof seed_seed_lesson_1_5;
  "seed/seed_lesson_1_6": typeof seed_seed_lesson_1_6;
  "seed/seed_lesson_1_7": typeof seed_seed_lesson_1_7;
  "seed/seed_lesson_1_8": typeof seed_seed_lesson_1_8;
  "seed/seed_lesson_1_9": typeof seed_seed_lesson_1_9;
  "seed/seed_lesson_2_1": typeof seed_seed_lesson_2_1;
  "seed/seed_lesson_2_10": typeof seed_seed_lesson_2_10;
  "seed/seed_lesson_2_11": typeof seed_seed_lesson_2_11;
  "seed/seed_lesson_2_12": typeof seed_seed_lesson_2_12;
  "seed/seed_lesson_2_13": typeof seed_seed_lesson_2_13;
  "seed/seed_lesson_2_14": typeof seed_seed_lesson_2_14;
  "seed/seed_lesson_2_15": typeof seed_seed_lesson_2_15;
  "seed/seed_lesson_2_2": typeof seed_seed_lesson_2_2;
  "seed/seed_lesson_2_3": typeof seed_seed_lesson_2_3;
  "seed/seed_lesson_2_4": typeof seed_seed_lesson_2_4;
  "seed/seed_lesson_2_5": typeof seed_seed_lesson_2_5;
  "seed/seed_lesson_2_6": typeof seed_seed_lesson_2_6;
  "seed/seed_lesson_2_7": typeof seed_seed_lesson_2_7;
  "seed/seed_lesson_2_8": typeof seed_seed_lesson_2_8;
  "seed/seed_lesson_2_9": typeof seed_seed_lesson_2_9;
  "seed/seed_lesson_3_1": typeof seed_seed_lesson_3_1;
  "seed/seed_lesson_3_10": typeof seed_seed_lesson_3_10;
  "seed/seed_lesson_3_11": typeof seed_seed_lesson_3_11;
  "seed/seed_lesson_3_12": typeof seed_seed_lesson_3_12;
  "seed/seed_lesson_3_13": typeof seed_seed_lesson_3_13;
  "seed/seed_lesson_3_14": typeof seed_seed_lesson_3_14;
  "seed/seed_lesson_3_15": typeof seed_seed_lesson_3_15;
  "seed/seed_lesson_3_2": typeof seed_seed_lesson_3_2;
  "seed/seed_lesson_3_3": typeof seed_seed_lesson_3_3;
  "seed/seed_lesson_3_4": typeof seed_seed_lesson_3_4;
  "seed/seed_lesson_3_5": typeof seed_seed_lesson_3_5;
  "seed/seed_lesson_3_6": typeof seed_seed_lesson_3_6;
  "seed/seed_lesson_3_7": typeof seed_seed_lesson_3_7;
  "seed/seed_lesson_3_8": typeof seed_seed_lesson_3_8;
  "seed/seed_lesson_3_9": typeof seed_seed_lesson_3_9;
  "seed/seed_lesson_4_1": typeof seed_seed_lesson_4_1;
  "seed/seed_lesson_4_10": typeof seed_seed_lesson_4_10;
  "seed/seed_lesson_4_11": typeof seed_seed_lesson_4_11;
  "seed/seed_lesson_4_12": typeof seed_seed_lesson_4_12;
  "seed/seed_lesson_4_13": typeof seed_seed_lesson_4_13;
  "seed/seed_lesson_4_14": typeof seed_seed_lesson_4_14;
  "seed/seed_lesson_4_2": typeof seed_seed_lesson_4_2;
  "seed/seed_lesson_4_3": typeof seed_seed_lesson_4_3;
  "seed/seed_lesson_4_4": typeof seed_seed_lesson_4_4;
  "seed/seed_lesson_4_5": typeof seed_seed_lesson_4_5;
  "seed/seed_lesson_4_6": typeof seed_seed_lesson_4_6;
  "seed/seed_lesson_4_7": typeof seed_seed_lesson_4_7;
  "seed/seed_lesson_4_8": typeof seed_seed_lesson_4_8;
  "seed/seed_lesson_4_9": typeof seed_seed_lesson_4_9;
  "seed/seed_lesson_standards": typeof seed_seed_lesson_standards;
  "seed/seed_objective_policies": typeof seed_seed_objective_policies;
  "seed/seed_standards": typeof seed_seed_standards;
  "seed/types": typeof seed_types;
  selectedLearningEvidence: typeof selectedLearningEvidence;
  student: typeof student;
  teacher: typeof teacher;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
