import type { CourseKey, SourceDocument } from "./types";

const im2Documents: SourceDocument[] = [
  ["im2-module-1", "IM2 Module 1 problem types", "1", "Module 1 Problem Types.pdf"],
  ["im2-module-2", "IM2 Module 2 problem types", "2", "Module 2 PRoblem Types.pdf"],
  ["im2-module-3", "IM2 Module 3 problem types", "3", "Module 3 Problem Types.pdf"],
  ["im2-module-4", "IM2 Module 4 problem types", "4", "Module 4 Problem Types.pdf"],
  ["im2-module-5", "IM2 Module 5 problem types", "5", "Module 5 Problem Types.pdf"],
  ["im2-module-6a", "IM2 Module 6 lessons 1 to 5", "6", "Module 6-1 to 6-5 Problem Types.pdf"],
  ["im2-module-6b", "IM2 Module 6 lessons 6 to 9", "6", "Module 6-6 to 6-9 Problem Types.pdf"],
  ["im2-module-7", "IM2 Module 7 problem types", "7", "Module 7 Problem Types.pdf"],
  ["im2-module-8a", "IM2 Module 8 lessons 1 to 4", "8", "Module 8-1 to 8-4 Problem Types.pdf"],
  ["im2-module-8b", "IM2 Module 8 lessons 5 to 7", "8", "Module 8-5 to 8-7 Problem Types.pdf"],
  ["im2-module-9a", "IM2 Module 9 lessons 1 to 2", "9", "Module 9-1 to 9-2 Problem Types.pdf"],
  ["im2-module-9b", "IM2 Module 9 lessons 3 to 8", "9", "Module 9-3 to 9-8 Problem Types.pdf"],
  ["im2-module-10a", "IM2 Module 10 lessons 1 to 4", "10", "Module 10-1 to 10-4 Problem Types.pdf"],
  ["im2-module-10b", "IM2 Module 10 lessons 5 to 7", "10", "Module 10-5 to 10-7 Problem Types.pdf"],
  ["im2-module-11", "IM2 Module 11 problem types", "11", "Module 11 Problem Types.pdf"],
  ["im2-module-12a", "IM2 Module 12 lessons 1 to 4", "12", "Module 12-1 to 12-4 Problem Types.pdf"],
  [
    "im2-module-12b",
    "IM2 Module 12 later problem types",
    "12",
    "Module 12-15 to 12-10 Problem Types.pdf",
  ],
  ["im2-module-13", "IM2 Module 13 problem types", "13", "Module 13 Problem Types.pdf"],
].map(([key, title, module, fileName]) => ({
  key,
  title,
  courseKey: "im2",
  module,
  repositoryPath: `apps/integrated-math-2/curriculum/${fileName}`,
}));

export const SOURCE_DOCUMENTS: readonly SourceDocument[] = [
  {
    key: "im1-text",
    title: "Reveal Math Integrated Math 1",
    courseKey: "im1",
    module: "*",
    repositoryPath: "apps/integrated-math-1/curriculum/reveal-math-2020-integrated-i.pdf",
  },
  ...im2Documents,
  ...Array.from({ length: 9 }, (_, index): SourceDocument => {
    const moduleNumber = String(index + 1);
    return {
      key: `im3-module-${moduleNumber}`,
      title: `IM3 Reveal Module ${moduleNumber}`,
      courseKey: "im3",
      module: moduleNumber,
      repositoryPath: `apps/integrated-math-3/curriculum/IM3-reveal-module-${moduleNumber}.pdf`,
    };
  }),
  ...Array.from({ length: 3 }, (_, index): SourceDocument => {
    const unit = String(index + 1);
    return {
      key: `precalc-unit-${unit}`,
      title: `AP Precalculus Unit ${unit}`,
      courseKey: "precalc",
      module: unit,
      repositoryPath: `apps/pre-calculus/curriculum/APPC  Unit ${unit} Passwater.pdf`,
    };
  }),
];

export function getSourceDocuments(courseKey: CourseKey): SourceDocument[] {
  return SOURCE_DOCUMENTS.filter((document) => document.courseKey === courseKey);
}

export function getSourceDocumentByKey(key: string): SourceDocument | undefined {
  return SOURCE_DOCUMENTS.find((document) => document.key === key);
}
