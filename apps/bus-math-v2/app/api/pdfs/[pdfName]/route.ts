import { requireActiveRequestSessionClaims } from '@/lib/auth/server';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import * as fs from 'fs';

/**
 * Serves a PDF file by name from the public/pdfs directory.
 *
 * @param request - The incoming Next.js request with session cookie.
 * @param context - Route params containing the pdfName string.
 * @returns A PDF file response with appropriate content headers.
 * @throws Returns 400 for invalid names, 404 if file not found.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ pdfName: string }> }
) {
  const session = await requireActiveRequestSessionClaims(request);
  if (session instanceof Response) {
    return session;
  }

  const params = await context.params;
  const { pdfName } = params;

  if (!/^[\w-]+\.pdf$/.test(pdfName)) {
    return NextResponse.json({ error: 'Invalid PDF name' }, { status: 400 });
  }

  const pdfsDir = path.join(process.cwd(), 'public', 'pdfs');
  const publicPath = path.join(pdfsDir, pdfName);

  if (!publicPath.startsWith(pdfsDir)) {
    return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
  }

  if (!fs.existsSync(publicPath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const fileBuffer = fs.readFileSync(publicPath);
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdfName}"`,
    },
  });
}
