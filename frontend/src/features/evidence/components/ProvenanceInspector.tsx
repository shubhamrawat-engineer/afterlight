import {
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  ArrowDown,
  Info,
} from 'lucide-react';
import type {
  CompleteProvenanceLineage,
  ProvenanceStageData,
  ProvenanceStageStatus,
} from '../types/provenance.types';

interface ProvenanceInspectorProps {
  lineage: CompleteProvenanceLineage;
  className?: string;
}

function getStageStatusConfig(status: ProvenanceStageStatus) {
  switch (status) {
    case 'Completed':
      return {
        badgeClass: 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300',
        icon: CheckCircle2,
        circleClass: 'border-emerald-500 bg-emerald-950 text-emerald-300',
      };
    case 'Pending':
      return {
        badgeClass: 'border-amber-500/40 bg-amber-950/60 text-amber-300',
        icon: AlertTriangle,
        circleClass: 'border-amber-500 bg-amber-950 text-amber-300',
      };
    case 'Failed':
      return {
        badgeClass: 'border-rose-500/40 bg-rose-950/60 text-rose-300',
        icon: AlertTriangle,
        circleClass: 'border-rose-500 bg-rose-950 text-rose-300',
      };
    case 'Demonstration only':
    case 'SPHEREx Verified':
      return {
        badgeClass: 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300',
        icon: CheckCircle2,
        circleClass: 'border-emerald-500 bg-emerald-950 text-emerald-300',
      };
    case 'Not available':
    default:
      return {
        badgeClass: 'border-slate-700 bg-slate-900 text-slate-400',
        icon: Clock,
        circleClass: 'border-slate-700 bg-slate-900 text-slate-400',
      };
  }
}

function StageCard({
  stage,
  isLast,
}: {
  stage: ProvenanceStageData;
  isLast: boolean;
}) {
  const config = getStageStatusConfig(stage.status);
  const StatusIcon = config.icon;

  return (
    <div className="relative flex items-start gap-4">
      {/* Node & Connector line */}
      <div className="flex flex-col items-center">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-mono font-bold shadow-sm ${config.circleClass}`}
        >
          {stage.stageNumber}
        </div>
        {!isLast && (
          <div className="h-full min-h-[50px] w-0.5 bg-slate-800 my-1 flex items-center justify-center">
            <ArrowDown className="h-3 w-3 text-slate-700 shrink-0" />
          </div>
        )}
      </div>

      {/* Stage Content */}
      <div className="flex-1 pb-6">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 space-y-3 shadow-sm">
          {/* Top row */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="font-mono text-[10px] uppercase font-bold text-slate-500">
                Pipeline Stage 0{stage.stageNumber}
              </span>
              <h4 className="text-sm font-bold text-slate-100">{stage.stageName}</h4>
            </div>

            <span
              className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold ${config.badgeClass}`}
            >
              <StatusIcon className="h-3 w-3" />
              <span>{stage.status}</span>
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {stage.description}
          </p>

          {/* References, Timestamp & Software Version */}
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 rounded-lg bg-slate-900/60 p-3 border border-slate-800/80 text-[11px] text-slate-400">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-500">
                Input References:
              </span>
              <span className="font-mono text-slate-300 block truncate">
                {stage.inputReferences.join(', ')}
              </span>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-500">
                Output References:
              </span>
              <span className="font-mono text-slate-300 block truncate">
                {stage.outputReferences.join(', ')}
              </span>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-500">
                Software / Pipeline:
              </span>
              <span className="font-mono text-slate-300 block truncate">
                {stage.softwarePipelineVersion ?? 'Awaiting execution'}
              </span>
            </div>

            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-500">
                Timestamp:
              </span>
              <span className="font-mono text-slate-300 block">
                {stage.processingTimestampUtc ?? 'Pending backend'}
              </span>
            </div>

            <div className="sm:col-span-2">
              <span className="block text-[10px] uppercase font-bold text-slate-500">
                Validation State:
              </span>
              <span className="font-mono text-slate-300 block">
                {stage.validationState}
              </span>
            </div>
          </div>

          {stage.notes && (
            <p className="text-[11px] text-slate-500 italic">
              <strong>Audit Note:</strong> {stage.notes}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProvenanceInspector({ lineage, className }: ProvenanceInspectorProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.9)] p-5 backdrop-blur-xl shadow-xl space-y-5 ${
        className ?? ''
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Database className="h-5 w-5 text-blue-400" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              End-to-End Scientific Provenance Lineage
            </h3>
            <p className="text-[11px] text-slate-400">
              Full data pedigree from space telescope acquisition to evidence dossier
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-700 bg-slate-900 px-2.5 py-0.5 text-[10px] font-mono text-slate-300">
            {lineage.stages.length} Stages
          </span>
        </div>
      </div>

      {/* Lineage Metadata Summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3 text-xs">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-blue-400" />
          <span className="font-bold text-slate-300">Pipeline:</span>
          <span className="font-mono text-slate-200">{lineage.pipelineName}</span>
        </div>
        <div className="text-slate-400 text-[11px]">
          <span>Validation State: </span>
          <span className="font-mono text-amber-300/90 font-semibold">
            {lineage.overallValidationState}
          </span>
        </div>
      </div>

      {/* Stage Flow */}
      <div className="space-y-0 pt-2">
        {lineage.stages.map((stage, idx) => (
          <StageCard
            key={stage.stageId}
            stage={stage}
            isLast={idx === lineage.stages.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
