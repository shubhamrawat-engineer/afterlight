import { useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Calendar,
  HelpCircle,
} from 'lucide-react';
import type { MultiEpochRecord } from '../types/multi-epoch.types';
import { ObservationImage } from './ObservationImage';
import { getObsId, getObsDate } from '../../observations/services/observation-service';
import { resolveImageUrl } from '../services/temporal-analysis-service';

interface EpochSequenceViewerProps {
  selectedEpochs: MultiEpochRecord[];
  currentIndex: number;
  onSelectIndex: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  playbackSpeedMs: number;
  onChangeSpeed: (ms: number) => void;
  fallbackImage?: string | null;
  targetTitle?: string;
  className?: string;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'Not recorded';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return iso;
  }
}

export function EpochSequenceViewer({
  selectedEpochs,
  currentIndex,
  onSelectIndex,
  isPlaying,
  onTogglePlay,
  playbackSpeedMs,
  onChangeSpeed,
  fallbackImage,
  targetTitle,
  className,
}: EpochSequenceViewerProps) {
  const currentEpoch = selectedEpochs[currentIndex] ?? selectedEpochs[0];
  const timerRef = useRef<number | null>(null);

  // Automated playback stepping
  useEffect(() => {
    if (!isPlaying || selectedEpochs.length <= 1) {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = window.setInterval(() => {
      onSelectIndex((currentIndex + 1) % selectedEpochs.length);
    }, playbackSpeedMs);

    return () => {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, selectedEpochs.length, currentIndex, playbackSpeedMs, onSelectIndex]);

  const handlePrev = () => {
    const prev = (currentIndex - 1 + selectedEpochs.length) % selectedEpochs.length;
    onSelectIndex(prev);
  };

  const handleNext = () => {
    const next = (currentIndex + 1) % selectedEpochs.length;
    onSelectIndex(next);
  };

  if (!currentEpoch) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center text-xs text-slate-400">
        No observation epochs selected for sequence playback.
      </div>
    );
  }

  const currentId = getObsId(currentEpoch);
  const date = getObsDate(currentEpoch);
  const imageUrl = resolveImageUrl(currentEpoch.image || fallbackImage);

  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5.5 backdrop-blur-xl shadow-lg space-y-4 ${className ?? ''}`}
      aria-label="Multi-Epoch Sequence Player"
    >
      {/* Player Header & Notice */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Multi-Epoch Stepping Comparator
          </span>
          <h3 className="text-base font-bold text-slate-100">
            Sequential Epoch Progression
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-xs font-mono font-bold text-blue-300">
            Epoch {currentIndex + 1} of {selectedEpochs.length}
          </span>
        </div>
      </div>

      {/* Disclaimers: Playback is a UI sequence over demonstration assets */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-2.5 text-xs text-slate-300 flex items-start gap-2">
        <HelpCircle className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
        <span className="text-[11px] leading-relaxed">
          <strong>Demonstration Sequential Playback: </strong>
          Cycles through curated demonstration cutout frames across distinct observation passes. This is a scientific multi-epoch comparison tool, not continuous telescope footage.
        </span>
      </div>

      {/* Sequence Canvas & Overlay */}
      <div className="relative aspect-video max-h-[460px] w-full overflow-hidden rounded-xl border border-slate-800 bg-black flex items-center justify-center">
        <ObservationImage
          src={imageUrl}
          alt={`${targetTitle ?? 'Target'} at ${currentEpoch.epochLabel} (${currentId})`}
          className="h-full w-full object-contain"
        />

        {/* Live Overlay HUD */}
        <div className="absolute top-3 left-3 rounded-lg border border-slate-800/80 bg-slate-950/80 p-2.5 backdrop-blur-md space-y-1 font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="rounded bg-blue-600 px-1.5 py-0.2 text-[10px] font-bold text-white uppercase">
              {currentEpoch.epochLabel}
            </span>
            <span className="font-bold text-slate-200">{currentId}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            <Calendar className="h-3 w-3 text-sky-400" />
            <span>{formatDate(date)}</span>
            {currentEpoch.daysFromFirst > 0 && (
              <span className="text-slate-400">(+{currentEpoch.daysFromFirst}d baseline)</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-sky-300">
            <Sparkles className="h-3 w-3" />
            <span>{currentEpoch.wavelength_um ?? 'N/A'} μm</span>
            <span className="text-slate-400">• {currentEpoch.detector ?? 'Array'}</span>
          </div>
        </div>

        {/* Big On-Canvas Stepping Buttons */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous observation epoch"
          className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-700 bg-slate-950/80 p-2 text-slate-200 hover:bg-blue-600 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next observation epoch"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-700 bg-slate-950/80 p-2 text-slate-200 hover:bg-blue-600 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Playback Controls & Speed Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/60 p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTogglePlay}
            aria-label={isPlaying ? 'Pause sequence playback' : 'Play sequence playback'}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isPlaying ? 'PAUSE SEQUENCE' : 'PLAY SEQUENCE'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrev}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800"
          >
            Next
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-2 text-xs">
          <Clock className="h-4 w-4 text-slate-400" />
          <span className="text-slate-400 font-semibold">Speed:</span>
          {[500, 1000, 2000, 3000].map((ms) => (
            <button
              key={ms}
              type="button"
              onClick={() => onChangeSpeed(ms)}
              className={`rounded px-2 py-1 font-mono text-[11px] font-bold transition-colors ${
                playbackSpeedMs === ms
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              {ms / 1000}s
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
