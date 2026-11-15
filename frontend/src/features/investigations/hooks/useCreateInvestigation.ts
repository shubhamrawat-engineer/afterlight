import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  CreateInvestigationInput,
} from '../types/investigation.types';
import type { PairGrade } from '../../observations/types/observation.types';
import { createInvestigation } from '../services/investigation-service';
import { MOCK_TARGET_MANIFESTS } from '../../explorer/data/mock-targets';
import { getObsId } from '../../observations/services/observation-service';
import {
  getActiveInvestigationSession,
  loadInvestigationDraft,
  saveInvestigationDraft,
  clearInvestigationDraft,
} from '../../../services/investigation-session';

export interface FormErrors {
  title?: string;
  summary?: string;
  what_was_observed?: string;
  possible_explanation?: string;
  uncertainty?: string;
}

export interface ValidatedInvestigationNavState {
  targetId: string;
  targetTitle: string;
  comparisonJobId: string | null;
  candidateId: string | null;
  earlierObsId: string | null;
  laterObsId: string | null;
  pairGrade: PairGrade | null;
  differenceImage: string | null;
  initiatedFrom: string | null;
  hasExplicitNavState: boolean;
}

function asNonEmptyString(val: unknown): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asValidPairGrade(val: unknown): PairGrade | null {
  if (val === 'GOOD' || val === 'FAIR' || val === 'POOR') return val;
  return null;
}

/**
 * Validates router navigation state and populates safe defaults from the persisted
 * investigation session or target manifest when navigation state is missing.
 */
export function parseInvestigationNavState(rawState: unknown): ValidatedInvestigationNavState {
  const isObj = typeof rawState === 'object' && rawState !== null;
  const record = isObj ? (rawState as Record<string, unknown>) : {};
  const session = getActiveInvestigationSession();

  const requestedTargetId =
    asNonEmptyString(record.targetId) ?? session?.targetId ?? null;
  const targetId =
    requestedTargetId && MOCK_TARGET_MANIFESTS[requestedTargetId]
      ? requestedTargetId
      : requestedTargetId ?? 'spherex-deep-field-south';

  const manifest = MOCK_TARGET_MANIFESTS[targetId];
  const manifestObservations = manifest?.observations ?? [];
  const defaultEarlierObs =
    manifestObservations.find((o) => o.role === 'earlier') ?? manifestObservations[0] ?? null;
  const defaultLaterObs =
    manifestObservations.find((o) => o.role === 'later') ?? manifestObservations[1] ?? null;

  const targetTitle =
    asNonEmptyString(record.targetTitle) ??
    (session?.targetId === targetId ? session.targetTitle : null) ??
    manifest?.title ??
    targetId;

  const sessionEarlierId =
    session?.targetId === targetId ? session.earlierObsId : null;
  const sessionLaterId =
    session?.targetId === targetId ? session.laterObsId : null;

  const earlierObsId =
    asNonEmptyString(record.earlierObsId) ??
    sessionEarlierId ??
    (defaultEarlierObs ? getObsId(defaultEarlierObs) : null);

  const laterObsId =
    asNonEmptyString(record.laterObsId) ??
    sessionLaterId ??
    (defaultLaterObs ? getObsId(defaultLaterObs) : null);

  const pairGrade =
    asValidPairGrade(record.pairGrade) ??
    manifest?.pair_quality?.grade ??
    null;

  const differenceImage =
    asNonEmptyString(record.differenceImage) ??
    manifest?.difference?.image ??
    null;

  return {
    targetId,
    targetTitle,
    comparisonJobId: asNonEmptyString(record.comparisonJobId),
    candidateId: asNonEmptyString(record.candidateId),
    earlierObsId,
    laterObsId,
    pairGrade,
    differenceImage,
    initiatedFrom: asNonEmptyString(record.initiatedFrom),
    hasExplicitNavState: Boolean(isObj && Object.keys(record).length > 0),
  };
}

