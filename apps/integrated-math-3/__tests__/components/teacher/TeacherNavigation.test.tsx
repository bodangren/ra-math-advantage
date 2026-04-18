import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TeacherNavigation, type TeacherNavigationProps } from '@/components/teacher/TeacherNavigation';

const defaultProps: TeacherNavigationProps = {
  activeRoute: '/teacher/dashboard',
};

describe('TeacherNavigation', () => {
  describe('layout', () => {
    it('renders navigation links', () => {
      render(<TeacherNavigation {...defaultProps} />);
      
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Gradebook')).toBeInTheDocument();
      expect(screen.getByText('Students')).toBeInTheDocument();
      expect(screen.getByText('Units')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('highlights the active route', () => {
      render(<TeacherNavigation {...defaultProps} activeRoute="/teacher/dashboard" />);
      
      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink.closest('a')).toHaveClass('text-orange-600');
    });

    it('does not highlight inactive routes', () => {
      render(<TeacherNavigation {...defaultProps} activeRoute="/teacher/dashboard" />);
      
      const gradebookLink = screen.getByText('Gradebook');
      expect(gradebookLink.closest('a')).not.toHaveClass('text-orange-600');
    });
  });

  describe('responsive behavior', () => {
    it('shows mobile menu button', () => {
      render(<TeacherNavigation {...defaultProps} />);
      
      const menuButton = screen.getByLabelText('Toggle menu');
      expect(menuButton).toBeInTheDocument();
    });

    it('collapses sidebar on mobile by default', () => {
      render(<TeacherNavigation {...defaultProps} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('-translate-x-full');
    });

    it('shows sidebar on desktop', () => {
      render(<TeacherNavigation {...defaultProps} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('md:block', 'md:translate-x-0');
    });
  });

  describe('link behavior', () => {
    it('renders dashboard link with correct href', () => {
      render(<TeacherNavigation {...defaultProps} />);
      
      const dashboardLink = screen.getByText('Dashboard');
      expect(dashboardLink.closest('a')).toHaveAttribute('href', '/teacher/dashboard');
    });

    it('renders gradebook link with correct href', () => {
      render(<TeacherNavigation {...defaultProps} />);
      
      const gradebookLink = screen.getByText('Gradebook');
      expect(gradebookLink.closest('a')).toHaveAttribute('href', '/teacher/gradebook');
    });

    it('renders students link with correct href', () => {
      render(<TeacherNavigation {...defaultProps} />);
      
      const studentsLink = screen.getByText('Students');
      expect(studentsLink.closest('a')).toHaveAttribute('href', '/teacher/students');
    });

    it('renders units link with correct href', () => {
      render(<TeacherNavigation {...defaultProps} />);
      
      const unitsLink = screen.getByText('Units');
      expect(unitsLink.closest('a')).toHaveAttribute('href', '/teacher/units');
    });

    it('renders settings link with correct href', () => {
      render(<TeacherNavigation {...defaultProps} />);
      
      const settingsLink = screen.getByText('Settings');
      expect(settingsLink.closest('a')).toHaveAttribute('href', '/teacher/settings');
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA label', () => {
      render(<TeacherNavigation {...defaultProps} />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Teacher navigation');
    });
  });
});
