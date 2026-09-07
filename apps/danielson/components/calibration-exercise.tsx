'use client';
import { useState } from 'react';

export function CalibrationExercise() {
  const [first, setFirst] = useState(''); const [second, setSecond] = useState('');
  const [compared, setCompared] = useState(false);
  return <section className="card form-stack"><h2>Compare a common example</h2>
    <p>Use the same school-approved example and component descriptor. Record evidence independently before entering ratings.</p>
    <label htmlFor="calibration-example">Example and component reference</label><input id="calibration-example" />
    <label htmlFor="calibration-evidence">Evidence and descriptor rationale</label><textarea id="calibration-evidence" />
    {(['A', 'B'] as const).map((label, index) => <div className="field" key={label}>
      <label htmlFor={`observer-${label}`}>Observer {label} rating</label><select id={`observer-${label}`} value={index === 0 ? first : second}
        onChange={e => { (index === 0 ? setFirst : setSecond)(e.target.value); setCompared(false); }}>
        <option value="">Select a rating</option>{['Unsatisfactory', 'Basic', 'Proficient', 'Distinguished'].map((name, i) => <option key={name} value={i + 1}>{i + 1} — {name}</option>)}
        <option value="gap">Not enough evidence</option>
      </select></div>)}
    <button type="button" disabled={!first || !second} onClick={() => setCompared(true)}>Compare ratings</button>
    {compared ? <p role="status">{first === 'gap' || second === 'gap' ? 'Review the evidence gap before comparing numerical ratings.'
      : first === second ? 'Exact agreement. Compare the evidence and rationale.'
        : Math.abs(Number(first) - Number(second)) > 1 ? 'Disagreement greater than one level. Review the evidence and descriptor together.' : 'One-level disagreement. Discuss the descriptor boundary.'}</p> : null}
    <p>Agreement does not prove accuracy. These entries stay on this page and are cleared when you leave. They do not update teacher records.</p>
  </section>;
}
