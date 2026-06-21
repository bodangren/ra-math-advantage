'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import PracticeTestEngine from '@/components/student/PracticeTestEngine';
import type { PracticeTestModuleConfig } from '@/lib/practice-tests/types';

interface PracticeTestPageClientProps {
  moduleConfig: PracticeTestModuleConfig;
}

/**
 * Client wrapper for practice test pages that tracks duration and reports results.
 *
 * @param {PracticeTestPageClientProps} props - Practice test page configuration.
 * @returns {JSX.Element} A practice test page client.
 */
export function PracticeTestPageClient({ moduleConfig }: PracticeTestPageClientProps) {
  const startedAtRef = useRef<number>(0);

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  const handleTestComplete = async (result: {
    moduleNumber: number;
    lessonsTested: string[];
    questionCount: number;
    score: number;
    perLessonBreakdown: Array<{
      lessonId: string;
      lessonTitle: string;
      correct: number;
      total: number;
    }>;
  }) => {
    const durationSeconds = Math.floor((Date.now() - startedAtRef.current) / 1000);

    try {
      const response = await fetch('/api/practice-tests/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleNumber: result.moduleNumber,
          lessonsTested: result.lessonsTested,
          questionCount: result.questionCount,
          score: result.score,
          perLessonBreakdown: result.perLessonBreakdown,
          durationSeconds,
        }),
      });

      if (!response.ok) {
        console.error('Failed to save practice test result:', await response.text());
      }
    } catch (error) {
      console.error('Failed to save practice test result:', error);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 py-6">
      <div className="container mx-auto px-4 mb-6">
        <Button variant="secondary" asChild>
          <Link href="/student/study/practice-tests">Back to Practice Tests</Link>
        </Button>
      </div>
      <PracticeTestEngine moduleConfig={moduleConfig} onComplete={handleTestComplete} />
    </div>
  );
}
