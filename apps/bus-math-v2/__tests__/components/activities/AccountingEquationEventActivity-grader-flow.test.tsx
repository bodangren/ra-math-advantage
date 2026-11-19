import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { AccountingEquationEventActivity } from "@/components/activities/accounting/AccountingEquationEventActivity";
import { accountingEquationEventDrafts } from "@/lib/practice/drafts/accounting-equation-event";
import {
  gradeAccountingEquationEventSubmission,
  type AccountingEquationEventGradeResult,
} from "@/lib/practice/grading/accounting-equation-event";

function enterEndingTotals(caseIndex: number, values: [string, string, string]) {
  fireEvent.change(screen.getAllByLabelText("Ending Assets amount")[caseIndex * 2]!, {
    target: { value: values[0] },
  });
  fireEvent.change(screen.getAllByLabelText("Ending Liabilities amount")[caseIndex * 2]!, {
    target: { value: values[1] },
  });
  fireEvent.change(screen.getAllByLabelText("Ending Equity amount")[caseIndex * 2]!, {
    target: { value: values[2] },
  });
}

describe("AccountingEquationEventActivity UI-to-grader flow", () => {
  it("grades both literal Guided cases and adds the per-case hint counts", async () => {
    let grade: AccountingEquationEventGradeResult | undefined;
    const onSubmit = vi.fn(async (envelope) => {
      grade = gradeAccountingEquationEventSubmission(envelope);
    });
    render(
      <AccountingEquationEventActivity
        {...accountingEquationEventDrafts.guided}
        onSubmit={onSubmit}
      />,
    );

    const hintButtons = screen.getAllByRole("button", { name: "Use hint" });
    fireEvent.click(hintButtons[0]!);
    fireEvent.click(hintButtons[1]!);
    fireEvent.click(screen.getByRole("radio", { name: "Cash: Asset" }));
    fireEvent.click(screen.getAllByRole("radio", { name: "Equipment: Asset" })[0]!);
    fireEvent.click(screen.getAllByRole("radio", { name: "Equipment: Asset" })[1]!);
    fireEvent.click(screen.getByRole("radio", { name: "Amount Owed: Liability" }));
    fireEvent.click(hintButtons[1]!);
    fireEvent.click(screen.getByRole("radio", { name: "Cash: Decrease" }));
    fireEvent.click(screen.getAllByRole("radio", { name: "Equipment: Increase" })[0]!);
    fireEvent.click(screen.getAllByRole("radio", { name: "Equipment: Increase" })[1]!);
    fireEvent.click(screen.getByRole("radio", { name: "Amount Owed: Increase" }));
    fireEvent.change(screen.getByLabelText("cash_purchase Cash amount"), {
      target: { value: "2000" },
    });
    fireEvent.change(screen.getByLabelText("cash_purchase Equipment amount"), {
      target: { value: "2000" },
    });
    fireEvent.change(screen.getByLabelText("credit_purchase Equipment amount"), {
      target: { value: "2000" },
    });
    fireEvent.change(screen.getByLabelText("credit_purchase Amount Owed amount"), {
      target: { value: "2000" },
    });
    enterEndingTotals(0, ["7000", "2000", "5000"]);
    enterEndingTotals(1, ["7000", "2000", "5000"]);
    fireEvent.change(screen.getByLabelText("cash_purchase equation difference"), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText("credit_purchase equation difference"), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: {
        value:
          "Cash purchases exchange assets. Credit purchases increase assets and liabilities equally.",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit event analysis" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(grade).toMatchObject({ automaticScore: 20, automaticMaxScore: 20, hintsUsed: 3 });
    expect(grade?.manualReview).toMatchObject({
      partId: "explanation",
      status: "manual_review_required",
    });
  });

  it("keeps a negative Independent ending total and scores it as wrong", async () => {
    let grade: AccountingEquationEventGradeResult | undefined;
    let submittedEnvelope: unknown;
    const onSubmit = vi.fn(async (envelope) => {
      submittedEnvelope = envelope;
      grade = gradeAccountingEquationEventSubmission(envelope);
    });
    render(
      <AccountingEquationEventActivity
        {...accountingEquationEventDrafts.independent}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("radio", { name: "Cash: Liability" }));
    fireEvent.click(screen.getByRole("radio", { name: "Owner's Equity: Equity" }));
    fireEvent.click(screen.getByRole("radio", { name: "Bank Loan: Liability" }));
    fireEvent.click(screen.getByRole("radio", { name: "Equipment: Asset" }));
    fireEvent.click(screen.getByRole("radio", { name: "Cash: Increase" }));
    fireEvent.click(screen.getByRole("radio", { name: "Owner's Equity: Increase" }));
    fireEvent.click(screen.getByRole("radio", { name: "Bank Loan: No effect" }));
    fireEvent.click(screen.getByRole("radio", { name: "Equipment: No effect" }));
    fireEvent.change(screen.getByLabelText("owner_investment Cash amount"), {
      target: { value: "1000" },
    });
    fireEvent.change(screen.getByLabelText("owner_investment Owner's Equity amount"), {
      target: { value: "1000" },
    });
    fireEvent.change(screen.getByLabelText("owner_investment Bank Loan amount"), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText("owner_investment Equipment amount"), {
      target: { value: "0" },
    });
    enterEndingTotals(0, ["-6000", "1000", "5000"]);
    fireEvent.change(screen.getByLabelText("owner_investment equation difference"), {
      target: { value: "0" },
    });
    fireEvent.change(screen.getByLabelText("Explanation"), {
      target: { value: "Cash and equity increase by the same 1000 amount." },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit event analysis" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(submittedEnvelope).toMatchObject({
      answers: { "owner_investment.ending_assets": -6000 },
    });
    expect(grade).toMatchObject({ automaticScore: 14, automaticMaxScore: 16, hintsUsed: 0 });
    expect(
      grade?.parts.find((part) => part.partId === "owner_investment.account_categories"),
    ).toMatchObject({ score: 3, maxScore: 4, isCorrect: false });
    expect(
      grade?.parts.find((part) => part.partId === "owner_investment.ending_assets"),
    ).toMatchObject({ rawAnswer: -6000, isCorrect: false, score: 0, maxScore: 1 });
    expect(grade?.manualReview.status).toBe("manual_review_required");
  });
});
