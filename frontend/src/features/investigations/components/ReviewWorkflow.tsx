import { useState, useCallback } from 'react';
import {
  Award,
  Send,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileCheck,
  History,
  ShieldAlert,
} from 'lucide-react';
import type { InvestigationCase } from '../types/investigation.types';
import type {
  ReviewWorkflowStatus,
  SectionReviewItem,
  ReviewHistoryEntry,
} from '../types/review.types';
import {
  mapStatusToReviewState,
  fetchReviewStatus,
  saveReviewStatus,
  fetchSectionReviews,
  toggleSectionReview,
  fetchReviewHistory,
  recordReviewAction,
} from '../services/investigation-review-service';
import { ReviewComments } from './ReviewComments';
import { Button } from '../../../components/ui/Button';

interface ReviewWorkflowProps {
  investigation: InvestigationCase;
  onInvestigationUpdated: (updated: InvestigationCase) => void;
}

const REVIEW_STATE_CONFIG: Record<
  ReviewWorkflowStatus,
  { label: string; color: string; desc: string }
> = {
  NOT_SUBMITTED: {
    label: 'Not Submitted for Review',
    color: 'border-slate-700 bg-slate-900 text-slate-300',
    desc: 'Investigation dossier is currently in active author editing or draft status.',
  },
  SUBMITTED_FOR_REVIEW: {
    label: 'Submitted for Review',
    color: 'border-sky-500/40 bg-sky-950/80 text-sky-300',
    desc: 'Queued for internal peer review and scientific consistency checks.',
  },
  UNDER_REVIEW: {
    label: 'Under Peer Review',
    color: 'border-amber-500/40 bg-amber-950/80 text-amber-300',
    desc: 'Actively being inspected by science working group reviewers.',
  },
  REVISION_REQUESTED: {
    label: 'Revisions Requested',
    color: 'border-rose-500/40 bg-rose-950/80 text-rose-300',
    desc: 'Reviewers flagged questions or methodology ambiguities requiring update.',
  },
  APPROVED: {
    label: 'Documentation Approved (Sign-Off Complete)',
    color: 'border-emerald-500/40 bg-emerald-950/80 text-emerald-300',
    desc: 'Internal documentation protocol complete. (Notice: Certifies documentation completeness only; does not imply verified astronomical discovery).',
  },
  REJECTED: {
    label: 'Review Rejected',
    color: 'border-red-500/40 bg-red-950/80 text-red-300',
    desc: 'Dossier did not meet completeness criteria. Returned to draft status.',
  },
};

