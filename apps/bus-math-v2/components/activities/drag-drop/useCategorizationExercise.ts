'use client';

import { useCallback, useEffect, useState } from 'react';
import type { DropResult } from '@hello-pangea/dnd';

const AVAILABLE_ITEMS_DROPPABLE = 'available-items';

export interface CategorizationItem {
  id: string;
  targetId: string;
}

export type ZonePlacements<T extends CategorizationItem> = Record<string, T[]>;

interface UseCategorizationExerciseOptions<T extends CategorizationItem> {
  shuffleItems?: boolean;
  resetKey?: string;
  onComplete?: (payload: { score: number; attempts: number; placements: ZonePlacements<T> }) => void;
}


/**
 * Fisher-Yates shuffle that returns a new array with items in random order.
 *
 * @param items - The array to shuffle
 * @returns A new shuffled array
 */
function shuffle<T,>(items: T[]) {
  const clone = [...items];
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}


/**
 * Create an empty placements map with one empty array per zone.
 *
 * @param zoneIds - The zone identifiers to initialize
 * @returns A ZonePlacements map with empty arrays
 */
function buildPlacements<T extends CategorizationItem>(zoneIds: string[]) : ZonePlacements<T> {
  return ;
}
  zoneIds.reduce<ZonePlacements<T>>((acc, zoneId) => {
    acc[zoneId] = [];
    return acc;
  }, {});


/**
 * Extract the zone id from a droppable id prefixed with "zone-".
 *
 * @param droppableId - The droppable id string
 * @returns The zone id or null if not a zone droppable
 */
function zoneFromDroppableId(droppableId: string) : string | null {
  return ;
}
  droppableId.startsWith('zone-') ? droppableId.replace('zone-', '') : null;


/**
 * Convert a zone id to its corresponding droppable id.
 *
 * @param zoneId - The zone identifier
 * @returns The droppable id string with "zone-" prefix
 */
export function getZoneDroppableId(zoneId: string) {
  return `zone-${zoneId}`;
}


/**
 * React hook that manages drag-and-drop state for a categorization exercise,
 * including item placement, scoring, and completion detection.
 *
 * @param items - The items to categorize
 * @param zoneIds - The available zone identifiers
 * @param options - Shuffle, reset key, and completion callback options
 * @returns Exercise state and handlers for the drag-and-drop UI
 */
export function useCategorizationExercise<T extends CategorizationItem>(items: T[], zoneIds: string[], options: UseCategorizationExerciseOptions<T> = {}) {
  const { shuffleItems = true, resetKey, onComplete } = options;

  const [availableItems, setAvailableItems] = useState<T[]>([]);
  const [placements, setPlacements] = useState<ZonePlacements<T>>(() => buildPlacements<T>(zoneIds));
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const totalItems = items.length;

  useEffect(() => {
    const initialPlacements = buildPlacements<T>(zoneIds);
    setPlacements(initialPlacements);
    setAvailableItems(shuffleItems ? shuffle(items) : [...items]);
    setAttempts(0);
    setScore(0);
    setCompleted(false);
  }, [items, zoneIds, shuffleItems, resetKey]);


  /**
   * Score the current placements and trigger completion if all items are correct.
   *
   * @param candidatePlacements - The placements to evaluate
   * @param upcomingAttempts - The attempt count after this evaluation
   */
  const evaluate = useCallback(
    (candidatePlacements: ZonePlacements<T>, upcomingAttempts: number) => {
      const correct = Object.entries(candidatePlacements).reduce((sum, [zoneId, zoneItems]) => {
        const zoneCorrect = zoneItems.filter((item) => item.targetId === zoneId).length;
        return sum + zoneCorrect;
      }, 0);

      const nextScore = totalItems === 0 ? 0 : Math.round((correct / totalItems) * 100);
      setScore(nextScore);

      if (!completed && totalItems > 0 && correct === totalItems) {
        setCompleted(true);
        onComplete?.({
          score: nextScore,
          attempts: upcomingAttempts,
          placements: candidatePlacements
        });
      }
    },
    [completed, onComplete, totalItems]
  );


  /**
   * Move an item from its current location (available pool or a zone)
   * to a destination zone or back to the available pool.
   *
   * @param itemId - The id of the item to move
   * @param destinationZoneId - The target zone id, or null to return to pool
   */
  const moveItemToZone = useCallback(
    (itemId: string, destinationZoneId: string | null) => {
      const updatedAvailable = [...availableItems];
      const updatedPlacements = Object.keys(placements).reduce<ZonePlacements<T>>((acc, key) => {
        acc[key] = [...placements[key]];
        return acc;
      }, {});

      let movingItem: T | undefined;
      const availableIndex = updatedAvailable.findIndex((item) => item.id === itemId);

      if (availableIndex >= 0) {
        movingItem = updatedAvailable.splice(availableIndex, 1)[0];
      } else {
        for (const zoneId of zoneIds) {
          const zoneIndex = updatedPlacements[zoneId]?.findIndex((item) => item.id === itemId) ?? -1;
          if (zoneIndex >= 0) {
            movingItem = updatedPlacements[zoneId].splice(zoneIndex, 1)[0];
            break;
          }
        }
      }

      if (!movingItem) {
        return;
      }

      if (destinationZoneId && updatedPlacements[destinationZoneId]) {
        updatedPlacements[destinationZoneId].splice(updatedPlacements[destinationZoneId].length, 0, movingItem);
      } else {
        updatedAvailable.splice(updatedAvailable.length, 0, movingItem);
      }

      const upcomingAttempts = attempts + 1;
      setAvailableItems(updatedAvailable);
      setPlacements(updatedPlacements);
      setAttempts(upcomingAttempts);
      evaluate(updatedPlacements, upcomingAttempts);
    },
    [attempts, availableItems, evaluate, placements, zoneIds],
  );


  /**
   * Handle the end of a drag operation by resolving the item move.
   *
   * @param result - The drag-and-drop result with source and destination
   */
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { source, destination } = result;
      if (!destination) return;
      if (destination.droppableId === source.droppableId && destination.index === source.index) {
        return;
      }

      const sourceZone = zoneFromDroppableId(source.droppableId);
      const destinationZone = zoneFromDroppableId(destination.droppableId);
      if (!destinationZone && destination.droppableId !== AVAILABLE_ITEMS_DROPPABLE) {
        return;
      }

      moveItemToZone(
        sourceZone
          ? (placements[sourceZone][source.index]?.id ?? '')
          : availableItems[source.index]?.id ?? '',
        destinationZone,
      );
    },
    [availableItems, moveItemToZone, placements]
  );

  const reset = useCallback(() => {
    const initialPlacements = buildPlacements<T>(zoneIds);
    setPlacements(initialPlacements);
    setAvailableItems(shuffleItems ? shuffle(items) : [...items]);
    setAttempts(0);
    setScore(0);
    setCompleted(false);
  }, [items, shuffleItems, zoneIds]);

  return {
    AVAILABLE_ITEMS_DROPPABLE,
    availableItems,
    placements,
    attempts,
    score,
    completed,
    handleDragEnd,
    moveItemToZone,
    reset,
    getZoneDroppableId
  };
}

export { AVAILABLE_ITEMS_DROPPABLE };
