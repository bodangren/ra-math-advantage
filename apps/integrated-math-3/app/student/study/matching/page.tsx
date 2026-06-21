import { requireStudentSessionClaims } from '@/lib/auth/server';
import { MatchingPageClient } from './MatchingPageClient';
import { getAllGlossaryModules, GLOSSARY } from '@/lib/study/glossary';

/**
 * Server wrapper for the matching game study page that authenticates the
 * student and passes glossary data to the client component.
 *
 * @returns {JSX.Element} The rendered MatchingPage JSX.
 */
export default async function MatchingPage() {
  const claims = await requireStudentSessionClaims('/auth/login');

  return (
    <MatchingPageClient
      allTerms={GLOSSARY}
      moduleNumbers={getAllGlossaryModules()}
      studentId={claims.sub}
    />
  );
}
