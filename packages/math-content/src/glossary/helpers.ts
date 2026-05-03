import type { GlossaryTerm } from './types';

export function getGlossaryTermBySlug(terms: GlossaryTerm[], slug: string): GlossaryTerm | undefined {
  return terms.find((term) => term.slug === slug);
}

export function getGlossaryTermsByCourse(terms: GlossaryTerm[], course: string): GlossaryTerm[] {
  return terms.filter((term) => term.courses.includes(course));
}

export function getGlossaryTermsByTopic(terms: GlossaryTerm[], topic: string): GlossaryTerm[] {
  return terms.filter((term) => term.topics.includes(topic));
}

export function getAllGlossaryCourses(terms: GlossaryTerm[]): string[] {
  const courses = new Set<string>();
  terms.forEach((term) => term.courses.forEach((c) => courses.add(c)));
  return Array.from(courses).sort();
}

export function getAllGlossaryTopics(terms: GlossaryTerm[]): string[] {
  const topics = new Set<string>();
  terms.forEach((term) => term.topics.forEach((t) => topics.add(t)));
  return Array.from(topics).sort();
}
