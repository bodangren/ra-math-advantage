'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import type { PracticeTestModuleConfig } from '@/lib/practice-tests/types';
import { filterQuestionsByLessonIds, drawRandomQuestions, shuffleAnswers } from '@/lib/practice-tests/question-banks';

interface PracticeTestEngineProps {
  moduleConfig: PracticeTestModuleConfig;
  onComplete?: (result: {
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
  }) => void;
}

type Phase = 'introduction' | 'assessment' | 'closing';

export default function PracticeTestEngine({ moduleConfig, onComplete }: PracticeTestEngineProps) {
  const [currentPhase, setCurrentPhase] = useState<Phase>('introduction');
  const [selectedLessonIds, setSelectedLessonIds] = useState<string[]>(
    moduleConfig.lessons.map((l) => l.lessonId)
  );
  const [questionCount, setQuestionCount] = useState<number>(
    Math.min(10, moduleConfig.questions.length)
  );
  const [testQuestions, setTestQuestions] = useState<
    { question: ReturnType<typeof shuffleAnswers>; original: PracticeTestModuleConfig['questions'][number] }[]
  >([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [, setScore] = useState<number>(0);
  const [, setPerLessonBreakdown] = useState<
    Record<string, { lessonTitle: string; correct: number; total: number }>
  >({});
  const [hasSeenFeedback, setHasSeenFeedback] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);

  const scoreRef = useRef(0);
  const breakdownRef = useRef<Record<string, { lessonTitle: string; correct: number; total: number }>>({});
  const hasCalledOnCompleteRef = useRef(false);

  const handleToggleLesson = (lessonId: string) => {
    setSelectedLessonIds((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const handleSelectAllLessons = () => {
    setSelectedLessonIds(moduleConfig.lessons.map((l) => l.lessonId));
  };

  const handleClearAllLessons = () => {
    setSelectedLessonIds([]);
  };

  const handleStartTest = () => {
    const filteredQuestions = filterQuestionsByLessonIds(moduleConfig.questions, selectedLessonIds);
    const drawnQuestions = drawRandomQuestions(filteredQuestions, questionCount);
    const shuffledQuestions = drawnQuestions.map((q) => ({
      question: shuffleAnswers(q),
      original: q,
    }));
    setTestQuestions(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setScore(0);
    scoreRef.current = 0;
    const breakdown: Record<string, { lessonTitle: string; correct: number; total: number }> = {};
    selectedLessonIds.forEach((lessonId) => {
      const lesson = moduleConfig.lessons.find((l) => l.lessonId === lessonId);
      if (lesson) {
        breakdown[lessonId] = { lessonTitle: lesson.title, correct: 0, total: 0 };
      }
    });
    shuffledQuestions.forEach(({ original }) => {
      if (breakdown[original.lessonId]) {
        breakdown[original.lessonId].total++;
      }
    });
    breakdownRef.current = breakdown;
    setPerLessonBreakdown(breakdown);
    setCurrentPhase('assessment');
  };

  const handleAnswerQuestion = (selectedAnswer: string) => {
    const current = testQuestions[currentQuestionIndex];
    if (!current || hasSeenFeedback) return;
    const { question, original } = current;
    const isCorrect = selectedAnswer === question.choices[question.correctIndex];
    setLastAnswerCorrect(isCorrect);

    if (isCorrect) {
      scoreRef.current += 1;
      setScore((prev) => prev + 1);
      if (breakdownRef.current[original.lessonId]) {
        breakdownRef.current[original.lessonId] = {
          ...breakdownRef.current[original.lessonId],
          correct: (breakdownRef.current[original.lessonId]?.correct ?? 0) + 1,
        };
      }
      setPerLessonBreakdown((prev) => ({
        ...prev,
        [original.lessonId]: {
          ...prev[original.lessonId],
          correct: (prev[original.lessonId]?.correct ?? 0) + 1,
        },
      }));
    }

    setHasSeenFeedback(true);
  };

  const handleContinueQuestion = () => {
    if (currentQuestionIndex < testQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setHasSeenFeedback(false);
      setLastAnswerCorrect(false);
    } else {
      setCurrentPhase('closing');

      if (onComplete && !hasCalledOnCompleteRef.current) {
        hasCalledOnCompleteRef.current = true;
        const perLessonBreakdownArray = Object.entries(breakdownRef.current).map(
          ([lessonId, data]) => ({
            lessonId,
            lessonTitle: data.lessonTitle,
            correct: data.correct,
            total: data.total,
          })
        );
        onComplete({
          moduleNumber: moduleConfig.moduleNumber,
          lessonsTested: selectedLessonIds,
          questionCount: testQuestions.length,
          score: scoreRef.current,
          perLessonBreakdown: perLessonBreakdownArray,
        });
      }
    }
  };

  const handleRetryTest = () => {
    scoreRef.current = 0;
    breakdownRef.current = {};
    hasCalledOnCompleteRef.current = false;
    setTestQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setPerLessonBreakdown({});
    setCurrentPhase('introduction');
  };

  const availableQuestions = filterQuestionsByLessonIds(moduleConfig.questions, selectedLessonIds).length;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {currentPhase === 'introduction'
              ? moduleConfig.phaseContent.introduction.heading
              : `Module ${moduleConfig.moduleNumber} Practice Test`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentPhase === 'introduction' && (
            <div>
              <p className="text-lg mb-6">{moduleConfig.phaseContent.introduction.body}</p>

              <div className="mb-6">
                <h3 className="text-md font-semibold mb-3">
                  {moduleConfig.messaging.selectLessons}
                </h3>
                <div className="flex gap-2 mb-3">
                  <Button variant="secondary" size="sm" onClick={handleSelectAllLessons}>
                    Select All
                  </Button>
                  <Button variant="secondary" size="sm" onClick={handleClearAllLessons}>
                    Clear All
                  </Button>
                </div>
                <div className="space-y-2">
                  {moduleConfig.lessons.map((lesson) => (
                    <div key={lesson.lessonId} className="flex items-center gap-2">
                      <Checkbox
                        id={lesson.lessonId}
                        checked={selectedLessonIds.includes(lesson.lessonId)}
                        onCheckedChange={() => handleToggleLesson(lesson.lessonId)}
                      />
                      <Label htmlFor={lesson.lessonId}>{lesson.title}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <Label htmlFor="question-count">{moduleConfig.messaging.questionCountLabel}</Label>
                <Input
                  id="question-count"
                  type="number"
                  min={1}
                  max={availableQuestions}
                  value={questionCount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setQuestionCount(
                      Math.max(
                        1,
                        Math.min(parseInt(e.target.value) || 1, availableQuestions)
                      )
                    )
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleStartTest}
                  disabled={selectedLessonIds.length === 0 || availableQuestions === 0}
                >
                  {moduleConfig.messaging.startTest}
                </Button>
              </div>
            </div>
          )}

          {currentPhase === 'assessment' && testQuestions.length > 0 && (
            <div>
              <div className="mb-6">
                <Badge variant="secondary">
                  {moduleConfig.phaseContent.assessment.questionNumberLabel
                    .replace('{current}', String(currentQuestionIndex + 1))
                    .replace('{total}', String(testQuestions.length))}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold mb-4">
                {testQuestions[currentQuestionIndex].original.prompt}
              </h3>
              <div className="space-y-3 mb-6">
                {testQuestions[currentQuestionIndex].question.choices.map((option, index) => {
                  const isCorrectAnswer = option === testQuestions[currentQuestionIndex].question.choices[testQuestions[currentQuestionIndex].question.correctIndex];
                  return (
                    <Button
                      key={index}
                      variant="secondary"
                      className={`w-full justify-start text-left ${
                        hasSeenFeedback && isCorrectAnswer ? 'bg-green-100 border-green-500 border-2' : ''
                      } ${hasSeenFeedback && !isCorrectAnswer ? 'opacity-50' : ''}`}
                      onClick={() => handleAnswerQuestion(option)}
                      disabled={hasSeenFeedback}
                    >
                      {option}
                    </Button>
                  );
                })}
              </div>
              {hasSeenFeedback && (
                <div className="mb-4">
                  <div
                    className={`text-lg font-semibold mb-2 ${
                      lastAnswerCorrect ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {lastAnswerCorrect
                      ? moduleConfig.phaseContent.assessment.correctFeedback
                      : moduleConfig.phaseContent.assessment.incorrectFeedback}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    {testQuestions[currentQuestionIndex].original.explanation}
                  </div>
                  <Button onClick={handleContinueQuestion}>
                    {moduleConfig.phaseContent.assessment.continueButton}
                  </Button>
                </div>
              )}
            </div>
          )}

          {currentPhase === 'closing' && (
            <div>
              <p className="text-lg mb-6">{moduleConfig.phaseContent.closing.heading}</p>
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-3">
                  {moduleConfig.phaseContent.closing.scoreLabel}
                </h3>
                <div className="text-4xl font-bold mb-2">
                  {scoreRef.current}/{testQuestions.length}
                </div>
                <div className="text-lg text-gray-600">
                  {testQuestions.length > 0
                    ? Math.round((scoreRef.current / testQuestions.length) * 100)
                    : 0}
                  %
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-md font-semibold mb-3">
                  {moduleConfig.phaseContent.closing.perLessonBreakdownLabel}
                </h3>
                <div className="space-y-2">
                  {Object.entries(breakdownRef.current).map(([lessonId, data]) => (
                    <div key={lessonId} className="flex justify-between">
                      <span>{data.lessonTitle}</span>
                      <span>
                        {data.correct}/{data.total}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={handleRetryTest}>
                  {moduleConfig.phaseContent.closing.retryButton}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
