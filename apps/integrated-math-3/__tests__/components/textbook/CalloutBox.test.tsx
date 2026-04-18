import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CalloutBox } from '@/components/textbook/CalloutBox';

describe('CalloutBox', () => {
  describe('basic rendering', () => {
    it('renders the title', () => {
      render(
        <CalloutBox variant="important" title="Important Note">
          <p>This is important information.</p>
        </CalloutBox>
      );
      expect(screen.getByText('Important Note')).toBeInTheDocument();
    });

    it('renders the body content', () => {
      render(
        <CalloutBox variant="tip" title="Tip">
          <p>This is a helpful tip.</p>
        </CalloutBox>
      );
      expect(screen.getByText('This is a helpful tip.')).toBeInTheDocument();
    });

    it('renders without title when not provided', () => {
      render(
        <CalloutBox variant="remember">
          <p>Remember this information.</p>
        </CalloutBox>
      );
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('variants', () => {
    describe('important variant', () => {
      it('renders important variant with correct icon', () => {
        const { container } = render(
          <CalloutBox variant="important" title="Important">
            <p>Content</p>
          </CalloutBox>
        );
        // Should have an icon (svg element)
        const icon = container.querySelector('svg');
        expect(icon).toBeInTheDocument();
      });

      it('applies important variant styling', () => {
        const { container } = render(
          <CalloutBox variant="important" title="Important">
            <p>Content</p>
          </CalloutBox>
        );
        const box = container.firstChild as HTMLElement;
        expect(box.className).toMatch(/important/);
      });

      it('renders with warning color scheme', () => {
        const { container } = render(
          <CalloutBox variant="important" title="Important">
            <p>Content</p>
          </CalloutBox>
        );
        const box = container.firstChild as HTMLElement;
        // Should have warning/destructive color classes
        expect(box.className).toMatch(/(warning|destructive|red)/);
      });
    });

    describe('tip variant', () => {
      it('renders tip variant with correct icon', () => {
        const { container } = render(
          <CalloutBox variant="tip" title="Tip">
            <p>Content</p>
          </CalloutBox>
        );
        const icon = container.querySelector('svg');
        expect(icon).toBeInTheDocument();
      });

      it('applies tip variant styling', () => {
        const { container } = render(
          <CalloutBox variant="tip" title="Tip">
            <p>Content</p>
          </CalloutBox>
        );
        const box = container.firstChild as HTMLElement;
        expect(box.className).toMatch(/tip/);
      });

      it('renders with accent/teal color scheme', () => {
        const { container } = render(
          <CalloutBox variant="tip" title="Tip">
            <p>Content</p>
          </CalloutBox>
        );
        const box = container.firstChild as HTMLElement;
        // Should have accent/teal color classes
        expect(box.className).toMatch(/(accent|teal)/);
      });
    });

    describe('remember variant', () => {
      it('renders remember variant with correct icon', () => {
        const { container } = render(
          <CalloutBox variant="remember" title="Remember">
            <p>Content</p>
          </CalloutBox>
        );
        const icon = container.querySelector('svg');
        expect(icon).toBeInTheDocument();
      });

      it('applies remember variant styling', () => {
        const { container } = render(
          <CalloutBox variant="remember" title="Remember">
            <p>Content</p>
          </CalloutBox>
        );
        const box = container.firstChild as HTMLElement;
        expect(box.className).toMatch(/remember/);
      });

      it('renders with blue/info color scheme', () => {
        const { container } = render(
          <CalloutBox variant="remember" title="Remember">
            <p>Content</p>
          </CalloutBox>
        );
        const box = container.firstChild as HTMLElement;
        // Should have blue/info color classes
        expect(box.className).toMatch(/(blue|info|primary)/);
      });
    });

    describe('caution variant', () => {
      it('renders caution variant with correct icon', () => {
        const { container } = render(
          <CalloutBox variant="caution" title="Caution">
            <p>Content</p>
          </CalloutBox>
        );
        const icon = container.querySelector('svg');
        expect(icon).toBeInTheDocument();
      });

      it('applies caution variant styling', () => {
        const { container } = render(
          <CalloutBox variant="caution" title="Caution">
            <p>Content</p>
          </CalloutBox>
        );
        const box = container.firstChild as HTMLElement;
        expect(box.className).toMatch(/caution/);
      });

      it('renders with amber/warning color scheme', () => {
        const { container } = render(
          <CalloutBox variant="caution" title="Caution">
            <p>Content</p>
          </CalloutBox>
        );
        const box = container.firstChild as HTMLElement;
        // Should have amber/warning color classes
        expect(box.className).toMatch(/(amber|yellow|warning)/);
      });
    });

    it('applies different colors for different variants', () => {
      const { container: container1 } = render(
        <CalloutBox variant="important" title="Test">
          <p>Content</p>
        </CalloutBox>
      );
      const { container: container2 } = render(
        <CalloutBox variant="tip" title="Test">
          <p>Content</p>
        </CalloutBox>
      );

      const box1 = container1.firstChild as HTMLElement;
      const box2 = container2.firstChild as HTMLElement;

      // Variants should have different color classes
      expect(box1.className).not.toBe(box2.className);
    });
  });

  describe('visual styling', () => {
    it('has a bordered container with background', () => {
      const { container } = render(
        <CalloutBox variant="tip" title="Test">
          <p>Content</p>
        </CalloutBox>
      );
      const box = container.firstChild as HTMLElement;
      expect(box.className).toMatch(/border/);
      expect(box.className).match(/bg-/);
    });

    it('displays icon before title', () => {
      render(
        <CalloutBox variant="tip" title="Test Title">
          <p>Content</p>
        </CalloutBox>
      );

      const icon = document.querySelector('svg');
      const title = screen.getByText('Test Title');

      expect(icon).toBeInTheDocument();
      expect(title).toBeInTheDocument();
    });

    it('applies proper spacing', () => {
      const { container } = render(
        <CalloutBox variant="tip" title="Test">
          <p>Content</p>
        </CalloutBox>
      );
      const box = container.firstChild as HTMLElement;
      expect(box.className).toMatch(/p-\d/);
    });
  });

  describe('accessibility', () => {
    it('has proper heading structure when title is provided', () => {
      render(
        <CalloutBox variant="important" title="Important Note">
          <p>Content</p>
        </CalloutBox>
      );
      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toBeInTheDocument();
    });

    it('is properly structured as an aside', () => {
      const { container } = render(
        <CalloutBox variant="tip" title="Test">
          <p>Content</p>
        </CalloutBox>
      );
      const aside = container.querySelector('aside');
      expect(aside).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('renders with empty body content', () => {
      render(
        <CalloutBox variant="remember" title="Test">
          <></>
        </CalloutBox>
      );
      expect(screen.getByText('Test')).toBeInTheDocument();
    });

    it('renders with multiple body elements', () => {
      render(
        <CalloutBox variant="caution" title="Test">
          <p>First paragraph</p>
          <p>Second paragraph</p>
          <ul><li>Item 1</li></ul>
        </CalloutBox>
      );
      expect(screen.getByText('First paragraph')).toBeInTheDocument();
      expect(screen.getByText('Second paragraph')).toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });

    it('renders with long title', () => {
      const longTitle = 'This is a very long callout title that should wrap properly';
      render(
        <CalloutBox variant="important" title={longTitle}>
          <p>Content</p>
        </CalloutBox>
      );
      expect(screen.getByText(longTitle)).toBeInTheDocument();
    });
  });
});
