// Stub for @/convex/_generated/api — not present until `npx convex dev` is run.
// Used by vitest to resolve the missing generated module in CI / fresh checkouts.
import { anyApi, componentsGeneric } from "convex/server";

export const api = anyApi;
export const internal = anyApi;
export const components = componentsGeneric();
