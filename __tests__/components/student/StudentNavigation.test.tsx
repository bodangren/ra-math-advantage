import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StudentNavigation, type StudentNavigationProps } from '@/components/student/StudentNavigation';

const defaultProps: StudentNavigationProps = {
  activeRoute: '/student/dashboard',
};

describe('StudentNavigation', () => {
  describe('layout', () => {
    it('renders navigation links', () => {
      render(<StudentNavigation {...defaultProps} />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Lessons')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('highlights the active route', () => {
      render(<StudentNavigation {...defaultProps} activeRoute="/student/dashboard" />);
      
      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink.closest('a')).toHaveClass('text-orange-600');
    });

    it('does not highlight inactive routes', () => {
      render(<StudentNavigation {...defaultProps} activeRoute="/student/dashboard" />);
      
      const lessonsLink = screen.getByText('Lessons');
      expect(lessonsLink.closest('a')).not.toHaveClass('text-orange-600');
    });
  });

  describe('responsive behavior', () => {
    it('shows mobile menu button', () => {
      render(<StudentNavigation {...defaultProps} />);
      
      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toBeInTheDocument();
    });

    it('collapses sidebar on mobile by default', () => {
      render(<StudentNavigation {...defaultProps} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('-translate-x-full');
    });

    it('shows sidebar on desktop', () => {
      render(<StudentNavigation {...defaultProps} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('md:block', 'md:translate-x-0');
    });
  });

  describe('link behavior', () => {
    it('renders dashboard link with correct href', () => {
      render(<StudentNavigation {...defaultProps} />);
      
      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink.closest('a')).toHaveAttribute('href', '/student/dashboard');
    });

    it('renders lessons link with correct href', () => {
      render(<StudentNavigation {...defaultProps} />);
      
      const lessonsLink = screen.getByText('Lessons');
      expect(lessonsLink.closest('a')).toHaveAttribute('href', '/student/lessons');
    });

    it('renders settings link with correct href', () => {
      render(<StudentNavigation {...defaultProps} />);
      
      const settingsLink = screen.getByText('Settings');
      expect(settingsLink.closest('a')).toHaveAttribute('href', '/student/settings');
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA label', () => {
      render(<StudentNavigation {...defaultProps} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Student navigation');
    });
  });
});
