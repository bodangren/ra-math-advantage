'use client';

import { useCallback, useEffect, useReducer } from 'react';
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

interface State<T extends CategorizationItem> {
  availableItems: T[];
  placements: ZonePlacements<T>;
  attempts: number;
  score: number;
  completed: boolean;
}

type Action<T extends CategorizationItem> =
  | { type: 'reset'; items: T[]; zoneIds: string[]; shuffleItems: boolean }
  | { type: 'moveItem'; itemId: string; destinationZoneId: string | null; items: T[]; zoneIds: string[] }
  | { type: 'evaluate'; totalItems: number; onComplete?: (payload: { score: number; attempts: number; placements: ZonePlacements<T> }) => void };


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
  return zoneIds.reduce<ZonePlacements<T>>((acc, zoneId) => {
    acc[zoneId] = [];
    return acc;
  }, {});
}


/**
 * Extract the zone id from a droppable id prefixed with "zone-".
 *
 * @param droppableId - The droppable id string
 * @returns The zone id or null if not a zone droppable
 */
function zoneFromDroppableId(droppableId: string) : string | null {
  return droppableId.startsWith('zone-') ? droppableId.replace('zone-', '') : null;
}


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
function reducer<T extends CategorizationItem>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case 'reset': {
      return {
        availableItems: action.shuffleItems ? shuffle(action.items) : [...action.items],
        placements: buildPlacements<T>(action.zoneIds),
        attempts: 0,
        score: 0,
        completed: false,
      };
    }
    case 'moveItem': {
      const updatedAvailable = [...state.availableItems];
      const updatedPlacements = Object.keys(state.placements).reduce<ZonePlacements<T>>((acc, key) => {
        acc[key] = [...state.placements[key]];
        return acc;
      }, {});

      let movingItem: T | undefined;
      const availableIndex = updatedAvailable.findIndex((item) => item.id === action.itemId);

      if (availableIndex >= 0) {
        movingItem = updatedAvailable.splice(availableIndex, 1)[0];
      } else {
        for (const zoneId of action.zoneIds) {
          const zoneIndex = updatedPlacements[zoneId]?.findIndex((item) => item.id === action.itemId) ?? -1;
          if (zoneIndex >= 0) {
            movingItem = updatedPlacements[zoneId].splice(zoneIndex, 1)[0];
            break;
          }
        }
      }

      if (!movingItem) {
        return state;
      }

      if (action.destinationZoneId && updatedPlacements[action.destinationZoneId]) {
        updatedPlacements[action.destinationZoneId].splice(updatedPlacements[action.destinationZoneId].length, 0, movingItem);
      } else {
        updatedAvailable.splice(updatedAvailable.length, 0, movingItem);
      }

      return {
        ...state,
        availableItems: updatedAvailable,
        placements: updatedPlacements,
        attempts: state.attempts + 1,
      };
    }
    case 'evaluate': {
      const correct = Object.entries(state.placements).reduce((sum, [zoneId, zoneItems]) => {
        const zoneCorrect = zoneItems.filter((item) => item.targetId === zoneId).length;
        return sum + zoneCorrect;
      }, 0);

      const nextScore = action.totalItems === 0 ? 0 : Math.round((correct / action.totalItems) * 100);

      if (!state.completed && action.totalItems > 0 && correct === action.totalItems) {
        action.onComplete?.({
          score: nextScore,
          attempts: state.attempts,
          placements: state.placements,
        });
      }

      return {
        ...state,
        score: nextScore,
        completed: state.completed || (action.totalItems > 0 && correct === action.totalItems),
      };
    }
    default:
      return state;
  }
}

function initState<T extends CategorizationItem>(items: T[], zoneIds: string[], shuffleItems: boolean): State<T> {
  return {
    availableItems: shuffleItems ? shuffle(items) : [...items],
    placements: buildPlacements<T>(zoneIds),
    attempts: 0,
    score: 0,
    completed: false,
  };
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
  const totalItems = items.length;

  const [state, dispatch] = useReducer(
    reducer as (state: State<T>, action: Action<T>) => State<T>,
    { items, zoneIds, shuffleItems },
    ({ items, zoneIds, shuffleItems }: { items: T[]; zoneIds: string[]; shuffleItems: boolean }) => initState(items, zoneIds, shuffleItems)
  );

  // Reset when dependencies change
  useEffect(() => {
    dispatch({ type: 'reset', items, zoneIds, shuffleItems });
  }, [items, zoneIds, shuffleItems, resetKey]);

  const { availableItems, placements, attempts, score, completed } = state;


  /**
   * Move an item from its current location (available pool or a zone)
   * to a destination zone or back to the available pool.
   *
   * @param itemId - The id of the item to move
   * @param destinationZoneId - The target zone id, or null to return to pool
   */
  const moveItemToZone = useCallback(
    (itemId: string, destinationZoneId: string | null) => {
      dispatch({ type: 'moveItem', itemId, destinationZoneId, items, zoneIds });
      dispatch({ type: 'evaluate', totalItems, onComplete });
    },
    [items, zoneIds, totalItems, onComplete],
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
          ? (state.placements[sourceZone][source.index]?.id ?? '')
          : state.availableItems[source.index]?.id ?? '',
        destinationZone,
      );
    },
    [state.placements, state.availableItems, moveItemToZone]
  );

  const reset = useCallback(() => {
    dispatch({ type: 'reset', items, zoneIds, shuffleItems });
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
