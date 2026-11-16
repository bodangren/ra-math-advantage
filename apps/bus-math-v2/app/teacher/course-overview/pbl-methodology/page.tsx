import { requireTeacherSessionClaims } from '@/lib/auth/server';
export default async function Page() {
  await requireTeacherSessionClaims('/teacher/course-overview/pbl-methodology');
  return <main className="container mx-auto max-w-3xl px-4 py-12"><h1 className="text-3xl font-bold">Project-based learning</h1><p className="mt-6">Start with the business question. Teach the accounting and spreadsheet skills that the project needs. Ask students to submit their calculations and explain the result. Check the evidence before you approve the final workbook.</p></main>;
}
