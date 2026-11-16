import Link from 'next/link';
export default function PrefacePage() {
  return <main className="max-w-3xl mx-auto p-6"><h1>Course guide</h1><p>This course covers 58 AP Precalculus topics in four units. Units 1–3 are assessed on the AP Exam. Unit 4 provides additional course content.</p><p>Read each lesson phase. Show your work and submit your explanation. Your teacher reviews lesson responses. The practice activities provide automatic feedback where available.</p><p>Mastery Advantage uses practice evidence and spaced review. Complete the classroom introduction before you use a skill for mastery practice.</p><Link href="/curriculum" className="underline">Open the curriculum</Link></main>;
}
