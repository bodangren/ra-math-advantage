'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { GlossaryTerm } from '@/lib/study/types';
import { shuffleArray } from '@/lib/study/utils';

type CardType = 'term' | 'definition';

interface CardItem {
  id: string;
  content: string;
  pairId: string;
  type: CardType;
}

interface MatchingGameProps {
  terms: GlossaryTerm[];
  onComplete: (results: {
    itemsSeen: number;
    itemsCorrect: number;
    itemsIncorrect: number;
    durationSeconds: number;
  }) => void;
}

export function MatchingGame({ terms, onComplete }: MatchingGameProps) {
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<Set<string>>(new Set());
  const [wrongIds, setWrongIds] = useState<Set<string>>(new Set());
  const [isComplete, setIsComplete] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const wrongTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (wrongTimerRef.current) {
        clearTimeout(wrongTimerRef.current);
      }
    };
  }, []);

  const gameTerms = useMemo(() => {
    const shuffled = shuffleArray(terms);
    return shuffled.slice(0, 6);
  }, [terms]);

  useEffect(() => {
    const newCards: CardItem[] = [];
    gameTerms.forEach((term) => {
      newCards.push({
        id: `${term.slug}-term`,
        content: term.term,
        pairId: term.slug,
        type: 'term',
      });
      newCards.push({
        id: `${term.slug}-def`,
        content: term.definition,
        pairId: term.slug,
        type: 'definition',
      });
    });
    setCards(shuffleArray(newCards));
    setStartTime(Date.now());
  }, [gameTerms]);

  useEffect(() => {
    if (matchedPairIds.size === gameTerms.length && gameTerms.length > 0 && !isComplete) {
      const now = Date.now();
      setEndTime(now);
      setIsComplete(true);
      onComplete({
        itemsSeen: gameTerms.length,
        itemsCorrect: gameTerms.length,
        itemsIncorrect: wrongAttempts,
        durationSeconds: Math.floor((now - startTime) / 1000),
      });
    }
  }, [matchedPairIds, gameTerms.length, wrongAttempts, startTime, isComplete, onComplete]);

  const handleCardClick = useCallback(
    (card: CardItem) => {
      if (matchedPairIds.has(card.pairId) || wrongIds.has(card.id) || isComplete) {
        return;
      }

      if (selectedId === null) {
        setSelectedId(card.id);
        return;
      }

      if (selectedId === card.id) {
        setSelectedId(null);
        return;
      }

      const selectedCard = cards.find((c) => c.id === selectedId);
      if (!selectedCard) {
        setSelectedId(null);
        return;
      }

      if (selectedCard.pairId === card.pairId && selectedCard.type !== card.type) {
        setMatchedPairIds((prev) => new Set(prev).add(card.pairId));
        setSelectedId(null);
      } else {
        setWrongIds(new Set([selectedCard.id, card.id]));
        setWrongAttempts((prev) => prev + 1);
        setSelectedId(null);
        if (wrongTimerRef.current) clearTimeout(wrongTimerRef.current);
        wrongTimerRef.current = setTimeout(() => {
          setWrongIds(new Set());
        }, 800);
      }
    },
    [cards, selectedId, matchedPairIds, wrongIds, isComplete]
  );

  if (isComplete) {
    const durationSeconds = Math.floor((endTime - startTime) / 1000);
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <h2 className="text-3xl font-display font-bold text-foreground">Completion!</h2>
        <p className="text-lg text-muted-foreground">
          You matched all {gameTerms.length} pairs in{' '}
          <span className="font-semibold text-foreground">{durationSeconds}s</span>
        </p>
        <div className="text-5xl">🎉</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6 text-center">
        <p className="text-sm text-muted-foreground">
          Matched {matchedPairIds.size} of {gameTerms.length} pairs
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {cards.map((card) => {
          const isMatched = matchedPairIds.has(card.pairId);
          const isSelected = selectedId === card.id;
          const isWrong = wrongIds.has(card.id);
          let state = 'idle';
          if (isMatched) state = 'matched';
          else if (isWrong) state = 'wrong';
          else if (isSelected) state = 'selected';

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(card)}
              disabled={isMatched}
              data-state={state}
              className={[
                'relative aspect-square rounded-xl border p-2 sm:p-3 text-left text-sm font-medium transition-all duration-200',
                'flex items-center justify-center text-center',
                isMatched
                  ? 'bg-green-100 border-green-300 text-green-800 cursor-default'
                  : isWrong
                    ? 'bg-red-100 border-red-300 text-red-800'
                    : isSelected
                      ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary'
                      : 'bg-card border-border text-foreground hover:border-primary/40',
              ].join(' ')}
            >
              <span className="line-clamp-4">{card.content}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
