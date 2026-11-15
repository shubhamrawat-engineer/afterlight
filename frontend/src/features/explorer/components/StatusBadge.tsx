import { CheckCircle2, Clock, TestTube2 } from 'lucide-react';
import type { TargetStatus } from '../types/explorer.types';

export function StatusBadge({ status }: { status: TargetStatus }) {
  switch (status) {
    case 'verified':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-950/70 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-emerald-300">
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          VERIFIED
        </span>
      );
    case 'preliminary':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-950/70 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-amber-300">
          <Clock className="h-3 w-3 text-amber-400" />
          PRELIMINARY
        </span>
      );
    case 'mock':
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-slate-300">
          <TestTube2 className="h-3 w-3 text-slate-400" />
          CONTROL STANDARD
        </span>
      );
  }
}
