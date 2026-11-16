import sourceLessons from "@/curriculum/lessons.json";
import sourceUnits from "@/curriculum/units.json";
const units = sourceUnits.map((unit) => ({
  ...unit,
  lessons: sourceLessons
    .filter((lesson) => lesson.unitNumber === unit.number)
    .map(
      (lesson) => `${lesson.unitNumber}.${lesson.orderIndex} ${lesson.title}`,
    ),
}));

export default function CurriculumPage() {
  return (
    <div className="max-w-content mx-auto px-6 py-16">
      <div className="mb-12">
        <span className="section-label mb-4 inline-block">Curriculum</span>
        <h1
          className="text-primary-text mb-4 font-display"
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-1px",
          }}
        >
          Integrated Math 2 Curriculum
        </h1>
        <p className="text-secondary-text text-lg max-w-2xl">
          13 units, {sourceLessons.length} lessons covering geometry, algebra,
          trigonometry, and probability.
        </p>
      </div>

      <div className="space-y-8">
        {units.map((unit) => (
          <div key={unit.number} className="card-surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <span
                className="flex items-center justify-center w-8 h-8 rounded-md text-sm font-bold text-white shrink-0"
                style={{ backgroundColor: "#B14C00" }}
              >
                {unit.number}
              </span>
              <h2
                className="text-primary-text font-display"
                style={{ fontSize: "20px", fontWeight: 600 }}
              >
                {unit.title}
              </h2>
              <span className="text-muted-text text-sm font-mono-num ml-auto">
                {unit.lessons.length} lessons
              </span>
            </div>
            <p className="text-secondary-text text-sm mb-4 leading-relaxed">
              {unit.description}
            </p>
            <div className="grid gap-1 sm:grid-cols-2 lg:grid-cols-3">
              {unit.lessons.map((lesson, i) => (
                <div
                  key={i}
                  className="text-sm text-muted-text py-1.5 px-2 rounded-md hover:bg-surface-light transition-colors"
                >
                  {lesson}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
