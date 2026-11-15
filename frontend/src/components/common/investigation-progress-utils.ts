export type InvestigationStageId =
  | 'discover'
  | 'select_observations'
  | 'readiness'
  | 'investigate'
  | 'evidence'
  | 'create_case';

/**
 * Pure helper that builds the navigation URL for any stage of the 6-step
 * investigation journey while preserving the selected sky region and observation pair.
 */
export function buildInvestigationStageHref(
  stage: InvestigationStageId,
  targetId?: string | null,
  earlierObsId?: string | null,
  laterObsId?: string | null
): string {
  const safeTargetId = targetId?.trim() || 'spherex-deep-field-south';
  const params = new URLSearchParams();
  if (earlierObsId) params.set('earlier', earlierObsId);
  if (laterObsId) params.set('later', laterObsId);
  const query = params.toString();
  const suffix = query ? `?${query}` : '';

  switch (stage) {
    case 'discover':
      return targetId ? `/explore/${safeTargetId}` : '/explore';
    case 'select_observations':
      return `/observations/${safeTargetId}${suffix}`;
    case 'readiness':
      return `/compatibility/${safeTargetId}${suffix}`;
    case 'investigate':
      return `/temporal-analysis/${safeTargetId}${suffix}`;
    case 'evidence':
      return `/evidence/${safeTargetId}${suffix}`;
    case 'create_case':
      return '/investigations/new';
  }
}
