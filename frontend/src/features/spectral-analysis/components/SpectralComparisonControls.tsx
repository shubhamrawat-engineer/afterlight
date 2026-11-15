import { Layers, Eye, RefreshCw, AlertTriangle } from 'lucide-react';
import type { ComparisonMode, SpectralProfile } from '../types/spectral.types';

interface SpectralComparisonControlsProps {
  mode: ComparisonMode;
  onModeChange: (mode: ComparisonMode) => void;
  profiles: SpectralProfile[];
  activeEpochIndex: number;
  onSelectEpochIndex: (idx: number) => void;
  onToggleNextEpoch: () => void;
  isCompatible: boolean;
  className?: string;
}

export function SpectralComparisonControls({
  mode,
  onModeChange,
  profiles,
  activeEpochIndex,
  onSelectEpochIndex,
  onToggleNextEpoch,
  isCompatible,
  className,
}: SpectralComparisonControlsProps) {
  if (profiles.length <= 1) {
    return (
      <div className={`flex items-center gap-2 text-xs text-slate-400 font-mono ${className ?? ''}`}>
        <span>Single Spectral Epoch Dataset</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-3 ${className ?? ''}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Mode Tabs */}
        <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Spectral Comparison Mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'overlay'}
            onClick={() => onModeChange('overlay')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-150 ${
              mode === 'overlay'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>OVERLAY COMPARISON</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === 'single'}
            onClick={() => onModeChange('single')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-150 ${
              mode === 'single'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>INDIVIDUAL SPECTRUM</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === 'toggle'}
            onClick={() => onModeChange('toggle')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all duration-150 ${
              mode === 'toggle'
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'border border-slate-800 bg-slate-900/60 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>EPOCH TOGGLE</span>
          </button>
        </div>

        {/* Subcontrols: Active Epoch Selector (for single/toggle modes) */}
        {mode !== 'overlay' && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase">Active Epoch:</span>
            <div className="flex gap-1.5">
              {profiles.map((p, idx) => (
                <button
                  key={p.epoch_id}
                  type="button"
                  onClick={() => onSelectEpochIndex(idx)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-mono font-bold transition-all ${
                    activeEpochIndex === idx
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'border border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {p.epoch_id}
                </button>
              ))}
            </div>

            {mode === 'toggle' && (
              <button
                type="button"
                onClick={onToggleNextEpoch}
                className="ml-2 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                Next Epoch →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Incompatibility Warning if flux units differ */}
      {!isCompatible && mode === 'overlay' && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 text-xs text-amber-300">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
          <span>
            Caution: Selected spectral profiles report different flux calibration units (e.g. μJy vs. MJy/sr). Direct vertical overlay may not be scientifically normalized.
          </span>
        </div>
      )}
    </div>
  );
}
