import { requireActiveRequestSessionClaims } from "@/lib/auth/server";
import { NextRequest, NextResponse } from "next/server";
import { getPdfAsset } from "@/lib/server/lesson-assets";

/**
 * Serves a PDF file by name from the public/pdfs directory.
 *
 * @param request - The incoming Next.js request with session cookie.
 * @param context - Route params containing the pdfName string.
 * @returns A PDF file response with appropriate content headers.
 * @throws Returns 400 for invalid names, 404 if file not found.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ pdfName: string }> }) {
  const session = await requireActiveRequestSessionClaims(request);
  if (session instanceof Response) {
    return session;
  }

  const params = await context.params;
  const { pdfName } = params;

  if (!/^[\w-]+\.pdf$/.test(pdfName)) {
    return NextResponse.json({ error: "Invalid PDF name" }, { status: 400 });
  }

  const fileBuffer = getPdfAsset(pdfName);
  if (fileBuffer === null) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdfName}"`,
    },
  });
}
