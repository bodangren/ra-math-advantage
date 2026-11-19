import { requireActiveRequestSessionClaims } from "@/lib/auth/server";
import { NextRequest, NextResponse } from "next/server";
import { getDatasetAsset } from "@/lib/server/lesson-assets";

/**
 * Serves a dataset CSV file by filename for authenticated users.
 *
 * @param request - The incoming Next.js request with session cookie.
 * @param context - Route params containing the filename string.
 * @returns A CSV file response with appropriate content headers.
 * @throws Returns 400 for invalid filenames, 404 if file not found.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> },
) {
  const session = await requireActiveRequestSessionClaims(request);
  if (session instanceof Response) {
    return session;
  }

  const params = await context.params;
  const { filename } = params;

  if (
    !/^unit_0[1-8]_(class_snapshot_dataset|class_dataset|group_dataset_0[1-6])\.csv$/.test(filename)
  ) {
    return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
  }

  const fileBuffer = getDatasetAsset(filename);
  if (fileBuffer === null) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
