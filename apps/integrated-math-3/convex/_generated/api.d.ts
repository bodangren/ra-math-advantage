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
import type * as practice_submission from "../practice_submission.js";
import type * as public_ from "../public.js";
import type * as queue_queue from "../queue/queue.js";
import type * as queue_sessions from "../queue/sessions.js";
import type * as srs_cards from "../srs/cards.js";
import type * as srs_dashboard from "../srs/dashboard.js";
import type * as srs_processReview from "../srs/processReview.js";
import type * as srs_reviews from "../srs/reviews.js";
import type * as srs_sessions from "../srs/sessions.js";
import type * as srs_submissionSrs from "../srs/submissionSrs.js";
import type * as student from "../student.js";
import type * as study from "../study.js";
import type * as teacher from "../teacher.js";

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
  practice_submission: typeof practice_submission;
  public: typeof public_;
  "queue/queue": typeof queue_queue;
  "queue/sessions": typeof queue_sessions;
  "srs/cards": typeof srs_cards;
  "srs/dashboard": typeof srs_dashboard;
  "srs/processReview": typeof srs_processReview;
  "srs/reviews": typeof srs_reviews;
  "srs/sessions": typeof srs_sessions;
  "srs/submissionSrs": typeof srs_submissionSrs;
  student: typeof student;
  study: typeof study;
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
