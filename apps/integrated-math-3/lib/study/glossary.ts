import type { GlossaryTerm } from '@math-platform/math-content/glossary';

// Re-export for backward compatibility
export { IM3_GLOSSARY as GLOSSARY } from '@math-platform/math-content/glossary';
export type { GlossaryTerm } from '@math-platform/math-content/glossary';

import {
  getGlossaryTermBySlug as _getBySlug,
  getGlossaryTermsByModule as _getByModule,
  getAllGlossaryModules as _getAllModules,
  getAllGlossaryTopics as _getAllTopics,
  IM3_GLOSSARY,
} from '@math-platform/math-content/glossary';

/** Looks up a glossary term by its URL slug. */
export function getGlossaryTermBySlug(slug: string): GlossaryTerm | undefined {
  return _getBySlug(IM3_GLOSSARY, slug);
}

/** Returns all glossary terms belonging to the specified module. */
export function getGlossaryTermsByModule(moduleNumber: number): GlossaryTerm[] {
  return _getByModule(IM3_GLOSSARY, moduleNumber);
}

/** Returns a sorted list of all distinct module numbers in the glossary. */
export function getAllGlossaryModules(): number[] {
  return _getAllModules(IM3_GLOSSARY);
}

/** Returns a sorted list of all distinct topic names in the glossary. */
export function getAllGlossaryTopics(): string[] {
  return _getAllTopics(IM3_GLOSSARY);
}
