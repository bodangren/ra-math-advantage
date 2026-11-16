import Link from 'next/link';
import { buildPublishedCurriculumManifest } from '@/lib/curriculum/published-manifest';
import { GLOSSARY } from '@/lib/study/glossary';
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = (await searchParams).q?.trim() ?? '';
  const match = (text: string) => text.toLowerCase().includes(query.toLowerCase());
  const lessons = query ? buildPublishedCurriculumManifest().lessons.filter((lesson) => match(`${lesson.title} ${lesson.description} ${lesson.learningObjectives.join(' ')}`)) : [];
  const terms = query ? GLOSSARY.filter((term) => match(`${term.term_en} ${term.def_en} ${term.term_zh}`)) : [];
  return <main className="container mx-auto max-w-4xl px-4 py-12"><h1 className="text-3xl font-bold">Search</h1>
    <form className="my-6 flex gap-3" action="/search"><label htmlFor="search-query" className="sr-only">Search lessons and terms</label>
      <input className="flex-1 rounded border bg-background p-2" id="search-query" name="q" defaultValue={query} placeholder="Search lessons and terms" />
      <button className="rounded bg-primary px-4 text-primary-foreground" type="submit">Search</button></form>
    {query && <p>{lessons.length + terms.length} results for “{query}”.</p>}
    <ul className="mt-6 space-y-4">{lessons.map((lesson) => <li key={lesson.slug}><Link className="underline" href={`/student/lesson/${lesson.slug}`}>{lesson.title}</Link><p>{lesson.description}</p></li>)}
      {terms.map((term) => <li key={term.slug}><Link className="underline" href={`/backmatter/glossary#${term.slug}`}>{term.term_en}</Link><p>{term.def_en}</p></li>)}</ul>
  </main>;
}
