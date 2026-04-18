export type ExampleDifficulty = 'basic' | 'intermediate' | 'advanced';

export interface ExampleHeaderProps {
  number: number;
  title: string;
  difficulty?: ExampleDifficulty;
}

const difficultyConfig = {
  basic: {
    label: 'Basic',
    className: 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/30',
  },
  intermediate: {
    label: 'Intermediate',
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30',
  },
  advanced: {
    label: 'Advanced',
    className: 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30',
  },
};

export function ExampleHeader({ number, title, difficulty }: ExampleHeaderProps) {
  const config = difficulty ? difficultyConfig[difficulty] : null;

  return (
    <div className="flex items-start justify-between gap-4 mb-6 pb-4 border-b border-border">
      <h3 className="font-display font-semibold text-xl text-foreground flex-1">
        <span className="text-muted-foreground">Example {number}:</span> {title}
      </h3>
      {config && (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className} flex-shrink-0`}>
          {config.label}
        </span>
      )}
    </div>
  );
}
