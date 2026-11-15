import type { TargetKind } from '../types/explorer.types';

export function formatTargetKind(kind: TargetKind): string {
  switch (kind) {
    case 'deep_field':
      return 'Deep Field';
    case 'moving_object':
      return 'Moving Object';
    case 'variable_star':
      return 'Variable Star';
    case 'control_static':
      return 'Static Control';
    default:
      return kind;
  }
}

export function formatCoordinate(val: number | null | undefined, isSigned = false): string {
  if (val === undefined || val === null) return 'Not available';
  const sign = isSigned && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(4)}°`;
}
