import { requireStudentSessionClaims } from '@/lib/auth/server';
import { SpeedRoundPageClient } from './SpeedRoundPageClient';
import { getAllGlossaryModules, GLOSSARY } from '@/lib/study/glossary';

/**
 * Server wrapper for the speed round game page that authenticates the
 * student and passes glossary data to the client component.
 *
 * @returns {JSX.Element} The rendered SpeedRoundPage JSX.
 */
export default async function SpeedRoundPage() {
  const claims = await requireStudentSessionClaims('/auth/login');

  return (
    <SpeedRoundPageClient
      allTerms={GLOSSARY}
      moduleNumbers={getAllGlossaryModules()}
      studentId={claims.sub}
    />
  );
}