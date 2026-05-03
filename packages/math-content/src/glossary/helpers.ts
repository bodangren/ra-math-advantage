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

export function getGlossaryTermsByModule(terms: GlossaryTerm[], moduleNumber: number): GlossaryTerm[] {
  return terms.filter((term) => term.modules?.includes(moduleNumber));
}

export function getAllGlossaryCourses(terms: GlossaryTerm[]): string[] {
  const courses = new Set<string>();
  terms.forEach((term) => term.courses.forEach((c) => courses.add(c)));
  return Array.from(courses).sort();
}

export function getAllGlossaryModules(terms: GlossaryTerm[]): number[] {
  const modules = new Set<number>();
  terms.forEach((term) => term.modules?.forEach((m) => modules.add(m)));
  return Array.from(modules).sort((a, b) => a - b);
}

export function getAllGlossaryTopics(terms: GlossaryTerm[]): string[] {
  const topics = new Set<string>();
  terms.forEach((term) => term.topics.forEach((t) => topics.add(t)));
  return Array.from(topics).sort();
}
