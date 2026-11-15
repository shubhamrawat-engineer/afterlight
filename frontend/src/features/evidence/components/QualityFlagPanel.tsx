import { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import type {
  ScientificQualityFlag,
  QualityFlagSeverity,
} from '../types/evidence.types';

interface QualityFlagPanelProps {
  flags: ScientificQualityFlag[];
  className?: string;
  onUpdateReviewStatus?: (flagId: string, newStatus: ScientificQualityFlag['reviewStatus']) => void;
}

type FilterSource = 'ALL' | 'BACKEND_CONFIRMED' | 'AVAILABLE';

function getSeverityBadge(severity: QualityFlagSeverity) {
  switch (severity) {
    case 'CRITICAL':
      return {
        badgeClass: 'border-rose-500/50 bg-rose-950/60 text-rose-300',
        label: 'CRITICAL',
      };
    case 'WARNING':
      return {
        badgeClass: 'border-amber-500/50 bg-amber-950/60 text-amber-300',
        label: 'WARNING',
      };
    case 'CAUTION':
      return {
        badgeClass: 'border-yellow-500/50 bg-yellow-950/60 text-yellow-300',
        label: 'CAUTION',
      };
    case 'INFORMATIONAL':
    default:
      return {
        badgeClass: 'border-blue-500/50 bg-blue-950/60 text-blue-300',
        label: 'INFO',
      };
  }
}

export function QualityFlagPanel({
  flags: initialFlags,
  className,
  onUpdateReviewStatus,
}: QualityFlagPanelProps) {
  const [flags, setFlags] = useState<ScientificQualityFlag[]>(initialFlags);
  const [filterSource, setFilterSource] = useState<FilterSource>('ALL');

  const handleToggleReview = (flagId: string) => {
    setFlags((prev) =>
      prev.map((f) => {
        if (f.id === flagId) {
          const nextStatus =
            f.reviewStatus === 'UNREVIEWED'
              ? 'REVIEWED'
              : f.reviewStatus === 'REVIEWED'
                ? 'CONFIRMED'
                : 'UNREVIEWED';
          onUpdateReviewStatus?.(flagId, nextStatus);
          return { ...f, reviewStatus: nextStatus };
        }
        return f;
      })
    );
  };

  const filteredFlags = flags.filter((f) => {
    if (filterSource === 'BACKEND_CONFIRMED') return f.source === 'BACKEND_CONFIRMED';
    if (filterSource === 'AVAILABLE') return f.source === 'AVAILABLE';
    return true;
  });

  const backendCount = flags.filter((f) => f.source === 'BACKEND_CONFIRMED').length;
  const demoCount = flags.filter((f) => f.source === 'AVAILABLE').length;

  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.9)] p-5 backdrop-blur-xl shadow-xl space-y-4 ${
        className ?? ''
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="h-5 w-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Scientific Quality Flags &amp; Data Caveats
            </h3>
            <p className="text-[11px] text-slate-400">
              Detector masking, registration status, calibration caveats, and artifact filtering
            </p>
          </div>
        </div>
        <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-0.5 text-[10px] font-mono text-slate-300">
          {flags.length} Flags Cataloged
        </span>
      </div>

      {/* Filter Tabs: All vs Backend Confirmed vs Demonstration Only */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterSource('ALL')}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              filterSource === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Flags ({flags.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterSource('BACKEND_CONFIRMED')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              filterSource === 'BACKEND_CONFIRMED'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="h-3 w-3" />
            <span>Backend Confirmed ({backendCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterSource('AVAILABLE')}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              filterSource === 'AVAILABLE'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="h-3 w-3" />
            <span>Demonstration Caveats ({demoCount})</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          <span>Click review status to acknowledge</span>
        </div>
      </div>

      {/* Flag Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {filteredFlags.length === 0 ? (
          <div className="col-span-full rounded-xl border border-slate-800 bg-slate-950/60 p-6 text-center space-y-2">
            <ShieldCheck className="mx-auto h-6 w-6 text-slate-500" />
            <h4 className="text-xs font-bold text-slate-300">
              {filterSource === 'BACKEND_CONFIRMED'
                ? 'No Backend-Confirmed Quality Flags Available'
                : 'No Quality Flags Match Current Filter'}
            </h4>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
              {filterSource === 'BACKEND_CONFIRMED'
                ? 'AFTERLIGHT is currently running in a frontend demonstration environment. Quality flags will be populated as backend-confirmed once connected to verified SPHEREx pipeline data reduction outputs.'
                : 'No quality flags are currently cataloged for this view.'}
            </p>
          </div>
        ) : (
          filteredFlags.map((flag) => {
          const sev = getSeverityBadge(flag.severity);
          const isBackend = flag.source === 'BACKEND_CONFIRMED';

          return (
            <div
              key={flag.id}
              className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-2.5"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-mono text-[10px] font-bold text-slate-400">
                      {flag.flag}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">{flag.name}</h4>
                  </div>
                  <span
                    className={`rounded border px-1.5 py-0.5 text-[9px] font-extrabold uppercase ${sev.badgeClass}`}
                  >
                    {sev.label}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {flag.description}
                </p>
              </div>

              {/* Affected Obs & Scientific Implication */}
              <div className="space-y-1 text-[11px] border-t border-slate-800/60 pt-2 text-slate-400">
                <div className="flex justify-between">
                  <span>Affected:</span>
                  <span className="font-mono text-slate-200">{flag.affectedObservation}</span>
                </div>
                <div>
                  <strong className="text-slate-300">Implication:</strong> {flag.scientificImplication}
                </div>
              </div>

              {/* Footer: Source & Review Status */}
              <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 text-[10px]">
                <span
                  className={`inline-flex items-center gap-1 font-mono font-semibold ${
                    isBackend ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {isBackend ? (
                    <ShieldCheck className="h-3 w-3" />
                  ) : (
                    <Info className="h-3 w-3" />
                  )}
                  <span>{isBackend ? 'Pipeline Verified' : 'Demo Caveat'}</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleReview(flag.id)}
                  className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-bold transition-colors ${
                    flag.reviewStatus === 'CONFIRMED'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                      : flag.reviewStatus === 'REVIEWED'
                        ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                        : 'bg-slate-900 text-slate-400 border border-slate-700 hover:text-slate-200'
                  }`}
                  title="Click to toggle review state"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  <span>{flag.reviewStatus}</span>
                </button>
              </div>
            </div>
          );
        })
      )}
      </div>
    </div>
  );
}
