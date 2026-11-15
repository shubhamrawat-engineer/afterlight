import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, FilePlus2, ShieldAlert, Tag } from 'lucide-react';
import {
  useCreateInvestigation,
  parseInvestigationNavState,
} from '../hooks/useCreateInvestigation';
import type { InvestigationCategory } from '../types/investigation.types';
import { ConfidenceSelector } from '../components/ConfidenceSelector';
import { ObservationReferences } from '../components/ObservationReferences';
import { PairQualityIndicator } from '../../observations/components/PairQualityIndicator';
import { InvestigationProgress } from '../../../components/common/InvestigationProgress';
import { DemonstrationDataBadge } from '../../../components/common/DemonstrationDataBadge';
import { Button } from '../../../components/ui/Button';

const CATEGORY_OPTIONS: Array<{
  value: InvestigationCategory;
  label: string;
  description: string;
}> = [
  {
    value: 'transient_phenomenon',
    label: 'Transient Phenomenon',
    description: 'Supernova candidate, tidal disruption flare, or sudden flux brightening',
  },
  {
    value: 'stellar_variability',
    label: 'Stellar Variability',
    description: 'Periodic or stochastic infrared flux modulation (YSO, AGB, eclipsing system)',
  },
  {
    value: 'proper_motion',
    label: 'Proper Motion / Moving Object',
    description: 'High-proper-motion brown dwarf or solar system body with dipole residual',
  },
  {
    value: 'instrumental_artifact',
    label: 'Instrumental / Passband Artifact',
    description: 'Suspected LVF passband chromatic residual, PSF drift, or cosmic ray hit',
  },
  {
    value: 'general_anomaly',
    label: 'General Anomaly',
    description: 'Unclassified multi-epoch residual requiring follow-up spectroscopy',
  },
];

