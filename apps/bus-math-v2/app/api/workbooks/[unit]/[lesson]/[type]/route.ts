import { requireActiveRequestSessionClaims } from "@/lib/auth/server";
import { NextRequest, NextResponse } from "next/server";
import { getWorkbookAsset } from "@/lib/server/lesson-assets";

/**
 * Serves a workbook Excel file by unit, lesson, and type (student or teacher).
 *
 * @param request - The incoming Next.js request with session cookie.
 * @param context - Route params containing unit, lesson, and type strings.
 * @returns An xlsx file response with appropriate content headers.
 * @throws Returns 400 for invalid params, 403 for teacher-only access violations,
 *   404 if file not found.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ unit: string; lesson: string; type: "student" | "teacher" }> },
) {
  const session = await requireActiveRequestSessionClaims(request);
  if (session instanceof Response) {
    return session;
  }

  const params = await context.params;
  const { unit, lesson, type } = params;

  if (type !== "student" && type !== "teacher") {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }

  if (!/^\d{2}$/.test(unit) || !/^\d{2}$/.test(lesson)) {
    return NextResponse.json({ error: "Invalid unit or lesson" }, { status: 400 });
  }

  const role = session.role;
  const requestedType = type;

  if (requestedType === "teacher" && role !== "teacher" && role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const fileName = `unit_${unit}_lesson_${lesson}_${requestedType}.xlsx`;
  const fileBuffer = getWorkbookAsset(fileName, type);
  if (fileBuffer === null) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return new NextResponse(fileBuffer, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
