import { requireStudentSessionClaims } from '@/lib/auth/server';
import { FlashcardsPageClient } from './FlashcardsPageClient';
import { GLOSSARY, getAllGlossaryModules } from '@/lib/study/glossary';

export default async function FlashcardsPage() {
  const claims = await requireStudentSessionClaims('/auth/login');

  return (
    <FlashcardsPageClient
      allTerms={GLOSSARY}
      moduleNumbers={getAllGlossaryModules()}
      studentId={claims.sub}
    />
  );
}
