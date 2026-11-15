import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { AIContextReference, AIContextType } from '../types/cosmos-ai.types';

const CONTEXT_STORAGE_KEY = 'afterlight_cosmos_ai_active_context';

const VALID_EXPLICIT_TYPES: ReadonlySet<string> = new Set([
  'general',
  'global',
  'target',
  'observations',
  'observation',
  'temporal',
  'multi_epoch',
  'evidence',
  'spectral',
  'investigation',
  'object',
]);

function loadStoredContext(): AIContextReference | null {
  try {
    if (typeof sessionStorage === 'undefined') return null;
    const raw = sessionStorage.getItem(CONTEXT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AIContextReference;
    if (parsed && typeof parsed.type === 'string' && VALID_EXPLICIT_TYPES.has(parsed.type)) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

function saveStoredContext(ctx: AIContextReference): void {
  try {
    if (typeof sessionStorage === 'undefined') return;
    sessionStorage.setItem(CONTEXT_STORAGE_KEY, JSON.stringify(ctx));
  } catch {
    // Ignore storage quota errors
  }
}

/**
 * Pure helper to resolve astronomical conversation context from URL query parameters.
 * Explicit contextType always takes precedence over generic targetId detection.
 */
export function resolveContextFromParams(
  searchParams: URLSearchParams,
  fallbackStoredContext?: AIContextReference | null
): AIContextReference {
  const rawTypeParam = searchParams.get('contextType');
  const rawType =
    rawTypeParam && VALID_EXPLICIT_TYPES.has(rawTypeParam)
      ? (rawTypeParam as AIContextType)
      : null;

  const targetId = searchParams.get('targetId') ?? undefined;
  const targetName = searchParams.get('targetName') ?? undefined;
  const comparisonId = searchParams.get('comparisonId') ?? undefined;
  const caseId = searchParams.get('caseId') ?? undefined;
  const objectId = searchParams.get('objectId') ?? undefined;
  const spectralSourceId = searchParams.get('spectralSourceId') ?? undefined;

  const hasAnyUrlContextParam = Boolean(
    rawType || targetId || targetName || comparisonId || caseId || objectId || spectralSourceId
  );

  if (!hasAnyUrlContextParam && fallbackStoredContext) {
    return fallbackStoredContext;
  }

  let type: AIContextType = 'general';
  let summaryLabel = 'General Astronomical Knowledge';

  // 1. Explicit contextType takes strict priority over generic targetId presence
  if (rawType === 'temporal' || rawType === 'multi_epoch') {
    type = 'temporal';
    summaryLabel = `Temporal Comparison: ${comparisonId || targetName || targetId || 'Active Pair'}`;
  } else if (rawType === 'evidence') {
    type = 'evidence';
    summaryLabel = `Evidence Ledger: ${targetName || targetId || 'Active Target'}`;
  } else if (rawType === 'spectral') {
    type = 'spectral';
    summaryLabel = `Spectral Profile: ${spectralSourceId || targetName || targetId || 'Source'}`;
  } else if (rawType === 'investigation') {
    type = 'investigation';
    summaryLabel = `Case Dossier: ${caseId || targetName || 'Investigation'}`;
  } else if (rawType === 'object') {
    type = 'object';
    summaryLabel = `Celestial Object: ${objectId || targetName || 'Catalogued Source'}`;
  } else if (rawType === 'observations' || rawType === 'observation') {
    type = 'observations';
    summaryLabel = `Observations: ${targetName || targetId || 'Selected Region'}`;
  } else if (rawType === 'target') {
    type = 'target';
    summaryLabel = `Target: ${targetName || targetId || 'Selected Region'}`;
  } else if (rawType === 'general' || rawType === 'global') {
    type = 'general';
    summaryLabel = 'General Astronomical Knowledge';
  }
  // 2. Fallback inference by specific resource identifier (most specific first)
  else if (caseId) {
    type = 'investigation';
    summaryLabel = `Case Dossier: ${caseId}`;
  } else if (objectId) {
    type = 'object';
    summaryLabel = `Celestial Object: ${objectId}`;
  } else if (spectralSourceId) {
    type = 'spectral';
    summaryLabel = `Spectral Profile: ${spectralSourceId}`;
  } else if (comparisonId) {
    type = 'temporal';
    summaryLabel = `Temporal Comparison: ${comparisonId}`;
  } else if (targetId) {
    type = 'target';
    summaryLabel = `Target: ${targetName || targetId}`;
  }

  return {
    type,
    targetId,
    targetName,
    comparisonId,
    caseId,
    objectId,
    spectralSourceId,
    summaryLabel,
  };
}

export function useConversationContext() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Resolve context from URL params or preserved sessionStorage
  const resolvedContext = useMemo<AIContextReference>(() => {
    const stored = loadStoredContext();
    return resolveContextFromParams(searchParams, stored);
  }, [searchParams]);

  const [context, setContext] = useState<AIContextReference>(resolvedContext);
  const [boundContext, setBoundContext] = useState<AIContextReference | null>(
    resolvedContext.type !== 'general' ? resolvedContext : loadStoredContext()
  );

  // Sync when URL searchParams change
  const [prevResolved, setPrevResolved] = useState<AIContextReference>(resolvedContext);
  if (
    resolvedContext.type !== prevResolved.type ||
    resolvedContext.targetId !== prevResolved.targetId ||
    resolvedContext.caseId !== prevResolved.caseId ||
    resolvedContext.objectId !== prevResolved.objectId ||
    resolvedContext.comparisonId !== prevResolved.comparisonId ||
    resolvedContext.spectralSourceId !== prevResolved.spectralSourceId
  ) {
    setPrevResolved(resolvedContext);
    setContext(resolvedContext);
    if (resolvedContext.type !== 'general') {
      setBoundContext(resolvedContext);
    }
  }

  // Persist non-general bound context across page navigation
  useEffect(() => {
    if (context.type !== 'general') {
      saveStoredContext(context);
    }
  }, [context]);

  const setContextType = (type: AIContextType) => {
    if (type === 'general') {
      setContext({
        type: 'general',
        summaryLabel: 'General Astronomical Knowledge',
      });
    } else if (boundContext) {
      setContext(boundContext);
    } else if (resolvedContext.type !== 'general') {
      setContext(resolvedContext);
    }
  };

  const initialQuery = searchParams.get('q') || '';

  const clearQueryParam = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('q');
    setSearchParams(nextParams, { replace: true });
  };

  return {
    context,
    boundContext,
    setContext,
    setContextType,
    initialQuery,
    clearQueryParam,
    hasContextualData: Boolean(boundContext && boundContext.type !== 'general'),
  };
}
