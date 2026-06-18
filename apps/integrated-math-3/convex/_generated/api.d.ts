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
import type * as dashboardHelpers from "../dashboardHelpers.js";
import type * as dev from "../dev.js";
import type * as objectiveProficiency from "../objectiveProficiency.js";
import type * as parent_links from "../parent/links.js";
import type * as practice_submission from "../practice_submission.js";
import type * as public_ from "../public.js";
import type * as queue_queue from "../queue/queue.js";
import type * as queue_sessions from "../queue/sessions.js";
import type * as rateLimits from "../rateLimits.js";
import type * as seed from "../seed.js";
import type * as seed_objective_policies from "../seed/objective_policies.js";
import type * as seed_problem_families_module_1 from "../seed/problem_families/module_1.js";
import type * as seed_problem_families_module_2 from "../seed/problem_families/module_2.js";
import type * as seed_problem_families_module_3 from "../seed/problem_families/module_3.js";
import type * as seed_problem_families_module_4 from "../seed/problem_families/module_4.js";
import type * as seed_problem_families_module_5 from "../seed/problem_families/module_5.js";
import type * as seed_problem_families_module_6 from "../seed/problem_families/module_6.js";
import type * as seed_problem_families_module_7 from "../seed/problem_families/module_7.js";
import type * as seed_problem_families_module_8 from "../seed/problem_families/module_8.js";
import type * as seed_problem_families_module_9 from "../seed/problem_families/module_9.js";
import type * as seed_seed_demo_env from "../seed/seed_demo_env.js";
import type * as seed_seed_demo_progress from "../seed/seed_demo_progress.js";
import type * as seed_seed_lesson_1_1 from "../seed/seed_lesson_1_1.js";
import type * as seed_seed_lesson_1_2 from "../seed/seed_lesson_1_2.js";
import type * as seed_seed_lesson_1_3 from "../seed/seed_lesson_1_3.js";
import type * as seed_seed_lesson_1_4 from "../seed/seed_lesson_1_4.js";
import type * as seed_seed_lesson_1_5 from "../seed/seed_lesson_1_5.js";
import type * as seed_seed_lesson_1_6 from "../seed/seed_lesson_1_6.js";
import type * as seed_seed_lesson_1_7 from "../seed/seed_lesson_1_7.js";
import type * as seed_seed_lesson_1_8 from "../seed/seed_lesson_1_8.js";
import type * as seed_seed_lesson_2_1 from "../seed/seed_lesson_2_1.js";
import type * as seed_seed_lesson_2_2 from "../seed/seed_lesson_2_2.js";
import type * as seed_seed_lesson_2_3 from "../seed/seed_lesson_2_3.js";
import type * as seed_seed_lesson_2_4 from "../seed/seed_lesson_2_4.js";
import type * as seed_seed_lesson_2_5 from "../seed/seed_lesson_2_5.js";
import type * as seed_seed_lesson_3_1 from "../seed/seed_lesson_3_1.js";
import type * as seed_seed_lesson_3_2 from "../seed/seed_lesson_3_2.js";
import type * as seed_seed_lesson_3_3 from "../seed/seed_lesson_3_3.js";
import type * as seed_seed_lesson_3_4 from "../seed/seed_lesson_3_4.js";
import type * as seed_seed_lesson_3_5 from "../seed/seed_lesson_3_5.js";
import type * as seed_seed_lesson_4_1 from "../seed/seed_lesson_4_1.js";
import type * as seed_seed_lesson_4_2 from "../seed/seed_lesson_4_2.js";
import type * as seed_seed_lesson_4_3 from "../seed/seed_lesson_4_3.js";
import type * as seed_seed_lesson_4_4 from "../seed/seed_lesson_4_4.js";
import type * as seed_seed_lesson_4_5 from "../seed/seed_lesson_4_5.js";
import type * as seed_seed_lesson_4_6 from "../seed/seed_lesson_4_6.js";
import type * as seed_seed_lesson_5_1 from "../seed/seed_lesson_5_1.js";
import type * as seed_seed_lesson_5_2 from "../seed/seed_lesson_5_2.js";
import type * as seed_seed_lesson_5_3 from "../seed/seed_lesson_5_3.js";
import type * as seed_seed_lesson_5_4 from "../seed/seed_lesson_5_4.js";
import type * as seed_seed_lesson_5_5 from "../seed/seed_lesson_5_5.js";
import type * as seed_seed_lesson_6_1 from "../seed/seed_lesson_6_1.js";
import type * as seed_seed_lesson_6_2 from "../seed/seed_lesson_6_2.js";
import type * as seed_seed_lesson_6_3 from "../seed/seed_lesson_6_3.js";
import type * as seed_seed_lesson_6_4 from "../seed/seed_lesson_6_4.js";
import type * as seed_seed_lesson_6_5 from "../seed/seed_lesson_6_5.js";
import type * as seed_seed_lesson_7_1 from "../seed/seed_lesson_7_1.js";
import type * as seed_seed_lesson_7_2 from "../seed/seed_lesson_7_2.js";
import type * as seed_seed_lesson_7_3 from "../seed/seed_lesson_7_3.js";
import type * as seed_seed_lesson_7_4 from "../seed/seed_lesson_7_4.js";
import type * as seed_seed_lesson_7_5 from "../seed/seed_lesson_7_5.js";
import type * as seed_seed_lesson_7_6 from "../seed/seed_lesson_7_6.js";
import type * as seed_seed_lesson_8_1 from "../seed/seed_lesson_8_1.js";
import type * as seed_seed_lesson_8_2 from "../seed/seed_lesson_8_2.js";
import type * as seed_seed_lesson_8_3 from "../seed/seed_lesson_8_3.js";
import type * as seed_seed_lesson_8_4 from "../seed/seed_lesson_8_4.js";
import type * as seed_seed_lesson_8_5 from "../seed/seed_lesson_8_5.js";
import type * as seed_seed_lesson_9_1 from "../seed/seed_lesson_9_1.js";
import type * as seed_seed_lesson_9_2 from "../seed/seed_lesson_9_2.js";
import type * as seed_seed_lesson_9_3 from "../seed/seed_lesson_9_3.js";
import type * as seed_seed_lesson_9_4 from "../seed/seed_lesson_9_4.js";
import type * as seed_seed_lesson_9_5 from "../seed/seed_lesson_9_5.js";
import type * as seed_seed_lesson_9_6 from "../seed/seed_lesson_9_6.js";
import type * as seed_seed_lesson_9_7 from "../seed/seed_lesson_9_7.js";
import type * as seed_seed_lesson_standards from "../seed/seed_lesson_standards.js";
import type * as seed_seed_objective_policies from "../seed/seed_objective_policies.js";
import type * as seed_seed_practice_items from "../seed/seed_practice_items.js";
import type * as seed_seed_problem_families from "../seed/seed_problem_families.js";
import type * as seed_seed_standards from "../seed/seed_standards.js";
import type * as seed_types from "../seed/types.js";
import type * as seed_utils from "../seed/utils.js";
import type * as seed_validate_blueprint from "../seed/validate_blueprint.js";
import type * as srs_cards from "../srs/cards.js";
import type * as srs_dashboard from "../srs/dashboard.js";
import type * as srs_processReview from "../srs/processReview.js";
import type * as srs_reviews from "../srs/reviews.js";
import type * as srs_sessions from "../srs/sessions.js";
import type * as srs_submissionSrs from "../srs/submissionSrs.js";
import type * as student from "../student.js";
import type * as study from "../study.js";
import type * as teacher from "../teacher.js";
import type * as teacher_lessonAssignment from "../teacher/lessonAssignment.js";
import type * as teacher_srs_mutations from "../teacher/srs_mutations.js";
import type * as teacher_srs_queries from "../teacher/srs_queries.js";
import type * as timing_baseline from "../timing_baseline.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activities: typeof activities;
  auth: typeof auth;
  dashboardHelpers: typeof dashboardHelpers;
  dev: typeof dev;
  objectiveProficiency: typeof objectiveProficiency;
  "parent/links": typeof parent_links;
  practice_submission: typeof practice_submission;
  public: typeof public_;
  "queue/queue": typeof queue_queue;
  "queue/sessions": typeof queue_sessions;
  rateLimits: typeof rateLimits;
  seed: typeof seed;
  "seed/objective_policies": typeof seed_objective_policies;
  "seed/problem_families/module_1": typeof seed_problem_families_module_1;
  "seed/problem_families/module_2": typeof seed_problem_families_module_2;
  "seed/problem_families/module_3": typeof seed_problem_families_module_3;
  "seed/problem_families/module_4": typeof seed_problem_families_module_4;
  "seed/problem_families/module_5": typeof seed_problem_families_module_5;
  "seed/problem_families/module_6": typeof seed_problem_families_module_6;
  "seed/problem_families/module_7": typeof seed_problem_families_module_7;
  "seed/problem_families/module_8": typeof seed_problem_families_module_8;
  "seed/problem_families/module_9": typeof seed_problem_families_module_9;
  "seed/seed_demo_env": typeof seed_seed_demo_env;
  "seed/seed_demo_progress": typeof seed_seed_demo_progress;
  "seed/seed_lesson_1_1": typeof seed_seed_lesson_1_1;
  "seed/seed_lesson_1_2": typeof seed_seed_lesson_1_2;
  "seed/seed_lesson_1_3": typeof seed_seed_lesson_1_3;
  "seed/seed_lesson_1_4": typeof seed_seed_lesson_1_4;
  "seed/seed_lesson_1_5": typeof seed_seed_lesson_1_5;
  "seed/seed_lesson_1_6": typeof seed_seed_lesson_1_6;
  "seed/seed_lesson_1_7": typeof seed_seed_lesson_1_7;
  "seed/seed_lesson_1_8": typeof seed_seed_lesson_1_8;
  "seed/seed_lesson_2_1": typeof seed_seed_lesson_2_1;
  "seed/seed_lesson_2_2": typeof seed_seed_lesson_2_2;
  "seed/seed_lesson_2_3": typeof seed_seed_lesson_2_3;
  "seed/seed_lesson_2_4": typeof seed_seed_lesson_2_4;
  "seed/seed_lesson_2_5": typeof seed_seed_lesson_2_5;
  "seed/seed_lesson_3_1": typeof seed_seed_lesson_3_1;
  "seed/seed_lesson_3_2": typeof seed_seed_lesson_3_2;
  "seed/seed_lesson_3_3": typeof seed_seed_lesson_3_3;
  "seed/seed_lesson_3_4": typeof seed_seed_lesson_3_4;
  "seed/seed_lesson_3_5": typeof seed_seed_lesson_3_5;
  "seed/seed_lesson_4_1": typeof seed_seed_lesson_4_1;
  "seed/seed_lesson_4_2": typeof seed_seed_lesson_4_2;
  "seed/seed_lesson_4_3": typeof seed_seed_lesson_4_3;
  "seed/seed_lesson_4_4": typeof seed_seed_lesson_4_4;
  "seed/seed_lesson_4_5": typeof seed_seed_lesson_4_5;
  "seed/seed_lesson_4_6": typeof seed_seed_lesson_4_6;
  "seed/seed_lesson_5_1": typeof seed_seed_lesson_5_1;
  "seed/seed_lesson_5_2": typeof seed_seed_lesson_5_2;
  "seed/seed_lesson_5_3": typeof seed_seed_lesson_5_3;
  "seed/seed_lesson_5_4": typeof seed_seed_lesson_5_4;
  "seed/seed_lesson_5_5": typeof seed_seed_lesson_5_5;
  "seed/seed_lesson_6_1": typeof seed_seed_lesson_6_1;
  "seed/seed_lesson_6_2": typeof seed_seed_lesson_6_2;
  "seed/seed_lesson_6_3": typeof seed_seed_lesson_6_3;
  "seed/seed_lesson_6_4": typeof seed_seed_lesson_6_4;
  "seed/seed_lesson_6_5": typeof seed_seed_lesson_6_5;
  "seed/seed_lesson_7_1": typeof seed_seed_lesson_7_1;
  "seed/seed_lesson_7_2": typeof seed_seed_lesson_7_2;
  "seed/seed_lesson_7_3": typeof seed_seed_lesson_7_3;
  "seed/seed_lesson_7_4": typeof seed_seed_lesson_7_4;
  "seed/seed_lesson_7_5": typeof seed_seed_lesson_7_5;
  "seed/seed_lesson_7_6": typeof seed_seed_lesson_7_6;
  "seed/seed_lesson_8_1": typeof seed_seed_lesson_8_1;
  "seed/seed_lesson_8_2": typeof seed_seed_lesson_8_2;
  "seed/seed_lesson_8_3": typeof seed_seed_lesson_8_3;
  "seed/seed_lesson_8_4": typeof seed_seed_lesson_8_4;
  "seed/seed_lesson_8_5": typeof seed_seed_lesson_8_5;
  "seed/seed_lesson_9_1": typeof seed_seed_lesson_9_1;
  "seed/seed_lesson_9_2": typeof seed_seed_lesson_9_2;
  "seed/seed_lesson_9_3": typeof seed_seed_lesson_9_3;
  "seed/seed_lesson_9_4": typeof seed_seed_lesson_9_4;
  "seed/seed_lesson_9_5": typeof seed_seed_lesson_9_5;
  "seed/seed_lesson_9_6": typeof seed_seed_lesson_9_6;
  "seed/seed_lesson_9_7": typeof seed_seed_lesson_9_7;
  "seed/seed_lesson_standards": typeof seed_seed_lesson_standards;
  "seed/seed_objective_policies": typeof seed_seed_objective_policies;
  "seed/seed_practice_items": typeof seed_seed_practice_items;
  "seed/seed_problem_families": typeof seed_seed_problem_families;
  "seed/seed_standards": typeof seed_seed_standards;
  "seed/types": typeof seed_types;
  "seed/utils": typeof seed_utils;
  "seed/validate_blueprint": typeof seed_validate_blueprint;
  "srs/cards": typeof srs_cards;
  "srs/dashboard": typeof srs_dashboard;
  "srs/processReview": typeof srs_processReview;
  "srs/reviews": typeof srs_reviews;
  "srs/sessions": typeof srs_sessions;
  "srs/submissionSrs": typeof srs_submissionSrs;
  student: typeof student;
  study: typeof study;
  teacher: typeof teacher;
  "teacher/lessonAssignment": typeof teacher_lessonAssignment;
  "teacher/srs_mutations": typeof teacher_srs_mutations;
  "teacher/srs_queries": typeof teacher_srs_queries;
  timing_baseline: typeof timing_baseline;
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
