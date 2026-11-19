import type { Technique } from "../types";

const technique: Technique = {
  id: "batch-process",
  title: "Batch Process",
  subdomain: "3a",
  domain: 3,
  source: "TLAC 3.0",
  alignment: "3a: Clear Communication of Purpose and Content",
  hasImage: false,
  description:
    "Let several students contribute before you respond, so students can build a discussion together.",
  detailedSummary:
    "The teacher delays the usual response between student contributions. Students must listen to each other because the discussion can develop before the teacher evaluates it.\n\nExample: After three interpretations of a passage, ask a fourth student which interpretation has the strongest evidence. Check whether students refer to each other’s ideas.",
  actionSteps: [
    "Ask a question that supports more than one contribution.",
    "Invite several students to respond in sequence.",
    "Listen without evaluating each response immediately.",
    "Ask students to connect, challenge, or extend a previous contribution.",
    "After the sequence, clarify a misconception or summarize the reasoning.",
  ],
  videos: {
    demo: "",
  },
  literature: {
    book: "Teach Like a Champion 3.0",
    pages: "Technique 45",
  },
};

export default technique;
