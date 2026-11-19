import { test, expect, type Page } from "@playwright/test";
import { ConvexHttpClient } from "convex/browser";
import { makeFunctionReference } from "convex/server";

async function login(page: Page, username: string, password: string) {
  await page.goto("/auth/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Username", { exact: true }).fill(username);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Login", exact: true }).click();
  await expect(page).toHaveURL(/\/(student|teacher)\/dashboard/);
}

test("public navigation works and teacher workbooks stay private", async ({ page }) => {
  for (const url of ["/search", "/backmatter/glossary"]) {
    const response = await page.goto(url);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
  }
  const staticFile = await page.request.get("/workbooks/unit_01_lesson_04_teacher.xlsx");
  expect(staticFile.status()).toBe(404);
  const privateFile = await page.request.get("/api/workbooks/01/04/teacher");
  expect([401, 403]).toContain(privateFile.status());
  await page.goto("/auth/login");
  await expect(page.getByRole("heading", { name: "Login", exact: true })).toBeVisible();
});

test("student saves graded and manual work; teacher retrieves the saved evidence", async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(120_000);
  await login(
    page,
    process.env.BM2_E2E_TEACHER ?? "demo_teacher",
    process.env.BM2_E2E_TEACHER_PASSWORD ?? "demo123",
  );
  const created = await page.request.post("/api/users/create-student", {
    data: { username: `bm2_review_${Date.now()}`, displayName: "Business Math Review Student" },
  });
  expect(created.status()).toBe(201);
  const student = await created.json();
  const teacherFile = await page.request.get("/api/workbooks/01/04/teacher");
  expect(teacherFile.status()).toBe(200);
  expect(teacherFile.headers()["cache-control"]).toContain("no-store");
  expect((await teacherFile.body()).subarray(0, 2).toString()).toBe("PK");

  const studentContext = await browser.newContext({
    baseURL,
    ignoreHTTPSErrors: process.env.BM2_E2E_LOCAL_HTTPS === "1",
  });
  const learner = await studentContext.newPage();
  try {
    await login(learner, student.username, student.password);
    const queue = await learner.request.get("/api/srs");
    expect(queue.status()).toBe(200);
    const preferences = await learner.request.get("/api/study", {
      params: { request: JSON.stringify({ operation: "getStudyPreferences", args: {} }) },
    });
    expect(preferences.status()).toBe(200);
    expect((await learner.request.get("/api/workbooks/01/04/teacher")).status()).toBe(403);

    const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
    const lesson = await client.query(makeFunctionReference<"query">("api:getLessonWithContent"), {
      slug: "unit-2-lesson-1",
    });
    const complete = (phaseNumber: number) =>
      learner.request.post("/api/phases/complete", {
        data: {
          lessonId: lesson.lesson._id,
          phaseNumber,
          timeSpent: 1,
          idempotencyKey: crypto.randomUUID(),
        },
      });
    expect((await complete(3)).status()).toBe(403);
    expect((await complete(1)).status()).toBe(200);
    expect((await complete(2)).status()).toBe(200);
    expect((await complete(3)).status()).toBe(409);

    await learner.goto("/student/lesson/unit-2-lesson-1?phase=3");
    await expect(
      learner.getByRole("button", { name: "Submit answers", exact: true }),
    ).toBeVisible();
    await learner.getByRole("textbox").fill("3,500");
    const savePromise = learner.waitForResponse(
      (response) =>
        response.url().endsWith("/api/progress/assessment") &&
        response.request().method() === "POST",
    );
    await learner.getByRole("button", { name: "Submit answers", exact: true }).click();
    const save = await savePromise;
    expect(save.status()).toBe(200);
    const saved = await save.json();
    expect(saved).toMatchObject({ score: 1, maxScore: 1, percentage: 100, attemptOrdinal: 1 });
    await expect(learner.getByText("Score: 1/1 (100%)")).toBeVisible();
    const replay = await learner.request.post("/api/progress/assessment", {
      headers: { "Idempotency-Key": save.request().headers()["idempotency-key"] },
      data: save.request().postDataJSON(),
    });
    expect(replay.status()).toBe(200);
    expect(await replay.json()).toEqual(saved);
    await expect
      .poll(async () => {
        const response = await learner.request.get("/api/lessons/unit-2-lesson-1/progress");
        const progress = await response.json();
        return progress.phases.find((phase: { phaseNumber: number }) => phase.phaseNumber === 3)
          ?.status;
      })
      .toBe("completed");

    await learner.goto("/student/lesson/unit-2-lesson-1?phase=4");
    const answers = learner.locator("textarea");
    await expect(answers).toHaveCount(2);
    await answers
      .nth(0)
      .fill(
        "Workbook: /api/workbooks/02/04/student. Cash debit 2000 and Capital credit 2000. The entry difference is 0.",
      );
    await answers
      .nth(1)
      .fill(
        "Change the investment from 2000 to 2500. Both Cash and Capital increase by 500. The entry difference remains 0.",
      );
    const manualPromise = learner.waitForResponse(
      (response) =>
        response.url().endsWith("/api/progress/assessment") &&
        response.request().method() === "POST",
    );
    await learner.getByRole("button", { name: "Save Reflection", exact: true }).click();
    expect((await manualPromise).status()).toBe(200);
    await expect(learner.getByText("Your work is saved for teacher review.")).toBeVisible();

    const detailResponse = await page.request.get("/api/teacher/submission-detail", {
      params: { studentId: student.studentId, lessonId: lesson.lesson._id },
    });
    expect(detailResponse.status()).toBe(200);
    const detail = await detailResponse.json();
    const evidence = detail.phases.flatMap((phase: { evidence: unknown[] }) => phase.evidence);
    expect(JSON.stringify(evidence)).toContain("3,500");
    expect(JSON.stringify(evidence)).toContain("entry difference remains 0");
    expect(
      (
        await learner.request.get("/api/teacher/submission-detail", {
          params: { studentId: student.studentId, lessonId: lesson.lesson._id },
        })
      ).status(),
    ).toBe(403);
  } finally {
    await studentContext.close();
  }
});
