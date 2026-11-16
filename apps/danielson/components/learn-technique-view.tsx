import Link from 'next/link';
import { TLAC_SOURCE_VIDEOS } from '@/content/learn/source-videos';
import { LearnSourceVideos } from './learn-source-videos';
import { COMPONENT_TITLES, type DanielsonComponentId } from '@/lib/proficiency/graph';

import { learnHref, type Technique } from '@/lib/learn/catalog';

type TechniqueNavigation = {
  previous: Technique | null;
  next: Technique | null;
};

function hasVideo(technique: Technique) {
  return /^[A-Za-z0-9_-]{11}$/.test(technique.videos.demo.trim());
}

export function LearnTechniqueView({
  technique,
  navigation,
}: {
  technique: Technique;
  navigation: TechniqueNavigation;
}) {
  const summaryParagraphs = technique.detailedSummary?.split(/\n{2,}/).filter(Boolean) ?? [];
  return (
    <article className="learn-detail">
      <nav className="learn-breadcrumbs" aria-label="Learn page">
        <Link href="/learn">All Learn pages</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{technique.title}</span>
      </nav>

      <header className="learn-technique-hero">
        <div className="learn-technique-code" aria-label={`Danielson component ${technique.subdomain}`}>
          {technique.subdomain}
        </div>
        <div>
          <p className="eyebrow">{technique.subdomain}: {COMPONENT_TITLES[technique.subdomain as DanielsonComponentId]}</p>
          <h1>{technique.title}</h1>
          <p className="learn-technique-source">Via {technique.source}</p>
          <p className="lede">{technique.description}</p>
        </div>
      </header>

      <div className="learn-technique-layout">
        <div className="learn-technique-main">
          <section className="learn-action-panel" aria-labelledby="learn-action-heading">
            <p className="eyebrow">Practice sequence</p>
            <h2 id="learn-action-heading">Use the technique</h2>
            <ol className="learn-step-list" aria-label={`${technique.title} action steps`}>
              {technique.actionSteps.map((step, index) => (
                <li key={step}>
                  <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <section className="learn-guide" aria-labelledby="learn-practice-heading">
            <h2 id="learn-practice-heading">Rehearse and review</h2>
            <p>Choose one action step for an upcoming lesson. Write the words you will use and the student response you expect.</p>
            <p>Rehearse with a colleague. Ask the colleague to identify evidence that you used the step. Revise the instruction if it was unclear.</p>
            <p>After the lesson, compare the expected and observed student responses. Choose one adjustment for the next attempt.</p>
          </section>
          {summaryParagraphs.length > 0 ? (
            <section className="learn-guide" aria-labelledby="learn-guide-heading">
              <h2 id="learn-guide-heading">Understand the technique</h2>
              {summaryParagraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </section>
          ) : null}
        </div>

        <aside className="learn-technique-aside" aria-label="Technique references">
          <LearnSourceVideos videos={TLAC_SOURCE_VIDEOS.filter((video) => video.techniqueId === technique.id)} />

          {hasVideo(technique) ? (
            <section aria-labelledby="learn-video-heading">
              <h2 id="learn-video-heading">Watch the example</h2>
              <div className="learn-video-frame">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${technique.videos.demo.trim()}?rel=0&modestbranding=1`}
                  title={`${technique.title} demonstration`}
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <p className="muted">Study the timing, student response, and teacher language. If the video is unavailable, use the book reference below.</p>
            </section>
          ) : null}

          {technique.literature ? (
            <section className="learn-book-reference" aria-labelledby="learn-book-heading">
              <p className="eyebrow">Book reference</p>
              <h2 id="learn-book-heading">{technique.literature.book}</h2>
              <p>{/^\d/.test(technique.literature.pages) ? 'Pages ' : ''}{technique.literature.pages}</p>
            </section>
          ) : null}
        </aside>
      </div>

      <nav className="learn-sequence-nav" aria-label="Technique sequence">
        {navigation.previous ? (
          <Link href={learnHref(navigation.previous.id)}>
            <span>Previous</span>
            <strong>{navigation.previous.title}</strong>
          </Link>
        ) : <span />}
        {navigation.next ? (
          <Link href={learnHref(navigation.next.id)}>
            <span>Next</span>
            <strong>{navigation.next.title}</strong>
          </Link>
        ) : <span />}
      </nav>
    </article>
  );
}
