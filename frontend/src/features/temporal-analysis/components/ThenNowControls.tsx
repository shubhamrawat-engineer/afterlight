import { Clock, Calendar } from 'lucide-react';
import type { ActiveEpoch } from '../types/temporal-analysis.types';

interface ThenNowControlsProps {
  activeEpoch: ActiveEpoch;
  onSetThen: () => void;
  onSetNow: () => void;
  earlierDate: string | null;
  laterDate: string | null;
  className?: string;
}

function formatShortDate(iso: string | null): string {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' });
  } catch {
    return '';
  }
}

/**
 * Manual observation toggle controls for THEN (Earlier) and NOW (Later).
 */
export function ThenNowControls({
  activeEpoch,
  onSetThen,
  onSetNow,
  earlierDate,
  laterDate,
  className,
}: ThenNowControlsProps) {
  const shortThen = formatShortDate(earlierDate);
  const shortNow = formatShortDate(laterDate);

  return (
    <div className={`flex items-center gap-2 ${className ?? ''}`} role="group" aria-label="Then/Now Observation Switcher">
      {/* THEN Button */}
      <button
        type="button"
        onClick={onSetThen}
        aria-pressed={activeEpoch === 'then'}
        aria-label="Display earlier observation (THEN)"
        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
          activeEpoch === 'then'
            ? 'bg-sky-600 text-white shadow-[0_0_15px_rgba(56,189,248,0.5)] border border-sky-400'
            : 'border border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
        }`}
      >
        <Calendar className="h-3.5 w-3.5" />
        <span>THEN (Earlier)</span>
        {shortThen && <span className="font-mono font-normal opacity-80">[{shortThen}]</span>}
      </button>

      {/* NOW Button */}
      <button
        type="button"
        onClick={onSetNow}
        aria-pressed={activeEpoch === 'now'}
        aria-label="Display later observation (NOW)"
        className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
          activeEpoch === 'now'
            ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400'
            : 'border border-slate-700 bg-slate-900/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800'
        }`}
      >
        <Clock className="h-3.5 w-3.5" />
        <span>NOW (Later)</span>
        {shortNow && <span className="font-mono font-normal opacity-80">[{shortNow}]</span>}
      </button>
    </div>
  );
}
