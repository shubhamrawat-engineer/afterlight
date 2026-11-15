import { Play, Pause, FastForward } from 'lucide-react';
import type { ActiveEpoch } from '../types/temporal-analysis.types';

interface BlinkControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  intervalMs: number;
  onIntervalChange: (ms: number) => void;
  currentEpoch: ActiveEpoch;
  className?: string;
}

const INTERVAL_PRESETS = [
  { label: '250ms', value: 250 },
  { label: '500ms (Default)', value: 500 },
  { label: '750ms', value: 750 },
  { label: '1.0s', value: 1000 },
];

/**
 * Interactive controls for astronomical Blink Mode.
 * Controls alternation speed, playback state, and exposes real-time active epoch.
 */
export function BlinkControls({
  isPlaying,
  onTogglePlay,
  intervalMs,
  onIntervalChange,
  currentEpoch,
  className,
}: BlinkControlsProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className ?? ''}`}>
      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? 'Pause astronomical blink mode' : 'Start astronomical blink mode'}
        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
          isPlaying
            ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)] border border-amber-400'
            : 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] border border-blue-400 hover:bg-blue-500'
        }`}
      >
        {isPlaying ? (
          <>
            <Pause className="h-3.5 w-3.5" />
            <span>PAUSE BLINK</span>
          </>
        ) : (
          <>
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>START BLINK</span>
          </>
        )}
      </button>

      {/* Active Blinking Epoch Indicator */}
      <div className="flex items-center gap-2 rounded-lg bg-slate-950/80 border border-slate-800 px-3 py-1.5 text-xs font-mono">
        <span className="text-slate-400 text-[10px] uppercase">Displaying:</span>
        <span
          className={`font-bold transition-colors ${
            currentEpoch === 'then' ? 'text-sky-400' : 'text-indigo-400'
          }`}
        >
          {currentEpoch === 'then' ? 'THEN (Earlier)' : 'NOW (Later)'}
        </span>
        <span
          className={`h-2 w-2 rounded-full ${
            isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'
          }`}
        />
      </div>

      {/* Blink Interval Dropdown */}
      <div className="flex items-center gap-1.5 text-xs">
        <FastForward className="h-3.5 w-3.5 text-slate-400" />
        <select
          value={intervalMs}
          onChange={(e) => onIntervalChange(Number(e.target.value))}
          aria-label="Adjust blink alternation interval"
          className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-xs font-mono text-slate-200 focus:border-blue-400 focus:outline-none"
        >
          {INTERVAL_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
