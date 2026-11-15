import { Cpu, AlertCircle, CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import type { AIAvailabilityStatus } from '../types/cosmos-ai.types';

interface AIAvailabilityIndicatorProps {
  status: AIAvailabilityStatus;
  details?: string | null;
  className?: string;
}

export function AIAvailabilityIndicator({
  status,
  details,
  className,
}: AIAvailabilityIndicatorProps) {
  const getBadgeConfig = () => {
    switch (status) {
      case 'available':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'AI Available',
          classes: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40',
          dot: 'bg-emerald-400 animate-pulse',
        };
      case 'processing':
        return {
          icon: <Cpu className="w-3.5 h-3.5 text-blue-400 animate-spin" />,
          label: 'AI Processing',
          classes: 'bg-blue-950/50 text-blue-300 border-blue-800/40',
          dot: 'bg-blue-400 animate-ping',
        };
      case 'not_configured':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-amber-400" />,
          label: 'AI Service Not Configured',
          classes: 'bg-amber-950/40 text-amber-300 border-amber-800/40',
          dot: 'bg-amber-400',
        };
      case 'unavailable':
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-rose-400" />,
          label: 'AI Unavailable',
          classes: 'bg-rose-950/40 text-rose-300 border-rose-800/40',
          dot: 'bg-rose-400',
        };
      case 'checking':
      default:
        return {
          icon: <Clock className="w-3.5 h-3.5 text-slate-400 animate-spin" />,
          label: 'Checking AI Status',
          classes: 'bg-slate-900/60 text-slate-400 border-slate-700/50',
          dot: 'bg-slate-400',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-mono backdrop-blur-md transition-all ${config.classes} ${className ?? ''}`}
      title={details || config.label}
    >
      <span className={`w-2 h-2 rounded-full ${config.dot}`} />
      <span className="font-medium">{config.label}</span>
      {details && (
        <span
          className="text-slate-500 hover:text-slate-300 cursor-help"
          title={details}
        >
          <HelpCircle className="w-3 h-3 inline" />
        </span>
      )}
    </div>
  );
}
