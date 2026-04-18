import { requireStudentSessionClaims } from '@/lib/auth/server';
import { MatchingPageClient } from './MatchingPageClient';
import { getAllGlossaryModules, GLOSSARY } from '@/lib/study/glossary';

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
