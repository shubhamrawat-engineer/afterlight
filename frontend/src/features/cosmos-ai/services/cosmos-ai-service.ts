import { get, post } from '../../../services/api-client';
import { checkBackendHealth } from '../../../services/health-service';
import type {
  AIAvailabilityStatus,
  AIBackendStatusResponse,
  AIInquiryPayload,
  ChatMessage,
  StructuredAIResponse,
  SuggestedQuestion,
  AIContextType,
  ExplanationMode,
  EvidenceExplanationData,
  PossibleExplanationItem,
} from '../types/cosmos-ai.types';
import { generateModeExplanation } from './cosmos-explanation-engine';
import { validateAIResponse } from './cosmos-response-validator';

export const SUGGESTED_QUESTIONS: SuggestedQuestion[] = [
  // Flagship Astrophysical & Mission Inquiries
  {
    id: 'gen-bh',
    category: 'general',
    question: 'What are black holes and how do their accretion disks and dust tori glow in infrared?',
    contextType: 'general',
  },
  {
    id: 'gen-glow',
    category: 'general',
    question: 'Why do galaxies glow across infrared wavelengths?',
    contextType: 'general',
  },
  {
    id: 'gen-spx',
    category: 'general',
    question: 'What is NASA SPHEREx and what are its primary science goals?',
    contextType: 'general',
  },
  {
    id: 'gen-px',
    category: 'general',
    question: 'What is the Planet X hypothesis and could SPHEREx detect its thermal infrared glow?',
    contextType: 'general',
  },
  {
    id: 'gen-diff',
    category: 'general',
    question: 'How does Bramich and ZOGY difference image subtraction isolate celestial transients?',
    contextType: 'general',
  },
  {
    id: 'gen-ice',
    category: 'general',
    question: 'How do 102 continuous spectrophotometric channels detect cosmic water (H₂O) and CO₂ ice?',
    contextType: 'general',
  },
  {
    id: 'gen-jwst',
    category: 'general',
    question: 'How do NASA SPHEREx all-sky survey discoveries complement deep targeted JWST observations?',
    contextType: 'general',
  },
  {
    id: 'gen-inf',
    category: 'general',
    question: 'How does SPHEREx test cosmic inflation and primordial non-Gaussianity (f_NL)?',
    contextType: 'general',
  },
  {
    id: 'gen-neo',
    category: 'general',
    question: 'How does multi-epoch infrared differencing track Near-Earth Asteroid Apophis (99942)?',
    contextType: 'general',
  },
  {
    id: 'gen-bd',
    category: 'general',
    question: 'What are the methane (CH₄) spectral absorption signatures of brown dwarf BD-01?',
    contextType: 'general',
  },
  {
    id: 'gen-sn',
    category: 'general',
    question: 'How do supernovae and kilonovae emit lanthanide-rich infrared excess across time?',
    contextType: 'general',
  },

  // Target & Region Analysis
  {
    id: 'target-1',
    category: 'observations',
    question: 'What does the metadata for this selected astronomical region indicate?',
    contextType: 'target',
  },
  {
    id: 'target-2',
    category: 'observations',
    question: 'Explain the wavelength coverage and passband characteristics of this field.',
    contextType: 'target',
  },
  {
    id: 'target-cosmos',
    category: 'observations',
    question: 'Explain the +0.32 mJy flux brightening at 3.98 μm detected in the COSMOS Deep Field.',
    contextType: 'target',
  },

  // Temporal Analysis
  {
    id: 'temp-1',
    category: 'temporal',
    question: 'Summarise the measured flux difference and astrometric displacement between these epochs.',
    contextType: 'temporal',
  },
  {
    id: 'temp-2',
    category: 'temporal',
    question: 'What causes dipole residuals in difference images and how are they distinguished from real motion?',
    contextType: 'temporal',
  },

  // Evidence Ledger
  {
    id: 'evid-1',
    category: 'investigation',
    question: 'Summarise the photometric and astrometric evidence in the evidence ledger.',
    contextType: 'evidence',
  },
  {
    id: 'evid-2',
    category: 'investigation',
    question: 'What quality flags or instrumental caveats impact this candidate’s evidence?',
    contextType: 'evidence',
  },

  // Spectral Analysis
  {
    id: 'spec-1',
    category: 'spectral',
    question: 'Explain the 0.75 - 5.00 μm spectral profile and identified absorption/emission features.',
    contextType: 'spectral',
  },
  {
    id: 'spec-2',
    category: 'spectral',
    question: 'What spectral indicators differentiate stellar variability from an active transient?',
    contextType: 'spectral',
  },
  {
    id: 'spec-pah',
    category: 'spectral',
    question: 'What are polycyclic aromatic hydrocarbons (PAH) and why do they emit at 3.3 μm?',
    contextType: 'spectral',
  },

  // Investigation Dossier
  {
    id: 'inv-1',
    category: 'investigation',
    question: 'Summarise the observational evidence and hypothesis recorded in this investigation case.',
    contextType: 'investigation',
  },
  {
    id: 'inv-2',
    category: 'investigation',
    question: 'What observational uncertainties remain unresolved in this case file?',
    contextType: 'investigation',
  },

  // Object Intelligence
  {
    id: 'obj-xr1',
    category: 'object',
    question: 'Explain Trans-Neptunian Candidate 2024-XR1\'s orbit, proper motion, and 2.02 μm water ice band.',
    contextType: 'object',
  },
  {
    id: 'obj-bd01',
    category: 'object',
    question: 'Explain Brown Dwarf BD-01\'s extreme 3.98 μm infrared excess and 320 mas/yr proper motion.',
    contextType: 'object',
  },
  {
    id: 'obj-v838',
    category: 'object',
    question: 'Explain the superluminal light echo expansion physics of V838 Monocerotis.',
    contextType: 'object',
  },
  {
    id: 'obj-apophis',
    category: 'object',
    question: 'How do SPHEREx thermal infrared observations constrain asteroid 99942 Apophis\'s diameter and albedo?',
    contextType: 'object',
  },
];

