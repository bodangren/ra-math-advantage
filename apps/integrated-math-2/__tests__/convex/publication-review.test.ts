// @vitest-environment node
import { it, expect } from "vitest";
import { database, invoke } from "../helpers/database";
import { listDrafts, previewDraft, publishLesson } from "../../convex/publication";
async function setup(role = "admin") {
  const t = database();
  const adminId = await t.db.insert("profiles", {
    username: "reviewer",
    role,
    organizationId: "org",
  });
  await t.db.insert("auth_credentials", {
    profileId: adminId,
    username: "reviewer",
    role,
    organizationId: "org",
    isActive: true,
  });
  return { ...t, adminId };
}
it("restricts draft review and app publication to active administrators", async () => {
  const t = await setup("teacher");
  const versionId = await t.db.insert("lesson_versions", {
    lessonId: "lesson",
    status: "draft",
  });
  await expect(invoke(listDrafts, t.ctx, { adminId: t.adminId })).rejects.toThrow("not_allowed");
  await expect(invoke(previewDraft, t.ctx, { adminId: t.adminId, versionId })).rejects.toThrow(
    "not_allowed",
  );
  await expect(invoke(publishLesson, t.ctx, { adminId: t.adminId, versionId })).rejects.toThrow(
    "not_allowed",
  );
});
it("paginates drafts and exposes the exact stored answer for administrator review", async () => {
  const t = await setup();
  const lessonId = await t.db.insert("lessons", {
    slug: "module-1-lesson-1",
    title: "Bisectors",
    unitNumber: 1,
  });
  for (let version = 1; version <= 55; version++)
    await t.db.insert("lesson_versions", {
      lessonId,
      title: `Draft ${version}`,
      status: "draft",
      version,
    });
  const first = await invoke<
    { adminId: string; cursor?: string },
    { drafts: Array<{ id: string }>; nextCursor: string | null }
  >(listDrafts, t.ctx, { adminId: t.adminId });
  expect(first.drafts).toHaveLength(50);
  const second = await invoke<
    { adminId: string; cursor?: string },
    { drafts: Array<{ id: string }>; nextCursor: string | null }
  >(listDrafts, t.ctx, {
    adminId: t.adminId,
    cursor: first.nextCursor ?? undefined,
  });
  expect(second.drafts).toHaveLength(5);
  expect(second.nextCursor).toBeNull();
  expect(
    await invoke(previewDraft, t.ctx, {
      adminId: t.adminId,
      versionId: "invalid",
    }),
  ).toBeNull();
  const versionId = first.drafts[0].id;
  const phaseId = await t.db.insert("phase_versions", {
    lessonVersionId: versionId,
    phaseNumber: 1,
    title: "Checkpoint",
  });
  const activityId = await t.db.insert("activities", {
    componentKey: "im2-question",
    props: {
      kind: "numeric",
      prompt: "Find 2 + 3.",
      answer: 5,
      explanation: "Add to get 5.",
    },
  });
  await t.db.insert("phase_sections", {
    phaseVersionId: phaseId,
    sequenceOrder: 1,
    sectionType: "activity",
    content: { activityId },
  });
  const preview = await invoke<
    { adminId: string; versionId: string },
    { phases: Array<{ sections: Array<{ body: string }> }> }
  >(previewDraft, t.ctx, { adminId: t.adminId, versionId });
  expect(preview.phases[0].sections[0].body).toContain("Answer: 5");
  await invoke(publishLesson, t.ctx, { adminId: t.adminId, versionId });
  expect(await t.db.get(versionId)).toMatchObject({ status: "published" });
  t.tables.auth_credentials[0].isActive = false;
  await expect(invoke(previewDraft, t.ctx, { adminId: t.adminId, versionId })).rejects.toThrow(
    "not_allowed",
  );
});
