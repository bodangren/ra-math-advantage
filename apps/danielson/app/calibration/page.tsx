import { SiteHeader } from '@/components/site-header';
import { CalibrationExercise } from '@/components/calibration-exercise';
import { requireObservationSupervisor } from '@/lib/observations/observation-page';
export default async function CalibrationPage() {
  await requireObservationSupervisor('/calibration');
  return <><SiteHeader isAuthenticated showReports /><main id="main-content" className="page-shell report-stack">
    <h1>Observer calibration</h1>
    <ol><li>Select a common lesson example and the school-approved component descriptor.</li>
      <li>Record teacher actions and student responses independently.</li><li>Assign a rating only when the evidence supports it.</li>
      <li>Compare ratings and the evidence for each judgment.</li><li>Discuss differences and record the agreed interpretation in the school calibration notes.</li>
      <li>Repeat with another example before using the interpretation in evaluations.</li></ol>
    <CalibrationExercise />
    <section className="card"><h2>Formal evaluation readiness</h2>
      <p>Confirm the approved rubric edition, component coverage requirements, and record correction policy with school leadership.</p>
      <p>A short visit cannot establish all 22 components. Review evidence from more than one occasion. Include planning, student work, and professional evidence where the approved rubric requires them.</p>
      <p>This page does not define a new school evaluation policy.</p>
    </section>
  </main></>;
}
