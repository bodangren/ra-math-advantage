import Link from 'next/link';
import topicIndex from '@/curriculum/source/college-board/ced-topic-index.json';

const units = topicIndex.units.map(unit => ({
  number: unit.unit, title: unit.title,
  description: unit.examStatus === 'not-assessed-on-ap-exam' ? 'Unit 4 is not assessed on the AP Exam.' : 'This unit is assessed on the AP Exam.',
  lessons: unit.topics.map(topic => `${topic.id} ${topic.title}`),
}));

export default function CurriculumPage() {
  return (
    <div className="max-w-content mx-auto px-6 py-16">
      <div className="mb-12">
        <span className="section-label mb-4 inline-block">Curriculum</span>
        <h1
          className="text-primary-text mb-4"
          style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 510, lineHeight: 1.10, letterSpacing: '-1.5px' }}
        >
          AP Precalculus Curriculum
        </h1>
        <p className="text-secondary-text text-lg max-w-2xl">
          4 units, 58 lessons covering the complete AP Precalculus curriculum aligned with
          College Board standards.
        </p>
      </div>

      <div className="space-y-8">
        {units.map((unit) => (
          <div key={unit.number} className="card-surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="flex items-center justify-center w-8 h-8 rounded-standard text-sm font-semibold text-white shrink-0"
                style={{ backgroundColor: "#5e6ad2" }}
              >
                {unit.number}
              </span>
              <h2 className="text-primary-text" style={{ fontSize: '20px', fontWeight: 510 }}>
                {unit.title}
              </h2>
              <span className="text-muted-text text-sm font-mono ml-auto">
                {unit.lessons.length} lessons
              </span>
            </div>
            <p className="text-secondary-text text-sm mb-4 leading-relaxed">
              {unit.description}
            </p>
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {unit.lessons.map((lesson, i) => (
                <Link
                  href={`/student/lessons/${unit.number}.${i + 1}`}
                  key={i}
                  className="text-sm text-muted-text py-1.5 px-2 rounded-standard hover:bg-surface-light transition-colors"
                >
                  {lesson}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
