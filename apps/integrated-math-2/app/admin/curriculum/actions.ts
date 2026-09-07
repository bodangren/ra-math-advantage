"use server";
import { ConvexError } from "convex/values";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdminSessionClaims } from "@/lib/auth/server";
import { fetchInternalMutation, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";
export async function publishDraft(form: FormData) {
  const claims = await requireAdminSessionClaims("/admin/curriculum");
  const value = form.get("versionId");
  if (typeof value !== "string" || !value || value.length > 128)
    redirect("/admin/curriculum");
  let error = "";
  try {
    await fetchInternalMutation(internal.publication.publishLesson, {
      adminId: claims.sub as Id<"profiles">,
      versionId: value as Id<"lesson_versions">,
    });
  } catch (cause) {
    error = cause instanceof ConvexError ? "invalid_content" : "unavailable";
  }
  if (!error) revalidatePath("/admin/curriculum");
  redirect(
    `/admin/curriculum/${encodeURIComponent(value)}${error ? `?error=${error}` : "?published=1"}`,
  );
}
