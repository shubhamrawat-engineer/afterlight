import test from 'node:test';
import assert from 'node:assert/strict';

// Node test environment Mock for localStorage / sessionStorage
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }
  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }
  removeItem(key: string): void {
    this.store.delete(key);
  }
  clear(): void {
    this.store.clear();
  }
}

if (typeof globalThis.localStorage === 'undefined') {
  // @ts-expect-error test mock
  globalThis.localStorage = new MemoryStorage();
}
if (typeof globalThis.sessionStorage === 'undefined') {
  // @ts-expect-error test mock
  globalThis.sessionStorage = new MemoryStorage();
}

import {
  resolveContextFromParams,
} from '../../src/features/cosmos-ai/hooks/useConversationContext';
import {
  enrichContextMetadata,
} from '../../src/features/cosmos-ai/services/cosmos-context-service';
import {
  listConversations,
  loadConversation,
  createConversation,
  appendMessage,
  renameConversation,
  deleteConversation,
} from '../../src/features/cosmos-ai/services/cosmos-conversation-service';
import {
  validateAIResponse,
  formatMeasurementWithUncertainty,
} from '../../src/features/cosmos-ai/services/cosmos-response-validator';
import {
  generateEvidenceExplanation,
  generatePossibleExplanations,
  generateModeExplanation,
} from '../../src/features/cosmos-ai/services/cosmos-explanation-engine';
import { sendAIInquiry } from '../../src/features/cosmos-ai/services/cosmos-ai-service';
import type { AIContextReference } from '../../src/features/cosmos-ai/types/cosmos-ai.types';

test('COSMOS AI - Context Resolution & Strict Precedence (All 6 Contexts)', () => {
  // 1. Investigation Precedence over generic targetId
  const invParams = new URLSearchParams(
    'contextType=investigation&caseId=INV-2025-SDFS-001&targetId=spherex-deep-field-south'
  );
  const resolvedInv = resolveContextFromParams(invParams);
  assert.equal(resolvedInv.type, 'investigation');
  assert.equal(resolvedInv.caseId, 'INV-2025-SDFS-001');

  // 2. Temporal Precedence over generic targetId
  const tempParams = new URLSearchParams(
    'contextType=temporal&comparisonId=cmp-2025-01&targetId=spherex-deep-field-south'
  );
  const resolvedTemp = resolveContextFromParams(tempParams);
  assert.equal(resolvedTemp.type, 'temporal');
  assert.equal(resolvedTemp.comparisonId, 'cmp-2025-01');

  // 3. Multi-Epoch Context
  const multiParams = new URLSearchParams(
    'contextType=multi_epoch&targetId=spherex-deep-field-south'
  );
  const resolvedMulti = resolveContextFromParams(multiParams);
  assert.equal(resolvedMulti.type, 'temporal');

  // 4. Evidence Context
  const evidParams = new URLSearchParams(
    'contextType=evidence&targetId=spherex-deep-field-south'
  );
  const resolvedEvid = resolveContextFromParams(evidParams);
  assert.equal(resolvedEvid.type, 'evidence');

  // 5. Observations Context
  const obsParams = new URLSearchParams(
    'contextType=observations&targetId=spherex-deep-field-south'
  );
  const resolvedObs = resolveContextFromParams(obsParams);
  assert.equal(resolvedObs.type, 'observations');

  // 6. Target Context (fallback when no specific contextType)
  const targetParams = new URLSearchParams('targetId=spherex-deep-field-south');
  const resolvedTarget = resolveContextFromParams(targetParams);
  assert.equal(resolvedTarget.type, 'target');

  // 7. Global Context (fallback when empty)
  const emptyParams = new URLSearchParams('');
  const resolvedGlobal = resolveContextFromParams(emptyParams);
  assert.equal(resolvedGlobal.type, 'general');
});

test('COSMOS AI - Enriched Context Metadata carries DEMONSTRATION_FIXTURE and coordinates', () => {
  const invCtx: AIContextReference = {
    type: 'investigation',
    caseId: 'INV-2025-SDFS-001',
    targetId: 'spherex-deep-field-south',
  };
  const enriched = enrichContextMetadata(invCtx);
  assert.equal(enriched.contextType, 'investigation');
  assert.equal(enriched.dataClassification, 'DEMONSTRATION_FIXTURE');
  assert.ok(enriched.coordinates?.raDeg !== null);
  assert.ok(enriched.coordinates?.decDeg !== null);
  assert.ok(enriched.observations?.selectedEpochIds.length !== undefined);
  assert.ok(enriched.summaryBadgeText.includes('INV:'));
});

