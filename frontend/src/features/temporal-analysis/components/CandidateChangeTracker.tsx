import { useState } from 'react';
import {
  Plus,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import type {
  CandidateChangeRecord,
  CandidateChangeCategory,
  CandidateChangeStatus,
  MultiEpochRecord,
} from '../types/multi-epoch.types';
import {
  CANDIDATE_CATEGORY_CONFIG,
  createCandidateChangeRecord,
} from '../services/multi-epoch-service';
import { getObsId } from '../../observations/services/observation-service';

interface CandidateChangeTrackerProps {
  targetId: string;
  selectedEpochs: MultiEpochRecord[];
  candidateRecords: CandidateChangeRecord[];
  onAddCandidate: (record: CandidateChangeRecord) => void;
  onDeleteCandidate: (id: string) => void;
  onUpdateStatus: (id: string, status: CandidateChangeStatus) => void;
  className?: string;
}

export function CandidateChangeTracker({
  targetId,
  selectedEpochs,
  candidateRecords,
  onAddCandidate,
  onDeleteCandidate,
  onUpdateStatus,
  className,
}: CandidateChangeTrackerProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CandidateChangeCategory>('brightness_variation');
  const [userHypothesis, setUserHypothesis] = useState('');
  const [associatedEpochIds, setAssociatedEpochIds] = useState<string[]>(
    selectedEpochs.map((e) => getObsId(e))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newRecord = createCandidateChangeRecord({
      targetId,
      category,
      title,
      description,
      associatedEpochIds:
        associatedEpochIds.length > 0
          ? associatedEpochIds
          : selectedEpochs.map((ep) => getObsId(ep)),
      userHypothesis,
    });

    onAddCandidate(newRecord);
    setTitle('');
    setDescription('');
    setUserHypothesis('');
    setIsFormOpen(false);
  };

  const toggleAssociatedEpoch = (id: string) => {
    setAssociatedEpochIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5.5 backdrop-blur-xl shadow-lg space-y-4 ${className ?? ''}`}
      aria-label="Candidate Change Tracking Interface"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Investigator Observations &amp; Change Log
          </span>
          <h3 className="text-base font-bold text-slate-100">
            Multi-Epoch Candidate Change Tracking ({candidateRecords.length})
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setIsFormOpen((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{isFormOpen ? 'Close Form' : 'Log New Candidate'}</span>
        </button>
      </div>

      {/* Mandatory Scientific Boundary Disclaimer */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-200/90 flex items-start gap-2.5">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-300 font-semibold">User-Created Scientific Hypotheses: </strong>
          <span>
            Candidate change records logged here represent researcher notes and exploratory hypotheses. They do NOT constitute automated transient discoveries, confirmed proper motion, or orbital solutions without verified multi-epoch pipeline cross-validation.
          </span>
        </div>
      </div>

      {/* New Candidate Creation Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-700 bg-slate-900/60 p-4 space-y-3.5 text-xs"
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="candidate-category" className="block text-slate-300 font-semibold">
                Candidate Category
              </label>
              <select
                id="candidate-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as CandidateChangeCategory)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              >
                {(Object.keys(CANDIDATE_CATEGORY_CONFIG) as CandidateChangeCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {CANDIDATE_CATEGORY_CONFIG[cat].label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="candidate-title" className="block text-slate-300 font-semibold">
                Hypothesis Title
              </label>
              <input
                id="candidate-title"
                type="text"
                placeholder="e.g. Asymmetric brightening in SW quadrant"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200 placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="candidate-description" className="block text-slate-300 font-semibold">
              Observations &amp; Visual Notes
            </label>
            <textarea
              id="candidate-description"
              rows={2}
              placeholder="Describe what was observed between epochs (e.g. source appears 1.5 magnitudes brighter in Epoch 3 compared to Epoch 1)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-950 p-2 text-slate-200 placeholder-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            />
          </div>

          {/* Associated Epoch Checkboxes */}
          <div className="space-y-1.5">
            <span className="block text-slate-300 font-semibold">
              Associated Epochs for this Candidate:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {selectedEpochs.map((ep) => {
                const epId = getObsId(ep);
                const isChecked = associatedEpochIds.includes(epId);
                return (
                  <button
                    key={epId}
                    type="button"
                    onClick={() => toggleAssociatedEpoch(epId)}
                    className={`rounded px-2 py-1 text-[11px] font-mono font-semibold border transition-colors ${
                      isChecked
                        ? 'border-blue-500 bg-blue-950 text-blue-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    {isChecked ? '✓ ' : '+ '}
                    {ep.epochLabel} ({epId})
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-500"
            >
              Save Candidate Record
            </button>
          </div>
        </form>
      )}

      {/* Candidate Records List */}
      {candidateRecords.length === 0 ? (
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/40 p-6 text-center text-xs text-slate-400">
          No candidate changes logged yet for this target. Click &ldquo;Log New Candidate&rdquo; to record a visual change hypothesis across observation epochs.
        </div>
      ) : (
        <div className="space-y-2.5">
          {candidateRecords.map((cand) => {
            const catConfig = CANDIDATE_CATEGORY_CONFIG[cand.category] ?? CANDIDATE_CATEGORY_CONFIG.unclassified;

            return (
              <div
                key={cand.id}
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-2 text-xs transition-colors hover:border-slate-700"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${catConfig.badgeColor} ${catConfig.borderColor}`}
                    >
                      {catConfig.label}
                    </span>
                    <h4 className="font-bold text-slate-100">{cand.title}</h4>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Dropdown */}
                    <select
                      value={cand.status}
                      onChange={(e) => onUpdateStatus(cand.id, e.target.value as CandidateChangeStatus)}
                      aria-label="Update candidate review status"
                      className="rounded border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-200"
                    >
                      <option value="unreviewed">Unreviewed</option>
                      <option value="under_review">Under Review</option>
                      <option value="resolved">Resolved</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => onDeleteCandidate(cand.id)}
                      aria-label="Delete candidate change record"
                      className="rounded p-1 text-slate-400 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {cand.description}
                </p>

                {/* Associated Epoch Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 font-mono text-[10px] text-slate-400">
                  <span className="font-sans text-slate-500">Epochs:</span>
                  {cand.associatedEpochIds.map((id) => (
                    <span
                      key={id}
                      className="rounded bg-slate-900 border border-slate-800 px-1.5 py-0.2 text-slate-300"
                    >
                      {id}
                    </span>
                  ))}
                  <span className="text-slate-500 ml-auto">
                    Logged: {new Date(cand.createdAtUtc).toLocaleDateString('en-GB')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
