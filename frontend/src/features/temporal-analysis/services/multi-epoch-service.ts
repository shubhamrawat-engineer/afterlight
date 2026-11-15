import type { ObservationRecord } from '../../observations/types/observation.types';
import type {
  MultiEpochRecord,
  CandidateChangeCategory,
  CandidateChangeRecord,
  CandidateChangeStatus,
} from '../types/multi-epoch.types';
import { getObsId, getObsDate } from '../../observations/services/observation-service';

/**
 * Evaluates the metadata completeness of an individual observation epoch.
 */
export function evaluateEpochMetadataCompleteness(obs: ObservationRecord): {
  completeness: 'complete' | 'partial' | 'minimal';
  availableFields: string[];
  missingFields: string[];
  isDemonstrationOnly: boolean;
} {
  const available: string[] = [];
  const missing: string[] = [];

  const id = getObsId(obs);
  if (id) available.push('Observation ID');
  else missing.push('Observation ID');

  const date = getObsDate(obs);
  if (date) available.push(`Acquisition Timestamp (${date.slice(0, 10)})`);
  else missing.push('Acquisition Timestamp');

  if (obs.wavelength_um !== null) available.push(`Wavelength (${obs.wavelength_um} μm)`);
  else missing.push('Effective Wavelength');

  if (obs.detector) available.push(`Detector Array (${obs.detector})`);
  else missing.push('Detector Channel / Array ID');

  if (obs.units) available.push(`Calibrated Units (${obs.units})`);
  else missing.push('Physical Calibration Units');

  if (obs.product_type || obs.product) available.push('Product Type');
  else missing.push('Data Product Class');

  // Scientific validation prerequisites (Awaiting multi-epoch pipeline)
  missing.push('Live WCS CD/CRPIX Matrix (Awaiting Server FITS Ingestion)');
  missing.push('Empirical PSF Convolution Kernel (Pending Pipeline Execution)');
  missing.push('Photometric Standard Zero-Point Solution (Pending Pipeline Calibration)');

  let completeness: 'complete' | 'partial' | 'minimal' = 'minimal';
  if (id && date && obs.wavelength_um !== null && obs.detector && obs.units) {
    completeness = 'complete';
  } else if (id && (date || obs.wavelength_um !== null)) {
    completeness = 'partial';
  }

  return {
    completeness,
    availableFields: available,
    missingFields: missing,
    isDemonstrationOnly: true,
  };
}

/**
 * Builds chronologically sorted MultiEpochRecord items for selected observation IDs.
 */
export function buildMultiEpochRecords(
  observations: ObservationRecord[],
  selectedIds?: string[]
): MultiEpochRecord[] {
  if (!observations || observations.length === 0) return [];

  // Filter if selectedIds is provided and non-empty
  const idSet = selectedIds && selectedIds.length > 0 ? new Set(selectedIds) : null;
  const filtered = idSet ? observations.filter((o) => idSet.has(getObsId(o))) : [...observations];

  // Sort strictly chronologically by date
  const sorted = [...filtered].sort((a, b) => {
    const dateA = getObsDate(a);
    const dateB = getObsDate(b);
    const tA = dateA ? new Date(dateA).getTime() : 0;
    const tB = dateB ? new Date(dateB).getTime() : 0;
    return tA - tB;
  });

  const firstDateStr = sorted.length > 0 ? getObsDate(sorted[0]) : null;
  const firstTime = firstDateStr ? new Date(firstDateStr).getTime() : 0;

  let prevTime: number | null = null;

  return sorted.map((obs, index) => {
    const dateStr = getObsDate(obs);
    const currentTime = dateStr ? new Date(dateStr).getTime() : null;

    let daysFromFirst = 0;
    let daysFromPrevious: number | null = null;

    if (currentTime !== null && !Number.isNaN(currentTime)) {
      if (!Number.isNaN(firstTime) && firstTime > 0) {
        daysFromFirst = Math.round((currentTime - firstTime) / (1000 * 60 * 60 * 24));
      }
      if (prevTime !== null && !Number.isNaN(prevTime)) {
        daysFromPrevious = Math.round((currentTime - prevTime) / (1000 * 60 * 60 * 24));
      }
      prevTime = currentTime;
    }

    const { completeness, availableFields, missingFields } = evaluateEpochMetadataCompleteness(obs);

    return {
      ...obs,
      epochIndex: index + 1,
      epochLabel: `Epoch ${index + 1}`,
      daysFromFirst,
      daysFromPrevious,
      completeness,
      availableFields,
      missingFields,
    };
  });
}

