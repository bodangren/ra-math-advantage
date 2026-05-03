import { ReactNode } from 'react';
import { AlertTriangle, Lightbulb, Info, AlertCircle } from 'lucide-react';

export type CalloutVariant = 'important' | 'tip' | 'remember' | 'caution';

export interface CalloutBoxProps {
  variant: CalloutVariant;
  title?: string;
  children: ReactNode;
}

const variantConfig = {
  important: {
    icon: AlertTriangle,
    container: 'bg-destructive/10 border-destructive/30',
    iconColor: 'text-destructive',
    titleColor: 'text-destructive',
  },
  tip: {
    icon: Lightbulb,
    container: 'bg-accent/10 border-accent/30',
    iconColor: 'text-accent',
    titleColor: 'text-accent',
  },
  remember: {
    icon: Info,
    container: 'bg-blue-500/10 border-blue-500/30',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-500',
  },
  caution: {
    icon: AlertCircle,
    container: 'bg-amber-500/10 border-amber-500/30',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-500',
  },
};

export function CalloutBox({ variant, title, children }: CalloutBoxProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <aside className={`rounded-lg border p-4 my-4 ${config.container} callout-${variant}`}>
      {title && (
        <div className="flex items-center gap-2 mb-3">
          <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
          <h4 className={`font-display font-semibold text-base ${config.titleColor}`}>
            {title}
          </h4>
        </div>
      )}
      <div className="prose prose-sm max-w-none">
        {children}
      </div>
    </aside>
  );
}
