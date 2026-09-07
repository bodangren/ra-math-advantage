"use server";
import { ConvexError } from "convex/values";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStudentSessionClaims } from "@/lib/auth/server";
import { fetchInternalMutation, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";
export async function joinClass(form: FormData) {
  const claims = await requireStudentSessionClaims("/student/dashboard");
  const code = form.get("classCode");
  if (typeof code !== "string" || code.trim().length < 12 || code.trim().length > 80)
    redirect("/student/dashboard?join=invalid_class");
  let result = "joined";
  try {
    await fetchInternalMutation(internal.classes.joinClass, {
      studentId: claims.sub as Id<"profiles">, classCode: code.trim(),
    });
  } catch (cause) {
    result = cause instanceof ConvexError
      ? cause.data === "enrollment_closed" ? "enrollment_closed" : "invalid_class"
      : "unavailable";
  }
  if (result === "joined") revalidatePath("/student/dashboard");
  redirect(`/student/dashboard?join=${result}`);
}
