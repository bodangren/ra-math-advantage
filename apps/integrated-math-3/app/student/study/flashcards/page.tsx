import { requireStudentSessionClaims } from '@/lib/auth/server';
import { FlashcardsPageClient } from './FlashcardsPageClient';
import { GLOSSARY, getAllGlossaryModules } from '@/lib/study/glossary';

/**
 * Server wrapper for the flashcards study page that authenticates the
 * student and passes glossary data to the client component.
 *
 * @returns The rendered FlashcardsPage JSX.
 */
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
