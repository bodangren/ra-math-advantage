import type { GlossaryTerm } from './types';

/**
 * Find a glossary term by its slug.
 * @param {GlossaryTerm[]} terms - Array of glossary terms
 * @param {string} slug - Slug to search for
 * @returns {GlossaryTerm | undefined} - Matching term or undefined
 */
export function getGlossaryTermBySlug(terms: GlossaryTerm[], slug: string): GlossaryTerm | undefined {
  return terms.find((term) => term.slug === slug);
}

/**
 * Filter glossary terms by course.
 * @param {GlossaryTerm[]} terms - Array of glossary terms
 * @param {string} course - Course identifier to filter by
 * @returns {GlossaryTerm[]} - Array of matching terms
 */
export function getGlossaryTermsByCourse(terms: GlossaryTerm[], course: string): GlossaryTerm[] {
  return terms.filter((term) => term.courses.includes(course));
}

/**
 * Filter glossary terms by topic.
 * @param {GlossaryTerm[]} terms - Array of glossary terms
 * @param {string} topic - Topic identifier to filter by
 * @returns {GlossaryTerm[]} - Array of matching terms
 */
export function getGlossaryTermsByTopic(terms: GlossaryTerm[], topic: string): GlossaryTerm[] {
  return terms.filter((term) => term.topics.includes(topic));
}

/**
 * Filter glossary terms by module number.
 * @param {GlossaryTerm[]} terms - Array of glossary terms
 * @param {number} moduleNumber - Module number to filter by
 * @returns {GlossaryTerm[]} - Array of matching terms
 */
export function getGlossaryTermsByModule(terms: GlossaryTerm[], moduleNumber: number): GlossaryTerm[] {
  return terms.filter((term) => term.modules?.includes(moduleNumber));
}

/**
 * Get all unique course identifiers from glossary terms.
 * @param {GlossaryTerm[]} terms - Array of glossary terms
 * @returns {string[]} - Sorted array of unique course identifiers
 */
export function getAllGlossaryCourses(terms: GlossaryTerm[]): string[] {
  const courses = new Set<string>();
  terms.forEach((term) => term.courses.forEach((c) => courses.add(c)));
  return Array.from(courses).sort();
}

/**
 * Get all unique module numbers from glossary terms.
 * @param {GlossaryTerm[]} terms - Array of glossary terms
 * @returns {number[]} - Sorted array of unique module numbers
 */
export function getAllGlossaryModules(terms: GlossaryTerm[]): number[] {
  const modules = new Set<number>();
  terms.forEach((term) => term.modules?.forEach((m) => modules.add(m)));
  return Array.from(modules).sort((a, b) => a - b);
}

/**
 * Get all unique topic identifiers from glossary terms.
 * @param {GlossaryTerm[]} terms - Array of glossary terms
 * @returns {string[]} - Sorted array of unique topic identifiers
 */
export function getAllGlossaryTopics(terms: GlossaryTerm[]): string[] {
  const topics = new Set<string>();
  terms.forEach((term) => term.topics.forEach((t) => topics.add(t)));
  return Array.from(topics).sort();
}
