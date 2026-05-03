import { ReactNode } from 'react';

export interface TheoremBoxProps {
  title: string;
  children: ReactNode;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'accent';
}

const variantStyles = {
  default: {
    container: 'bg-secondary/30 border-secondary/50',
    title: 'text-foreground',
  },
  primary: {
    container: 'bg-primary/10 border-primary/30',
    title: 'text-primary',
  },
  accent: {
    container: 'bg-accent/10 border-accent/30',
    title: 'text-accent',
  },
};

export function TheoremBox({ title, children, icon, variant = 'default' }: TheoremBoxProps) {
  const styles = variantStyles[variant];

  return (
    <section className={`rounded-lg border p-4 my-4 ${styles.container}`}>
      <div className="flex items-center gap-2 mb-3">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <h3 className={`font-display font-semibold text-lg ${styles.title}`}>
          {title}
        </h3>
      </div>
      <div className="prose prose-sm max-w-none">
        {children}
      </div>
    </section>
  );
}
