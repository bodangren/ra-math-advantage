import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Topic11ExposureForm } from "@/components/course/Topic11ExposureForm";

const props = {
  studentId: "student",
  studentName: "Alex",
  submissionId: "source",
  lessonTitle: "Change in Tandem",
  submittedAt: Date.UTC(2026, 8, 7, 10),
  classes: [
    { id: "class-a", name: "Morning class" },
    { id: "class-b", name: "Afternoon class" },
  ],
};
afterEach(() => vi.unstubAllGlobals());

describe("Topic 1.1 teacher confirmation", () => {
  it("shows the exact learner, lesson, source state and time", () => {
    render(<Topic11ExposureForm {...props} />);
    expect(screen.getByText("Alex")).toBeInTheDocument();
    expect(screen.getByText("Unit 1 Topic 1.1: Change in Tandem")).toBeInTheDocument();
    expect(
      screen.getByText("Worked example: Intervals of increase and decrease"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Student acknowledgement saved. Teacher confirmation is pending."),
    ).toBeInTheDocument();
    expect(document.querySelector("time")).toHaveAttribute(
      "dateTime",
      new Date(props.submittedAt).toISOString(),
    );
  });

  it("locks selection while pending, retains the request after failure, and confirms success", async () => {
    let rejectRequest: (reason: Error) => void = () => {};
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((_resolve, reject) => {
            rejectRequest = reject;
          }),
      )
      .mockResolvedValueOnce(new Response(JSON.stringify({ delivery: "replay" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<Topic11ExposureForm {...props} />);
    const select = screen.getByRole("combobox", { name: "Class" });
    fireEvent.change(select, { target: { value: "class-b" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm classroom introduction" }));
    expect(select).toBeDisabled();
    expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled();
    await act(async () => rejectRequest(new Error("Network failed")));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Could not save the confirmation. Try again.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirm classroom introduction" }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent("Classroom introduction confirmed."),
    );
    expect(fetchMock.mock.calls[0][1].body).toBe(fetchMock.mock.calls[1][1].body);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      action: "recordTopic11Exposure",
      classId: "class-b",
      studentId: "student",
      submissionId: "source",
    });
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("keeps the selected tuple after a malformed success and ignores a later selector change", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ ok: true }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ delivery: "new" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<Topic11ExposureForm {...props} />);
    const select = screen.getByRole("combobox", { name: "Class" });
    fireEvent.change(select, { target: { value: "class-b" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm classroom introduction" }));
    await screen.findByRole("alert");
    expect(select).toBeDisabled();
    fireEvent.change(select, { target: { value: "class-a" } });
    fireEvent.click(screen.getByRole("button", { name: "Confirm classroom introduction" }));
    await screen.findByRole("status");
    expect(fetchMock.mock.calls[1][1].body).toBe(fetchMock.mock.calls[0][1].body);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({
      action: "recordTopic11Exposure",
      classId: "class-b",
      studentId: "student",
      submissionId: "source",
    });
  });

  it("prevents two synchronous submissions while the first request is pending", () => {
    const fetchMock = vi.fn(() => new Promise<Response>(() => undefined));
    vi.stubGlobal("fetch", fetchMock);
    render(<Topic11ExposureForm {...props} />);
    const form = screen
      .getByRole("button", { name: "Confirm classroom introduction" })
      .closest("form")!;
    fireEvent.submit(form);
    fireEvent.submit(form);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not offer confirmation without an eligible class", () => {
    render(<Topic11ExposureForm {...props} classes={[]} />);
    expect(screen.getByText("No active class has this lesson assigned.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

it("preserves confirmation from server data after a page reload", () => {
  render(<Topic11ExposureForm {...props} teacherConfirmed />);
  expect(screen.getByRole("status")).toHaveTextContent("Classroom introduction confirmed.");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
