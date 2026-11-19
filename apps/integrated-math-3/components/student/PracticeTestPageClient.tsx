"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import PracticeTestEngine from "@/components/student/PracticeTestEngine";
import type { PracticeTestModuleConfig } from "@/lib/practice-tests/types";

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
  const [saveError, setSaveError] = useState(false);
  const retrySave = useRef<(() => Promise<void>) | null>(null);

  const handleTestComplete = async (result: {
    attemptId: string;
    answers: Array<{ questionId: string; answer: string }>;
    durationSeconds: number;
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
    retrySave.current = () => handleTestComplete(result);
    setSaveError(false);

    try {
      const response = await fetch("/api/practice-tests/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attemptId: result.attemptId,
          moduleNumber: result.moduleNumber,
          answers: result.answers,
          durationSeconds: result.durationSeconds,
        }),
      });

      if (!response.ok) {
        throw new Error("The test result was not saved.");
      }
    } catch (error) {
      console.error("Failed to save practice test result:", error);
      setSaveError(true);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 py-6">
      <div className="container mx-auto px-4 mb-6">
        <Button variant="secondary" asChild>
          <Link href="/student/study/practice-tests">Back to Practice Tests</Link>
        </Button>
      </div>
      {saveError && (
        <div role="alert">
          The test result was not saved.{" "}
          <Button onClick={() => void retrySave.current?.()}>Retry save</Button>
        </div>
      )}
      <PracticeTestEngine moduleConfig={moduleConfig} onComplete={handleTestComplete} />
    </div>
  );
}