export function ReviewWorkflow({
  investigation,
  onInvestigationUpdated,
}: ReviewWorkflowProps) {
  const [currentReviewState, setCurrentReviewState] = useState<ReviewWorkflowStatus>(() =>
    fetchReviewStatus(
      investigation.id,
      investigation.review_status ?? mapStatusToReviewState(investigation.status)
    )
  );
  const [sections, setSections] = useState<SectionReviewItem[]>(() =>
    fetchSectionReviews(investigation.id)
  );
  const [history, setHistory] = useState<ReviewHistoryEntry[]>(() =>
    fetchReviewHistory(investigation.id)
  );
  const [actorName, setActorName] = useState<string>('Lead Investigator');
  const [actionNotes, setActionNotes] = useState<string>('');

  const reload = useCallback(() => {
    setCurrentReviewState(
      fetchReviewStatus(
        investigation.id,
        investigation.review_status ?? mapStatusToReviewState(investigation.status)
      )
    );
    setSections(fetchSectionReviews(investigation.id));
    setHistory(fetchReviewHistory(investigation.id));
  }, [investigation.id, investigation.review_status, investigation.status]);

  const handleStateTransition = async (newState: ReviewWorkflowStatus, actionName: string) => {
    recordReviewAction(investigation.id, {
      action: actionName,
      actor: actorName,
      previousReviewState: currentReviewState,
      newReviewState: newState,
      notes: actionNotes.trim() || undefined,
    });

    saveReviewStatus(investigation.id, newState);
    setCurrentReviewState(newState);

    const updatedCase: InvestigationCase = {
      ...investigation,
      review_status: newState,
      updated_at_utc: new Date().toISOString(),
    };

    onInvestigationUpdated(updatedCase);
    setActionNotes('');
    reload();
  };

  const handleToggleSection = (sectionId: string) => {
    toggleSectionReview(investigation.id, sectionId);
    reload();
  };

  const reviewedSectionsCount = sections.filter((s) => s.isReviewed).length;

  return (
    <div className="space-y-6">
      {/* Review Status Card */}
      <div className="rounded-2xl border border-[rgba(148,163,184,0.13)] bg-[rgba(15,21,35,0.78)] p-6 backdrop-blur-md shadow-lg space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-blue-400" />
              <h2 className="text-base font-semibold text-slate-100">
                Scientific Review Workflow &amp; Sign-Off
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Internal peer review pipeline tracking dossier completeness independently from case lifecycle state.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
                REVIEW_STATE_CONFIG[currentReviewState].color
              }`}
            >
              {REVIEW_STATE_CONFIG[currentReviewState].label}
            </span>
          </div>
        </div>

        {/* Clear Independence and Non-Discovery Notice */}
        <div className="flex items-start gap-2.5 rounded-xl border border-sky-500/30 bg-sky-950/20 p-3.5 text-xs text-sky-300">
          <ShieldAlert className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />
          <span>
            <strong>Review Status Separation Notice:</strong> Review status tracks document verification independently from investigation lifecycle. An <strong>APPROVED</strong> review certifies that report documentation standards have been met; it <em>never</em> implies scientific confirmation or verified astronomical discovery.
          </span>
        </div>

        {/* Current State Description */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="font-semibold text-slate-200">
              Workflow Status Details:
            </div>
            <p className="text-slate-400">
              {REVIEW_STATE_CONFIG[currentReviewState].desc}
            </p>
          </div>

          <div className="font-mono text-xs text-slate-400 shrink-0">
            Section Sign-Offs: <strong className="text-blue-300">{reviewedSectionsCount}</strong> / {sections.length}
          </div>
        </div>

        {/* State Transition Actions */}
        <div className="rounded-xl border border-slate-800/90 bg-slate-900/40 p-4 space-y-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Available Review Actions
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Your Reviewer Role
              </label>
              <input
                type="text"
                value={actorName}
                onChange={(e) => setActorName(e.target.value)}
                placeholder="Your Name / Working Group"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">
                Action Rationale / Note (Optional)
              </label>
              <input
                type="text"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="e.g. Approved photometric calibration, revisions resolved"
                className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {currentReviewState === 'NOT_SUBMITTED' && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleStateTransition('SUBMITTED_FOR_REVIEW', 'Submitted case for review')}
                leftIcon={<Send className="h-3.5 w-3.5" />}
              >
                Submit for Peer Review
              </Button>
            )}

            {currentReviewState === 'SUBMITTED_FOR_REVIEW' && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => handleStateTransition('UNDER_REVIEW', 'Initiated active peer review')}
                leftIcon={<Eye className="h-3.5 w-3.5" />}
              >
                Begin Active Peer Review
              </Button>
            )}

            {(currentReviewState === 'UNDER_REVIEW' || currentReviewState === 'SUBMITTED_FOR_REVIEW') && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleStateTransition('REVISION_REQUESTED', 'Requested author revisions')}
                  leftIcon={<AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
                >
                  Request Revisions
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleStateTransition('APPROVED', 'Approved investigation documentation')}
                  leftIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                >
                  Approve Documentation
                </Button>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleStateTransition('REJECTED', 'Rejected review and returned to draft')}
                  leftIcon={<XCircle className="h-3.5 w-3.5" />}
                >
                  Reject &amp; Return to Draft
                </Button>
              </>
            )}

            {currentReviewState === 'REVISION_REQUESTED' && (
              <>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleStateTransition('SUBMITTED_FOR_REVIEW', 'Re-submitted after completing revisions')}
                  leftIcon={<Send className="h-3.5 w-3.5" />}
                >
                  Re-submit Revised Dossier
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleStateTransition('UNDER_REVIEW', 'Re-opened review')}
                  leftIcon={<Eye className="h-3.5 w-3.5" />}
                >
                  Return to Active Review
                </Button>
              </>
            )}

            {currentReviewState === 'APPROVED' && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => handleStateTransition('UNDER_REVIEW', 'Re-opened approved dossier for re-examination')}
                leftIcon={<History className="h-3.5 w-3.5" />}
              >
                Re-open for Inspection
              </Button>
            )}
          </div>
        </div>

        {/* Section Review Checklist */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-emerald-400" />
              <span>Scientific Section Review Checklist (15 Sections)</span>
            </h3>
            <span className="font-mono text-xs text-slate-400">
              {reviewedSectionsCount} of {sections.length} Verified
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((sec) => (
              <div
                key={sec.sectionId}
                onClick={() => handleToggleSection(sec.sectionId)}
                className={`flex items-start gap-2.5 rounded-lg border p-3 cursor-pointer transition-all ${
                  sec.isReviewed
                    ? 'border-emerald-500/30 bg-emerald-950/20 text-slate-200'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={sec.isReviewed}
                  onChange={() => handleToggleSection(sec.sectionId)}
                  className="mt-0.5 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <div className={`font-medium ${sec.isReviewed ? 'text-emerald-300' : 'text-slate-300'}`}>
                    {sec.sectionTitle}
                  </div>
                  {sec.isReviewed && sec.reviewedAtUtc && (
                    <div className="font-mono text-[10px] text-emerald-500/80 mt-0.5">
                      Verified {new Date(sec.reviewedAtUtc).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit History Log */}
        {history.length > 0 && (
          <div className="space-y-3 border-t border-slate-800 pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <History className="h-4 w-4 text-slate-400" />
              <span>Review Action Audit History</span>
            </h3>

            <div className="space-y-2">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 rounded-lg border border-slate-800 bg-slate-900/40 px-3.5 py-2 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-200">{entry.action}</span>
                    <span className="text-slate-500">by</span>
                    <span className="text-blue-300">{entry.actor}</span>
                    {entry.notes && (
                      <span className="text-slate-400 italic font-sans">— "{entry.notes}"</span>
                    )}
                  </div>
                  <div className="font-mono text-[11px] text-slate-500">
                    {new Date(entry.timestampUtc).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Review Comments & Remarks Log */}
      <ReviewComments caseId={investigation.id} />
    </div>
  );
}
