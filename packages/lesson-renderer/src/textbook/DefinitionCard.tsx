export interface DefinitionCardProps {
  term: string;
  definition: string;
  relatedTerms?: string[];
}

export function DefinitionCard({ term, definition, relatedTerms }: DefinitionCardProps) {
  return (
    <article className="rounded-lg border bg-card p-4 my-4 shadow-sm">
      <h3 className="font-display font-semibold text-lg mb-2 text-foreground">
        <strong>{term}</strong>
      </h3>
      <p className="text-foreground/80 mb-3 leading-relaxed">
        {definition}
      </p>
      {relatedTerms && relatedTerms.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            Related Terms
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-foreground/70">
            {relatedTerms.map((relatedTerm, index) => (
              <li key={index}>{relatedTerm}</li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}
