'use client';

import { useEffect, useRef, useCallback } from 'react';
import {
  createTimingAccumulator,
  DEFAULT_IDLE_THRESHOLD_MS,
  type TimingAccumulator,
  type PracticeTimingSummary,
} from '@math-platform/practice-core/timing';

export interface UsePracticeTimingOptions {
  idleThresholdMs?: number;
  onSubmit?: (timing: PracticeTimingSummary) => void;
}

export interface UsePracticeTimingReturn {
  getTiming: () => PracticeTimingSummary | null;
  recordInteraction: () => void;
  isTracking: () => boolean;
}


/**
 * Hook that tracks active practice time, idle periods, and visibility events.
 *
 * @param options - Idle threshold and optional submit callback
 * @returns Timing getter, interaction recorder, and tracking state checker
 */
export function usePracticeTiming(
  options: UsePracticeTimingOptions = {},
): UsePracticeTimingReturn {
  const { idleThresholdMs = DEFAULT_IDLE_THRESHOLD_MS, onSubmit } = options;
  const accumulatorRef = useRef<TimingAccumulator | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isTrackingRef = useRef(false);


  /**
   * Returns the current timing summary by finalizing the accumulator.
   *
   * @returns The current timing summary or null if not tracking
   */
  const getTiming = useCallback((): PracticeTimingSummary | null => {
    if (!accumulatorRef.current || startTimeRef.current === null) {
      return null;
    }
    return accumulatorRef.current.finalize(performance.now());
  }, []);


  /**
   * Records a user interaction event in the timing accumulator.
   */
  const recordInteraction = useCallback(() => {
    if (accumulatorRef.current) {
      accumulatorRef.current.addEvent({
        type: 'interaction',
        timestamp: performance.now(),
      });
    }
  }, []);


  /**
   * Tracks document visibility changes as timing events.
   */
  const handleVisibilityChange = useCallback(() => {
    if (!accumulatorRef.current) return;

    if (document.visibilityState === 'hidden') {
      accumulatorRef.current.addEvent({
        type: 'visibility_hidden',
        timestamp: performance.now(),
      });
    } else {
      accumulatorRef.current.addEvent({
        type: 'visibility_visible',
        timestamp: performance.now(),
      });
    }
  }, []);


  /**
   * Tracks window focus and blur events as timing events.
   */
  const handleFocusChange = useCallback(() => {
    if (!accumulatorRef.current) return;

    if (document.hasFocus()) {
      accumulatorRef.current.addEvent({
        type: 'focus',
        timestamp: performance.now(),
      });
    } else {
      accumulatorRef.current.addEvent({
        type: 'blur',
        timestamp: performance.now(),
      });
    }
  }, []);


  /**
   * Finalizes timing and submits on page hide events.
   */
  const handlePageHide = useCallback(() => {
    if (!accumulatorRef.current) return;

    accumulatorRef.current.addEvent({
      type: 'pagehide',
      timestamp: performance.now(),
    });

    const timing = accumulatorRef.current.finalize(performance.now());
    if (timing && onSubmit) {
      onSubmit(timing);
    }
    isTrackingRef.current = false;
  }, [onSubmit]);

  useEffect(() => {
    accumulatorRef.current = createTimingAccumulator({ idleThresholdMs });
    startTimeRef.current = Date.now();
    accumulatorRef.current.start(performance.now());
    isTrackingRef.current = true;

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocusChange);
    window.addEventListener('blur', handleFocusChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocusChange);
      window.removeEventListener('blur', handleFocusChange);
      window.removeEventListener('pagehide', handlePageHide);

      if (accumulatorRef.current && accumulatorRef.current.isActive()) {
        const timing = accumulatorRef.current.finalize(performance.now());
        if (timing && onSubmit) {
          onSubmit(timing);
        }
      }

      accumulatorRef.current = null;
      startTimeRef.current = null;
      isTrackingRef.current = false;
    };
  }, [idleThresholdMs, handleVisibilityChange, handleFocusChange, handlePageHide, onSubmit]);

  return {
    getTiming,
    recordInteraction,
    isTracking: () => isTrackingRef.current,
  };
}