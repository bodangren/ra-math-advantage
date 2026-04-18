'use client';

import React, { useState } from 'react';
import { MathInputField } from '@/components/activities/algebraic/MathInputField';
import { buildPracticeSubmissionEnvelope } from '@/lib/practice/contract';

type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'select_all';

interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

interface ComprehensionQuizProps {
  activityId: string;
  mode: 'teaching' | 'guided' | 'practice';
  questions: Question[];
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
}

interface QuizState {
  answers: Record<string, string | string[]>;
  retryCounts: Record<string, number>;
  currentQuestionIndex: number;
  feedbackShown: Record<string, boolean>;
  submitted: boolean;
}

export function ComprehensionQuiz({
  activityId,
  mode,
  questions,
  onSubmit,
  onComplete,
}: ComprehensionQuizProps) {
  const [state, setState] = useState<QuizState>({
    answers: {},
    retryCounts: {},
    currentQuestionIndex: 0,
    feedbackShown: {},
    submitted: false,
  });

  const MAX_RETRIES = 1;

  const currentQuestion = questions[state.currentQuestionIndex];
  const isCurrentAnswerCorrect = (question: Question, answer: string | string[]): boolean => {
    if (Array.isArray(question.correctAnswer)) {
      if (!Array.isArray(answer)) return false;
      return question.correctAnswer.length === answer.length &&
        question.correctAnswer.every(a => answer.includes(a));
    }
    if (Array.isArray(answer)) return false;
    return answer.toLowerCase().trim() === String(question.correctAnswer).toLowerCase().trim();
  };

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    const question = questions.find(q => q.id === questionId);
    const isCorrect = question ? isCurrentAnswerCorrect(question, answer) : false;

    if (mode === 'guided' && question) {
      if (isCorrect) {
        setState(prev => ({
          ...prev,
          answers: { ...prev.answers, [questionId]: answer },
          feedbackShown: { ...prev.feedbackShown, [questionId]: true },
        }));
      } else {
        setState(prev => ({
          ...prev,
          answers: { ...prev.answers, [questionId]: answer },
          feedbackShown: { ...prev.feedbackShown, [questionId]: true },
        }));
      }
    } else {
      setState(prev => ({
        ...prev,
        answers: { ...prev.answers, [questionId]: answer },
      }));
    }
  };

  const handleNext = () => {
    if (state.currentQuestionIndex < questions.length - 1) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }));
    }
  };

  const handlePracticeSubmit = () => {
    const answers: Record<string, unknown> = {};
    const parts = questions.map(q => {
      const answer = state.answers[q.id];
      const correct = isCurrentAnswerCorrect(q, answer || '');
      answers[q.id] = { answer, isCorrect: correct };
      return {
        partId: q.id,
        rawAnswer: answer,
        isCorrect: correct,
        score: correct ? 1 : 0,
        maxScore: 1,
      };
    });

    const correctCount = parts.filter(p => p.isCorrect).length;
    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === 'practice' ? 'independent_practice' : mode === 'guided' ? 'guided_practice' : mode,
      status: 'submitted',
      attemptNumber: 1,
      answers,
      parts,
      analytics: { score, totalQuestions: questions.length, correctCount },
    });

    onSubmit?.(envelope);
    onComplete?.();
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <MultipleChoiceQuestion
            key={question.id}
            question={question}
            selectedAnswer={state.answers[question.id] as string | undefined}
            onAnswer={(answer) => handleAnswer(question.id, answer)}
            disabled={mode === 'teaching'}
            showCorrect={mode === 'teaching'}
            feedbackShown={state.feedbackShown[question.id]}
          />
        );

      case 'true_false':
        return (
          <TrueFalseQuestion
            key={question.id}
            question={question}
            selectedAnswer={state.answers[question.id] as string | undefined}
            onAnswer={(answer) => handleAnswer(question.id, answer)}
            disabled={mode === 'teaching'}
            showCorrect={mode === 'teaching'}
            feedbackShown={state.feedbackShown[question.id]}
          />
        );

      case 'short_answer':
        return (
          <ShortAnswerQuestion
            key={question.id}
            question={question}
            value={(state.answers[question.id] as string) || ''}
            onChange={(value) => handleAnswer(question.id, value)}
            disabled={mode === 'teaching'}
            showCorrect={mode === 'teaching'}
            feedbackShown={state.feedbackShown[question.id]}
          />
        );

      case 'select_all':
        return (
          <SelectAllQuestion
            key={question.id}
            question={question}
            selectedAnswers={(state.answers[question.id] as string[]) || []}
            onAnswer={(answers) => handleAnswer(question.id, answers)}
            disabled={mode === 'teaching'}
            showCorrect={mode === 'teaching'}
            feedbackShown={state.feedbackShown[question.id]}
          />
        );

      default:
        return null;
    }
  };

  if (mode === 'teaching') {
    return (
      <div className="space-y-8 p-4">
        <h2 className="text-xl font-bold">Comprehension Quiz</h2>
        <div className="space-y-6">
          {questions.map(q => renderQuestion(q))}
        </div>
      </div>
    );
  }

  if (mode === 'guided') {
    const currentAnswer = state.answers[currentQuestion?.id];
    const retryCount = state.retryCounts[currentQuestion?.id] || 0;
    const feedbackShown = state.feedbackShown[currentQuestion?.id];
    const correct = currentQuestion ? isCurrentAnswerCorrect(currentQuestion, currentAnswer || '') : false;

    return (
      <div className="space-y-6 p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            Question {state.currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>

        <div className="space-y-4">
          {renderQuestion(currentQuestion)}
        </div>

        <div className="flex gap-4">
          {feedbackShown && correct && (
            <div className="flex gap-4 items-center">
              <span className="text-green-600 font-medium">Correct!</span>
              {state.currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => onComplete?.()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Finish
                </button>
              )}
            </div>
          )}

          {feedbackShown && !correct && retryCount >= MAX_RETRIES && (
            <div className="space-y-2">
              <span className="text-red-600 font-medium">
                Correct answer: {Array.isArray(currentQuestion.correctAnswer) 
                  ? currentQuestion.correctAnswer.join(', ') 
                  : currentQuestion.correctAnswer}
              </span>
              {state.currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => onComplete?.()}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Finish
                </button>
              )}
            </div>
          )}

          {feedbackShown && !correct && retryCount < MAX_RETRIES && (
            <div className="flex gap-4 items-center">
              <span className="text-red-600">Incorrect. Try again!</span>
              <button
                onClick={() => {
                  const resetValue = Array.isArray(currentQuestion.correctAnswer) ? [] : '';
                  setState(prev => ({
                    ...prev,
                    answers: { ...prev.answers, [currentQuestion.id]: resetValue },
                    feedbackShown: { ...prev.feedbackShown, [currentQuestion.id]: false },
                    retryCounts: { ...prev.retryCounts, [currentQuestion.id]: retryCount + 1 },
                  }));
                }}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'practice') {
    const allAnswered = questions.every(q => state.answers[q.id] !== undefined);

    return (
      <div className="space-y-8 p-4">
        <h2 className="text-xl font-bold">Comprehension Quiz</h2>
        <div className="space-y-6">
          {questions.map((q, i) => (
            <div key={q.id} className="border rounded-lg p-4">
              <div className="flex gap-2 mb-2">
                <span className="font-medium">Q{i + 1}.</span>
                {renderQuestion(q)}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={handlePracticeSubmit}
          disabled={!allAnswered}
          className="px-6 py-2 bg-primary text-primary-foreground rounded-md disabled:opacity-50"
        >
          Submit All Answers
        </button>
      </div>
    );
  }

  return null;
}

interface QuestionProps {
  question: Question;
  selectedAnswer?: string | string[];
  onAnswer: (answer: string | string[]) => void;
  disabled?: boolean;
  showCorrect?: boolean;
  feedbackShown?: boolean;
}

function MultipleChoiceQuestion({
  question,
  selectedAnswer,
  onAnswer,
  disabled,
  showCorrect,
}: QuestionProps) {
  return (
    <div className="space-y-3">
      <p className="font-medium">{question.prompt}</p>
      <div className="space-y-2">
        {question.options?.map((option, i) => {
          const isCorrect = option === question.correctAnswer;
          const isSelected = selectedAnswer === option;
          let className = 'w-full p-3 text-left rounded-md border transition-colors ';
          
          if (disabled) {
            className += isCorrect ? 'bg-green-100 border-green-500 ' : 'bg-gray-50 border-gray-200 ';
          } else {
            className += isSelected ? 'bg-blue-100 border-blue-500 ' : 'bg-white border-border hover:bg-gray-50 ';
          }

          return (
            <button
              key={i}
              onClick={() => onAnswer(option)}
              disabled={disabled}
              className={className}
            >
              <span className="mr-2">{option}</span>
              {showCorrect && isCorrect && <span className="text-green-600 text-sm">(Correct)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TrueFalseQuestion({
  question,
  selectedAnswer,
  onAnswer,
  disabled,
  showCorrect,
}: QuestionProps) {
  return (
    <div className="space-y-3">
      <p className="font-medium">{question.prompt}</p>
      <div className="flex gap-4">
        {question.options?.map((option, i) => {
          const isCorrect = option === question.correctAnswer;
          const isSelected = selectedAnswer === option;
          let className = 'px-6 py-3 rounded-md border transition-colors ';
          
          if (disabled) {
            className += isCorrect ? 'bg-green-100 border-green-500 ' : 'bg-gray-50 border-gray-200 ';
          } else {
            className += isSelected ? 'bg-blue-100 border-blue-500 ' : 'bg-white border-border hover:bg-gray-50 ';
          }

          return (
            <button
              key={i}
              onClick={() => onAnswer(option)}
              disabled={disabled}
              className={className}
            >
              {option}
              {showCorrect && isCorrect && <span className="text-green-600 text-sm ml-2">(Correct)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ShortAnswerQuestion({
  question,
  value,
  onChange,
  disabled,
  showCorrect,
}: Omit<QuestionProps, 'onAnswer'> & { value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-3">
      <p className="font-medium">{question.prompt}</p>
      <MathInputField
        value={value}
        onChange={onChange}
        label="Your answer"
        correctAnswer={question.correctAnswer as string}
        disabled={disabled}
        showValidation={showCorrect}
      />
      {showCorrect && (
        <p className="text-sm text-green-600">
          Correct answer: {question.correctAnswer}
        </p>
      )}
    </div>
  );
}

function SelectAllQuestion({
  question,
  selectedAnswers,
  onAnswer,
  disabled,
  showCorrect,
}: QuestionProps & { selectedAnswers: string[] }) {
  const toggleAnswer = (option: string) => {
    if (selectedAnswers.includes(option)) {
      onAnswer(selectedAnswers.filter(a => a !== option));
    } else {
      onAnswer([...selectedAnswers, option]);
    }
  };

  return (
    <div className="space-y-3">
      <p className="font-medium">{question.prompt}</p>
      <p className="text-sm text-muted-foreground">Select all that apply</p>
      <div className="space-y-2">
        {question.options?.map((option, i) => {
          const isSelected = selectedAnswers.includes(option);
          const isCorrect = Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option);
          
          let className = 'w-full p-3 text-left rounded-md border transition-colors ';
          
          if (disabled) {
            className += isCorrect ? 'bg-green-100 border-green-500 ' : 'bg-gray-50 border-gray-200 ';
          } else {
            className += isSelected ? 'bg-blue-100 border-blue-500 ' : 'bg-white border-border hover:bg-gray-50 ';
          }

          return (
            <button
              key={i}
              onClick={() => toggleAnswer(option)}
              disabled={disabled}
              className={className}
            >
              <span className="mr-2">{isSelected ? '☑' : '☐'}</span>
              {option}
              {showCorrect && isCorrect && <span className="text-green-600 text-sm ml-2">(Correct)</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
