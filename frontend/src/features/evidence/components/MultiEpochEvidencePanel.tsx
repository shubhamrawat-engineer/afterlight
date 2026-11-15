import { Link } from 'react-router-dom';
import {
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Tag,
  ArrowLeft,
} from 'lucide-react';
import type { ObservationRecord } from '../../observations/types/observation.types';
import { getObsId, getObsDate } from '../../observations/services/observation-service';
import { loadCandidateChangeRecords } from '../../../services/investigation-session';

interface MultiEpochEvidencePanelProps {
  targetId: string;
  targetTitle?: string;
  observations: ObservationRecord[];
  selectedEpochIds: string[];
  earlierId?: string | null;
  laterId?: string | null;
  className?: string;
}

export function MultiEpochEvidencePanel({
  targetId,
  observations,
  selectedEpochIds,
  earlierId,
  laterId,
  className,
}: MultiEpochEvidencePanelProps) {
  const userCandidateRecords = loadCandidateChangeRecords(targetId);

  const temporalUrlParams = new URLSearchParams();
  if (earlierId) temporalUrlParams.set('earlier', earlierId);
  if (laterId) temporalUrlParams.set('later', laterId);
  if (selectedEpochIds.length > 0) {
    temporalUrlParams.set('epochs', selectedEpochIds.join(','));
  }
  const temporalLink = `/temporal-analysis/${targetId}?${temporalUrlParams.toString()}`;

  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.9)] p-5 backdrop-blur-xl shadow-xl space-y-5 ${
        className ?? ''
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Clock className="h-5 w-5 text-amber-400" />
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
              Multi-Epoch Evidence Integration (Phase 4 Connection)
            </h3>
            <p className="text-[11px] text-slate-400">
              Temporal cross-correlation across survey passes and user candidate hypotheses
            </p>
          </div>
        </div>

        <Link
          to={temporalLink}
          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-950/40 px-3 py-1.5 text-xs font-semibold text-blue-300 hover:bg-blue-900/40 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Temporal Lab</span>
        </Link>
      </div>

      {/* Epoch Evidence Availability Grid */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-blue-400" />
          <span>Survey Epoch Data Matrix ({observations.length} Epochs Cataloged)</span>
        </h4>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {observations.map((obs, idx) => {
            const obsId = getObsId(obs);
            const date = getObsDate(obs) ?? '2025-01-01';
            const isSelected = selectedEpochIds.includes(obsId);
            const isPairEndpoint = obsId === earlierId || obsId === laterId;

            return (
              <div
                key={obsId}
                className={`rounded-xl border p-3.5 space-y-2 transition-all ${
                  isSelected
                    ? 'border-blue-500/50 bg-blue-950/20 shadow-sm'
                    : 'border-slate-800 bg-slate-950/60 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-slate-200">
                    Epoch 0{idx + 1}
                  </span>
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 rounded bg-blue-900/60 border border-blue-500/40 px-1.5 py-0.2 text-[9px] font-bold text-blue-200">
                      <CheckCircle2 className="h-2.5 w-2.5 text-blue-400" />
                      <span>SELECTED</span>
                    </span>
                  ) : (
                    <span className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.2 text-[9px] font-bold text-slate-500">
                      UNSELECTED
                    </span>
                  )}
                </div>

                <div className="font-mono text-[10px] text-slate-400 space-y-0.5">
                  <div className="text-slate-300 font-bold truncate">{obsId}</div>
                  <div>UTC: {date.slice(0, 10)}</div>
                  <div className="text-slate-500">{obs.product_type ?? 'Spectral Mosaic'}</div>
                </div>

                <div className="border-t border-slate-800/60 pt-2 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Pair Role:</span>
                  <span className="font-mono text-slate-300">
                    {isPairEndpoint
                      ? obsId === earlierId
                        ? 'Earlier (T0)'
                        : 'Later (T1)'
                      : 'Cadence Node'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Candidate Hypotheses from Phase 4 */}
      <div className="space-y-2 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Candidate Hypotheses from Temporal Analysis ({userCandidateRecords.length})</span>
          </h4>
          <span className="text-[10px] text-slate-500 font-mono">
            User-Created Hypotheses
          </span>
        </div>

        {userCandidateRecords.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-center text-xs text-slate-400">
            <p>
              No candidate change records were saved in Step 4 for this target.
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              You can log candidate changes in the Temporal Analysis Lab to correlate them with quantitative measurements.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {userCandidateRecords.map((cand) => (
              <div
                key={cand.id}
                className="rounded-xl border border-slate-800 bg-slate-950/70 p-3.5 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-200">{cand.title}</span>
                  <span className="rounded border border-amber-500/40 bg-amber-950/50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-300">
                    {cand.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <Tag className="h-3 w-3 text-blue-400" />
                  <span className="font-mono text-blue-300">{cand.category}</span>
                </div>

                {cand.notes && (
                  <p className="text-[11px] text-slate-300 italic border-l-2 border-slate-700 pl-2">
                    &ldquo;{cand.notes}&rdquo;
                  </p>
                )}

                <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 text-[10px] text-slate-500">
                  <span>Epochs: {cand.associatedEpochIds.join(', ')}</span>
                  <span>{new Date(cand.createdAtUtc).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick link to Phase 4 Temporal Comparison */}
      <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/50 p-3.5 text-xs">
        <div className="space-y-0.5">
          <span className="font-bold text-slate-200 block">
            Inspect Image Differences &amp; Temporal Blink
          </span>
          <p className="text-[11px] text-slate-400">
            Open the Two-Epoch Comparator or Multi-Epoch Sequence Player for these observation passes.
          </p>
        </div>

        <Link
          to={temporalLink}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors shadow-sm"
        >
          <span>Open Temporal Lab</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
