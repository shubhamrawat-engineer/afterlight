import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Layers,
  Sparkles,
  Compass,
  Radio,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import type {
  CompatibilityAssessment,
  CompatibilityTask,
} from '../types/compatibility.types';
import { CompatibilityStatusBadge } from './CompatibilityStatusBadge';

interface CompatibilityMatrixProps {
  assessments: Record<CompatibilityTask, CompatibilityAssessment>;
  onSelectTask?: (task: CompatibilityTask) => void;
  className?: string;
}

const TASK_ROWS: Array<{
  task: CompatibilityTask;
  label: string;
  icon: typeof Eye;
}> = [
  { task: 'visual', label: 'Visual Comparability', icon: Eye },
  { task: 'difference_image', label: 'Difference-Image Readiness', icon: Layers },
  { task: 'photometric', label: 'Photometric Comparability', icon: Sparkles },
  { task: 'astrometric', label: 'Astrometric Comparability', icon: Compass },
  { task: 'spectral', label: 'Spectral Comparability', icon: Radio },
];

/**
 * Responsive Scientific Comparison Readiness Matrix.
 * Displays all 5 scientific task categories with their status, available metadata,
 * missing requirements, and row-level expansion for comprehensive drilldown.
 */
export function CompatibilityMatrix({
  assessments,
  onSelectTask,
  className,
}: CompatibilityMatrixProps) {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (task: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [task]: !prev[task],
    }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    TASK_ROWS.forEach((r) => {
      all[r.task] = true;
    });
    setExpandedRows(all);
  };

  const collapseAll = () => {
    setExpandedRows({});
  };

  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5.5 backdrop-blur-xl shadow-lg space-y-4 ${className ?? ''}`}
    >
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Task-Specific Evaluation Matrix
          </span>
          <h3 className="text-base font-bold text-slate-100">
            Scientific Comparison Readiness Matrix
          </h3>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={expandAll}
            className="rounded border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="rounded border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Responsive Table / Card Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs" aria-label="Scientific Compatibility Matrix">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th scope="col" className="py-3 px-3">
                Assessment Category
              </th>
              <th scope="col" className="py-3 px-3">
                Compatibility Status
              </th>
              <th scope="col" className="py-3 px-3 hidden md:table-cell">
                Available Information
              </th>
              <th scope="col" className="py-3 px-3 hidden lg:table-cell">
                Missing Requirements
              </th>
              <th scope="col" className="py-3 px-3 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {TASK_ROWS.map((item) => {
              const assessment = assessments[item.task];
              const isExpanded = Boolean(expandedRows[item.task]);
              const Icon = item.icon;

              if (!assessment) return null;

              return (
                <tr
                  key={item.task}
                  className="group transition-colors hover:bg-slate-900/40"
                >
                  <td colSpan={5} className="p-0">
                    <div className="flex flex-col">
                      {/* Main Row */}
                      <div className="grid grid-cols-12 items-center p-3 gap-2">
                        {/* 1. Assessment Category */}
                        <div className="col-span-12 sm:col-span-5 md:col-span-4 flex items-center gap-2">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900 text-blue-400 shrink-0">
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            {onSelectTask ? (
                              <button
                                type="button"
                                onClick={() => onSelectTask(item.task)}
                                className="font-bold text-left text-slate-100 group-hover:text-blue-300 transition-colors block truncate hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded"
                              >
                                {item.label}
                              </button>
                            ) : (
                              <span className="font-bold text-slate-100 group-hover:text-blue-300 transition-colors block truncate">
                                {item.label}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 md:hidden">
                              {assessment.requirements.filter((r) => r.isSatisfied).length}/{assessment.requirements.length} satisfied
                            </span>
                          </div>
                        </div>

                        {/* 2. Compatibility Status */}
                        <div className="col-span-8 sm:col-span-4 md:col-span-3">
                          <CompatibilityStatusBadge status={assessment.status} size="sm" />
                        </div>

                        {/* 3. Available Information */}
                        <div className="col-span-3 hidden md:block">
                          <p className="text-[11px] text-slate-300 line-clamp-1">
                            {assessment.availableInformation[0] ?? 'None'}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            +{assessment.availableInformation.length - 1} more fields
                          </span>
                        </div>

                        {/* 4. Missing Requirements */}
                        <div className="col-span-2 hidden lg:block">
                          <p className="text-[11px] text-amber-300/90 line-clamp-1">
                            {assessment.missingInformation[0] ?? 'All verified'}
                          </p>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {assessment.missingInformation.length} pending checks
                          </span>
                        </div>

                        {/* 5. Row Toggle Button */}
                        <div className="col-span-4 sm:col-span-3 md:col-span-2 lg:col-span-1 sm:col-start-10 md:col-start-11 lg:col-start-12 flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleRow(item.task)}
                            aria-expanded={isExpanded}
                            aria-label={`Expand details for ${item.label}`}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-800 bg-slate-900/80 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:border-slate-700 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                          >
                            <span>{isExpanded ? 'Hide' : 'Details'}</span>
                            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Sub-Detail Panel */}
                      {isExpanded && (
                        <div className="border-t border-slate-800/80 bg-slate-950/70 p-4 space-y-3">
                          <p className="text-xs text-slate-300 leading-relaxed">
                            {assessment.taskDescription}
                          </p>

                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Available Parameters */}
                            <div className="rounded-xl border border-emerald-500/20 bg-emerald-950/15 p-3 space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Available Information
                              </span>
                              <ul className="list-disc ml-4 space-y-1 text-[11px] text-slate-300">
                                {assessment.availableInformation.map((info, idx) => (
                                  <li key={idx}>{info}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Missing Requirements */}
                            <div className="rounded-xl border border-amber-500/20 bg-amber-950/15 p-3 space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Missing Validation Requirements
                              </span>
                              <ul className="list-disc ml-4 space-y-1 text-[11px] text-slate-300">
                                {assessment.missingInformation.map((info, idx) => (
                                  <li key={idx}>{info}</li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60 text-xs">
                            <span className="text-[11px] text-slate-400">
                              <strong className="text-slate-300">Required Validation: </strong>
                              {assessment.requiredValidation}
                            </span>
                            {onSelectTask && (
                              <button
                                type="button"
                                onClick={() => onSelectTask(item.task)}
                                className="font-semibold text-blue-400 hover:text-blue-300 hover:underline"
                              >
                                View full task breakdown →
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
