"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { LanguageMode } from "@/lib/study/types";
import type { GlossaryTerm } from "@/lib/study/glossary";

/** Returns the current user's study preferences and a mutation to update them. */
export function useStudyPreferences() {
  const preferences = useQuery(api.study.getStudyPreferences);
  const updatePreferences = useMutation(api.study.updatePreferences);

  return {
    preferences,
    updatePreferences,
    languageMode: (preferences?.languageMode ?? "en_to_en") as LanguageMode,
  };
}

/**
 * Queries term mastery data for an optional unit.
 * @param unitNumber - If provided, filters mastery to this unit.
 */
export function useTermMastery(unitNumber?: number) {
  return useQuery(api.study.getTermMasteryByUnit, { unitNumber: unitNumber ?? undefined });
}

/** Queries glossary terms that are due for spaced-repetition review. */
export function useDueTerms() {
  return useQuery(api.study.getDueTerms);
}

/**
 * Queries recent study sessions with an optional limit.
 * @param limit - Maximum number of sessions to return.
 */
export function useRecentSessions(limit?: number) {
  return useQuery(api.study.getRecentSessions, limit ? { limit } : "skip");
}

/** Returns the mutation function to process a glossary term review. */
export function useProcessReview() {
  return useMutation(api.study.processReview);
}

/** Returns the mutation function to record a study session. */
export function useRecordSession() {
  return useMutation(api.study.recordSession);
}

/** Queries all study data for CSV/JSON export. */
export function useExportData() {
  return useQuery(api.study.getExportData);
}

/**
 * Queries practice test results for an optional unit.
 * @param unitNumber - If provided, filters results to this unit.
 */
export function usePracticeTestResults(unitNumber?: number) {
  return useQuery(api.study.getPracticeTestResults, unitNumber !== undefined ? { unitNumber } : "skip");
}

/** Returns the mutation function to save a practice test result. */
export function useSavePracticeTestResult() {
  return useMutation(api.study.savePracticeTestResult);
}

/**
 * Returns the prompt and answer for a glossary term in the given language mode.
 * @param term - The glossary term with English and Chinese fields.
 * @param languageMode - The active language display mode.
 * @returns An object with `prompt` and `answer` strings.
 */
export function getGlossaryTermDisplay(term: GlossaryTerm, languageMode: LanguageMode) {
  switch (languageMode) {
    case "en_to_en":
      return {
        prompt: term.term_en,
        answer: term.def_en,
      };
    case "en_to_zh":
      return {
        prompt: term.term_en,
        answer: term.term_zh,
      };
    case "zh_to_en":
      return {
        prompt: term.term_zh,
        answer: term.term_en,
      };
    case "zh_to_zh":
      return {
        prompt: term.term_zh,
        answer: term.def_zh,
      };
    default:
      return {
        prompt: term.term_en,
        answer: term.def_en,
      };
  }
}
