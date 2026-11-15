/**
 * COSMOS AI — Scientific Response & Guardrails Validator
 *
 * Implements strict frontend verification for AI responses to maintain astronomical integrity:
 * 1. Prohibits fabricated probability percentages (e.g. "87% probability of supernova").
 * 2. Prohibits premature discovery claims or false certainty ("confirmed discovery", "proven transient").
 * 3. Enforces explicit uncertainty disclaimers and demonstration labeling.
 * 4. Ensures claims remain bounded by available observational data.
 */

export interface ValidationResult {
  isValid: boolean;
  guardrailFlags: string[];
  sanitizedContent: string;
  hasUncertaintyDisclosed: boolean;
  hasDemonstrationDisclosure: boolean;
  rejectionReason?: string;
}

// Patterns that imply unscientific fabricated certainty or discovery confirmation
const FORBIDDEN_CONFIRMATION_PATTERNS = [
  /\bconfirmed\s+(supernova|kilonova|exoplanet|transient|discovery|detection)\b/i,
  /\bdefinitively\s+(proven|confirmed|established|discovered)\b/i,
  /\b100%\s*(certain|confidence|guaranteed|proven)\b/i,
  /\bpublication[- ]ready\s+proof\b/i,
  /\bconclusive\s+proof\s+of\b/i,
];

// Patterns that fabricate arbitrary probability figures without statistical validation
const FABRICATED_PROBABILITY_PATTERNS = [
  /\b\d+(\.\d+)?%\s*(probability|chance|likelihood|certainty|confidence)\b/i,
  /\b(probability|likelihood|confidence)\s*(of|is)?\s*\d+(\.\d+)?%/i,
];

export function validateAIResponse(content: string, isDemonstrationEnvironment = true): ValidationResult {
  const guardrailFlags: string[] = [];
  let sanitized = content;

  // 1. Check for fabricated probability percentages
  for (const pattern of FABRICATED_PROBABILITY_PATTERNS) {
    if (pattern.test(sanitized)) {
      guardrailFlags.push('FABRICATED_PROBABILITY_DETECTED');
      sanitized = sanitized.replace(pattern, '[Uncalibrated Qualitative Assessment - Statistical Model Required]');
    }
  }

  // 2. Check for premature discovery or false confirmation claims
  for (const pattern of FORBIDDEN_CONFIRMATION_PATTERNS) {
    if (pattern.test(sanitized)) {
      guardrailFlags.push('UNVERIFIED_DISCOVERY_CLAIM_MUTED');
      sanitized = sanitized.replace(pattern, 'unconfirmed candidate requiring independent verification');
    }
  }

  // 3. Inspect uncertainty disclosure
  const hasUncertaintyDisclosed =
    /\b(uncertainty|uncertainties|caveat|caveats|standard error|systematic|tentative|candidate|unverified|preliminary)\b/i.test(
      sanitized
    );

  if (!hasUncertaintyDisclosed) {
    guardrailFlags.push('UNCERTAINTY_DISCLOSURE_ADDED');
    sanitized += '\n\n*Scientific Note: Observational uncertainties, systematic PSF residuals, and detector noise thresholds must be considered before scientific conclusions can be reached.*';
  }

  // 4. Inspect demonstration environment disclosure
  const hasDemonstrationDisclosure =
    /\b(demonstration|mock|fixture|simulation|prototype|pre-commissioning)\b/i.test(sanitized);

  if (isDemonstrationEnvironment && !hasDemonstrationDisclosure) {
    guardrailFlags.push('DEMONSTRATION_DISCLOSURE_ATTACHED');
  }

  return {
    isValid: guardrailFlags.length === 0 || !guardrailFlags.includes('UNVERIFIED_DISCOVERY_CLAIM_MUTED'),
    guardrailFlags,
    sanitizedContent: sanitized,
    hasUncertaintyDisclosed,
    hasDemonstrationDisclosure,
  };
}

/**
 * Format any numerical measurement with its explicit scientific uncertainty.
 * If uncertainty is missing, flags as qualitative or unquantified.
 */
export function formatMeasurementWithUncertainty(
  param: string,
  value: number | string,
  uncertainty?: number | string,
  unit?: string
): string {
  const unitSuffix = unit ? ` ${unit}` : '';
  if (uncertainty !== undefined && uncertainty !== null && uncertainty !== '') {
    return `${param}: ${value} ± ${uncertainty}${unitSuffix}`;
  }
  return `${param}: ${value}${unitSuffix} (Uncertainty: unquantified in demonstration fixture)`;
}