export function useCreateInvestigation(initialValues?: Partial<CreateInvestigationInput>) {
  const navigate = useNavigate();

  const savedDraft = loadInvestigationDraft(initialValues?.target_id);
  const resolvedTargetId =
    initialValues?.target_id ?? savedDraft?.targetId ?? 'spherex-deep-field-south';
  const fallbackManifest = MOCK_TARGET_MANIFESTS[resolvedTargetId];
  const useDraft = Boolean(
    savedDraft && (!initialValues?.target_id || savedDraft.targetId === resolvedTargetId)
  );

  const [formData, setFormData] = useState<CreateInvestigationInput>({
    title: initialValues?.title ?? (useDraft ? (savedDraft?.title ?? '') : ''),
    summary: initialValues?.summary ?? (useDraft ? (savedDraft?.summary ?? '') : ''),
    category: initialValues?.category ?? (useDraft ? (savedDraft?.category ?? 'transient_phenomenon') : 'transient_phenomenon'),
    target_id: resolvedTargetId,
    target_title:
      initialValues?.target_title && initialValues.target_title !== resolvedTargetId
        ? initialValues.target_title
        : (fallbackManifest?.title ?? initialValues?.target_title ?? resolvedTargetId),
    comparison_job_id: initialValues?.comparison_job_id ?? null,
    confidence: initialValues?.confidence ?? (useDraft ? (savedDraft?.confidence ?? 'HIGH') : 'HIGH'),
    what_was_observed:
      initialValues?.what_was_observed ?? (useDraft ? (savedDraft?.what_was_observed ?? '') : ''),
    possible_explanation:
      initialValues?.possible_explanation ?? (useDraft ? (savedDraft?.possible_explanation ?? '') : ''),
    uncertainty:
      initialValues?.uncertainty ?? (useDraft ? (savedDraft?.uncertainty ?? '') : ''),
    earlier_obs_id:
      initialValues?.earlier_obs_id ?? (useDraft ? (savedDraft?.earlier_obs_id ?? null) : null),
    later_obs_id:
      initialValues?.later_obs_id ?? (useDraft ? (savedDraft?.later_obs_id ?? null) : null),
    candidate_id: initialValues?.candidate_id ?? null,
    difference_image: initialValues?.difference_image ?? fallbackManifest?.difference?.image ?? null,
    pair_grade: initialValues?.pair_grade ?? fallbackManifest?.pair_quality?.grade ?? null,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const updateField = useCallback(
    <K extends keyof CreateInvestigationInput>(field: K, value: CreateInvestigationInput[K]) => {
      setFormData((prev) => {
        const next = { ...prev, [field]: value };
        saveInvestigationDraft(next);
        return next;
      });
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const validate = useCallback((): boolean => {
    const errs: FormErrors = {};

    if (!formData.title.trim()) {
      errs.title = 'Investigation title is required.';
    } else if (formData.title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters.';
    }

    if (!formData.summary.trim()) {
      errs.summary = 'Research summary is required.';
    } else if (formData.summary.trim().length < 15) {
      errs.summary = 'Summary must be at least 15 characters.';
    }

    if (!formData.what_was_observed.trim()) {
      errs.what_was_observed = 'Please describe what was observed in the comparison.';
    }

    if (!formData.possible_explanation.trim()) {
      errs.possible_explanation = 'Please enter at least one working hypothesis or explanation.';
    }

    if (!formData.uncertainty.trim()) {
      errs.uncertainty = 'Please document known limitations and uncertainties.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const result = await createInvestigation(formData);
        clearInvestigationDraft(formData.target_id);
        const createdCase = result.data;
        navigate(`/investigations/${createdCase.id}`, {
          state: { newlyCreated: true },
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to persist investigation case.';
        setSubmitError(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validate, navigate]
  );

  return {
    formData,
    updateField,
    errors,
    isSubmitting,
    submitError,
    handleSubmit,
  };
}
