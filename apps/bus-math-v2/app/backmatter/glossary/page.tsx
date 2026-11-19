import { GLOSSARY } from "@/lib/study/glossary";
export default function GlossaryPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-bold">Glossary</h1>
      <p className="my-4">Use these definitions when you read a lesson or review your work.</p>
      <dl className="space-y-6">
        {[...GLOSSARY]
          .sort((a, b) => a.term_en.localeCompare(b.term_en))
          .map((term) => (
            <div key={term.slug} id={term.slug}>
              <dt className="font-semibold">
                {term.term_en} · {term.term_zh}
              </dt>
              <dd>{term.def_en}</dd>
              <dd lang="zh">{term.def_zh}</dd>
            </div>
          ))}
      </dl>
    </main>
  );
}
