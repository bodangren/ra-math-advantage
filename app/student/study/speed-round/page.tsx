import { requireStudentSessionClaims } from '@/lib/auth/server';
import { SpeedRoundPageClient } from './SpeedRoundPageClient';
import { getAllGlossaryModules, GLOSSARY } from '@/lib/study/glossary';

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