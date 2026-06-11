import { requireActiveRequestSessionClaims } from '@/lib/auth/server';
import { buildCapstoneFilename } from '@math-platform/workbook-pipeline';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import * as fs from 'fs';

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

  if (type === 'teacher' && role !== 'teacher') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const fileName = buildCapstoneFilename(type, 'investor_ready_workbook');
  
  const workbooksDir = path.join(process.cwd(), 'public', 'workbooks');
  const publicPath = path.join(workbooksDir, fileName);

  if (!publicPath.startsWith(workbooksDir)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  if (!fs.existsSync(publicPath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(publicPath);
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
}