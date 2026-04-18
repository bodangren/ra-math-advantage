import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { PhaseRenderer, type PhaseSection } from '@/components/lesson/PhaseRenderer';
import type { PhaseType } from '@/lib/curriculum/phase-types';

import React from 'react';

const { MockLessonMarkdownRenderer } = vi.hoisted(() => ({
  MockLessonMarkdownRenderer: ({ content }: { content: string }) => (
    <div data-testid="markdown-renderer">{content}</div>
  ),
}));

// Mock next/dynamic to return component synchronously for tests
type DynamicComponentProps = Record<string, unknown>;

vi.mock('next/dynamic', () => ({
  default: (fn: () => Promise<{ default: React.ComponentType<DynamicComponentProps> }>) => {
    // Resolve the import eagerly; the mock intercepts import() so it resolves in a microtask.
    // We lazily cache the resolved module on first render.
    let cached: { default: React.ComponentType<DynamicComponentProps> } | undefined;
    const pending = fn().then((m) => { cached = m; });

    const Component = (props: DynamicComponentProps) => {
      // Hooks must be called unconditionally (lint: react-hooks/rules-of-hooks)
      const [, setTick] = React.useState(0);
      React.useEffect(() => {
        if (!cached) {
          pending.then(() => setTick((t) => t + 1));
        }
      }, []);

      if (!cached) {
        return <div data-testid="dynamic-loading">Loading...</div>;
      }
      const LoadedComponent = cached.default;
      return <LoadedComponent {...props} />;
    };

    Component.displayName = 'DynamicMock';
    return Component;
  },
}));

// Mock sub-components to isolate PhaseRenderer logic
vi.mock('@/components/lesson/MarkdownRenderer', () => ({
  LessonMarkdownRenderer: MockLessonMarkdownRenderer,
  default: MockLessonMarkdownRenderer,
}));

vi.mock('@/components/lesson/VideoPlayer', () => ({
  VideoPlayer: ({ videoUrl }: { videoUrl: string }) => (
    <div data-testid="video-player">{videoUrl}</div>
  ),
}));

vi.mock('@/components/lesson/ActivityRenderer', () => ({
  ActivityRenderer: ({ componentKey }: { componentKey: string }) => (
    <div data-testid="activity-renderer">{componentKey}</div>
  ),
}));

vi.mock('@/components/textbook/CalloutBox', () => ({
  CalloutBox: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="callout-box">{children}</div>
  ),
}));

vi.mock('@/components/textbook/PhaseContainer', () => ({
  PhaseContainer: ({ children, phaseType }: { children: React.ReactNode; phaseType: string }) => (
    <div data-testid="phase-container" data-phase-type={phaseType}>{children}</div>
  ),
}));

const makeSection = (overrides: Partial<PhaseSection>): PhaseSection => ({
  id: 'sec-1',
  sequenceOrder: 1,
  ...overrides,
} as PhaseSection);

describe('PhaseRenderer', () => {
  const phaseType: PhaseType = 'learn';

  describe('section type mapping', () => {
    it('renders text section via LessonMarkdownRenderer', async () => {
      render(
        <PhaseRenderer
          phaseType={phaseType}
          sections={[makeSection({ sectionType: 'text', content: { markdown: 'Hello world' } })]}
        />
      );
      await waitFor(() => {
        expect(screen.getByTestId('markdown-renderer')).toBeInTheDocument();
        expect(screen.getByText('Hello world')).toBeInTheDocument();
      });
    });

    it('renders video section via VideoPlayer', () => {
      render(
        <PhaseRenderer
          phaseType={phaseType}
          sections={[makeSection({
            sectionType: 'video',
            content: { videoUrl: 'https://youtu.be/abc', duration: 5 },
          })]}
        />
      );
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
    });

    it('renders callout section via CalloutBox', () => {
      render(
        <PhaseRenderer
          phaseType={phaseType}
          sections={[makeSection({
            sectionType: 'callout',
            content: { variant: 'tip', text: 'This is a tip.' },
          })]}
        />
      );
      expect(screen.getByTestId('callout-box')).toBeInTheDocument();
    });

    it('renders activity section via ActivityRenderer', () => {
      render(
        <PhaseRenderer
          phaseType={phaseType}
          sections={[makeSection({
            sectionType: 'activity',
            content: { componentKey: 'graphing-explorer', activityId: 'act-1' },
          })]}
        />
      );
      expect(screen.getByTestId('activity-renderer')).toBeInTheDocument();
    });

    it('renders image section with img element', () => {
      render(
        <PhaseRenderer
          phaseType={phaseType}
          sections={[makeSection({
            sectionType: 'image',
            content: { imageUrl: '/img/test.png', alt: 'Test image' },
          })]}
        />
      );
      expect(screen.getByRole('img')).toBeInTheDocument();
      expect(screen.getByAltText('Test image')).toBeInTheDocument();
    });

    it('renders image caption when provided', () => {
      render(
        <PhaseRenderer
          phaseType={phaseType}
          sections={[makeSection({
            sectionType: 'image',
            content: { imageUrl: '/img/test.png', alt: 'alt', caption: 'Figure 1' },
          })]}
        />
      );
      expect(screen.getByText('Figure 1')).toBeInTheDocument();
    });
  });

  describe('PhaseContainer wrapping', () => {
    it('wraps content in PhaseContainer with correct phaseType', () => {
      const { container } = render(
        <PhaseRenderer
          phaseType="explore"
          sections={[makeSection({ sectionType: 'text', content: { markdown: 'content' } })]}
        />
      );
      const phaseContainer = container.querySelector('[data-testid="phase-container"]');
      expect(phaseContainer).toBeInTheDocument();
      expect(phaseContainer).toHaveAttribute('data-phase-type', 'explore');
    });

    it('applies different phaseType to PhaseContainer', () => {
      const { container } = render(
        <PhaseRenderer
          phaseType="worked_example"
          sections={[makeSection({ sectionType: 'text', content: { markdown: 'x' } })]}
        />
      );
      expect(container.querySelector('[data-phase-type="worked_example"]')).toBeInTheDocument();
    });
  });

  describe('multiple sections', () => {
    it('renders multiple sections in order', async () => {
      render(
        <PhaseRenderer
          phaseType={phaseType}
          sections={[
            makeSection({ id: 's1', sequenceOrder: 1, sectionType: 'text', content: { markdown: 'First' } }),
            makeSection({ id: 's2', sequenceOrder: 2, sectionType: 'text', content: { markdown: 'Second' } }),
          ]}
        />
      );
      await waitFor(() => {
        expect(screen.getByText('First')).toBeInTheDocument();
        expect(screen.getByText('Second')).toBeInTheDocument();
      });
    });
  });

  describe('empty state', () => {
    it('renders empty state message when no sections', () => {
      render(<PhaseRenderer phaseType={phaseType} sections={[]} />);
      expect(screen.getByText(/no content/i)).toBeInTheDocument();
    });
  });
});
