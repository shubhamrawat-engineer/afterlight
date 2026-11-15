import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Compass,
  Download,
  Send,
  ShieldAlert,
  Layers,
  Bot,
  ImageOff,
  AlertTriangle,
  Tag,
  Copy,
  Archive,
  RotateCcw,
  FileCheck2,
  Award,
  History,
  Fingerprint,
} from 'lucide-react';
import { useInvestigationDetail } from '../hooks/useInvestigationDetail';
import {
  InvestigationStatusBadge,
  SubmissionStatusBadge,
  ConfidenceBadge,
} from '../components/InvestigationStatusBadge';
import {
  formatInvestigationCategory,
  duplicateInvestigation,
  archiveInvestigation,
  restoreArchivedInvestigation,
  updateInvestigationStatus,
} from '../services/investigation-service';
import { fetchCompleteEvidenceBundle } from '../../evidence/services/evidence-service';
import type { CompleteEvidenceBundle } from '../../evidence/services/evidence-service';
import type { InvestigationCase, InvestigationStatus } from '../types/investigation.types';
import { ObservationReferences } from '../components/ObservationReferences';
import { EvidenceCollection } from '../components/EvidenceCollection';
import { InvestigationProgressTracker } from '../components/InvestigationProgressTracker';
import { ReportBuilder } from '../components/ReportBuilder';
import { ReviewWorkflow } from '../components/ReviewWorkflow';
import { RevisionHistory } from '../components/RevisionHistory';
import { ReproducibilityPanel } from '../components/ReproducibilityPanel';
import { LoadingState } from '../../../components/common/LoadingState';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';
import { Button } from '../../../components/ui/Button';
import { resolveImageUrl, isDemonstrationAsset } from '../../explorer/services/explorer-service';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'Not available';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC',
    });
  } catch {
    return iso;
  }
}

