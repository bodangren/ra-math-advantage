import Link from "next/link";
export default function Preface() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-12 space-y-6">
      <h1 className="text-3xl font-display">How to use this course</h1>
      <p>
        Use the class code from your teacher to register. Your teacher assigns published lessons to
        your class.
      </p>
      <ol className="list-decimal pl-6 space-y-3">
        <li>Open an assigned lesson from your dashboard.</li>
        <li>Read each phase. Open the original worksheet to inspect its figures.</li>
        <li>Enter your practice answer. Check the feedback.</li>
        <li>Complete the required practice before you continue.</li>
      </ol>
      <p>
        Your teacher can review saved answers and progress. Contact your teacher if you cannot
        access an assigned lesson.
      </p>
      <Link href="/curriculum">View the course outline</Link>
    </article>
  );
}