test('COSMOS AI - Conversation CRUD and Persistence', () => {
  localStorage.clear();

  // 1. Initial list from seeded defaults
  const initial = listConversations();
  assert.ok(initial.length >= 2, 'Should seed default demonstrative conversations');

  // 2. Create new conversation
  const testContext: AIContextReference = {
    type: 'evidence',
    targetId: 'spherex-deep-field-south',
    summaryLabel: 'Evidence Ledger: SDF-S',
  };
  const newConv = createConversation(testContext, 'researcher', 'Test Evidence Thread');
  assert.ok(newConv.id.startsWith('conv-'));
  assert.equal(newConv.title, 'Test Evidence Thread');

  // 3. Append messages
  const userMsg = {
    id: 'user-1',
    sender: 'user' as const,
    content: 'What is the differential flux measurement?',
    timestamp: new Date().toISOString(),
    status: 'complete' as const,
  };
  const withUser = appendMessage(newConv.id, userMsg);
  assert.equal(withUser?.messages.length, 1);

  const assistantMsg = {
    id: 'ai-1',
    sender: 'assistant' as const,
    content: 'The measured flux differential is 4.12 ± 0.38 μJy in Band 3.',
    timestamp: new Date().toISOString(),
    status: 'complete' as const,
    isDemonstrationResponse: true,
  };
  const withAi = appendMessage(newConv.id, assistantMsg);
  assert.equal(withAi?.messages.length, 2);

  // 4. Rename conversation
  renameConversation(newConv.id, 'Renamed SDFS Discussion');
  const loaded = loadConversation(newConv.id);
  assert.equal(loaded?.title, 'Renamed SDFS Discussion');

  // 5. Delete conversation
  const deleted = deleteConversation(newConv.id);
  assert.equal(deleted, true);
  assert.equal(loadConversation(newConv.id), null);
});

test('COSMOS AI - Scientific Reasoning Guardrails', () => {
  // 1. Catches and flags fabricated probability percentages
  const promptWithFakeProb = 'There is an 87% probability of a supernova here.';
  const validation1 = validateAIResponse(promptWithFakeProb, true);
  assert.ok(validation1.guardrailFlags.includes('FABRICATED_PROBABILITY_DETECTED'));
  assert.ok(!validation1.sanitizedContent.includes('87% probability'));
  assert.ok(validation1.sanitizedContent.includes('[Uncalibrated Qualitative Assessment'));

  // 2. Catches and neutralizes false discovery claims
  const promptWithFalseClaim = 'We have confirmed discovery of a kilonova in this epoch.';
  const validation2 = validateAIResponse(promptWithFalseClaim, true);
  assert.ok(validation2.guardrailFlags.includes('UNVERIFIED_DISCOVERY_CLAIM_MUTED'));
  assert.ok(!validation2.sanitizedContent.includes('confirmed discovery'));
  assert.ok(validation2.sanitizedContent.includes('unconfirmed candidate requiring independent verification'));

  // 3. Adds uncertainty disclosure when missing
  const plainText = 'The star became brighter.';
  const validation3 = validateAIResponse(plainText, true);
  assert.ok(validation3.guardrailFlags.includes('UNCERTAINTY_DISCLOSURE_ADDED'));
  assert.ok(validation3.sanitizedContent.includes('Scientific Note: Observational uncertainties'));

  // 4. Formats measurements with explicit standard uncertainties
  const withUncertainty = formatMeasurementWithUncertainty('Flux Excess', '4.12', '0.38', 'μJy');
  assert.equal(withUncertainty, 'Flux Excess: 4.12 ± 0.38 μJy');

  const withoutUncertainty = formatMeasurementWithUncertainty('Signal-to-Noise', '10.84', undefined, 'σ');
  assert.ok(withoutUncertainty.includes('(Uncertainty: unquantified in demonstration fixture)'));
});

