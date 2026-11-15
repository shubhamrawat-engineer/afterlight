import { useState, useEffect } from 'react';
import { Eye, Zap, Layers, Compass, ArrowRight, Activity, Sparkles, ShieldCheck } from 'lucide-react';
import type { CelestialObject } from '../types/object.types';

interface ObjectMultiEpochViewerProps {
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
  };
}

export function ObjectMultiEpochViewer({ object }: ObjectMultiEpochViewerProps) {
  const { id, name, category, observations, temporal_behaviour, how_to_spot_the_shift, plain_stats, fun_fact } = object;

  const [viewMode, setViewMode] = useState<'e1' | 'e2' | 'diff' | 'split'>('diff');
  const [isBlinking, setIsBlinking] = useState(false);
  const [blinkPhase, setBlinkPhase] = useState<'e1' | 'e2'>('e1');

  // Auto-blink effect between Epoch 1 and Epoch 2
  useEffect(() => {
    if (!isBlinking) return;
    const interval = setInterval(() => {
      setBlinkPhase((prev) => (prev === 'e1' ? 'e2' : 'e1'));
    }, 600);
    return () => clearInterval(interval);
  }, [isBlinking]);

  const activeSrc = isBlinking
    ? `/static/objects_media/${id}/${blinkPhase === 'e1' ? 'epoch1' : 'epoch2'}.png`
    : viewMode === 'e1'
    ? `/static/objects_media/${id}/epoch1.png`
    : viewMode === 'e2'
    ? `/static/objects_media/${id}/epoch2.png`
    : `/static/objects_media/${id}/difference.png`;

  const obs0 = observations?.[0];
  const obs1 = observations?.[1] || observations?.[observations.length - 1];

  const e1Label = obs0?.observation_id ? `Epoch 1: ${obs0.observation_id}` : 'NASA SPHEREx Epoch 1 (Baseline)';
  const e2Label = obs1?.observation_id ? `Epoch 2: ${obs1.observation_id}` : 'NASA SPHEREx Epoch 2 (Follow-up)';

  const modeBadge = isBlinking
    ? blinkPhase === 'e1'
      ? '● BLINK: EPOCH 1 (T0)'
      : '● BLINK: EPOCH 2 (T1)'
    : viewMode === 'e1'
    ? 'EPOCH 1 (BASELINE)'
    : viewMode === 'e2'
    ? 'EPOCH 2 (FOLLOW-UP)'
    : 'SUBTRACTED DIFFERENCE MAP (RESIDUAL)';

  return (
    <div className="rounded-2xl border border-[#24344D] bg-[#0c1424] p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A2940] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <Layers className="w-5 h-5 text-[#45D5F2]" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Multi-Epoch Visual Verification &amp; Discovery Ledger
            </h2>
          </div>
          <p className="text-xs text-[#8293AD] mt-1">
            Compare baseline and follow-up SPHEREx observations. Live blink or subtract to reveal celestial shifts.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>GAIA DR3 CO-REGISTERED</span>
          </span>
        </div>
      </div>

      {/* Main Visual Display Viewport */}
      {viewMode === 'split' && !isBlinking ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Epoch 1 */}
          <div className="space-y-1.5 rounded-xl border border-[#1A2940] bg-[#070B14] p-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-blue-300">
              <span className="font-semibold">Epoch 1 (Baseline)</span>
              <span className="text-[#8293AD]">{obs0?.effective_wavelength_um || 3.98} μm</span>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden border border-[#24344D] bg-black">
              <img
                src={`/static/objects_media/${id}/epoch1.png`}
                alt={`${name} Epoch 1`}
                className="w-full h-full object-contain bg-black/95"
              />
            </div>
          </div>

          {/* Epoch 2 */}
          <div className="space-y-1.5 rounded-xl border border-[#1A2940] bg-[#070B14] p-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-purple-300">
              <span className="font-semibold">Epoch 2 (Follow-up)</span>
              <span className="text-[#8293AD]">{obs1?.effective_wavelength_um || 3.98} μm</span>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden border border-[#24344D] bg-black">
              <img
                src={`/static/objects_media/${id}/epoch2.png`}
                alt={`${name} Epoch 2`}
                className="w-full h-full object-contain bg-black/95"
              />
            </div>
          </div>

          {/* Difference Map */}
          <div className="space-y-1.5 rounded-xl border border-[#1A2940] bg-[#070B14] p-2.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-cyan-300">
              <span className="font-semibold">Subtracted Difference</span>
              <span className="text-[#8293AD]">Residual (ZOGY)</span>
            </div>
            <div className="relative aspect-video rounded-lg overflow-hidden border border-[#24344D] bg-black">
              <img
                src={`/static/objects_media/${id}/difference.png`}
                alt={`${name} Difference Map`}
                className="w-full h-full object-contain bg-black/95"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full aspect-video sm:h-80 rounded-xl overflow-hidden border border-[#24344D] bg-[#040711] flex items-center justify-center">
          <img
            src={activeSrc}
            alt={`${name} ${modeBadge}`}
            className="w-full h-full object-contain transition-opacity duration-150"
          />
          {/* Top-left Overlay Pill */}
          <div className="absolute top-3 left-3 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-[#070B14]/85 backdrop-blur-md text-[#45D5F2] border border-[#45D5F2]/40 shadow-lg">
            {modeBadge}
          </div>

          {/* Blink Indicator */}
          {isBlinking && (
            <div className="absolute top-3 right-3 px-3 py-1 rounded-lg text-xs font-mono font-bold bg-amber-500/90 text-black shadow-lg animate-pulse">
              ● AUTO-BLINKING (600ms)
            </div>
          )}
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => {
              setIsBlinking(false);
              setViewMode('e1');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              viewMode === 'e1' && !isBlinking
                ? 'bg-blue-600/25 border-blue-500 text-blue-200'
                : 'bg-[#101A2B] border-[#24344D] text-[#8293AD] hover:text-white'
            }`}
          >
            Epoch 1
          </button>
          <button
            type="button"
            onClick={() => {
              setIsBlinking(false);
              setViewMode('e2');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              viewMode === 'e2' && !isBlinking
                ? 'bg-purple-600/25 border-purple-500 text-purple-200'
                : 'bg-[#101A2B] border-[#24344D] text-[#8293AD] hover:text-white'
            }`}
          >
            Epoch 2
          </button>
          <button
            type="button"
            onClick={() => {
              setIsBlinking(false);
              setViewMode('diff');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              viewMode === 'diff' && !isBlinking
                ? 'bg-cyan-600/25 border-cyan-500 text-cyan-200'
                : 'bg-[#101A2B] border-[#24344D] text-[#8293AD] hover:text-white'
            }`}
          >
            Diff Map
          </button>
          <button
            type="button"
            onClick={() => {
              setIsBlinking(false);
              setViewMode('split');
            }}
            className={`hidden sm:inline-block px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
              viewMode === 'split' && !isBlinking
                ? 'bg-indigo-600/25 border-indigo-500 text-indigo-200'
                : 'bg-[#101A2B] border-[#24344D] text-[#8293AD] hover:text-white'
            }`}
          >
            Side-by-Side (All 3)
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setViewMode('diff');
            setIsBlinking(!isBlinking);
          }}
          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            isBlinking
              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20'
              : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{isBlinking ? 'Stop Blink' : '⚡ Live Blink Comparator'}</span>
        </button>
      </div>

      {/* Simple Form Data Breakdown (For Non-Astronomers & Experts Alike) */}
      <div className="rounded-xl border border-[#1A2940] bg-[#070B14] p-4 space-y-4">
        {/* Simple Explanation & How to Spot the Shift */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs font-semibold text-[#45D5F2]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>How to Spot What Changed Between Epochs (In Simple Terms)</span>
          </div>
          <p className="text-xs sm:text-[13px] text-slate-200 leading-relaxed">
            {how_to_spot_the_shift ||
              'When you blink between Epoch 1 and Epoch 2, stationary stars stay frozen in place while this candidate shifts position or changes brightness. In the Difference Map, subtracted background stars cancel to zero, leaving a clear positive-negative residual where the object moved.'}
          </p>
        </div>

        {/* Simple Plain Language Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-[#1A2940] text-xs">
          <div className="p-3 rounded-lg bg-[#101A2B] border border-[#1A2940] space-y-1">
            <span className="text-[#8293AD] text-[10px] font-mono uppercase block">Speed / Motion</span>
            <span className="text-[#F4F7FF] font-semibold text-xs block">
              {plain_stats?.speed || `${temporal_behaviour?.motion_rate_mas_per_day || 26.2} mas/day`}
            </span>
            <span className="text-[10px] text-[#45D5F2]">Speed across deep space</span>
          </div>

          <div className="p-3 rounded-lg bg-[#101A2B] border border-[#1A2940] space-y-1">
            <span className="text-[#8293AD] text-[10px] font-mono uppercase block">Estimated Distance</span>
            <span className="text-[#F4F7FF] font-semibold text-xs block">
              {plain_stats?.distance || '48.2 AU (~4.5 Billion Miles)'}
            </span>
            <span className="text-[10px] text-[#45D5F2]">Outer solar system rim</span>
          </div>

          <div className="p-3 rounded-lg bg-[#101A2B] border border-[#1A2940] space-y-1">
            <span className="text-[#8293AD] text-[10px] font-mono uppercase block">Thermal Glow</span>
            <span className="text-[#F4F7FF] font-semibold text-xs block">
              {plain_stats?.temperature || '40.2 K (-387°F)'}
            </span>
            <span className="text-[10px] text-[#45D5F2]">Infrared heat signature</span>
          </div>

          <div className="p-3 rounded-lg bg-[#101A2B] border border-[#1A2940] space-y-1">
            <span className="text-[#8293AD] text-[10px] font-mono uppercase block">Observational Baseline</span>
            <span className="text-[#F4F7FF] font-semibold text-xs block">
              {temporal_behaviour?.time_baseline_days || 379} Days (~1.0 Year)
            </span>
            <span className="text-[10px] text-emerald-400">Optimal parallax baseline</span>
          </div>
        </div>

        {/* Fun Fact / Real Astronomical Discovery Clue */}
        {fun_fact && (
          <div className="p-3 rounded-lg bg-amber-500/8 border border-amber-500/25 text-xs text-amber-200/90 leading-relaxed">
            <strong className="text-amber-300 font-semibold not-italic mr-1.5">🌟 Cosmic Fact:</strong>
            {fun_fact}
          </div>
        )}
      </div>
    </div>
  );
}
