import { z } from "zod";
import { requireActiveTeacherRequestClaims } from "@/lib/auth/server";
import { fetchInternalQuery, fetchInternalMutation, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";

const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("reset"),
    studentId: z.string().min(1),
    problemFamilyId: z.string().min(1),
  }),
  z.object({
    action: z.literal("bump"),
    classId: z.string().min(1),
    problemFamilyId: z.string().min(1),
  }),
]);

export async function GET(request: Request) {
  const claims = await requireActiveTeacherRequestClaims(request);
  if (claims instanceof Response) return claims;
  const classId = new URL(request.url).searchParams.get("classId");
  if (!classId) return Response.json({ error: "classId is required" }, { status: 400 });
  try {
    const args = { userId: claims.sub as Id<"profiles">, classId: classId as Id<"classes"> };
    const [health, families, students] = await Promise.all([
      fetchInternalQuery(internal.srs.getClassSrsHealth, args),
      fetchInternalQuery(internal.srs.getWeakFamilies, args),
      fetchInternalQuery(internal.srs.getStrugglingStudents, args),
    ]);
    return Response.json(
      { health, families, students: students.students },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch {
    return Response.json(
      { error: "Unable to load practice data for this class." },
      { status: 403 },
    );
  }
}

export async function POST(request: Request) {
  const claims = await requireActiveTeacherRequestClaims(request);
  if (claims instanceof Response) return claims;
  const parsed = actionSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid practice action" }, { status: 400 });
  try {
    const { problemFamilyId } = parsed.data;
    const userId = claims.sub as Id<"profiles">;
    const result =
      parsed.data.action === "reset"
        ? await fetchInternalMutation(internal.srs.resetStudentCard, {
            userId,
            problemFamilyId,
            studentId: parsed.data.studentId as Id<"profiles">,
          })
        : await fetchInternalMutation(internal.srs.bumpFamilyPriority, {
            userId,
            problemFamilyId,
            classId: parsed.data.classId as Id<"classes">,
          });
    return Response.json(result);
  } catch {
    return Response.json(
      { error: "Unable to change practice data for this class." },
      { status: 403 },
    );
  }
}
