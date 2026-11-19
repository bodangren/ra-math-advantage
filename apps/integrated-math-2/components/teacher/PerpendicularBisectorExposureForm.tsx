"use client";
import { useRef, useState } from "react";
export function PerpendicularBisectorExposureForm({
  classId,
  studentId,
  submissionId,
}: {
  classId: string;
  studentId: string;
  submissionId: string;
}) {
  const [message, setMessage] = useState("");
  const key = useRef<{ identity: string; value: string } | null>(null);
  const [pending, setPending] = useState(false);
  async function submit(data: FormData) {
    if (pending) return;
    if (key.current?.identity !== submissionId)
      key.current = { identity: submissionId, value: crypto.randomUUID() };
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/teacher/perpendicular-bisector-exposure", {
        method: "POST",
        headers: { "content-type": "application/json", "Idempotency-Key": key.current.value },
        body: JSON.stringify({
          classId: data.get("classId"),
          studentId: data.get("studentId"),
          submissionId: data.get("submissionId"),
        }),
      });
      if (response.ok) key.current = null;
      setMessage(response.ok ? "Teacher exposure recorded." : "Teacher exposure was not recorded.");
    } catch {
      setMessage("Teacher exposure was not recorded.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form action={submit} className="space-y-3 mt-3">
      <input type="hidden" name="classId" value={classId} />
      <input type="hidden" name="studentId" value={studentId} />
      <input type="hidden" name="submissionId" value={submissionId} />
      <button className="btn-primary" disabled={pending}>
        Confirm teacher exposure
      </button>
      <p role="status">{message}</p>
    </form>
  );
}
