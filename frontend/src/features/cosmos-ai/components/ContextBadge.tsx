import { Globe, Compass, Eye, Activity, FileText, Orbit, Layers } from 'lucide-react';
import type { AIContextReference } from '../types/cosmos-ai.types';

interface ContextBadgeProps {
  context: AIContextReference;
  className?: string;
}

export function ContextBadge({ context, className }: ContextBadgeProps) {
  const getContextIcon = () => {
    switch (context.type) {
      case 'target':
        return <Compass className="w-3.5 h-3.5 text-cyan-400" />;
      case 'observations':
        return <Layers className="w-3.5 h-3.5 text-sky-400" />;
      case 'temporal':
        return <Eye className="w-3.5 h-3.5 text-indigo-400" />;
      case 'spectral':
        return <Activity className="w-3.5 h-3.5 text-purple-400" />;
      case 'investigation':
        return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
      case 'object':
        return <Orbit className="w-3.5 h-3.5 text-amber-400" />;
      case 'general':
      default:
        return <Globe className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono bg-slate-950/80 border-slate-800 ${className ?? ''}`}
    >
      <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
        ACTIVE CONTEXT:
      </span>
      <div className="flex items-center gap-1.5 text-slate-200 font-semibold">
        {getContextIcon()}
        <span>{context.summaryLabel || 'General Astronomy'}</span>
      </div>
    </div>
  );
}
