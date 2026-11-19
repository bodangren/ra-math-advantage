import type { Technique } from "../types";

const technique: Technique = {
  id: "all-hands",
  title: "All Hands",
  subdomain: "3c",
  domain: 3,
  source: "TLAC 3.0",
  alignment: "3c: Active Engagement in Learning",
  hasImage: false,
  description:
    "Manage voluntary hand-raising so participation supports the pace and focus of discussion.",
  detailedSummary:
    "Raised hands show willingness to contribute. They do not establish understanding. Combine voluntary participation with writing, Cold Call, or another method that reveals the thinking of more students.\n\nCheck: Before you move on, inspect an answer or explanation. Do not use the number of raised hands as a mastery measure.",
  actionSteps: [
    "Ask a clear question and allow thinking time.",
    "Invite hands when voluntary responses serve the lesson purpose.",
    "Scan the room before selecting a response.",
    "Reset hands between questions so students attend to the new question.",
    "Use other participation methods to include students who do not volunteer.",
  ],
  videos: {
    demo: "",
  },
  literature: {
    book: "Teach Like a Champion 3.0",
    pages: "Technique 29",
  },
};

export default technique;
