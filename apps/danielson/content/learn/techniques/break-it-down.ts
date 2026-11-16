import type { Technique } from '../types';

const technique: Technique = {
  "id": "break-it-down",
  "title": "Break It Down",
  "subdomain": "3a",
  "domain": 3,
  "source": "TLAC 3.0",
  "alignment": "3a: Clear Communication of Purpose and Content",
  "hasImage": false,
  "description": "After an incorrect or incomplete answer, give the smallest useful prompt that helps the student continue thinking.",
  "detailedSummary": "The purpose is to support a student without doing the thinking for them. This response follows evidence of difficulty. It is different from explaining every step of a new skill in advance.\n\nExample: If a student adds denominators, ask what the denominator represents before showing a worked solution.",
  "actionSteps": [
    "Identify the point where the student’s reasoning stopped or changed direction.",
    "Give a small cue, question, example, or missing step.",
    "Let the student attempt the answer again.",
    "Add another prompt only if the first prompt was not sufficient.",
    "Return to the original question and check the student’s full answer."
  ],
  "videos": {
    "demo": "",
    "deepDive": ""
  },
  "literature": {
    "book": "Teach Like a Champion 3.0",
    "pages": "Technique 37"
  }
};

export default technique;
