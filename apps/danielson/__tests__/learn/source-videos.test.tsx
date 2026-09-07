import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { LearnIndex } from '../../components/learn-index';
import { LearnTechniqueView } from '../../components/learn-technique-view';
import { LEARN_TECHNIQUES, getLearnTechnique, getLearnTechniqueNavigation } from '../../lib/learn/catalog';

describe('source TLAC 3.0 videos', () => {
  it('makes all eight source videos available from Learn', () => {
    render(<LearnIndex techniques={LEARN_TECHNIQUES} />);
    const library = screen.getByRole('region', { name: 'TLAC 3.0 video tutorials' });
    const links = within(library).getAllByRole('link', { name: /Watch on YouTube/ });
    expect(links).toHaveLength(8);
    expect(new Set(links.map((link) => link.getAttribute('href'))).size).toBe(8);
    expect(within(library).getByTitle('Teach Like a Champion (TLAC) 3.0 Overview and Review'))
      .toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/5vJoq2fQ-bM?rel=0');
  });

  it.each([
    ['cold-call', 'wO9Y9R5xTaw'], ['wait-time', 'PvJw9ge8yFQ'],
    ['stretch-it', 'rdszNzs0N80'], ['right-is-right', 'H07fYE6vLGk'],
    ['no-opt-out', 'NUL51AmaKfM'], ['retrieval-practice', 'dysID9X2STs'],
    ['replace-self-report', '7himF8J3ick'],
  ])('connects %s to its source tutorial', (slug, videoId) => {
    const technique = getLearnTechnique(slug)!;
    render(<LearnTechniqueView technique={technique} navigation={getLearnTechniqueNavigation(slug)} />);
    const tutorial = screen.getByRole('region', { name: 'TLAC 3.0 video tutorials' });
    expect(within(tutorial).getByRole('link', { name: /Watch on YouTube/ }))
      .toHaveAttribute('href', `https://www.youtube.com/watch?v=${videoId}`);
    expect(tutorial.querySelector('iframe')).toHaveAttribute('src', `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`);
    expect(tutorial.querySelector('details')).toHaveAttribute('open');
    if (slug === 'replace-self-report') expect(within(tutorial).getByText(/Technique 6/)).toBeVisible();
  });

  it('does not attach unrelated source tutorials to other lessons', () => {
    const technique = getLearnTechnique('fase-reading')!;
    render(<LearnTechniqueView technique={technique} navigation={getLearnTechniqueNavigation(technique.id)} />);
    expect(screen.queryByRole('region', { name: 'TLAC 3.0 video tutorials' })).not.toBeInTheDocument();
  });
});
