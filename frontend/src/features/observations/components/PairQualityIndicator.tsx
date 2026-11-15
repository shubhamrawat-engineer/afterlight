import { ShieldCheck, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import type { PairGrade } from '../types/observation.types';

interface PairQualityIndicatorProps {
  grade: PairGrade | null | undefined;
  className?: string;
  showDetails?: boolean;
}

/**
 * Reusable scientific status indicator for observation pair compatibility.
 */
export function PairQualityIndicator({ grade, className }: PairQualityIndicatorProps) {
  if (!grade) {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-xs font-semibold text-slate-300 ${className ?? ''}`}>
        <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
        <span>Compatibility Not Established</span>
      </span>
    );
  }

  const configs = {
    GOOD: {
      badgeClass: 'border-emerald-500/30 bg-emerald-950/70 text-emerald-300',
      icon: ShieldCheck,
      text: 'GOOD COMPATIBILITY',
    },
    FAIR: {
      badgeClass: 'border-amber-500/30 bg-amber-950/70 text-amber-300',
      icon: AlertTriangle,
      text: 'FAIR COMPATIBILITY',
    },
    POOR: {
      badgeClass: 'border-rose-500/30 bg-rose-950/70 text-rose-300',
      icon: AlertCircle,
      text: 'POOR COMPATIBILITY',
    },
  }[grade];

  const Icon = configs.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold tracking-wider ${configs.badgeClass} ${className ?? ''}`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{configs.text}</span>
    </span>
  );
}
