import Link from 'next/link';
import { TLAC_SOURCE_VIDEOS } from '@/content/learn/source-videos';
import { LearnSourceVideos } from './learn-source-videos';
import { COMPONENT_TITLES, type DanielsonComponentId } from '@/lib/proficiency/graph';

import { learnHref, type Technique } from '@/lib/learn/catalog';

const DOMAIN_TITLES: Record<number, string> = {
  1: 'Planning and Readiness',
  2: 'Classroom Environment',
  3: 'Instruction and Learning',
  4: 'Professional Responsibility',
};

export function LearnIndex({ techniques }: { techniques: readonly Technique[] }) {
  return (
    <div className="learn-index">
      <header className="learn-index-hero">
        <p className="eyebrow">Teach Like a Champion 3.0</p>
        <h1>Learn the target skills</h1>
        <p className="lede">
          Open a skill to review its purpose and action steps. Use the page before coaching, practice, or an observation.
        </p>
        <p>This reference library does not cover all 22 Danielson components. It includes selected classroom techniques. The component mapping is school-defined.</p>
        <p className="learn-index-count"><strong>{techniques.length}</strong> approved skills</p>
      </header>

      <LearnSourceVideos videos={TLAC_SOURCE_VIDEOS} showTechniqueLinks />

      {[1, 2, 3, 4].map((domain) => {
        const domainTechniques = techniques.filter((technique) => technique.domain === domain);
        const componentIds = [...new Set(domainTechniques.map((technique) => technique.subdomain))].sort();
        return (
          <section className="learn-domain" key={domain} aria-labelledby={`learn-domain-${domain}`}>
            <header className="learn-domain-heading">
              <span aria-hidden="true">{domain}</span>
              <div>
                <p className="eyebrow">Danielson domain {domain}</p>
                <h2 id={`learn-domain-${domain}`}>Domain {domain}: {DOMAIN_TITLES[domain]}</h2>
              </div>
            </header>
            {componentIds.length === 0 ? <p>No technique pages are included for this domain. Use the school rubric and professional learning plan for this work.</p> : null}
            {componentIds.map((componentId) => {
              const componentTechniques = domainTechniques.filter(
                (technique) => technique.subdomain === componentId,
              );
              const firstTechnique = componentTechniques[0];
              if (!firstTechnique) return null;
              return (
                <section className="learn-component" key={componentId}>
                  <h3>{componentId}: {COMPONENT_TITLES[componentId as DanielsonComponentId]}</h3>
                  <ul className="learn-card-grid">
                    {componentTechniques.map((technique) => (
                      <li key={technique.id}>
                        <Link
                          className="learn-card-link"
                          href={learnHref(technique.id)}
                          aria-label={`Learn ${technique.title}`}
                        >
                          <span className="learn-card-code">{technique.subdomain}</span>
                          <strong>{technique.title}</strong>
                          <span>{technique.description}</span>
                          <span className="learn-card-action">Open Learn page <span aria-hidden="true">→</span></span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
