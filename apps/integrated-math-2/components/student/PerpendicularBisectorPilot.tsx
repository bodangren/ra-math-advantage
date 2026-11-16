"use client";
import { useRef, useState } from "react";

type Item = { activityId: string; mode: "worked_example" | "guided_practice" | "independent_practice"; prompt: string; answer?: number; hint?: string; stepPrompts?: string[]; hints?: string[]; revealPolicy?: "after_attempt"; solutionSteps?: Array<{ description: string; expression?: string }> };
export function PerpendicularBisectorPilot({ items }: { items: Item[] }) {
  const [index, setIndex] = useState(0), [answer, setAnswer] = useState(""), [message, setMessage] = useState(""), [hintsUsed, setHintsUsed] = useState(0), [guidedAttempted, setGuidedAttempted] = useState(false);
  const keys = useRef(new Map<string, { key: string; body: string }>()), item = items[index];
  const pendingRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  if (!item) return <p>{items.length ? "Practice complete." : "This practice is not available."}</p>;
  async function submit(rawResponse: string) {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setIsSaving(true);
    try {
    if (item.mode === "guided_practice") setGuidedAttempted(true);
    const body = JSON.stringify({ rawResponse, hintsUsed, revealStepsSeen: 0 });
    let request = keys.current.get(item.activityId);
    if (!request || request.body !== body) { request = { key: crypto.randomUUID(), body }; keys.current.set(item.activityId, request); }
    const response = await fetch(`/api/activities/${encodeURIComponent(item.activityId)}/submissions`, { method: "POST", headers: { "content-type": "application/json", "Idempotency-Key": request.key }, body });
    if (!response.ok) throw new Error("Your response was not saved. Submit it again.");
    const result = await response.json() as { kind?: string; score?: number; maxScore?: number; feedback?: string };
    if (item.mode === "worked_example") { if (result.kind !== "acknowledged") throw new Error("The server response is invalid."); }
    else { if (result.kind !== "graded" || typeof result.score !== "number" || typeof result.maxScore !== "number") throw new Error("The server response is invalid."); if (result.score < result.maxScore) { keys.current.delete(item.activityId); setMessage(result.feedback ?? "Check your answer and try again."); return; } }
    keys.current.delete(item.activityId); setAnswer(""); setHintsUsed(0); setGuidedAttempted(false); setMessage(""); setIndex(value => value + 1);
    } finally {
      pendingRef.current = false;
      setIsSaving(false);
    }
  }
  const hints = item.hints ?? (item.hint ? [item.hint] : []);
  const visibleHints = guidedAttempted ? hints.slice(0, hintsUsed) : [];
  return <section className="card-surface p-6 space-y-4"><h2>{item.mode.replaceAll("_", " ")}</h2><p>{item.prompt}</p>{item.mode === "worked_example" ? <><p>Answer: {item.answer}</p><ol>{item.solutionSteps?.map(step => <li key={step.description}>{step.description} {step.expression}</li>)}</ol><button className="btn-primary" disabled={isSaving} onClick={() => void submit("").catch(error => setMessage(error.message))}>Continue</button></> : <><>{item.mode === "guided_practice" && <ol>{item.stepPrompts?.map(step => <li key={step}>{step}</li>)}</ol>}</><label htmlFor={item.activityId}>Your answer</label><input id={item.activityId} disabled={isSaving} value={answer} onChange={event => setAnswer(event.target.value)} className="input-field" />{item.mode === "guided_practice" && hints.length ? <button className="btn-secondary" disabled={isSaving || !guidedAttempted || hintsUsed >= hints.length} onClick={() => setHintsUsed(value => value + 1)}>Show next hint</button> : null}{visibleHints?.map(hint => <p key={hint}>{hint}</p>)}<button className="btn-primary" disabled={isSaving || !answer} onClick={() => void submit(answer).catch(error => setMessage(error.message))}>Check answer</button></>}<p role="status">{message}</p></section>;
}
