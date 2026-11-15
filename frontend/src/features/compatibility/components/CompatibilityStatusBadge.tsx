import { CheckCircle2, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import type { CompatibilityStatus } from '../types/compatibility.types';

interface CompatibilityStatusBadgeProps {
  status: CompatibilityStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CompatibilityStatusBadge({
  status,
  size = 'md',
  className,
}: CompatibilityStatusBadgeProps) {
  const configs: Record<
    CompatibilityStatus,
    { label: string; bg: string; text: string; border: string; icon: typeof CheckCircle2 }
  > = {
    READY_FOR_REVIEW: {
      label: 'READY FOR REVIEW',
      bg: 'bg-emerald-950/70',
      text: 'text-emerald-300',
      border: 'border-emerald-500/40',
      icon: CheckCircle2,
    },
    CONDITIONALLY_READY: {
      label: 'CONDITIONALLY READY',
      bg: 'bg-amber-950/70',
      text: 'text-amber-300',
      border: 'border-amber-500/40',
      icon: AlertTriangle,
    },
    INSUFFICIENT_METADATA: {
      label: 'INSUFFICIENT METADATA',
      bg: 'bg-rose-950/70',
      text: 'text-rose-300',
      border: 'border-rose-500/40',
      icon: AlertCircle,
    },
    NOT_ASSESSED: {
      label: 'NOT ASSESSED',
      bg: 'bg-slate-900/80',
      text: 'text-slate-400',
      border: 'border-slate-700/60',
      icon: HelpCircle,
    },
  };

  const config = configs[status] ?? configs.NOT_ASSESSED;
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-xs font-bold gap-2',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-lg border font-mono font-bold tracking-wider uppercase transition-colors ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className ?? ''}`}
      role="status"
    >
      <Icon className={size === 'sm' ? 'h-3 w-3 shrink-0' : 'h-3.5 w-3.5 shrink-0'} />
      <span>{config.label}</span>
    </span>
  );
}
