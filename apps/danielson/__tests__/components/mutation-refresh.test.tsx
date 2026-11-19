import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { AccountCreateForm } from "../../components/account-create-form";
import { AdminChangeForm } from "../../components/admin-change-form";
import { ImprovementPlanProposalForm } from "../../components/improvement-plan-proposal-form";
import { ReportCommentForm } from "../../components/report-comment-form";
import { TeacherResponseForm } from "../../components/teacher-response-form";

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ planId: "plan:one", revision: 1, temporaryPassword: "one-time-value" }),
    }),
  );
});

it("updates account choices without losing the one-time password", async () => {
  render(<AccountCreateForm />);
  fireEvent.submit(screen.getByRole("button", { name: "Create account" }));
  await screen.findByText("one-time-value");
  expect(router.refresh).toHaveBeenCalledOnce();
  expect(screen.getByText("one-time-value")).toBeVisible();
});

it.each(["admin", "comment", "response"])("refreshes the %s view after saving", async (form) => {
  if (form === "admin")
    render(
      <AdminChangeForm
        endpoint="/api/admin/departments"
        title="Department"
        fields={[]}
        submitLabel="Save"
      />,
    );
  if (form === "comment")
    render(<ReportCommentForm observationId="observation" commentType="public" />);
  if (form === "response") render(<TeacherResponseForm observationId="observation" />);
  fireEvent.submit(screen.getByRole("button"));
  await waitFor(() => expect(router.refresh).toHaveBeenCalledOnce());
});

it("opens the saved proposal instead of leaving a null plan identity in the form", async () => {
  render(
    <ImprovementPlanProposalForm
      teacherProfileId="teacher"
      teacherDisplayName="Teacher"
      position="Teacher"
      departmentId="department"
      departmentName="Department"
      targetOptions={[]}
    />,
  );
  fireEvent.submit(screen.getByRole("button", { name: "Propose plan" }));
  await waitFor(() => expect(router.push).toHaveBeenCalledWith("/improvement-plans/plan%3Aone"));
});
