import { Shield, Zap, Target } from 'lucide-react';

export interface ReflectionDimension {
  prompt: string;
}

export interface ReflectionCardProps {
  courage: ReflectionDimension;
  adaptability: ReflectionDimension;
  persistence: ReflectionDimension;
}

export function ReflectionCard({ courage, adaptability, persistence }: ReflectionCardProps) {
  const dimensions = [
    {
      name: 'Courage',
      icon: Shield,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      data: courage,
    },
    {
      name: 'Adaptability',
      icon: Zap,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/30',
      data: adaptability,
    },
    {
      name: 'Persistence',
      icon: Target,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30',
      data: persistence,
    },
  ];

  return (
    <div className="my-6 rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="font-display font-semibold text-xl text-foreground mb-6 text-center">
        CAP Reflection
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dimensions.map((dimension) => {
          const Icon = dimension.icon;

          return (
            <div
              key={dimension.name}
              className={`flex flex-col items-center text-center p-4 rounded-lg border ${dimension.borderColor} ${dimension.bgColor} transition-colors hover:shadow-md`}
            >
              <div className={`mb-3 p-3 rounded-full ${dimension.bgColor}`}>
                <Icon className={`w-6 h-6 ${dimension.color}`} />
              </div>
              <h4 className={`font-display font-semibold text-base ${dimension.color} mb-2`}>
                {dimension.name}
              </h4>
              <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {dimension.data.prompt}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
