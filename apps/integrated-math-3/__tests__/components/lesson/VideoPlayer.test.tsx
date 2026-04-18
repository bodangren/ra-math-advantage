import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoPlayer } from '@/components/lesson/VideoPlayer';

describe('VideoPlayer', () => {
  describe('basic rendering', () => {
    it('renders a Load Video button initially', () => {
      render(<VideoPlayer videoUrl="https://www.youtube.com/watch?v=abc123" duration={5} />);
      expect(screen.getByRole('button', { name: /load video/i })).toBeInTheDocument();
    });

    it('shows duration', () => {
      render(<VideoPlayer videoUrl="https://youtu.be/abc123" duration={12} />);
      expect(screen.getByText(/12/)).toBeInTheDocument();
    });

    it('loads iframe after clicking Load Video', () => {
      const { container } = render(
        <VideoPlayer videoUrl="https://www.youtube.com/watch?v=abc123" duration={5} />
      );
      const btn = screen.getByRole('button', { name: /load video/i });
      fireEvent.click(btn);
      expect(container.querySelector('iframe')).toBeInTheDocument();
    });

    it('uses youtube-nocookie embed URL for YouTube links', () => {
      const { container } = render(
        <VideoPlayer videoUrl="https://www.youtube.com/watch?v=dQw4w9WgXcQ" duration={3} />
      );
      fireEvent.click(screen.getByRole('button', { name: /load video/i }));
      const iframe = container.querySelector('iframe');
      expect(iframe?.src).toContain('youtube-nocookie.com');
      expect(iframe?.src).toContain('dQw4w9WgXcQ');
    });

    it('passes non-YouTube URLs directly to iframe', () => {
      const customUrl = 'https://example.com/video.mp4';
      const { container } = render(<VideoPlayer videoUrl={customUrl} duration={2} />);
      fireEvent.click(screen.getByRole('button', { name: /load video/i }));
      const iframe = container.querySelector('iframe');
      expect(iframe?.src).toContain('example.com');
    });
  });

  describe('transcript', () => {
    it('does not render transcript toggle when no transcript provided', () => {
      render(<VideoPlayer videoUrl="https://youtu.be/abc" duration={1} />);
      expect(screen.queryByText(/transcript/i)).not.toBeInTheDocument();
    });

    it('renders transcript toggle when transcript provided', () => {
      render(
        <VideoPlayer videoUrl="https://youtu.be/abc" duration={1} transcript="Full transcript text." />
      );
      expect(screen.getByText(/transcript/i)).toBeInTheDocument();
    });

    it('shows transcript text after toggling', () => {
      render(
        <VideoPlayer videoUrl="https://youtu.be/abc" duration={1} transcript="This is the transcript." />
      );
      const toggle = screen.getByRole('button', { name: /transcript/i });
      fireEvent.click(toggle);
      expect(screen.getByText('This is the transcript.')).toBeInTheDocument();
    });
  });

  describe('responsive layout', () => {
    it('renders with aspect-video container', () => {
      const { container } = render(
        <VideoPlayer videoUrl="https://youtu.be/abc" duration={2} />
      );
      expect(container.querySelector('[class*="aspect-video"]')).toBeInTheDocument();
    });
  });
});