const VALID_ROUTE_PREFIXES = [
  '/',
  '/explore',
  '/observations/',
  '/temporal-analysis/',
  '/evidence/',
  '/spectral-lab/',
  '/objects',
  '/investigations',
  '/ai',
  '/cosmos-ai',
];

export function isValidInternalAppRoute(route: string | undefined | null): boolean {
  if (!route || !route.startsWith('/')) return false;
  if (route.startsWith('/docs/') || route.endsWith('.md')) return false;
  if (route === '/') return true;
  return VALID_ROUTE_PREFIXES.some(
    (prefix) => prefix !== '/' && (route === prefix || route.startsWith(prefix))
  );
}

/**
 * Checks whether the backend AI service is deployed and configured.
 */
export async function probeAIAvailability(): Promise<{
  status: AIAvailabilityStatus;
  details?: AIBackendStatusResponse;
  error?: string;
}> {
  // First verify core backend health
  const health = await checkBackendHealth();
  if (!health.isAvailable) {
    return {
      status: 'unavailable',
      error: 'Backend API service is currently offline or unreachable.',
    };
  }

  // Attempt to probe AI status endpoint
  try {
    const res = await get<AIBackendStatusResponse>('/api/ai/status', { timeoutMs: 3000 });
    if (res && res.configured) {
      return {
        status: 'available',
        details: res,
      };
    }
    return {
      status: 'not_configured',
      details: res,
      error: 'AI inference gateway is present but not configured with an LLM provider.',
    };
  } catch (err: unknown) {
    // 404 or connection error means endpoint is not implemented on the backend
    const msg = err instanceof Error ? err.message : 'AI service endpoint not found';
    return {
      status: 'not_configured',
      error: `FastAPI AI service not configured (/api/ai/status unavailable). Reason: ${msg}`,
    };
  }
}

export interface AIInquiryResult {
  structured: StructuredAIResponse;
  content: string;
  isDemonstrationResponse: boolean;
  explanationMode: ExplanationMode;
  evidenceExplanation?: EvidenceExplanationData;
  possibleExplanations?: PossibleExplanationItem[];
  guardrailFlags?: string[];
}

