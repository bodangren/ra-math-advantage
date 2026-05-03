'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { StudyTerm } from '../study/types';
import { shuffleArray } from '../study/shuffle';

export interface SpeedRoundGameProps {
  terms: StudyTerm[];
  onComplete: (results: {
    itemsSeen: number;
    itemsCorrect: number;
    itemsIncorrect: number;
    durationSeconds: number;
  }) => void;
}

interface Question {
  termSlug: string;
  term: string;
  correctDef: string;
  options: string[];
}

const GAME_DURATION = 90;
const INITIAL_LIVES = 3;
const OPTIONS_COUNT = 4;

function generateQuestions(terms: StudyTerm[], count: number): Question[] {
  const shuffledTerms = shuffleArray(terms);
  const selectedTerms = shuffledTerms.slice(0, Math.min(count, shuffledTerms.length));

  return selectedTerms.map((term) => {
    const otherDefs = terms
      .filter((t) => t.slug !== term.slug)
      .map((t) => t.definition);

    const wrongOptions = shuffleArray(otherDefs).slice(0, OPTIONS_COUNT - 1);
    const options = shuffleArray([term.definition, ...wrongOptions]);

    return {
      termSlug: term.slug,
      term: term.term,
      correctDef: term.definition,
      options,
    };
  });
}

export function SpeedRoundGame({ terms, onComplete }: SpeedRoundGameProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [lives, setLives] = useState(INITIAL_LIVES);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [itemsSeen, setItemsSeen] = useState(0);
  const [itemsCorrect, setItemsCorrect] = useState(0);
  const [itemsIncorrect, setItemsIncorrect] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [startTime] = useState(() => Date.now());
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const gameTerms = useMemo(() => {
    return shuffleArray(terms).slice(0, Math.min(20, terms.length));
  }, [terms]);

  useEffect(() => {
    const newQuestions = generateQuestions(gameTerms, gameTerms.length);
    setQuestions(newQuestions);
  }, [gameTerms]);

  useEffect(() => {
    if (isComplete) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isComplete]);

  useEffect(() => {
    if (isComplete) {
      const endTime = Date.now();
      const durationSeconds = Math.floor((endTime - startTime) / 1000);
      onComplete({
        itemsSeen,
        itemsCorrect,
        itemsIncorrect,
        durationSeconds,
      });
    }
  }, [isComplete, itemsSeen, itemsCorrect, itemsIncorrect, startTime, onComplete]);

  const handleAnswer = useCallback(
    (selectedDef: string) => {
      if (feedback !== null || isComplete || currentIndex >= questions.length) return;

      setSelectedAnswer(selectedDef);
      const question = questions[currentIndex];
      const isCorrect = selectedDef === question.correctDef;

      setItemsSeen((prev) => prev + 1);

      if (isCorrect) {
        setItemsCorrect((prev) => prev + 1);
        setStreak((prev) => {
          const next = prev + 1;
          setBestStreak((bs) => Math.max(bs, next));
          return next;
        });
        setFeedback('correct');
      } else {
        setItemsIncorrect((prev) => prev + 1);
        setStreak(0);
        setLives((prev) => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setIsComplete(true);
          }
          return newLives;
        });
        setFeedback('wrong');
      }

      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
      feedbackTimerRef.current = setTimeout(() => {
        setFeedback(null);
        setSelectedAnswer(null);
        setCurrentIndex((prev) => prev + 1);
      }, 800);
    },
    [feedback, isComplete, currentIndex, questions]
  );

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center">
        <p className="text-lg text-muted-foreground">Loading questions...</p>
      </div>
    );
  }

  if (isComplete || currentIndex >= questions.length) {
    const endTime = Date.now();
    const durationSeconds = Math.floor((endTime - startTime) / 1000);

    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <h2 className="text-3xl font-display font-bold text-foreground">
          {lives <= 0 ? 'Game Over!' : "Time's Up!"}
        </h2>
        <div className="text-5xl">{lives <= 0 ? '💔' : '⏱️'}</div>
        <div className="space-y-2">
          <p className="text-lg text-muted-foreground">
            Final Score: <span className="font-semibold text-foreground">{itemsCorrect}</span> correct
          </p>
          <p className="text-sm text-muted-foreground">
            You saw {itemsSeen} questions in {durationSeconds}s
          </p>
          <p className="text-sm text-muted-foreground">
            Best streak: <span className="font-semibold text-foreground">{bestStreak}</span>
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 space-y-6">
      <div className="flex items-center justify-between text-sm font-medium">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Time:</span>
          <span className={`font-mono-num ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-foreground'}`}>
            {timeLeft}s
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Lives:</span>
          <span className="text-foreground">
            {'❤️'.repeat(lives)}
            {'🖤'.repeat(INITIAL_LIVES - lives)}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">Streak:</span>
          <span className="text-foreground font-mono-num">{streak}🔥</span>
        </div>
      </div>

      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">What is the definition of:</p>
        <h3 className="text-2xl font-display font-bold text-foreground">{currentQuestion.term}</h3>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {currentQuestion.options.map((option, idx) => {
          const isSelected = selectedAnswer === option;
          const isCorrectAnswer = option === currentQuestion.correctDef;
          let buttonClass = 'bg-card border-border text-foreground hover:border-primary/40';

          if (feedback !== null && isSelected) {
            if (feedback === 'correct') {
              buttonClass = 'bg-green-100 border-green-300 text-green-800';
            } else {
              buttonClass = 'bg-red-100 border-red-300 text-red-800';
            }
          } else if (feedback !== null && isCorrectAnswer) {
            buttonClass = 'bg-green-100 border-green-300 text-green-800';
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(option)}
              disabled={feedback !== null}
              className={`rounded-xl border p-4 text-left font-medium transition-all duration-200 ${buttonClass}`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div
          className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl font-bold animate-bounce ${
            feedback === 'correct' ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {feedback === 'correct' ? '✓' : '✗'}
        </div>
      )}
    </div>
  );
}
