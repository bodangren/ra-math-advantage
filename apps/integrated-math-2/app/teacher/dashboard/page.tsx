import Link from "next/link";

export default function TeacherDashboard() {
  return (
    <div className="max-w-content mx-auto px-6 py-16">
      <div className="text-center py-20">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-panel mb-6"
          style={{ backgroundColor: "oklch(0.60 0.14 195 / 0.10)" }}
        >
          <span className="text-3xl" aria-hidden="true">👨‍🏫</span>
        </div>
        <h1
          className="text-primary-text mb-4 font-display"
          style={{ fontSize: '32px', fontWeight: 700 }}
        >
          Teacher Dashboard
        </h1>
        <p className="text-secondary-text text-lg mb-8 max-w-md mx-auto">
          Your class management dashboard is coming soon. Monitor student progress,
          view gradebooks, and manage assignments.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/curriculum" className="btn-secondary">
            View Curriculum
          </Link>
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
