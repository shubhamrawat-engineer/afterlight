import { useState, useMemo, useCallback } from 'react';
import type { CandidateDetection } from '../types/evidence.types';

export function useSelectedCandidate(
  candidates: CandidateDetection[],
  initialCandidateId?: string | null
) {
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    if (initialCandidateId) {
      const match = candidates.find((c) => c.id === initialCandidateId);
      if (match) return match.id;
    }
    return candidates.length > 0 ? candidates[0].id : null;
  });

  // Keep in sync if candidate list changes
  const activeCandidate = useMemo(() => {
    if (!selectedId) return candidates[0] ?? null;
    return candidates.find((c) => c.id === selectedId) ?? candidates[0] ?? null;
  }, [candidates, selectedId]);

  const selectCandidate = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return {
    selectedId: activeCandidate?.id ?? null,
    selectedCandidate: activeCandidate,
    selectCandidate,
  };
}
