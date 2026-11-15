import { useState, useEffect } from 'react';
import { ArrowRight, Compass, Layers } from 'lucide-react';
import type { CelestialObject } from '../types/object.types';
import {
  formatRaSexagesimal,
  formatDecSexagesimal,
  formatCategoryLabel,
} from '../services/object-service';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

interface ObjectCardProps {
  object: CelestialObject & {
    simple_title?: string;
    simple_explanation?: string;
    how_to_spot_the_shift?: string;
    plain_stats?: {
      speed?: string;
      distance?: string;
      temperature?: string;
      visibility?: string;
    };
    fun_fact?: string;
    images?: {
      epoch1: string;
      epoch2: string;
      difference: string;
    };
  };
}

export function ObjectCard({ object }: ObjectCardProps) {
  const {
    id,
    name,
    designation,
    category,
    status,
    associated_region,
    observations,
    has_spectral_data,
    simple_title,
    simple_explanation,
    how_to_spot_the_shift,
    plain_stats,
    fun_fact,
  } = object;

  const [viewMode, setViewMode] = useState<'e1' | 'e2' | 'diff'>('diff');
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (!isBlinking) return;
    const interval = setInterval(() => {
      setViewMode((v) => (v === 'e1' ? 'e2' : 'e1'));
    }, 650);
    return () => clearInterval(interval);
  }, [isBlinking]);

  const imgSrc =
    viewMode === 'e1'
      ? `/static/objects_media/${id}/epoch1.png`
      : viewMode === 'e2'
      ? `/static/objects_media/${id}/epoch2.png`
      : `/static/objects_media/${id}/difference.png`;

  const modeLabel =
    viewMode === 'e1'
      ? 'NASA SPHEREx Epoch 1 (2025.4)'
      : viewMode === 'e2'
      ? 'NASA SPHEREx Epoch 2 (2026.5)'
      : 'Difference Map (Shift Target)';

  const categoryColor =
    category === 'transient_candidate'
      ? 'bg-rose-950/60 text-rose-300 border-rose-700/50'
      : category === 'calibration_standard'
      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-700/50'
      : category === 'brown_dwarf'
      ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700/50'
      : category === 'variable_star'
      ? 'bg-amber-950/60 text-amber-300 border-amber-700/50'
      : 'bg-purple-950/60 text-purple-300 border-purple-700/50';

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-[#24344D] bg-[#101A2B]/95 p-5 transition-all duration-300 hover:border-[#4388FF]/60 hover:bg-[#131F33] shadow-[0_4px_22px_rgba(3,6,14,0.45)] hover:shadow-[0_14px_36px_rgba(3,6,14,0.7)] space-y-4">
      {/* Top Row: Category & Status */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-semibold text-[#45D5F2]">{id}</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono border border-slate-700 text-slate-300">
            {status}
          </span>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${categoryColor}`}>
          {simple_title || formatCategoryLabel(category)}
        </span>
      </div>

      {/* Object Title & Plain English Explanation */}
      <div className="space-y-1.5">
        <h3 className="font-[family-name:var(--font-display)] text-base sm:text-lg font-bold text-white transition-colors group-hover:text-[#45D5F2] leading-snug">
          {name}
        </h3>
        <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed">
          {simple_explanation || object.description}
        </p>
      </div>

      {/* NASA Multi-Epoch Image Blink Viewer */}
      <div className="space-y-2 rounded-xl border border-slate-800 bg-[#070B14] p-3">
        <div className="relative h-44 w-full overflow-hidden rounded-lg border border-slate-700/60 bg-black flex items-center justify-center">
          <img
            src={imgSrc}
            alt={name}
            className="h-full w-full object-contain bg-black/95 transition-opacity duration-200"
          />
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-black/75 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
            {modeLabel}
          </div>
          {isBlinking && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/80 text-black animate-pulse">
              ● AUTO-BLINKING
            </div>
          )}
        </div>

        {/* Interactive Buttons (Image Changes Every Time!) */}
        <div className="grid grid-cols-4 gap-1.5 text-[11px] font-semibold">
          <button
            onClick={() => {
              setIsBlinking(false);
              setViewMode('e1');
            }}
            className={`py-1 rounded bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-slate-200 border ${
              viewMode === 'e1' && !isBlinking
                ? 'border-blue-400 bg-blue-900/40 text-blue-300'
                : 'border-transparent'
            }`}
          >
            Epoch 1
          </button>
          <button
            onClick={() => {
              setIsBlinking(false);
              setViewMode('e2');
            }}
            className={`py-1 rounded bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-slate-200 border ${
              viewMode === 'e2' && !isBlinking
                ? 'border-blue-400 bg-blue-900/40 text-blue-300'
                : 'border-transparent'
            }`}
          >
            Epoch 2
          </button>
          <button
            onClick={() => {
              setIsBlinking(false);
              setViewMode('diff');
            }}
            className={`py-1 rounded bg-slate-800 hover:bg-slate-700 active:scale-95 transition-all text-slate-200 border ${
              viewMode === 'diff' && !isBlinking
                ? 'border-cyan-400 bg-cyan-900/40 text-cyan-300'
                : 'border-transparent'
            }`}
          >
            Diff Map
          </button>
          <button
            onClick={() => setIsBlinking(!isBlinking)}
            className="py-1 rounded bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold active:scale-95 transition-all flex items-center justify-center gap-1"
          >
            {isBlinking ? 'Stop' : '⚡ Blink'}
          </button>
        </div>
      </div>

      {/* How to Spot the Shift (Citizen Science Clue) */}
      {how_to_spot_the_shift && (
        <div className="rounded-lg bg-blue-950/30 border border-blue-800/40 p-2.5 space-y-1 text-xs">
          <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
            <span>💡</span> How to Spot the Shift:
          </div>
          <p className="text-slate-300 leading-relaxed text-[11px]">{how_to_spot_the_shift}</p>
        </div>
      )}

      {/* Plain Language Quick Stats */}
      {plain_stats && (
        <div className="grid grid-cols-2 gap-2 text-[11px] border-t border-slate-800/80 pt-3">
          <div>
            <div className="text-slate-400">Speed / Motion:</div>
            <div className="font-medium text-slate-200 truncate">{plain_stats.speed}</div>
          </div>
          <div>
            <div className="text-slate-400">Distance:</div>
            <div className="font-medium text-slate-200 truncate">{plain_stats.distance}</div>
          </div>
          <div>
            <div className="text-slate-400">Temperature:</div>
            <div className="font-medium text-slate-200 truncate">{plain_stats.temperature}</div>
          </div>
          <div>
            <div className="text-slate-400">Visibility:</div>
            <div className="font-medium text-slate-200 truncate">{plain_stats.visibility}</div>
          </div>
        </div>
      )}

      {/* Fun Cosmic Fact */}
      {fun_fact && (
        <div className="text-[11px] text-amber-200/90 italic bg-amber-950/20 border border-amber-800/30 rounded-lg p-2 leading-relaxed">
          <span className="font-bold not-italic mr-1 text-amber-300">🌟 Fun Fact:</span>
          {fun_fact}
        </div>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-800/80 pt-3 text-xs">
        <span className="font-mono text-slate-400 text-[11px]">{associated_region}</span>
        <Button
          to={`/objects/${id}`}
          variant="secondary"
          size="sm"
          className="hover:bg-blue-600 hover:text-white transition-all"
          rightIcon={<ArrowRight className="h-3.5 w-3.5" />}
        >
          Inspect Full Ledger
        </Button>
      </div>
    </div>
  );
}
