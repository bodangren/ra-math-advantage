import type { Technique } from '../types';

const technique: Technique = {
  id: 'double-plan',
  title: 'The Double Plan',
  subdomain: '1e',
  domain: 1,
  source: 'TLAC 3.0',
  alignment: '1e: Planning Coherent Instruction',
  description:
    'Plan the teacher move and the student work side by side so every stage of the lesson keeps students accountable.',
  detailedSummary:
    'The Double Plan is a planning structure that asks teachers to imagine their lesson simultaneously from two perspectives: what the teacher will be doing and what students will be doing at each moment. Without this dual focus, a lesson can easily become a sequence of teacher moves with students waiting passively for their turn to engage. The Double Plan makes invisible time gaps visible by forcing the teacher to specify what students should be doing while the teacher is circulating, reviewing directions, or modeling thinking.\n\nThis technique works because it exposes the most common planning blind spot: assuming that student engagement will happen naturally once the teacher finishes talking. In reality, students often sit passively during transitions, wait for instructions after the teacher moves on, or have no clear task during independent practice. The Double Plan corrects this by treating every minute as an opportunity for deliberate student thinking.\n\nThe Double Plan also reveals when a student task is too vague to be actionable. "Students practice problems" is not a student action; it is an outcome. "Students solve problems 1-3 in their notebooks, showing all steps, while the teacher circulates" is a student action. The specificity is the point.\n\nImplementing the Double Plan well requires a willingness to slow down planning in order to speed up execution. Block the lesson into segments, then write the teacher move and student move for each segment in parallel columns. Look especially at transitions: these are the highest-risk moments for passive waiting. Build in a quick-turn partner discussion, a silent reflection prompt, or a micro-practice problem that students can begin immediately.',
  quote:
    'The Double Plan asks you to imagine every minute of the lesson from the student\'s perspective, which reveals gaps where students have nothing meaningful to do.',
  actionSteps: [
    'Create a two-column lesson layout: label the left column "Teacher Actions" and the right column "Student Actions."',
    'Map every minute of the lesson by writing what the teacher will do in the left column and what students will be doing at that exact moment in the right column.',
    'Inspect the student column for empty time, passive waiting, or vague tasks like "listen" or "wait." Replace these with specific, cognitively active tasks.',
    'Verify that every transition includes a clear student product and a success criteria so students know exactly what to do when the teacher moves on.',
    'Revise the plan to eliminate any segment where students are passive for more than 30 seconds or where the task does not connect to the lesson objective.',
  ],
  videos: {
    demo: 'hSj4uCkfz5k',
  },
  literature: {
    book: 'Teach Like a Champion 3.0',
    pages: '58-61',
  },
};

export default technique;