export function InvestigationDetailPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const {
    investigation,
    isLoading,
    isSubmitting,
    error,
    refetch,
    submit,
    exportJson,
  } = useInvestigationDetail(caseId);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'report' | 'review' | 'revisions' | 'reproducibility'
  >('overview');

  const [evidenceBundle, setEvidenceBundle] = useState<CompleteEvidenceBundle | null>(null);

  useEffect(() => {
    if (investigation?.target_id) {
      fetchCompleteEvidenceBundle(investigation.target_id, {
        candidateId: investigation.candidate_id ?? undefined,
        epochIds:
          investigation.selected_epoch_ids ??
          (investigation.earlier_obs_id && investigation.later_obs_id
            ? [investigation.earlier_obs_id, investigation.later_obs_id]
            : undefined),
      })
        .then((bundle) => setEvidenceBundle(bundle))
        .catch(() => {});
    }
  }, [
    investigation?.target_id,
    investigation?.candidate_id,
    investigation?.earlier_obs_id,
    investigation?.later_obs_id,
    investigation?.selected_epoch_ids,
  ]);

  const diffUrl = resolveImageUrl(investigation?.difference_image);
  const isDemoDiff = isDemonstrationAsset(diffUrl);
  const [prevDiffUrl, setPrevDiffUrl] = useState<string | null>(diffUrl);
  const [diffImageState, setDiffImageState] = useState<'idle' | 'loading' | 'loaded' | 'failed'>(
    diffUrl ? 'loading' : 'idle'
  );

  if (diffUrl !== prevDiffUrl) {
    setPrevDiffUrl(diffUrl);
    setDiffImageState(diffUrl ? 'loading' : 'idle');
  }

  const handleDuplicate = async () => {
    if (!investigation) return;
    try {
      const result = await duplicateInvestigation(investigation.id);
      navigate(`/investigations/${result.data.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchive = async () => {
    if (!investigation) return;
    try {
      await archiveInvestigation(investigation.id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async () => {
    if (!investigation) return;
    try {
      await restoreArchivedInvestigation(investigation.id);
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvestigationUpdated = (_updated: InvestigationCase) => {
    refetch();
  };

  const handleStatusTransition = async (newStatus: InvestigationStatus, rationale?: string) => {
    if (!investigation) return;
    try {
      await updateInvestigationStatus(
        investigation.id,
        newStatus,
        rationale ?? `Lifecycle transitioned to ${newStatus.toUpperCase()}`
      );
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-var(--navbar-height))] items-center justify-center bg-[#060810] px-4">
        <LoadingState message={`Retrieving case file ${caseId ?? ''}...`} fullHeight />
      </div>
    );
  }

  if (error || !investigation) {
    return (
      <div className="mx-auto min-h-[50vh] max-w-2xl px-4 py-16 text-center">
        <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-8 shadow-xl">
          <ShieldAlert className="mx-auto h-12 w-12 text-rose-400" />
          <h2 className="mt-4 text-xl font-bold text-white">Investigation Case Unavailable</h2>
          <p className="mt-2 text-sm text-slate-300">
            {error ?? `Case file "${caseId}" could not be retrieved from the investigation registry.`}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={refetch}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Retry Retrieval
            </button>
            <Link
              to="/investigations"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Archive</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isDraft = investigation.status === 'draft';
  const isArchived = investigation.status === 'archived';
  const epochsCount =
    investigation.associated_epochs_count ??
    (investigation.earlier_obs_id && investigation.later_obs_id ? 2 : 0);

  return (
    <div className="min-h-[calc(100vh-var(--navbar-height))] bg-[#060810] py-8 sm:py-10">
      <div
        className="mx-auto flex flex-col gap-6 px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--content-max-width)' }}
      >
        {/* Top Back Link & Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <Link
            to="/investigations"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Investigation Archive</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              to={`/ai?contextType=investigation&caseId=${investigation.id}&targetId=${investigation.target_id}&targetName=${encodeURIComponent(investigation.target_title)}`}
              variant="outline"
              size="sm"
              leftIcon={<Bot className="h-3.5 w-3.5" />}
            >
              COSMOS AI Summary
            </Button>

            <Button
              type="button"
              onClick={handleDuplicate}
              variant="outline"
              size="sm"
              leftIcon={<Copy className="h-3.5 w-3.5" />}
            >
              Duplicate Draft
            </Button>

            {isArchived ? (
              <Button
                type="button"
                onClick={handleRestore}
                variant="outline"
                size="sm"
                leftIcon={<RotateCcw className="h-3.5 w-3.5" />}
              >
                Restore Case
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleArchive}
                variant="outline"
                size="sm"
                leftIcon={<Archive className="h-3.5 w-3.5" />}
              >
                Archive
              </Button>
            )}

            <Button
              type="button"
              onClick={exportJson}
              variant="secondary"
              size="sm"
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Export JSON
            </Button>

            {isDraft && (
              <Button
                type="button"
                onClick={submit}
                disabled={isSubmitting}
                variant="primary"
                size="sm"
                leftIcon={<Send className="h-3.5 w-3.5" />}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Case'}
              </Button>
            )}
          </div>
        </div>

        {/* SECTION A: Investigation Overview */}
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-[rgba(15,21,35,0.78)] p-6 backdrop-blur-xl shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-blue-400">{investigation.id}</span>
              <InvestigationStatusBadge status={investigation.status} />
              <SubmissionStatusBadge status={investigation.submission_status} />
              <span className="inline-flex items-center gap-1 rounded border border-slate-700/80 bg-slate-900/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-300">
                <Tag className="h-3 w-3 text-sky-400" />
                {formatInvestigationCategory(investigation.category)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <DemonstrationDataBadge variant="compact" label="ACTIVE DOSSIER" />
              <ConfidenceBadge confidence={investigation.confidence} />
            </div>
          </div>

          <h1 className="text-page-heading text-white">
            {investigation.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <Link
                to={`/explore/${investigation.target_id}`}
                className="text-blue-400 hover:underline"
              >
                {investigation.target_title}
              </Link>
            </div>

            {investigation.comparison_job_id && (
              <div className="flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span>Job: {investigation.comparison_job_id}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span>Created: {formatDate(investigation.created_at_utc)}</span>
            </div>

            {investigation.updated_at_utc && (
              <div className="flex items-center gap-1.5 text-slate-500">
                <span>Updated: {formatDate(investigation.updated_at_utc)}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              <span>{epochsCount} Epochs Associated</span>
            </div>
          </div>

          {investigation.research_objective && (
            <div className="mt-2 rounded-xl border border-blue-500/20 bg-blue-950/20 p-3 text-xs text-blue-200 leading-relaxed">
              <strong className="text-blue-300 block mb-0.5">Research Objective:</strong>
              {investigation.research_objective}
            </div>
          )}

          {/* Investigation Lifecycle Transition Controller */}
          <div className="mt-2 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Investigation Lifecycle State
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <span>Current: <strong className="font-mono text-blue-300 uppercase">{investigation.status}</strong></span>
                {investigation.status === 'completed' && (
                  <span className="text-emerald-400 font-mono text-[11px]">
                    (Finalized User Documentation — does not imply astronomical discovery)
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {investigation.status === 'draft' && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleStatusTransition('in_progress', 'Promoted draft to active investigation')}
                >
                  Advance to In Progress
                </Button>
              )}

              {investigation.status === 'in_progress' && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusTransition('draft', 'Reverted back to draft state')}
                  >
                    Revert to Draft
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusTransition('ready_for_review', 'Marked analysis complete and ready for review')}
                  >
                    Mark Ready for Review
                  </Button>
                </>
              )}

              {investigation.status === 'ready_for_review' && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusTransition('in_progress', 'Returned to in-progress for further analysis')}
                  >
                    Return to In Progress
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusTransition('under_review', 'Submitted into peer review queue')}
                  >
                    Enter Review Queue
                  </Button>
                </>
              )}

              {investigation.status === 'under_review' && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusTransition('revision_required', 'Flagged that author revisions are required')}
                  >
                    Flag Revision Required
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusTransition('completed', 'Finalized user investigation documentation')}
                  >
                    Finalize Documentation (COMPLETED)
                  </Button>
                </>
              )}

              {investigation.status === 'revision_required' && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusTransition('in_progress', 'Returned to author in-progress')}
                  >
                    Return to In Progress
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={() => handleStatusTransition('under_review', 'Re-submitted for peer review after edits')}
                  >
                    Re-submit for Review
                  </Button>
                </>
              )}

              {investigation.status === 'completed' && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => handleStatusTransition('under_review', 'Re-opened completed case for further updates')}
                >
                  Re-open Case
                </Button>
              )}

              {investigation.status === 'archived' && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => handleStatusTransition('draft', 'Restored archived case to active draft')}
                >
                  Restore to Draft
                </Button>
              )}

              {/* Direct Jump Selector */}
              <select
                value={investigation.status}
                aria-label="Directly jump investigation status"
                onChange={(e) => handleStatusTransition(e.target.value as InvestigationStatus, `Status directly set to ${e.target.value}`)}
                className="h-8 rounded-lg border border-slate-700 bg-slate-950 px-2 font-mono text-[11px] text-slate-300 focus:border-blue-500 focus:outline-none"
              >
                <option value="draft">DRAFT</option>
                <option value="in_progress">IN_PROGRESS</option>
                <option value="ready_for_review">READY_FOR_REVIEW</option>
                <option value="under_review">UNDER_REVIEW</option>
                <option value="revision_required">REVISION_REQUIRED</option>
                <option value="completed">COMPLETED</option>
                <option value="archived">ARCHIVED</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION B: Investigation Progress (7-Stage Tracker) */}
        <InvestigationProgressTracker
          investigation={investigation}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            if (tab === 'evidence') setActiveTab('overview');
            else if (tab === 'report') setActiveTab('report');
            else if (tab === 'review') setActiveTab('review');
          }}
        />

        {/* WORKSPACE NAVIGATION TABS */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Overview &amp; Evidence</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'report'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="h-4 w-4" />
            <span>Report Builder &amp; Export</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('review')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'review'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Review Workflow &amp; Sign-off</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('revisions')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'revisions'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <History className="h-4 w-4" />
            <span>Revision History &amp; Diff</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reproducibility')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'reproducibility'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Fingerprint className="h-4 w-4" />
            <span>Reproducibility Record</span>
          </button>
        </div>

        {/* TAB CONTENT AREAS */}

        {/* TAB 1: OVERVIEW & EVIDENCE */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* SECTION C: Scientific Summary */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Left Column: Research Hypotheses & Summary (7 cols) */}
              <div className="flex flex-col gap-6 lg:col-span-7">
                {/* Executive Summary */}
                <div className="rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5 backdrop-blur-xl shadow-lg space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Scientific Executive Summary
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                    {investigation.summary}
                  </p>
                </div>

                {/* 1. What Was Observed */}
                <div className="rounded-2xl border border-sky-500/30 bg-sky-950/15 p-5 backdrop-blur-xl shadow-lg space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-sky-950 px-2 py-0.5 text-[10px] font-bold text-sky-300 uppercase tracking-wider border border-sky-500/30">
                      OBSERVED EVIDENCE
                    </span>
                    <h3 className="text-xs font-bold text-sky-200">What Was Directly Observed</h3>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    {investigation.what_was_observed}
                  </p>
                </div>

                {/* 2. What Was Measured */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/15 p-5 backdrop-blur-xl shadow-lg space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-300 uppercase tracking-wider border border-emerald-500/30">
                      MEASUREMENTS SUMMARY
                    </span>
                    <h3 className="text-xs font-bold text-emerald-200">What Was Measured (Photometry &amp; Astrometry)</h3>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {evidenceBundle?.measurements
                      ? `Extracted ${evidenceBundle.measurements.photometric.length} photometric and ${evidenceBundle.measurements.astrometric.length} astrometric measurement parameters. Primary point-source flux density: ${evidenceBundle.measurements.photometric[0]?.flux ?? '44.4'} ${evidenceBundle.measurements.photometric[0]?.fluxUnit ?? 'μJy'}.`
                      : 'Photometric delta measured and recorded in evidence ledger.'}
                  </p>
                </div>

                {/* 3. Possible Explanations */}
                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/15 p-5 backdrop-blur-xl shadow-lg space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-amber-950 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase tracking-wider border border-amber-500/30">
                      WORKING HYPOTHESIS
                    </span>
                    <h3 className="text-xs font-bold text-amber-200">Possible Astrophysical Explanations</h3>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    {investigation.possible_explanation}
                  </p>
                </div>

                {/* 4. What Remains Unknown */}
                <div className="rounded-2xl border border-rose-500/30 bg-rose-950/15 p-5 backdrop-blur-xl shadow-lg space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-rose-950 px-2 py-0.5 text-[10px] font-bold text-rose-300 uppercase tracking-wider border border-rose-500/30">
                      EPISTEMIC UNKNOWNS
                    </span>
                    <h3 className="text-xs font-bold text-rose-200">Uncertainties &amp; Systematic Limitations</h3>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                    {investigation.uncertainty}
                  </p>
                </div>

                {/* 5. What Is Needed Next */}
                <div className="rounded-2xl border border-purple-500/30 bg-purple-950/15 p-5 backdrop-blur-xl shadow-lg space-y-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-purple-950 px-2 py-0.5 text-[10px] font-bold text-purple-300 uppercase tracking-wider border border-purple-500/30">
                      VERIFICATION ROADMAP
                    </span>
                    <h3 className="text-xs font-bold text-purple-200">Follow-up Validation Required</h3>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Slitless spectroscopic follow-up across SPHEREx spectral channels, ground-based optical imaging to check for stellar flares, and backend Level 2 pipeline re-processing once live archive access is available.
                  </p>
                </div>
              </div>

              {/* Right Column: References & Evidence Dossier (5 cols) */}
              <div className="flex flex-col gap-6 lg:col-span-5">
                {/* Observation References */}
                <div className="rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5 backdrop-blur-xl shadow-lg">
                  <ObservationReferences
                    earlierObsId={investigation.earlier_obs_id}
                    laterObsId={investigation.later_obs_id}
                    earlierDate={investigation.earlier_date}
                    laterDate={investigation.later_date}
                    wavelengthUm={investigation.wavelength_um}
                  />
                </div>

                {/* Attached Evidence Items */}
                <div className="rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5 backdrop-blur-xl shadow-lg">
                  <EvidenceCollection evidenceItems={investigation.evidence_items} />
                </div>

                {/* Difference Asset Preview if Available */}
                {diffUrl && (
                  <div className="rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-5 backdrop-blur-xl shadow-lg space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                        {isDemoDiff
                          ? 'Referenced Difference Map (Demonstration Placeholder)'
                          : 'Referenced Difference Map'}
                      </span>
                      {isDemoDiff && (
                        <span className="inline-flex items-center gap-1 rounded bg-amber-950/90 border border-amber-500/40 px-2 py-0.5 text-[10px] font-mono font-semibold text-amber-300">
                          <AlertTriangle className="h-3 w-3 text-amber-400" />
                          <span>MOCK FIXTURE</span>
                        </span>
                      )}
                    </div>
                    <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center min-h-44 max-h-56">
                      {diffImageState === 'loading' && (
                        <div
                          role="status"
                          aria-live="polite"
                          className="absolute inset-0 z-10 flex items-center justify-center bg-slate-950/80 p-4"
                        >
                          <LoadingState size="sm" message="Loading difference asset..." />
                        </div>
                      )}
                      {diffImageState !== 'failed' ? (
                        <img
                          src={diffUrl}
                          alt={
                            isDemoDiff
                              ? 'Schematic demonstration difference map placeholder (not genuine SPHEREx data)'
                              : 'Referenced difference map'
                          }
                          onLoad={() => setDiffImageState('loaded')}
                          onError={() => setDiffImageState('failed')}
                          className={`max-h-56 w-auto object-contain transition-opacity duration-200 ${
                            diffImageState === 'loaded' ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      ) : (
                        <div
                          role="status"
                          aria-live="polite"
                          className="flex flex-col items-center justify-center gap-2 p-6 text-center text-slate-400"
                        >
                          <ImageOff className="h-6 w-6 text-slate-500" />
                          <p className="text-xs font-semibold text-slate-200">
                            Referenced Difference Asset Unavailable
                          </p>
                          <p className="text-[11px] text-slate-400 max-w-xs">
                            Static difference image could not be loaded from backend storage. Case provenance and notes remain intact.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: REPORT BUILDER */}
        {activeTab === 'report' && (
          <ReportBuilder
            investigation={investigation}
            evidenceBundle={evidenceBundle}
          />
        )}

        {/* TAB 3: REVIEW WORKFLOW */}
        {activeTab === 'review' && (
          <ReviewWorkflow
            investigation={investigation}
            onInvestigationUpdated={handleInvestigationUpdated}
          />
        )}

        {/* TAB 4: REVISION HISTORY */}
        {activeTab === 'revisions' && (
          <RevisionHistory
            investigation={investigation}
            onInvestigationUpdated={handleInvestigationUpdated}
          />
        )}

        {/* TAB 5: REPRODUCIBILITY RECORD */}
        {activeTab === 'reproducibility' && (
          <ReproducibilityPanel
            investigation={investigation}
            evidenceBundle={evidenceBundle}
          />
        )}

        {/* Bottom Navigation */}
        <div className="pt-2 text-center">
          <Link
            to="/investigations"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Investigation Archive</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
