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
import type * as classes from "../classes.js";
import type * as learning from "../learning.js";
import type * as public_ from "../public.js";
import type * as publication from "../publication.js";
import type * as seed from "../seed.js";
import type * as seed_lesson_content from "../seed/lesson_content.js";
import type * as seed_objective_policies from "../seed/objective_policies.js";
import type * as seed_seed_class_lessons from "../seed/seed_class_lessons.js";
import type * as seed_seed_demo_env from "../seed/seed_demo_env.js";
import type * as seed_seed_demo_progress from "../seed/seed_demo_progress.js";
import type * as seed_seed_im2_module_10_standards from "../seed/seed_im2_module_10_standards.js";
import type * as seed_seed_im2_module_11_standards from "../seed/seed_im2_module_11_standards.js";
import type * as seed_seed_im2_module_12_standards from "../seed/seed_im2_module_12_standards.js";
import type * as seed_seed_im2_module_13_standards from "../seed/seed_im2_module_13_standards.js";
import type * as seed_seed_im2_module_1_standards from "../seed/seed_im2_module_1_standards.js";
import type * as seed_seed_im2_module_2_standards from "../seed/seed_im2_module_2_standards.js";
import type * as seed_seed_im2_module_3_standards from "../seed/seed_im2_module_3_standards.js";
import type * as seed_seed_im2_module_4_standards from "../seed/seed_im2_module_4_standards.js";
import type * as seed_seed_im2_module_5_standards from "../seed/seed_im2_module_5_standards.js";
import type * as seed_seed_im2_module_6_standards from "../seed/seed_im2_module_6_standards.js";
import type * as seed_seed_im2_module_7_standards from "../seed/seed_im2_module_7_standards.js";
import type * as seed_seed_im2_module_8_standards from "../seed/seed_im2_module_8_standards.js";
import type * as seed_seed_im2_module_9_standards from "../seed/seed_im2_module_9_standards.js";
import type * as seed_seed_module_10_lessons from "../seed/seed_module_10_lessons.js";
import type * as seed_seed_module_11_lessons from "../seed/seed_module_11_lessons.js";
import type * as seed_seed_module_12_lessons from "../seed/seed_module_12_lessons.js";
import type * as seed_seed_module_13_lessons from "../seed/seed_module_13_lessons.js";
import type * as seed_seed_module_1_lessons from "../seed/seed_module_1_lessons.js";
import type * as seed_seed_module_2_lessons from "../seed/seed_module_2_lessons.js";
import type * as seed_seed_module_3_lessons from "../seed/seed_module_3_lessons.js";
import type * as seed_seed_module_4_lessons from "../seed/seed_module_4_lessons.js";
import type * as seed_seed_module_5_lessons from "../seed/seed_module_5_lessons.js";
import type * as seed_seed_module_6_lessons from "../seed/seed_module_6_lessons.js";
import type * as seed_seed_module_7_lessons from "../seed/seed_module_7_lessons.js";
import type * as seed_seed_module_8_lessons from "../seed/seed_module_8_lessons.js";
import type * as seed_seed_module_9_lessons from "../seed/seed_module_9_lessons.js";
import type * as seed_seed_objective_policies from "../seed/seed_objective_policies.js";
import type * as seed_seed_problem_families from "../seed/seed_problem_families.js";
import type * as seed_seed_standards from "../seed/seed_standards.js";
import type * as seed_standards from "../seed/standards.js";
import type * as seed_types from "../seed/types.js";
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
  classes: typeof classes;
  learning: typeof learning;
  public: typeof public_;
  publication: typeof publication;
  seed: typeof seed;
  "seed/lesson_content": typeof seed_lesson_content;
  "seed/objective_policies": typeof seed_objective_policies;
  "seed/seed_class_lessons": typeof seed_seed_class_lessons;
  "seed/seed_demo_env": typeof seed_seed_demo_env;
  "seed/seed_demo_progress": typeof seed_seed_demo_progress;
  "seed/seed_im2_module_10_standards": typeof seed_seed_im2_module_10_standards;
  "seed/seed_im2_module_11_standards": typeof seed_seed_im2_module_11_standards;
  "seed/seed_im2_module_12_standards": typeof seed_seed_im2_module_12_standards;
  "seed/seed_im2_module_13_standards": typeof seed_seed_im2_module_13_standards;
  "seed/seed_im2_module_1_standards": typeof seed_seed_im2_module_1_standards;
  "seed/seed_im2_module_2_standards": typeof seed_seed_im2_module_2_standards;
  "seed/seed_im2_module_3_standards": typeof seed_seed_im2_module_3_standards;
  "seed/seed_im2_module_4_standards": typeof seed_seed_im2_module_4_standards;
  "seed/seed_im2_module_5_standards": typeof seed_seed_im2_module_5_standards;
  "seed/seed_im2_module_6_standards": typeof seed_seed_im2_module_6_standards;
  "seed/seed_im2_module_7_standards": typeof seed_seed_im2_module_7_standards;
  "seed/seed_im2_module_8_standards": typeof seed_seed_im2_module_8_standards;
  "seed/seed_im2_module_9_standards": typeof seed_seed_im2_module_9_standards;
  "seed/seed_module_10_lessons": typeof seed_seed_module_10_lessons;
  "seed/seed_module_11_lessons": typeof seed_seed_module_11_lessons;
  "seed/seed_module_12_lessons": typeof seed_seed_module_12_lessons;
  "seed/seed_module_13_lessons": typeof seed_seed_module_13_lessons;
  "seed/seed_module_1_lessons": typeof seed_seed_module_1_lessons;
  "seed/seed_module_2_lessons": typeof seed_seed_module_2_lessons;
  "seed/seed_module_3_lessons": typeof seed_seed_module_3_lessons;
  "seed/seed_module_4_lessons": typeof seed_seed_module_4_lessons;
  "seed/seed_module_5_lessons": typeof seed_seed_module_5_lessons;
  "seed/seed_module_6_lessons": typeof seed_seed_module_6_lessons;
  "seed/seed_module_7_lessons": typeof seed_seed_module_7_lessons;
  "seed/seed_module_8_lessons": typeof seed_seed_module_8_lessons;
  "seed/seed_module_9_lessons": typeof seed_seed_module_9_lessons;
  "seed/seed_objective_policies": typeof seed_seed_objective_policies;
  "seed/seed_problem_families": typeof seed_seed_problem_families;
  "seed/seed_standards": typeof seed_seed_standards;
  "seed/standards": typeof seed_standards;
  "seed/types": typeof seed_types;
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
