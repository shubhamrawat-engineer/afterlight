import { useState, useCallback } from 'react';
import {
  History,
  RotateCcw,
  GitCompare,
  Clock,
  Tag,
  AlertTriangle,
  Info,
} from 'lucide-react';
import type { InvestigationCase } from '../types/investigation.types';
import type { InvestigationRevision } from '../types/revision.types';
import {
  fetchRevisionHistory,
  createRevision,
  restoreRevision,
} from '../services/investigation-revision-service';
import { RevisionComparison } from './RevisionComparison';
import { Button } from '../../../components/ui/Button';

interface RevisionHistoryProps {
  investigation: InvestigationCase;
  onInvestigationUpdated: (updated: InvestigationCase) => void;
}

function getInitialRevisions(inv: InvestigationCase): InvestigationRevision[] {
  let revs = fetchRevisionHistory(inv.id);
  if (revs.length === 0) {
    // Seed initial revision #1 if empty
    const initial = createRevision(inv.id, {
      changeDescription: 'Initial investigation case initialized.',
      updatedSections: ['Case Creation'],
      previousStatus: inv.status,
      newStatus: inv.status,
      userActionLabel: 'Case Initialized',
      snapshot: inv,
    });
    revs = [initial];
  }
  return revs;
}

export function RevisionHistory({
  investigation,
  onInvestigationUpdated,
}: RevisionHistoryProps) {
  const [revisions, setRevisions] = useState<InvestigationRevision[]>(() =>
    getInitialRevisions(investigation)
  );
  const [comparePair, setComparePair] = useState<{
    older: InvestigationRevision;
    newer: InvestigationRevision;
  } | null>(null);
  const [restoreConfirmRev, setRestoreConfirmRev] = useState<InvestigationRevision | null>(null);

  const loadRevisions = useCallback(() => {
    setRevisions(getInitialRevisions(investigation));
  }, [investigation]);

  const handleRestore = (rev: InvestigationRevision) => {
    try {
      const { restoredCase } = restoreRevision(investigation.id, rev.revisionId, investigation);
      onInvestigationUpdated(restoredCase);
      loadRevisions();
      setRestoreConfirmRev(null);
    } catch (err: unknown) {
      console.error(err);
    }
  };

  return (
    <div className="rounded-2xl border border-[rgba(148,163,184,0.13)] bg-[rgba(15,21,35,0.78)] p-6 backdrop-blur-md shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-semibold text-slate-100">
              Revision History &amp; Non-Destructive Audit Trail
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Immutable log of all edits, status transitions, and snapshot rollbacks for case{' '}
            <span className="font-mono text-blue-300">{investigation.id}</span>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 font-mono text-xs text-slate-300">
            {revisions.length} Revision{revisions.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Demonstration Notice */}
      <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 text-xs text-amber-300">
        <Info className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        <span>
          <strong>Demonstration Audit Notice:</strong> Revision history is tracked and persisted non-destructively in browser localStorage. In a production deployment, audit trails are cryptographically signed and stored in a tamper-evident distributed append-only database.
        </span>
      </div>

      {/* Revision Timeline List */}
      <div className="space-y-4">
        {revisions.map((rev, index) => {
          const isLatest = index === 0;
          const previousRev = revisions[index + 1];

          return (
            <div
              key={rev.revisionId}
              className={`relative rounded-xl border p-4.5 transition-all ${
                isLatest
                  ? 'border-blue-500/30 bg-blue-950/15 shadow-[0_0_15px_rgba(59,130,246,0.06)]'
                  : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded bg-blue-500/20 px-2 py-0.5 font-mono text-xs font-semibold text-blue-300 border border-blue-500/30">
                      Rev #{rev.revisionNumber}
                    </span>

                    {isLatest && (
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                        CURRENT ACTIVE
                      </span>
                    )}

                    <span className="font-mono text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(rev.timestampUtc).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-200">
                    {rev.changeDescription}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400">
                      <Tag className="h-3 w-3 text-slate-500" />
                      Action: <strong className="text-slate-300">{rev.userActionLabel}</strong>
                    </span>

                    <span className="text-slate-600">•</span>

                    <span className="text-[11px] font-mono text-slate-400">
                      Status: <span className="text-slate-300 uppercase">{rev.previousStatus}</span> →{' '}
                      <span className="text-blue-300 uppercase font-semibold">{rev.newStatus}</span>
                    </span>

                    {rev.updatedSections && rev.updatedSections.length > 0 && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="text-[11px] text-slate-400">
                          Updated: {rev.updatedSections.join(', ')}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Revision Actions */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 sm:self-center">
                  {previousRev && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setComparePair({ older: previousRev, newer: rev })}
                      leftIcon={<GitCompare className="h-3.5 w-3.5" />}
                    >
                      Compare with #{previousRev.revisionNumber}
                    </Button>
                  )}

                  {!isLatest && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setRestoreConfirmRev(rev)}
                      leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
                    >
                      Restore to Rev #{rev.revisionNumber}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal for Restoration */}
      {restoreConfirmRev && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-[#0d1322] p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-semibold text-white">
                Restore Revision #{restoreConfirmRev.revisionNumber}?
              </h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Restoring this revision will copy its fields into the current investigation and append a brand new revision entry (<strong>Rev #{revisions.length + 1}</strong>).
            </p>

            <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 text-[11px] text-slate-400">
              <strong>Non-Destructive Guarantee:</strong> Your current state and all past revisions remain completely intact in the audit trail.
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setRestoreConfirmRev(null)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleRestore(restoreConfirmRev)}
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              >
                Confirm Non-Destructive Restore
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Diff Modal */}
      {comparePair && (
        <RevisionComparison
          olderRevision={comparePair.older}
          newerRevision={comparePair.newer}
          onClose={() => setComparePair(null)}
        />
      )}
    </div>
  );
}
