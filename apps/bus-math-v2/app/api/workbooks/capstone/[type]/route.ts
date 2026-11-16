import { requireActiveRequestSessionClaims } from '@/lib/auth/server';
import { buildCapstoneFilename } from '@math-platform/workbook-pipeline';
import { NextRequest, NextResponse } from 'next/server';
import { getWorkbookAsset } from '@/lib/server/lesson-assets';

/**
 * Serves a capstone workbook Excel file by type (student or teacher).
 *
 * @param request - The incoming Next.js request with session cookie.
 * @param context - Route params containing the type string.
 * @returns An xlsx file response with appropriate content headers.
 * @throws Returns 400 for invalid type, 403 for teacher-only access violations,
 *   404 if file not found.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: 'student' | 'teacher' }> }
) {
  const session = await requireActiveRequestSessionClaims(request);
  if (session instanceof Response) {
    return session;
  }

  const params = await context.params;
  const { type } = params;

  if (type !== 'student' && type !== 'teacher') {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  const role = session.role;

  if (type === 'teacher' && role !== 'teacher' && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const fileName = buildCapstoneFilename(type, 'investor_ready_workbook');
  
  const fileBuffer = getWorkbookAsset(fileName, type);
  if (fileBuffer === null) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  return new NextResponse(fileBuffer, {
    headers: {
      'Cache-Control': 'private, no-store',
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}