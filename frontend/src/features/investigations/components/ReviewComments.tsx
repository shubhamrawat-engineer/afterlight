import { useState, useCallback } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Filter,
  Check,
  ShieldAlert,
} from 'lucide-react';
import type { ReviewComment } from '../types/review.types';
import {
  fetchReviewComments,
  addReviewComment,
  toggleResolveComment,
  deleteReviewComment,
} from '../services/investigation-review-service';
import { Button } from '../../../components/ui/Button';

interface ReviewCommentsProps {
  caseId: string;
}

export function ReviewComments({ caseId }: ReviewCommentsProps) {
  const [comments, setComments] = useState<ReviewComment[]>(() =>
    fetchReviewComments(caseId)
  );
  const [authorLabel, setAuthorLabel] = useState<string>('Lead Science Reviewer');
  const [content, setContent] = useState<string>('');
  const [sectionId, setSectionId] = useState<string>('');
  const [isRevisionRequest, setIsRevisionRequest] = useState<boolean>(false);
  const [filterMode, setFilterMode] = useState<'all' | 'unresolved' | 'revision_requests'>('all');

  const reload = useCallback(() => {
    setComments(fetchReviewComments(caseId));
  }, [caseId]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addReviewComment(caseId, {
      authorLabel,
      content,
      sectionId: sectionId || undefined,
      isRevisionRequest,
    });

    setContent('');
    setIsRevisionRequest(false);
    reload();
  };

  const handleToggleResolve = (commentId: string) => {
    toggleResolveComment(caseId, commentId);
    reload();
  };

  const handleDelete = (commentId: string) => {
    deleteReviewComment(caseId, commentId);
    reload();
  };

  const filteredComments = comments.filter((c) => {
    if (filterMode === 'unresolved') return !c.resolved;
    if (filterMode === 'revision_requests') return c.isRevisionRequest;
    return true;
  });

  return (
    <div className="rounded-2xl border border-[rgba(148,163,184,0.13)] bg-[rgba(15,21,35,0.78)] p-6 backdrop-blur-md shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Investigation Review Comments &amp; Revision Log
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Collaborative review remarks, verification inquiries, and revision requests.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 p-1">
          <Filter className="h-3.5 w-3.5 text-slate-500 ml-2" />
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              filterMode === 'all'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({comments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('unresolved')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              filterMode === 'unresolved'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Open ({comments.filter((c) => !c.resolved).length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('revision_requests')}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              filterMode === 'revision_requests'
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Revision Requests ({comments.filter((c) => c.isRevisionRequest).length})
          </button>
        </div>
      </div>

      {/* Demonstration Banner */}
      <div className="flex items-start gap-2.5 rounded-xl border border-sky-500/30 bg-sky-950/20 p-3 text-xs text-sky-300">
        <ShieldAlert className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />
        <span>
          <strong>Demonstration Record Notice:</strong> All review comments and sign-offs are locally simulated records stored in browser memory. They do not constitute official peer review or mission governance approvals.
        </span>
      </div>

      {/* Comment Creation Form */}
      <form
        onSubmit={handleAddComment}
        className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 space-y-3"
      >
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
          Post Review Remark or Revision Request
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Reviewer Role / Attribution
            </label>
            <input
              type="text"
              value={authorLabel}
              onChange={(e) => setAuthorLabel(e.target.value)}
              placeholder="e.g. Science Reviewer, Photometry Team"
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-mono text-slate-400 block mb-1">
              Referenced Section (Optional)
            </label>
            <select
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
            >
              <option value="">General (Whole Investigation)</option>
              <option value="identity">1. Identity &amp; Classification</option>
              <option value="objective">2. Research Objective</option>
              <option value="target_observation">3. Target &amp; Coordinates</option>
              <option value="timeline">4. Timeline &amp; Epochs</option>
              <option value="compatibility">5. Instrument Compatibility</option>
              <option value="temporal_comparison">6. Temporal Subtraction</option>
              <option value="measurements">7. Quantitative Measurements</option>
              <option value="uncertainty_flags">8. Uncertainty &amp; Quality Flags</option>
              <option value="evidence_ledger">9. Evidence Ledger</option>
              <option value="provenance">10. Data Provenance</option>
              <option value="explanations">11. Working Hypotheses</option>
              <option value="limitations">12. Epistemic Unknowns</option>
              <option value="validation_required">13. Required Follow-up</option>
              <option value="reproducibility">14. Reproducibility Parameters</option>
              <option value="references">15. References &amp; Disclaimers</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-[11px] font-mono text-slate-400 block mb-1">
            Review Commentary
          </label>
          <textarea
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add scientific commentary, methodology critique, or required revision details..."
            className="w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={isRevisionRequest}
              onChange={(e) => setIsRevisionRequest(e.target.checked)}
              className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500"
            />
            <span className="flex items-center gap-1.5 font-medium">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
              Flag as Formal Revision Request (Blocks Approval)
            </span>
          </label>

          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!content.trim()}
            leftIcon={<Send className="h-3.5 w-3.5" />}
          >
            Post Review Remark
          </Button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3.5">
        {filteredComments.length === 0 ? (
          <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-8 text-center text-xs text-slate-400">
            No review comments match current filter.
          </div>
        ) : (
          filteredComments.map((comment) => (
            <div
              key={comment.id}
              className={`rounded-xl border p-4 transition-all ${
                comment.resolved
                  ? 'border-slate-800 bg-slate-900/40 opacity-70'
                  : comment.isRevisionRequest
                  ? 'border-amber-500/40 bg-amber-950/20'
                  : 'border-slate-800/90 bg-slate-900/70'
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">
                      {comment.authorLabel}
                    </span>

                    <span className="rounded bg-sky-950 px-2 py-0.2 text-[9px] font-mono text-sky-400 border border-sky-800/60 uppercase">
                      PEER REVIEW RECORD
                    </span>

                    {comment.isRevisionRequest && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/40">
                        <AlertTriangle className="h-3 w-3" />
                        REVISION REQUEST
                      </span>
                    )}

                    {comment.sectionId && (
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                        Section: {comment.sectionId}
                      </span>
                    )}

                    <span className="text-[11px] font-mono text-slate-500">
                      {new Date(comment.createdAtUtc).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {comment.content}
                  </p>

                  {comment.resolved && (
                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 pt-1">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>
                        Resolved {comment.resolvedAtUtc ? `(${new Date(comment.resolvedAtUtc).toLocaleDateString()})` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => handleToggleResolve(comment.id)}
                    className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      comment.resolved
                        ? 'border border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                        : 'border border-emerald-500/40 bg-emerald-950/80 text-emerald-300 hover:bg-emerald-900'
                    }`}
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>{comment.resolved ? 'Reopen' : 'Mark Resolved'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    aria-label="Delete comment"
                    className="rounded p-1 text-slate-500 hover:bg-rose-950/50 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
