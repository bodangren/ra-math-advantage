import { fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { PerpendicularBisectorExposureForm } from "@/components/teacher/PerpendicularBisectorExposureForm";
it("submits hidden selected identity and retains its retry key", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce(new Response("", { status: 500 }))
    .mockResolvedValueOnce(new Response("{}", { status: 200 }));
  vi.stubGlobal("fetch", fetchMock);
  render(<PerpendicularBisectorExposureForm classId="c" studentId="s" submissionId="x" />);
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button"));
  await screen.findByText(/not recorded/i);
  fireEvent.click(screen.getByRole("button"));
  await screen.findByText(/recorded/i);
  const [a, b] = fetchMock.mock.calls;
  expect((a[1].headers as Record<string, string>)["Idempotency-Key"]).toBe(
    (b[1].headers as Record<string, string>)["Idempotency-Key"],
  );
  expect(JSON.parse(String(b[1].body))).toEqual({
    classId: "c",
    studentId: "s",
    submissionId: "x",
  });
  vi.unstubAllGlobals();
});
