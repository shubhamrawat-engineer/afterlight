import { useState, useMemo, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTargetDetail } from '../../explorer/hooks/useTargetDetail';
import type {
  ComparisonMode,
  ActiveEpoch,
  TemporalWorkspaceMode,
  CandidateChangeRecord,
  CandidateChangeStatus,
} from '../types/temporal-analysis.types';
import {
  resolveObservationPair,
  resolveDifferenceMetadata,
  deriveComparisonStatus,
  resolveImageUrl,
} from '../services/temporal-analysis-service';
import { buildMultiEpochRecords } from '../services/multi-epoch-service';
import { getObsId } from '../../observations/services/observation-service';
import {
  resolveValidatedPairIds,
  resolveValidatedEpochIds,
  saveActiveInvestigationSession,
  getActiveInvestigationSession,
  loadCandidateChangeRecords,
  saveCandidateChangeRecord,
  deleteCandidateChangeRecord,
} from '../../../services/investigation-session';
import { useBlinkMode } from './useBlinkMode';

export function useTemporalAnalysis(
  targetId: string | undefined,
  overrideEarlierId?: string | null,
  overrideLaterId?: string | null,
  overrideEpochParam?: string | null
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { manifest, isLoading, error, isFallback, refetch } = useTargetDetail(targetId);

  // Workspace View Mode: 'two_epoch' | 'sequence' | 'grid' | 'overview'
  const [workspaceMode, setWorkspaceMode] = useState<TemporalWorkspaceMode>(() => {
    const session = getActiveInvestigationSession();
    return session?.temporalWorkspaceMode ?? 'two_epoch';
  });

  // Two-Epoch Comparison Sub-mode: 'then_now' | 'side_by_side' | 'blink' | 'difference'
  const [mode, setMode] = useState<ComparisonMode>('then_now');
  const [manualEpoch, setManualEpoch] = useState<ActiveEpoch>('then');
  const [isMetadataOpen, setIsMetadataOpen] = useState<boolean>(true);

  // Sorting & Filtering
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [detectorFilter, setDetectorFilter] = useState<string | 'all'>('all');

  // Sequence player state
  const [sequenceIndex, setSequenceIndex] = useState<number>(0);
  const [isSequencePlaying, setIsSequencePlaying] = useState<boolean>(false);
  const [playbackSpeedMs, setPlaybackSpeedMs] = useState<number>(1000);

  // Candidate changes list initialized lazily from storage
  const [candidateRecords, setCandidateRecords] = useState<CandidateChangeRecord[]>(() => {
    return targetId ? loadCandidateChangeRecords(targetId) : [];
  });

  // Blink controller for Two-Epoch mode
  const blink = useBlinkMode({
    defaultIntervalMs: 500,
  });

  // Parse requested epochs from URL or session
  const urlEpochIds = useMemo(() => {
    const raw = overrideEpochParam || searchParams.get('epochs');
    if (!raw) return null;
    return raw.split(',').map((s) => s.trim()).filter(Boolean);
  }, [overrideEpochParam, searchParams]);

  // Selected epoch IDs
  const [userSelectedEpochIds, setUserSelectedEpochIds] = useState<string[] | null>(null);

  const selectedEpochIds = useMemo(() => {
    if (userSelectedEpochIds !== null) {
      return userSelectedEpochIds;
    }
    if (manifest?.observations && manifest.observations.length > 0) {
      return resolveValidatedEpochIds(manifest.observations, urlEpochIds, manifest.id);
    }
    return [];
  }, [userSelectedEpochIds, manifest, urlEpochIds]);

  // Active Epoch for deep metadata inspection
  const [userActiveEpochId, setUserActiveEpochId] = useState<string | null>(null);

  const activeEpochId = useMemo(() => {
    if (userActiveEpochId !== null) return userActiveEpochId;
    const session = getActiveInvestigationSession();
    if (session?.activeEpochId && selectedEpochIds.includes(session.activeEpochId)) {
      return session.activeEpochId;
    }
    return selectedEpochIds[0] ?? null;
  }, [userActiveEpochId, selectedEpochIds]);

  const setActiveEpochId = useCallback((id: string | null) => {
    setUserActiveEpochId(id);
  }, []);

  // All epochs with chronological multi-epoch records
  const allEpochs = useMemo(() => {
    if (!manifest?.observations) return [];
    let list = buildMultiEpochRecords(manifest.observations);

    if (detectorFilter !== 'all') {
      list = list.filter((e) => e.detector === detectorFilter);
    }

    if (sortOrder === 'desc') {
      list = [...list].reverse();
    }

    return list;
  }, [manifest, detectorFilter, sortOrder]);

  // Selected epochs subset
  const selectedEpochs = useMemo(() => {
    if (!manifest?.observations) return [];
    return buildMultiEpochRecords(manifest.observations, selectedEpochIds);
  }, [manifest, selectedEpochIds]);

  // Two-Epoch Earlier and Later resolution
  const { earlier: earlierObs, later: laterObs } = useMemo(() => {
    if (!manifest) return { earlier: null, later: null };

    // If explicit override params provided, honor them
    if (overrideEarlierId && overrideLaterId) {
      const validatedIds = resolveValidatedPairIds(
        manifest.observations,
        overrideEarlierId,
        overrideLaterId,
        manifest.id
      );
      return resolveObservationPair(
        manifest,
        validatedIds.earlierId,
        validatedIds.laterId
      );
    }

    // If selectedEpochs has at least 2 epochs, use first as Earlier and second (or last) as Later
    if (selectedEpochs.length >= 2) {
      const firstId = getObsId(selectedEpochs[0]);
      const lastId = getObsId(selectedEpochs[selectedEpochs.length - 1]);
      return resolveObservationPair(manifest, firstId, lastId);
    }

    const defaultIds = resolveValidatedPairIds(
      manifest.observations,
      overrideEarlierId,
      overrideLaterId,
      manifest.id
    );
    return resolveObservationPair(
      manifest,
      defaultIds.earlierId,
      defaultIds.laterId
    );
  }, [manifest, overrideEarlierId, overrideLaterId, selectedEpochs]);

  // Persist active state in session storage
  useEffect(() => {
    if (manifest && earlierObs && laterObs) {
      saveActiveInvestigationSession({
        targetId: manifest.id,
        targetTitle: manifest.title,
        earlierObsId: getObsId(earlierObs),
        laterObsId: getObsId(laterObs),
        selectedEpochIds,
        activeEpochId,
        temporalWorkspaceMode: workspaceMode,
      });
    }
  }, [manifest, earlierObs, laterObs, selectedEpochIds, activeEpochId, workspaceMode]);

  const differenceMeta = useMemo(() => {
    if (!manifest) return null;
    return resolveDifferenceMetadata(manifest);
  }, [manifest]);

  const statusInfo = useMemo(() => {
    if (!manifest) return null;
    return deriveComparisonStatus(manifest);
  }, [manifest]);

  // Toggle selection of an individual epoch
  const toggleEpoch = useCallback(
    (id: string) => {
      setUserSelectedEpochIds((prev) => {
        const base = prev ?? selectedEpochIds;
        let next: string[];
        if (base.includes(id)) {
          if (base.length <= 1) return base;
          next = base.filter((i) => i !== id);
        } else {
          next = [...base, id];
        }

        setSearchParams(
          (p) => {
            const copy = new URLSearchParams(p);
            copy.set('epochs', next.join(','));
            return copy;
          },
          { replace: true }
        );
        return next;
      });
    },
    [selectedEpochIds, setSearchParams]
  );

  const selectAllEpochs = useCallback(() => {
    if (!manifest?.observations) return;
    const allIds = manifest.observations.map((o) => getObsId(o));
    setUserSelectedEpochIds(allIds);
    setSearchParams(
      (p) => {
        const copy = new URLSearchParams(p);
        copy.set('epochs', allIds.join(','));
        return copy;
      },
      { replace: true }
    );
  }, [manifest, setSearchParams]);

  const resetToDefaultPair = useCallback(() => {
    if (!manifest?.observations) return;
    const validated = resolveValidatedPairIds(manifest.observations, null, null, manifest.id);
    const pair = [validated.earlierId, validated.laterId].filter(Boolean) as string[];
    setUserSelectedEpochIds(pair);
    setSearchParams(
      (p) => {
        const copy = new URLSearchParams(p);
        if (pair.length > 0) copy.set('epochs', pair.join(','));
        return copy;
      },
      { replace: true }
    );
  }, [manifest, setSearchParams]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  }, []);

  // Handle mode switches
  const switchMode = useCallback(
    (newMode: ComparisonMode) => {
      if (newMode === 'blink') {
        blink.startBlink();
      } else {
        blink.stopBlink();
      }
      setMode(newMode);
    },
    [blink]
  );

  const switchWorkspaceMode = useCallback(
    (newWorkspaceMode: TemporalWorkspaceMode) => {
      setWorkspaceMode(newWorkspaceMode);
      if (newWorkspaceMode !== 'two_epoch') {
        blink.stopBlink();
      }
    },
    [blink]
  );

  const setThen = useCallback(() => {
    setManualEpoch('then');
    if (mode === 'blink') {
      blink.stopBlink();
      setMode('then_now');
    }
  }, [mode, blink]);

  const setNow = useCallback(() => {
    setManualEpoch('now');
    if (mode === 'blink') {
      blink.stopBlink();
      setMode('then_now');
    }
  }, [mode, blink]);

  // Two-epoch active epoch
  const activeEpoch: ActiveEpoch = mode === 'blink' ? blink.currentEpoch : manualEpoch;

  const currentObs = useMemo(() => {
    if (mode === 'difference') return null;
    return activeEpoch === 'then' ? earlierObs : laterObs;
  }, [mode, activeEpoch, earlierObs, laterObs]);

  const currentImageUrl = useMemo(() => {
    if (!manifest) return null;
    if (mode === 'difference') {
      return resolveImageUrl(differenceMeta?.image);
    }
    const targetObs = activeEpoch === 'then' ? earlierObs : laterObs;
    const path = targetObs?.image || manifest.preview_image || manifest.thumbnail;
    return resolveImageUrl(path);
  }, [manifest, mode, activeEpoch, differenceMeta, earlierObs, laterObs]);

  // Active epoch record for detailed metadata panel
  const activeEpochRecord = useMemo(() => {
    if (!activeEpochId || selectedEpochs.length === 0) {
      return selectedEpochs[0] ?? null;
    }
    return (
      selectedEpochs.find((e) => getObsId(e) === activeEpochId) ??
      allEpochs.find((e) => getObsId(e) === activeEpochId) ??
      selectedEpochs[0] ??
      null
    );
  }, [activeEpochId, selectedEpochs, allEpochs]);

  // Sequence playback controls
  const toggleSequencePlay = useCallback(() => {
    setIsSequencePlaying((prev) => !prev);
  }, []);

  // Candidate change handlers
  const handleAddCandidate = useCallback(
    (record: CandidateChangeRecord) => {
      saveCandidateChangeRecord(record);
      setCandidateRecords((prev) => [record, ...prev]);
    },
    []
  );

  const handleDeleteCandidate = useCallback(
    (id: string) => {
      if (!targetId) return;
      deleteCandidateChangeRecord(targetId, id);
      setCandidateRecords((prev) => prev.filter((c) => c.id !== id));
    },
    [targetId]
  );

  const handleUpdateCandidateStatus = useCallback(
    (id: string, newStatus: CandidateChangeStatus) => {
      setCandidateRecords((prev) => {
        const next = prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c));
        const found = next.find((c) => c.id === id);
        if (found) saveCandidateChangeRecord(found);
        return next;
      });
    },
    []
  );

  return {
    manifest,
    // Multi-epoch state
    allEpochs,
    selectedEpochIds,
    selectedEpochs,
    activeEpochId,
    setActiveEpochId,
    activeEpochRecord,
    workspaceMode,
    switchWorkspaceMode,
    toggleEpoch,
    selectAllEpochs,
    resetToDefaultPair,
    sortOrder,
    toggleSortOrder,
    detectorFilter,
    setDetectorFilter,
    // Sequence mode
    sequenceIndex,
    setSequenceIndex,
    isSequencePlaying,
    toggleSequencePlay,
    playbackSpeedMs,
    setPlaybackSpeedMs,
    // Candidate changes
    candidateRecords,
    handleAddCandidate,
    handleDeleteCandidate,
    handleUpdateCandidateStatus,
    // Two-epoch compatibility state
    earlierObs,
    laterObs,
    differenceMeta,
    statusInfo,
    mode,
    switchMode,
    activeEpoch,
    manualEpoch,
    setThen,
    setNow,
    blink,
    currentObs,
    currentImageUrl,
    isMetadataOpen,
    setIsMetadataOpen,
    isLoading,
    error,
    isFallback,
    refetch,
  };
}
