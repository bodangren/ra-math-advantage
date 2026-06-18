import type { ParentVisualizationV1 } from '@math-platform/knowledge-space-practice';

const _pageTitle: keyof ParentVisualizationV1 = 'canDoSummary';
void _pageTitle;

export default function ParentPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-display font-bold text-foreground">Parent Portal</h1>
      <p className="text-muted-foreground mt-2">
        View your student&apos;s progress, mastery, and engagement.
      </p>
    </div>
  );
}