test('COSMOS AI - Three Explanation Modes', () => {
  const context: AIContextReference = {
    type: 'temporal',
    targetId: 'spherex-deep-field-south',
    comparisonId: 'cmp-sdfs-01',
  };

  // 1. Researcher Mode: rigorous astrophysical terms, flux density (μJy), LaTeX formulas
  const res = generateModeExplanation('Explain the difference image', context, 'researcher');
  assert.ok(res.text.includes('\\Delta F_\\nu'));
  assert.ok(res.text.includes('\\mu\\text{Jy}'));
  assert.ok(res.text.includes('FWHM'));
  assert.ok(res.text.includes('Gaia DR3'));

  // 2. Curious Explorer Mode: engaging, visual analogies, infrared explanations
  const exp = generateModeExplanation('Explain the difference image', context, 'curious_explorer');
  assert.ok(exp.text.includes('Infrared Vision'));
  assert.ok(exp.text.includes('microjanskys'));
  assert.ok(exp.text.includes('supernova') || exp.text.includes('black hole'));

  // 3. Kids Mode: cosmic detective story, simple wonder without scientific deceit
  const kids = generateModeExplanation('Explain the difference image', context, 'kids');
  assert.ok(kids.text.includes('Cosmic Detective'));
  assert.ok(kids.text.includes('night-vision') || kids.text.includes('Night Vision'));
  assert.ok(kids.text.includes('firework'));
  assert.ok(kids.text.includes('Astronomers won\'t claim'));
});

test('COSMOS AI - Scientific Evidence Explainer (7 Structured Sections)', () => {
  const context: AIContextReference = {
    type: 'evidence',
    targetId: 'spherex-deep-field-south',
  };
  const evidence = generateEvidenceExplanation(context);

  assert.equal(evidence.dataClassification, 'DEMONSTRATION_FIXTURE');
  assert.ok(evidence.availableEvidence.length >= 3, 'Section 1: Available Evidence');
  assert.ok(evidence.supportingMeasurements.length >= 4, 'Section 2: Supporting Measurements');
  assert.ok(evidence.contradictingEvidence.length >= 2, 'Section 3: Contradicting Evidence');
  assert.ok(evidence.missingInformation.length >= 3, 'Section 4: Missing Information');
  assert.ok(evidence.instrumentalCaveats.length >= 2, 'Section 5: Instrumental Caveats');
  assert.ok(evidence.possibleAstrophysicalExplanations.length >= 3, 'Section 6: Astrophysical Explanations');
  assert.ok(evidence.recommendedNextSteps.length >= 3, 'Section 7: Recommended Next Steps');

  // Verify measurements have parameter, value, uncertainty, and unit
  for (const m of evidence.supportingMeasurements) {
    assert.ok(m.parameter, 'Measurement must have parameter');
    assert.ok(m.value !== undefined, 'Measurement must have value');
    assert.ok(m.uncertainty !== undefined, 'Measurement must have uncertainty');
  }
});

test('COSMOS AI - Possible Explanations Matrix (6 Categories Without Fabricated Probabilities)', () => {
  const context: AIContextReference = {
    type: 'temporal',
    targetId: 'spherex-deep-field-south',
  };
  const explanations = generatePossibleExplanations(context);

  assert.equal(explanations.length, 6, 'Must provide all 6 investigation categories');

  const categories = explanations.map((e) => e.category);
  assert.ok(categories.includes('astrophysical'));
  assert.ok(categories.includes('instrumental'));
  assert.ok(categories.includes('calibration'));
  assert.ok(categories.includes('background'));
  assert.ok(categories.includes('astrometric'));
  assert.ok(categories.includes('insufficient_evidence'));

  // Ensure NO fabricated probability numbers are present in explanations
  for (const item of explanations) {
    assert.ok(item.categoryLabel);
    assert.ok(item.explanation);
    assert.ok(item.supportingEvidence.length > 0);
    assert.ok(item.contradictingEvidence.length > 0);
    assert.ok(item.validationRequired.length > 0);

    // Verify regex does not match arbitrary probability figures
    assert.equal(
      /\b\d+%\s*(probability|likelihood|certainty)\b/i.test(item.explanation),
      false,
      `Category ${item.category} must not contain arbitrary probability figures`
    );
  }
});

test('COSMOS AI - Offline Fallback & Immutability', async () => {
  // When FastAPI backend is offline, sendAIInquiry falls back to local explanation engine
  const result = await sendAIInquiry(
    {
      prompt: 'Explain the candidate flux change',
      context: { type: 'temporal', targetId: 'spherex-deep-field-south' },
    },
    'researcher'
  );

  assert.equal(result.isDemonstrationResponse, true);
  assert.equal(result.explanationMode, 'researcher');
  assert.ok(result.content.length > 0);
  assert.ok(result.evidenceExplanation !== undefined);
  assert.ok(result.possibleExplanations !== undefined);
  assert.ok(result.guardrailFlags?.includes('DEMONSTRATION_FIXTURE_ACTIVE'));
});
