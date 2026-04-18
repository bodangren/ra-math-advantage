import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModuleCompleteScreen } from '@/components/lesson/ModuleCompleteScreen';

describe('ModuleCompleteScreen', () => {
  it('renders module completion screen', () => {
    render(
      <ModuleCompleteScreen
        moduleLabel="Module 1: Linear Functions"
        lessonsCompleted={8}
        totalLessons={8}
        totalTimeMinutes={120}
        onBackToDashboard={() => {}}
      />
    );
    expect(screen.getByTestId('module-complete-screen')).toBeInTheDocument();
  });

  it('displays module label', () => {
    render(
      <ModuleCompleteScreen
        moduleLabel="Module 1: Linear Functions"
        lessonsCompleted={8}
        totalLessons={8}
        totalTimeMinutes={120}
        onBackToDashboard={() => {}}
      />
    );
    expect(screen.getByText('Module 1: Linear Functions')).toBeInTheDocument();
  });

  it('displays lessons completed count', () => {
    render(
      <ModuleCompleteScreen
        moduleLabel="Module 1"
        lessonsCompleted={5}
        totalLessons={8}
        totalTimeMinutes={120}
        onBackToDashboard={() => {}}
      />
    );
    expect(screen.getByText('5 / 8 lessons completed')).toBeInTheDocument();
  });

  it('displays total time spent', () => {
    render(
      <ModuleCompleteScreen
        moduleLabel="Module 1"
        lessonsCompleted={8}
        totalLessons={8}
        totalTimeMinutes={120}
        onBackToDashboard={() => {}}
      />
    );
    expect(screen.getByText((content) => content.includes('2 hours'))).toBeInTheDocument();
  });

  it('shows back to dashboard button that calls onBackToDashboard', () => {
    const onBack = vi.fn();
    render(
      <ModuleCompleteScreen
        moduleLabel="Module 1"
        lessonsCompleted={8}
        totalLessons={8}
        totalTimeMinutes={120}
        onBackToDashboard={onBack}
      />
    );
    const dashboardBtn = screen.getByTestId('module-complete-dashboard-btn');
    fireEvent.click(dashboardBtn);
    expect(onBack).toHaveBeenCalledTimes(1);
  });
});
