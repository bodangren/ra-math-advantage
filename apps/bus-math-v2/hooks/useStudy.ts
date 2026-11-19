"use client";

import { useCallback, useEffect, useState } from "react";
import type { FunctionArgs, FunctionReturnType } from "convex/server";
import type { internal } from "@/convex/_generated/api";
import type { LanguageMode } from "@/lib/study/types";
import type { GlossaryTerm } from "@/lib/study/glossary";

type StudyApi = typeof internal.study;
type StudyArgs<K extends keyof StudyApi> = Omit<FunctionArgs<StudyApi[K]>, "userId">;
async function requestStudy<K extends keyof StudyApi>(
  operation: K,
  args: StudyArgs<K>,
  method: "GET" | "POST",
): Promise<FunctionReturnType<StudyApi[K]>> {
  const body = JSON.stringify({ operation, args });
  const response = await fetch(
    method === "GET" ? `/api/study?request=${encodeURIComponent(body)}` : "/api/study",
    method === "GET"
      ? { cache: "no-store" }
      : { method, headers: { "Content-Type": "application/json" }, body },
  );
  if (!response.ok) throw new Error("Unable to load or save study data.");
  return response.json();
}
function useStudyQuery<K extends keyof StudyApi>(operation: K, args: StudyArgs<K> | "skip") {
  const [value, setValue] = useState<FunctionReturnType<StudyApi[K]>>();
  const [error, setError] = useState<Error | null>(null);
  const requestKey = JSON.stringify(args);
  useEffect(() => {
    if (requestKey === JSON.stringify("skip")) return;
    let active = true;
    const load = () => {
      void requestStudy(operation, JSON.parse(requestKey), "GET")
        .then((result) => {
          if (active) {
            setValue(result);
            setError(null);
          }
        })
        .catch((reason) => {
          if (active) setError(reason);
        });
    };
    load();
    window.addEventListener("bm2-study-change", load);
    return () => {
      active = false;
      window.removeEventListener("bm2-study-change", load);
    };
  }, [operation, requestKey]);
  if (error) throw error;
  return value;
}
function useStudyMutation<K extends keyof StudyApi>(operation: K) {
  return useCallback(
    async (args: StudyArgs<K>) => {
      const result = await requestStudy(operation, args, "POST");
      window.dispatchEvent(new Event("bm2-study-change"));
      return result;
    },
    [operation],
  );
}

/** Returns the current user's study preferences and a mutation to update them. */
export function useStudyPreferences() {
  const preferences = useStudyQuery("getStudyPreferences", {});
  const updatePreferences = useStudyMutation("updatePreferences");

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
  return useStudyQuery("getTermMasteryByUnit", { unitNumber: unitNumber ?? undefined });
}

/** Queries glossary terms that are due for spaced-repetition review. */
export function useDueTerms() {
  return useStudyQuery("getDueTerms", {});
}

/**
 * Queries recent study sessions with an optional limit.
 * @param limit - Maximum number of sessions to return.
 */
export function useRecentSessions(limit?: number) {
  return useStudyQuery("getRecentSessions", { limit });
}

/** Returns the mutation function to process a glossary term review. */
export function useProcessReview() {
  return useStudyMutation("processReview");
}

/** Returns the mutation function to record a study session. */
export function useRecordSession() {
  return useStudyMutation("recordSession");
}

/** Queries all study data for CSV/JSON export. */
export function useExportData() {
  return useStudyQuery("getExportData", {});
}

/**
 * Queries practice test results for an optional unit.
 * @param unitNumber - If provided, filters results to this unit.
 */
export function usePracticeTestResults(unitNumber?: number) {
  return useStudyQuery(
    "getPracticeTestResults",
    unitNumber !== undefined ? { unitNumber } : "skip",
  );
}

/** Returns the mutation function to save a practice test result. */
export function useSavePracticeTestResult() {
  return useStudyMutation("savePracticeTestResult");
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
