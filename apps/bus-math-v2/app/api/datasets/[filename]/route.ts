import { requireActiveRequestSessionClaims } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import * as fs from 'fs';

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
  context: { params: Promise<{ filename: string }> }
) {
  const session = await requireActiveRequestSessionClaims(request);
  if (session instanceof Response) {
    return session;
  }

  const params = await context.params;
  const { filename } = params;

  if (!/^unit_0[1-8]_(class_snapshot|group_dataset_0[1-6])\.csv$/.test(filename)) {
    return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
  }

  const datasetsDir = path.join(process.cwd(), 'resources', 'datasets');
  const publicPath = path.join(datasetsDir, filename);

  if (!publicPath.startsWith(datasetsDir)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  if (!fs.existsSync(publicPath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(publicPath);
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}