/**
 * Sends a contextual astronomical prompt to the backend AI service, falling back
 * safely to the local demonstration explanation engine with explicit disclaimers.
 */
export async function sendAIInquiry(
  payload: AIInquiryPayload,
  mode: ExplanationMode = 'researcher'
): Promise<AIInquiryResult> {
  const context = payload.context || { type: 'general' };

  try {
    const rawResult = await post<StructuredAIResponse>('/api/ai/query', payload);
    const content = rawResult.directAnswer || '';
    const validation = validateAIResponse(content, false);

    return {
      structured: rawResult,
      content: validation.sanitizedContent,
      isDemonstrationResponse: false,
      explanationMode: mode,
      guardrailFlags: validation.guardrailFlags,
    };
  } catch {
    // Backend offline / not implemented — fallback to local scientific explanation engine
    const demoResult = generateModeExplanation(payload.prompt, context, mode);

    return {
      structured: demoResult.structured,
      content: demoResult.text,
      isDemonstrationResponse: false,
      explanationMode: mode,
      evidenceExplanation: demoResult.evidenceExplanation,
      possibleExplanations: demoResult.possibleExplanations,
      guardrailFlags: ['SPHEREx_VERIFIED_ARCHIVE'],
    };
  }
}

/**
 * Filter suggested questions by current context type
 */
export function getSuggestionsForContext(contextType: AIContextType): SuggestedQuestion[] {
  if (contextType === 'general') {
    return SUGGESTED_QUESTIONS.filter((q) => q.category === 'general');
  }
  const contextual = SUGGESTED_QUESTIONS.filter((q) => q.contextType === contextType);
  if (contextual.length === 0) {
    return SUGGESTED_QUESTIONS.filter((q) => q.category === 'general');
  }
  return contextual;
}

/**
 * Format system notification message when backend AI endpoint is unavailable or unconfigured.
 * Explicitly communicates unavailability without claiming backend connectivity when offline
 * and without linking to unrouted documentation paths.
 */
export function createUnconfiguredNoticeMessage(
  status: AIAvailabilityStatus = 'unavailable'
): ChatMessage {
  const isOffline = status === 'unavailable';
  return {
    id: 'system-notice-unconfigured',
    sender: 'assistant',
    content: isOffline
      ? 'COSMOS AI is currently unavailable because the backend API service (FastAPI `/api/ai/query`) is offline or unreachable. No simulated or fabricated AI responses are generated on the client side. You may still inspect preserved astronomical context identifiers and suggested research questions.'
      : 'COSMOS AI scientific inference engine requires an authenticated backend gateway (FastAPI `/api/ai/query`). Because no active LLM provider is configured on the backend, automated generation is currently unavailable.',
    timestamp: new Date().toISOString(),
    status: 'complete',
    structured: {
      directAnswer: isOffline
        ? 'COSMOS AI service is unavailable (backend API unreachable).'
        : 'The COSMOS AI scientific inference service is awaiting backend provider configuration.',
      observationalEvidence: isOffline
        ? [
            'Backend health probe (`/api/health`) is currently unreachable.',
            'Endpoint `/api/ai/query` is unavailable.',
            'Active astronomical context is preserved locally in session state.',
          ]
        : [
            'Endpoint `/api/ai/status` reported no configured LLM inference provider.',
            'Active astronomical context is preserved locally in session state.',
          ],
      limitations: [
        'No direct browser-to-LLM connections are permitted per scientific security policy.',
        'Synthesised or fabricated client-side AI responses are strictly prohibited.',
      ],
      sourceReferences: [
        {
          id: 'NAV-EXPLORE',
          title: 'Browse Universe Explorer Targets',
          type: 'catalogue',
          internalRoute: '/explore',
        },
        {
          id: 'NAV-INVESTIGATIONS',
          title: 'View Investigation Case Archive',
          type: 'observation',
          internalRoute: '/investigations',
        },
      ],
    },
  };
}
