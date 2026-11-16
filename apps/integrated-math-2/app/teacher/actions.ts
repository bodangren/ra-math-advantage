"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireTeacherSessionClaims } from "@/lib/auth/server";
import { fetchInternalMutation, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";
export async function createClass(form: FormData) {
  const claims = await requireTeacherSessionClaims("/teacher/dashboard");
  const name = form.get("name");
  if (typeof name !== "string" || !name.trim() || name.length > 100)
    throw Error("Enter a class name.");
  const id = await fetchInternalMutation(internal.classes.createClass, {
    teacherId: claims.sub as Id<"profiles">,
    name,
    joinCode: crypto.randomUUID(),
  });
  revalidatePath("/teacher/dashboard");
  redirect(`/teacher/classes/${id}`);
}
export async function assignLesson(form: FormData) {
  const claims = await requireTeacherSessionClaims("/teacher/dashboard");
  const classId = form.get("classId");
  const lessonId = form.get("lessonId");
  if (typeof classId !== "string" || typeof lessonId !== "string")
    throw Error("Select a class and lesson.");
  await fetchInternalMutation(internal.classes.assignLesson, {
    teacherId: claims.sub as Id<"profiles">,
    classId: classId as Id<"classes">,
    lessonId: lessonId as Id<"lessons">,
  });
  revalidatePath(`/teacher/classes/${classId}`);
}