/**
 * Computes temporal baseline span across an array of multi-epoch records.
 */
export function calculateMultiEpochBaseline(records: MultiEpochRecord[]): {
  totalBaselineDays: number | null;
  earliestDate: string | null;
  latestDate: string | null;
  cadenceDescription: string;
} {
  if (records.length === 0) {
    return {
      totalBaselineDays: null,
      earliestDate: null,
      latestDate: null,
      cadenceDescription: 'No epochs designated.',
    };
  }

  const earliestDate = getObsDate(records[0]) ?? null;
  const latestDate = getObsDate(records[records.length - 1]) ?? null;

  let totalBaselineDays: number | null = null;
  if (earliestDate && latestDate) {
    const t0 = new Date(earliestDate).getTime();
    const t1 = new Date(latestDate).getTime();
    if (!Number.isNaN(t0) && !Number.isNaN(t1)) {
      totalBaselineDays = Math.round(Math.abs(t1 - t0) / (1000 * 60 * 60 * 24));
    }
  }

  const intervalCount = records.length - 1;
  let cadenceDescription = 'Single epoch';
  if (intervalCount > 0 && totalBaselineDays !== null) {
    const meanCadence = Math.round(totalBaselineDays / intervalCount);
    cadenceDescription = `${records.length} epochs spanning ${totalBaselineDays} days (Mean cadence: ~${meanCadence} days)`;
  }

  return {
    totalBaselineDays,
    earliestDate,
    latestDate,
    cadenceDescription,
  };
}

export const CANDIDATE_CATEGORY_CONFIG: Record<
  CandidateChangeCategory,
  { label: string; description: string; badgeColor: string; borderColor: string }
> = {
  brightness_variation: {
    label: 'Brightness Variation',
    description: 'Apparent relative flux delta across observation epochs.',
    badgeColor: 'bg-amber-950/60 text-amber-300',
    borderColor: 'border-amber-500/40',
  },
  positional_shift: {
    label: 'Apparent Positional Change',
    description: 'Visual centroid offset observed between epochs (requires astrometric registration).',
    badgeColor: 'bg-sky-950/60 text-sky-300',
    borderColor: 'border-sky-500/40',
  },
  morphological_change: {
    label: 'Morphological Variation',
    description: 'Structural evolution, shell expansion, or spatial profile change.',
    badgeColor: 'bg-indigo-950/60 text-indigo-300',
    borderColor: 'border-indigo-500/40',
  },
  transient_candidate: {
    label: 'Transient Candidate',
    description: 'Source appearing or disappearing between observation passes.',
    badgeColor: 'bg-rose-950/60 text-rose-300',
    borderColor: 'border-rose-500/40',
  },
  spectral_variation: {
    label: 'Spectral Variation',
    description: 'Chromatic color changes across LVF passbands.',
    badgeColor: 'bg-purple-950/60 text-purple-300',
    borderColor: 'border-purple-500/40',
  },
  instrumental_artifact: {
    label: 'Instrumental Artifact',
    description: 'Suspected detector persistence, optical ghosting, or cosmic ray residual.',
    badgeColor: 'bg-slate-900 text-slate-300',
    borderColor: 'border-slate-700',
  },
  unclassified: {
    label: 'Unclassified Observation',
    description: 'Preliminary anomaly flagged for collaborative investigation.',
    badgeColor: 'bg-blue-950/60 text-blue-300',
    borderColor: 'border-blue-500/40',
  },
};

/**
 * Creates a new Candidate Change Record.
 */
export function createCandidateChangeRecord(params: {
  targetId: string;
  category: CandidateChangeCategory;
  title: string;
  description: string;
  associatedEpochIds: string[];
  status?: CandidateChangeStatus;
  notes?: string;
  userHypothesis?: string;
}): CandidateChangeRecord {
  const now = new Date().toISOString();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const id = `cand-${params.category.substring(0, 4)}-${Date.now().toString(36)}-${randomSuffix}`;

  return {
    id,
    targetId: params.targetId,
    category: params.category,
    title: params.title.trim(),
    description: params.description.trim(),
    associatedEpochIds: params.associatedEpochIds,
    status: params.status ?? 'unreviewed',
    createdAtUtc: now,
    notes: params.notes?.trim(),
    userHypothesis: params.userHypothesis?.trim(),
  };
}
