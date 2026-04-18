import { requireStudentSessionClaims } from '@/lib/auth/server';
import { PracticeTestPageClient } from '@/components/student/PracticeTestPageClient';
import { getModuleConfig } from '@/lib/practice-tests/question-banks';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PracticeTestModulePageProps {
  params: Promise<{ moduleNumber: string }>;
}

export default async function PracticeTestModulePage({ params }: PracticeTestModulePageProps) {
  const { moduleNumber } = await params;
  const moduleNum = parseInt(moduleNumber, 10);

  if (!Number.isInteger(moduleNum) || moduleNum < 1 || moduleNum > 9) {
    notFound();
  }

  await requireStudentSessionClaims('/auth/login');

  const moduleConfig = getModuleConfig(moduleNum);
  if (!moduleConfig) {
    notFound();
  }

  return <PracticeTestPageClient moduleConfig={moduleConfig} />;
}
