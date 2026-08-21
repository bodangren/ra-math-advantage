import type { Technique } from '../types';

const replaceSelfReport: Technique = {
  id: "replace-self-report",
  title: "Replace Self-Report",
  subdomain: "3d",
  domain: 3,
  source: "TLAC 3.0",
  alignment: "3d: Using Assessment for Learning",
  hasImage: false,
  description:
    "Replace Self-Report counters the common habit of accepting 'Are you done?' as a reliable signal of student mastery. Instead of trusting students to accurately assess their own understanding, teachers require evidence that learning has actually occurred before granting approval to move on.",
  detailedSummary:
    "Self-report is one of the most seductive and most dangerous shortcuts in teaching. When a student says 'I'm done' or 'I understand,' a teacher who accepts that without verification is essentially guessing about student mastery. The Replace Self-Report technique addresses this vulnerability by insisting on tangible evidence of understanding before a student is cleared to proceed. This technique recognizes that student self-assessment is a skill that must be explicitly taught and developed, not a given. Many students, particularly younger learners or those with less experience with academic work, genuinely believe they understand something when they do not. Their confidence is not feigned—it is simply misplaced. Experienced teachers know that real understanding shows up in specific, observable ways: work that is complete and correct, explanations that demonstrate reasoning, or performances that meet clear criteria. When a student claims to be finished, the teacher's response should not be 'Great, move on' but rather 'Show me your evidence.' This single shift in language fundamentally changes the dynamic of independent practice. Students learn that completion without accuracy is not acceptance. They learn that understanding must be demonstrated, not declared. This creates a classroom culture where the burden of proof rests on visible demonstration rather than student announcement. Over time, students internalize these standards and begin to evaluate their own work more critically before claiming mastery, developing the metacognitive skills that transfer beyond any single lesson. The technique also provides teachers with invaluable formative data. By requiring visible work product, teachers can scan for understanding at a glance, identify misconceptions while they are still correctable, and make instructional decisions based on actual evidence rather than student self-perception—which is notoriously unreliable as a gauge of true mastery.",
  quote: "Saying you understand is not the same as demonstrating you understand—effective teachers demand evidence, not just confidence.",
  actionSteps: [
    "When a student claims to be finished, respond with 'Show me' rather than accepting their report at face value.",
    "Require visible work product or performance as evidence before approving a student to move to the next task.",
    "Create clear success criteria for each assignment so students know exactly what their work should demonstrate.",
    "Build in checkpoints where students must show their progress before proceeding independently.",
    "When evidence is insufficient, provide specific feedback about what is missing rather than simply saying 'not done.'",
  ],
  videos: {
    demo: "8ZJAk6n9a3M",
  },
  literature: {
    book: "Teach Like a Champion 3.0",
    pages: "116-128",
  },
};

export default replaceSelfReport;