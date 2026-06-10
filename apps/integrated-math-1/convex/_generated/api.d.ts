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
import type * as public_ from "../public.js";
import type * as queue_queue from "../queue/queue.js";
import type * as queue_sessions from "../queue/sessions.js";
import type * as seed from "../seed.js";
import type * as seed_standards from "../seed/standards.js";
import type * as seed_units from "../seed/units.js";
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
  public: typeof public_;
  "queue/queue": typeof queue_queue;
  "queue/sessions": typeof queue_sessions;
  seed: typeof seed;
  "seed/standards": typeof seed_standards;
  "seed/units": typeof seed_units;
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
