import { GitCompare, X } from 'lucide-react';
import type { InvestigationRevision, RevisionDiffItem } from '../types/revision.types';
import { compareRevisions } from '../services/investigation-revision-service';

interface RevisionComparisonProps {
  olderRevision: InvestigationRevision;
  newerRevision: InvestigationRevision;
  onClose: () => void;
}

export function RevisionComparison({
  olderRevision,
  newerRevision,
  onClose,
}: RevisionComparisonProps) {
  const diffs: RevisionDiffItem[] = compareRevisions(olderRevision, newerRevision);
  const changedCount = diffs.filter((d) => d.isChanged).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-800 bg-[#0d1322] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-5 bg-[#0a0e1a]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <GitCompare className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">
                Revision Comparison (Side-by-Side Diff)
              </h3>
              <p className="text-xs text-slate-400">
                Comparing Rev #{olderRevision.revisionNumber} ({new Date(olderRevision.timestampUtc).toLocaleDateString()}) with Rev #{newerRevision.revisionNumber} ({new Date(newerRevision.timestampUtc).toLocaleDateString()}) — {changedCount} field{changedCount === 1 ? '' : 's'} modified
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0b101c] text-slate-400 border-b border-slate-800 font-mono">
                <tr>
                  <th className="p-3 w-1/4">Field</th>
                  <th className="p-3 w-3/8 text-rose-300 bg-rose-950/20">
                    Rev #{olderRevision.revisionNumber} (Previous)
                  </th>
                  <th className="p-3 w-3/8 text-emerald-300 bg-emerald-950/20">
                    Rev #{newerRevision.revisionNumber} (Updated)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {diffs.map((diff) => {
                  return (
                    <tr
                      key={diff.fieldName}
                      className={diff.isChanged ? 'bg-blue-950/20' : 'opacity-70 hover:opacity-100'}
                    >
                      <td className="p-3 font-medium text-slate-300 align-top">
                        <div className="flex items-center gap-1.5">
                          {diff.isChanged && (
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0" />
                          )}
                          <span>{diff.fieldLabel}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500 block mt-0.5">
                          {diff.fieldName}
                        </span>
                      </td>

                      {/* Before */}
                      <td className="p-3 text-slate-300 bg-rose-950/10 align-top">
                        <div className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed break-words">
                          {String(diff.beforeValue ?? '—')}
                        </div>
                      </td>

                      {/* After */}
                      <td className="p-3 text-slate-200 bg-emerald-950/10 align-top">
                        <div className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed break-words">
                          {String(diff.afterValue ?? '—')}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-400">
            <span className="font-medium text-slate-300">Non-Destructive Restoration Rule:</span> Restoring any older revision creates a brand new revision entry preserving complete historical lineage.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-800 p-4 bg-[#0a0e1a]">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            Close Diff View
          </button>
        </div>
      </div>
    </div>
  );
}
