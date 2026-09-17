import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getGraphDocument } from '@/app/(dev)/blueprint-qa/graph-documents';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../../');

export async function GET(request: Request): Promise<Response> {
  if (process.env.NODE_ENV !== 'development') {
    return new Response(null, { status: 404 });
  }

  const search = new URL(request.url).searchParams;
  const repositoryPath = getGraphDocument(search.get('course') ?? '', search.get('artifact') ?? '');
  if (!repositoryPath) {
    return new Response(null, { status: 404 });
  }

  return Response.redirect(new URL(`/@fs${path.join(REPO_ROOT, repositoryPath)}`, request.url), 307);
}
