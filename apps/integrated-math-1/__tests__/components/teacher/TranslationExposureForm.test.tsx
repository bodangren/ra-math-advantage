import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TranslationExposureForm } from "@/components/teacher/TranslationExposureForm";
const candidates = [
  {
    classId: "class-a",
    studentId: "student-a",
    submissionId: "submission-a",
    className: "Algebra",
    studentName: "Ari",
    lessonTitle: "Expressions",
    answer: "9 + 11",
    score: 1,
    maxScore: 1,
    submittedAt: 1,
  },
  {
    classId: "class-b",
    studentId: "student-b",
    submissionId: "submission-b",
    className: "Math",
    studentName: "Bo",
    lessonTitle: "Expressions",
    answer: "11 - 9",
    score: 0,
    maxScore: 1,
    submittedAt: 2,
  },
];
const clickSubmit = () =>
  fireEvent.click(screen.getByRole("button", { name: /Record exposure|Confirm instruction/ }));
afterEach(() => vi.unstubAllGlobals());

describe("TranslationExposureForm", () => {
  it("shows source context and retains the exact request after a rejected network Promise", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("Failed to fetch"))
      .mockResolvedValueOnce(new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);
    render(<TranslationExposureForm candidates={candidates.slice(0, 1)} />);
    expect(screen.getByText(/9 \+ 11/)).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    clickSubmit();
    await screen.findByText(/not recorded|could not be saved/i);
    clickSubmit();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const [a, b] = fetchMock.mock.calls;
    expect(a[1].body).toBe(b[1].body);
    expect(a[1].headers["Idempotency-Key"]).toBe(b[1].headers["Idempotency-Key"]);
    expect(JSON.parse(b[1].body)).toEqual({
      classId: "class-a",
      studentId: "student-a",
      submissionId: "submission-a",
    });
    await waitFor(() => expect(screen.queryByRole("button")).not.toBeInTheDocument());
  });

  it("freezes selection and prevents duplicate clicks during an unresolved save", async () => {
    let finish!: (response: Response) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise<Response>((resolve) => {
          finish = resolve;
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<TranslationExposureForm candidates={candidates} />);
    clickSubmit();
    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();
    fireEvent.click(screen.getByRole("button"));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () => finish(new Response("{}")));
  });

  it("uses a different key for a different source after a failed save", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<TranslationExposureForm candidates={candidates} />);
    clickSubmit();
    await screen.findByText(/not recorded|could not be saved/i);
    const select = screen.getByRole("combobox");
    const options = screen.getAllByRole("option");
    fireEvent.change(select, { target: { value: (options[1] as HTMLOptionElement).value } });
    clickSubmit();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    const [a, b] = fetchMock.mock.calls;
    expect(a[1].headers["Idempotency-Key"]).not.toBe(b[1].headers["Idempotency-Key"]);
    expect(JSON.parse(b[1].body).submissionId).toBe("submission-b");
  });

  it("shows an empty state without controls", () => {
    render(<TranslationExposureForm candidates={[]} />);
    expect(screen.getByText(/No Guided submissions/)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
