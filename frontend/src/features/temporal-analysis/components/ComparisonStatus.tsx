import { ShieldCheck, AlertCircle, Database, Layers } from 'lucide-react';
import type { ComparisonStatusInfo } from '../types/temporal-analysis.types';
import { StatusBadge } from '../../explorer/components/StatusBadge';
import { PairQualityIndicator } from '../../observations/components/PairQualityIndicator';

interface ComparisonStatusProps {
  statusInfo: ComparisonStatusInfo;
  className?: string;
}

/**
 * Status panel delineating target dataset validation from observation pair compatibility.
 * Reinforces the fundamental astronomical rule that a verified target field can contain
 * incompatible multi-band observation epochs.
 */
export function ComparisonStatus({ statusInfo, className }: ComparisonStatusProps) {
  const { targetStatus, pairGrade, isComparisonReady, hasDifferenceAsset } = statusInfo;

  return (
    <div className={`rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md ${className ?? ''}`}>
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2.5">
        <Layers className="h-4 w-4 text-blue-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
          Investigation Validation Status
        </h4>
      </div>

      <div className="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* 1. Target Dataset Verification */}
        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Target Integrity</span>
            <Database className="h-3.5 w-3.5 text-blue-400" />
          </div>
          <div className="mt-1.5">
            <StatusBadge status={targetStatus} />
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Archival Catalogue Provenance</p>
        </div>

        {/* 2. Pair Photometric Compatibility */}
        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Pair Compatibility</span>
            <ShieldCheck className="h-3.5 w-3.5 text-sky-400" />
          </div>
          <div className="mt-1.5">
            <PairQualityIndicator grade={pairGrade} />
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Passband Spectral Overlap</p>
        </div>

        {/* 3. Subtraction Pipeline Readiness */}
        <div className="rounded-lg bg-slate-950/60 p-2.5 border border-slate-800/60">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Pipeline Subtraction</span>
            <AlertCircle className={`h-3.5 w-3.5 ${hasDifferenceAsset ? 'text-emerald-400' : 'text-amber-400'}`} />
          </div>
          <p className={`mt-1.5 text-xs font-bold font-mono ${isComparisonReady ? 'text-emerald-300' : 'text-rose-300'}`}>
            {isComparisonReady ? 'READY FOR TEMPORAL SUBTRACTION' : 'SUBTRACTION BLOCKED'}
          </p>
          <p className="mt-1 text-[10px] text-slate-400">
            {hasDifferenceAsset ? 'Calibrated subtraction map ingested' : 'Difference map calculation pending'}
          </p>
        </div>
      </div>
    </div>
  );
}
