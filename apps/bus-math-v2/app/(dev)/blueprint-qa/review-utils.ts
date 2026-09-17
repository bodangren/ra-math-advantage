import type {
  CourseKey,
  ReviewDecision,
  ReviewExport,
  ReviewStore,
  SkillNode,
  SourceDocument,
  SourceReference,
} from './types';

function locationValue(node: SkillNode, field: 'module' | 'lesson' | 'exampleNumber'): unknown {
  if (field === 'module') return node.metadata.module ?? node.metadata.unit;
  return node.metadata[field];
}

function compareNumericLabels(left: unknown, right: unknown): number {
  const leftParts = String(left ?? '').match(/\d+/g)?.map(Number) ?? [];
  const rightParts = String(right ?? '').match(/\d+/g)?.map(Number) ?? [];
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const difference = (leftParts[index] ?? -1) - (rightParts[index] ?? -1);
    if (difference !== 0) return difference;
  }

  return String(left ?? '').localeCompare(String(right ?? ''), undefined, { numeric: true });
}

export function compareCurriculumNodes(left: SkillNode, right: SkillNode): number {
  const moduleOrder = compareNumericLabels(locationValue(left, 'module'), locationValue(right, 'module'));
  if (moduleOrder !== 0) return moduleOrder;

  const lessonOrder = compareNumericLabels(locationValue(left, 'lesson'), locationValue(right, 'lesson'));
  if (lessonOrder !== 0) return lessonOrder;

  const exampleOrder = compareNumericLabels(
    locationValue(left, 'exampleNumber'),
    locationValue(right, 'exampleNumber'),
  );
  if (exampleOrder !== 0) return exampleOrder;

  const titleOrder = left.title.localeCompare(right.title, undefined, { numeric: true });
  return titleOrder !== 0 ? titleOrder : left.id.localeCompare(right.id);
}

function sameLocation(left: SkillNode, right: SkillNode): boolean {
  return (
    String(locationValue(left, 'module') ?? '') === String(locationValue(right, 'module') ?? '') &&
    String(locationValue(left, 'lesson') ?? '') === String(locationValue(right, 'lesson') ?? '')
  );
}

export function getWorkedExamplesForSkill(
  nodes: SkillNode[],
  skill: SkillNode,
  sourceNodeIds: string[],
): SkillNode[] {
  const linked = new Set(sourceNodeIds);
  return nodes
    .filter((node) => node.kind === 'worked_example' && (linked.has(node.id) || sameLocation(node, skill)))
    .sort((left, right) => {
      const linkOrder = Number(linked.has(right.id)) - Number(linked.has(left.id));
      return linkOrder !== 0 ? linkOrder : compareCurriculumNodes(left, right);
    });
}

function sourceReferenceValues(reference: SourceReference): string[] {
  if (typeof reference === 'string') return [reference];
  return [reference.url, reference.location, reference.source].filter(
    (value): value is string => typeof value === 'string',
  );
}

export function resolvePdfReference(
  node: SkillNode,
  documents: SourceDocument[],
): { documentKey: string; page: number; sourceRef: string } | null {
  for (const reference of node.sourceRefs ?? []) {
    for (const value of sourceReferenceValues(reference)) {
      const match = value.match(/^(.*\.pdf)#page=(\d+)$/i);
      if (!match) continue;

      const page = Number(match[2]);
      const document = documents.find((candidate) => candidate.repositoryPath === match[1]);
      if (document && Number.isInteger(page) && page > 0) {
        return { documentKey: document.key, page, sourceRef: value };
      }
    }
  }
  return null;
}

export function isReviewDecisionComplete(decision: ReviewDecision | undefined): boolean {
  if (!decision) return false;
  return decision.status === 'approved' || decision.note.trim().length > 0;
}

export function isSkillApproved(review: ReviewStore[string] | undefined): boolean {
  if (!review) return false;
  return (
    Object.values(review.sourceAlignments).some((decision) => decision.status === 'approved') &&
    review.worked_example?.status === 'approved' &&
    review.guided_practice?.status === 'approved' &&
    review.independent_practice?.status === 'approved'
  );
}

export function buildReviewExport(courseKey: CourseKey, store: ReviewStore): ReviewExport {
  return {
    version: 1,
    courseKey,
    skills: Object.keys(store)
      .sort()
      .map((skillNodeId) => {
        const review = store[skillNodeId];
        return {
          skillNodeId,
          sourceAlignments: Object.keys(review.sourceAlignments)
            .sort()
            .map((sourceNodeId) => ({ sourceNodeId, ...review.sourceAlignments[sourceNodeId] })),
          modalities: {
            ...(review.worked_example ? { worked_example: review.worked_example } : {}),
            ...(review.guided_practice ? { guided_practice: review.guided_practice } : {}),
            ...(review.independent_practice ? { independent_practice: review.independent_practice } : {}),
          },
        };
      }),
  };
}
