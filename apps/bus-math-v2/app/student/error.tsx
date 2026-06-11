'use client';

import { useEffect } from 'react';
import { ErrorFallback } from '@/components/error-fallback';

interface StudentErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for the student section.
 *
 * @param props - The error boundary props.
 * @param props.error - The caught error with optional digest.
 * @param props.reset - Callback to retry the failed render.
 * @returns An error fallback UI with a retry action.
 */
export default function StudentError({ error, reset }: StudentErrorProps) {
  useEffect(() => {
    console.error('Student route error:', error);
  }, [error]);

  return (
    <ErrorFallback
      error={error}
      reset={reset}
      title="Unable to load page"
      description="We ran into a problem loading this page. Please try again."
    />
  );
}
