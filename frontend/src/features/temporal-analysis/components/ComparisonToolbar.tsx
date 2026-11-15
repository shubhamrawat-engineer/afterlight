import { Eye, Flame, Layers, Columns2 } from 'lucide-react';
import type { ComparisonMode, ActiveEpoch, DifferenceMetadata } from '../types/temporal-analysis.types';
import { ThenNowControls } from './ThenNowControls';
import { BlinkControls } from './BlinkControls';
import { DifferenceControls } from './DifferenceControls';

interface ComparisonToolbarProps {
  mode: ComparisonMode;
  onModeChange: (mode: ComparisonMode) => void;
  activeEpoch: ActiveEpoch;
  onSetThen: () => void;
  onSetNow: () => void;
  earlierDate: string | null;
  laterDate: string | null;
  isBlinking: boolean;
  onToggleBlink: () => void;
  blinkInterval: number;
  onBlinkIntervalChange: (ms: number) => void;
  differenceMeta: DifferenceMetadata | null;
  className?: string;
}

/**
 * Top command toolbar for the Temporal Analysis comparison workstation.
 * Houses mode selectors (Then/Now, Side-by-Side, Blink, Difference) and their context-sensitive subcontrols.
 */
export function ComparisonToolbar({
  mode,
  onModeChange,
  activeEpoch,
  onSetThen,
  onSetNow,
  earlierDate,
  laterDate,
  isBlinking,
  onToggleBlink,
  blinkInterval,
  onBlinkIntervalChange,
  differenceMeta,
  className,
}: ComparisonToolbarProps) {
  const hasDifference = Boolean(differenceMeta?.image);

  const modeDescriptions: Record<ComparisonMode, string> = {
    then_now: 'Manual Observation Switcher',
    side_by_side: 'Synchronized Side-by-Side Split View',
    blink: 'Automated Blink Alternation',
    difference: 'Demonstration Difference Placeholder Map',
  };

  return (
    <div className={`flex flex-col gap-4 rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-4.5 backdrop-blur-xl shadow-lg ${className ?? ''}`}>
      {/* Top Row: Mode Selection Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Comparison View Mode">
          {/* 1. THEN / NOW */}
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'then_now'}
            onClick={() => onModeChange('then_now')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
              mode === 'then_now'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                : 'border border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Eye className="h-4 w-4" />
            <span>THEN / NOW</span>
          </button>

          {/* 2. SIDE-BY-SIDE */}
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'side_by_side'}
            onClick={() => onModeChange('side_by_side')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
              mode === 'side_by_side'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                : 'border border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Columns2 className="h-4 w-4 text-sky-400" />
            <span>SIDE-BY-SIDE</span>
          </button>

          {/* 3. BLINK MODE */}
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'blink'}
            onClick={() => onModeChange('blink')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
              mode === 'blink'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                : 'border border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Flame className="h-4 w-4 text-amber-400" />
            <span>BLINK MODE</span>
          </button>

          {/* 4. DIFFERENCE VIEW */}
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'difference'}
            disabled={!hasDifference}
            title={hasDifference ? 'Display demonstration difference placeholder map' : 'Difference asset not available for this target'}
            onClick={() => onModeChange('difference')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
              !hasDifference
                ? 'opacity-40 cursor-not-allowed border border-slate-800 bg-slate-950 text-slate-400'
                : mode === 'difference'
                ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]'
                : 'border border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>DIFFERENCE VIEW</span>
            {!hasDifference && <span className="text-[10px] text-slate-400">(Unavailable)</span>}
          </button>
        </div>

        {/* Current Active Mode Indicator */}
        <div className="text-right">
          <span className="text-[10px] uppercase font-semibold text-slate-400">Viewing Mode</span>
          <p className="text-xs font-mono font-bold text-slate-200">
            {modeDescriptions[mode]}
          </p>
        </div>
      </div>

      {/* Bottom Row: Context-Sensitive Subcontrols */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {mode === 'then_now' && (
          <ThenNowControls
            activeEpoch={activeEpoch}
            onSetThen={onSetThen}
            onSetNow={onSetNow}
            earlierDate={earlierDate}
            laterDate={laterDate}
          />
        )}

        {mode === 'side_by_side' && (
          <div className="flex flex-wrap items-center justify-between gap-3 w-full text-xs text-slate-300">
            <span>
              <strong className="text-sky-300">Synchronized Split Viewport: </strong>
              Drag or zoom either pane to inspect Earlier (T0) and Later (T1) demonstration cutouts simultaneously at identical pixel coordinates.
            </span>
          </div>
        )}

        {mode === 'blink' && (
          <BlinkControls
            isPlaying={isBlinking}
            onTogglePlay={onToggleBlink}
            intervalMs={blinkInterval}
            onIntervalChange={onBlinkIntervalChange}
            currentEpoch={activeEpoch}
          />
        )}

        {mode === 'difference' && (
          <DifferenceControls differenceMeta={differenceMeta} />
        )}
      </div>
    </div>
  );
}