export function CreateInvestigationPage() {
  const location = useLocation();
  const validatedNav = parseInvestigationNavState(location.state);

  const {
    formData,
    updateField,
    errors,
    isSubmitting,
    submitError,
    handleSubmit,
  } = useCreateInvestigation({
    target_id: validatedNav.targetId,
    target_title: validatedNav.targetTitle,
    comparison_job_id: validatedNav.comparisonJobId,
    earlier_obs_id: validatedNav.earlierObsId,
    later_obs_id: validatedNav.laterObsId,
    candidate_id: validatedNav.candidateId,
    pair_grade: validatedNav.pairGrade,
    difference_image: validatedNav.differenceImage,
    confidence: 'HIGH',
  });

  const backHref =
    validatedNav.initiatedFrom === 'object' && validatedNav.candidateId
      ? `/objects/${validatedNav.candidateId}`
      : validatedNav.hasExplicitNavState
      ? `/evidence/${validatedNav.targetId}`
      : '/investigations';

  const backLabel =
    validatedNav.initiatedFrom === 'object' && validatedNav.candidateId
      ? `Return to Object (${validatedNav.candidateId})`
      : validatedNav.hasExplicitNavState
      ? `Return to Evidence (${validatedNav.targetId})`
      : 'Return to Investigation Archive';

  return (
    <div className="min-h-[calc(100vh-var(--navbar-height))] bg-[#060810] py-8 sm:py-10">
      <div
        className="mx-auto flex flex-col gap-6 px-4 sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--content-max-width)' }}
      >
        {/* 6-Step Core Investigation Journey Progress */}
        <InvestigationProgress
          currentStage="create_case"
          targetId={formData.target_id}
          targetTitle={formData.target_title}
          earlierObsId={formData.earlier_obs_id}
          laterObsId={formData.later_obs_id}
        />

        <div className="mx-auto flex w-full max-w-[840px] flex-col gap-6">
          {/* Back Link */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              to={backHref}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{backLabel}</span>
            </Link>
            <DemonstrationDataBadge label="Local Draft Auto-Saved" />
          </div>

          {/* Header */}
          <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-800/80 bg-[rgba(15,21,35,0.78)] p-6 sm:p-7 backdrop-blur-xl shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-950/60 border border-blue-500/30 px-2.5 py-0.5 text-[11px] font-medium tracking-wider text-blue-400 uppercase">
                  Step 6 — New Case File
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  {formData.target_title || formData.target_id}
                </span>
                <span className="text-xs text-slate-400 font-mono">({formData.target_id})</span>
              </div>
              {formData.pair_grade && (
                <PairQualityIndicator
                  grade={formData.pair_grade as 'GOOD' | 'FAIR' | 'POOR'}
                />
              )}
            </div>

            <h1 className="text-page-heading text-white">
              Create Scientific Investigation Case
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Formalise your sky region selection, multi-epoch observation pair, and demonstration
              evidence into a persistent Team ASTRION investigation dossier. Draft fields are
              preserved automatically across page refreshes.
            </p>
          </div>

          {/* Submission Error Banner */}
          {submitError && (
            <div className="flex items-center gap-3 rounded-xl border border-rose-500/40 bg-rose-950/30 p-4 text-xs text-rose-300">
              <ShieldAlert className="h-5 w-5 shrink-0 text-rose-400" />
              <span>{submitError}</span>
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* SECTION A: Investigation Information & Category */}
            <div className="rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-6 backdrop-blur-xl shadow-lg space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 border-b border-slate-800 pb-2.5">
                A. Investigation Information &amp; Category
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">
                  Investigation Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  placeholder="e.g. Candidate Type Ia Supernova in SPHEREx Deep Field South"
                  className={`w-full rounded-xl border bg-slate-950 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 ${
                    errors.title
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                {errors.title && <p className="text-[11px] text-rose-400">{errors.title}</p>}
              </div>

              {/* Investigation Category Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-blue-400" />
                  <span>Investigation Category</span>
                </label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {CATEGORY_OPTIONS.map((opt) => {
                    const isSelected = (formData.category ?? 'transient_phenomenon') === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateField('category', opt.value)}
                        aria-pressed={isSelected}
                        className={`flex flex-col items-start rounded-xl border p-3 text-left transition-all ${
                          isSelected
                            ? 'border-blue-500/60 bg-blue-950/35 text-white shadow-[0_0_15px_rgba(59,130,246,0.18)]'
                            : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-900/70'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-100">{opt.label}</span>
                        <span className="mt-0.5 text-[11px] text-slate-400 leading-snug">
                          {opt.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">
                  Investigation Description / Summary <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.summary}
                  onChange={(e) => updateField('summary', e.target.value)}
                  placeholder="Concise overview of the astronomical transient or moving body candidate..."
                  className={`w-full rounded-xl border bg-slate-950 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 ${
                    errors.summary
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                      : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500'
                  }`}
                />
                {errors.summary && <p className="text-[11px] text-rose-400">{errors.summary}</p>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 block">Target Region Title</label>
                  <input
                    type="text"
                    value={formData.target_title || formData.target_id}
                    disabled
                    aria-label="Target Region Title"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 px-3 text-xs text-slate-300 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 block">Target Identifier</label>
                  <input
                    type="text"
                    value={formData.target_id}
                    disabled
                    aria-label="Target Identifier"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 px-3 text-xs font-mono text-slate-400 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-200 block">Comparison Job ID</label>
                  <input
                    type="text"
                    value={formData.comparison_job_id ?? 'None / Unlinked'}
                    disabled
                    aria-label="Comparison Job ID"
                    className="w-full rounded-xl border border-slate-800 bg-slate-900/60 py-2 px-3 text-xs font-mono text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* SECTION B: Observation References */}
            <div className="rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-6 backdrop-blur-xl shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                  B. Review Selected Observations
                </h2>
                <Link
                  to={`/observations/${formData.target_id}`}
                  className="text-xs font-semibold text-blue-400 hover:text-blue-300"
                >
                  Change Observation Pair
                </Link>
              </div>

              <ObservationReferences
                earlierObsId={formData.earlier_obs_id}
                laterObsId={formData.later_obs_id}
              />

              {formData.candidate_id && (
                <div className="rounded-xl border border-blue-500/20 bg-blue-950/20 p-3 text-xs flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">Attached Candidate ID:</span>
                  <span className="font-mono font-bold text-blue-300">{formData.candidate_id}</span>
                </div>
              )}
            </div>

            {/* SECTION C: User Observations */}
            <div className="rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-6 backdrop-blur-xl shadow-lg space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 border-b border-slate-800 pb-2.5">
                C. What Did You Observe? <span className="text-rose-400">*</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Detail what is directly visible in the image subtraction map or comparison epochs (e.g. point-like flux peak, ring expansion, or dipole astrometric displacement).
              </p>
              <textarea
                rows={4}
                value={formData.what_was_observed}
                onChange={(e) => updateField('what_was_observed', e.target.value)}
                placeholder="Describe the visible characteristics, pixel coordinate location, and spatial morphology..."
                className={`w-full rounded-xl border bg-slate-950 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 ${
                  errors.what_was_observed
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {errors.what_was_observed && (
                <p className="text-[11px] text-rose-400">{errors.what_was_observed}</p>
              )}
            </div>

            {/* SECTION D: Possible Explanation */}
            <div className="rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-6 backdrop-blur-xl shadow-lg space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 border-b border-slate-800 pb-2.5">
                D. What Could Explain This Change? <span className="text-rose-400">*</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Document supported astrophysical or instrumental working hypotheses. Clearly communicate these as interpretations, not proven facts.
              </p>
              <textarea
                rows={4}
                value={formData.possible_explanation}
                onChange={(e) => updateField('possible_explanation', e.target.value)}
                placeholder="e.g. Consistent with Type Ia supernova decline, active galactic nucleus stochastic flare, or minor PSF convolution residual..."
                className={`w-full rounded-xl border bg-slate-950 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 ${
                  errors.possible_explanation
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {errors.possible_explanation && (
                <p className="text-[11px] text-rose-400">{errors.possible_explanation}</p>
              )}
            </div>

            {/* SECTION E: Uncertainty */}
            <div className="rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-6 backdrop-blur-xl shadow-lg space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-100 border-b border-slate-800 pb-2.5">
                E. What Remains Unknown? <span className="text-rose-400">*</span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Identify missing observations, unconstrained physical parameters, and remaining scientific caveats.
              </p>
              <textarea
                rows={3}
                value={formData.uncertainty}
                onChange={(e) => updateField('uncertainty', e.target.value)}
                placeholder="e.g. Light curve peak date unknown; host galaxy spectroscopic redshift unconstrained..."
                className={`w-full rounded-xl border bg-slate-950 py-2.5 px-3.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 ${
                  errors.uncertainty
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                    : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {errors.uncertainty && (
                <p className="text-[11px] text-rose-400">{errors.uncertainty}</p>
              )}
            </div>

            {/* SECTION F: Confidence */}
            <div className="rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.85)] p-6 backdrop-blur-xl shadow-lg">
              <ConfidenceSelector
                value={formData.confidence}
                onChange={(val) => updateField('confidence', val)}
              />
            </div>

            {/* Form Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button
                to="/investigations"
                variant="secondary"
                size="md"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                variant="primary"
                size="md"
                leftIcon={!isSubmitting ? <FilePlus2 className="h-4 w-4" /> : undefined}
              >
                {isSubmitting ? 'Saving to Archive...' : 'Save Investigation Case'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
