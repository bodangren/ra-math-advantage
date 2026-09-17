import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getSourceDocumentByKey } from '@/app/(dev)/blueprint-qa/source-documents';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../../');

export async function GET(request: Request): Promise<Response> {
  if (process.env.NODE_ENV !== 'development') {
    return new Response(null, { status: 404 });
  }

  const key = new URL(request.url).searchParams.get('document');
  const document = key ? getSourceDocumentByKey(key) : undefined;
  if (!document) {
    return new Response(null, { status: 404 });
  }

  const sourcePath = path.join(REPO_ROOT, document.repositoryPath);
  return Response.redirect(new URL(`/@fs${sourcePath}`, request.url), 307);
}
