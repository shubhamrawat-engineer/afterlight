import type {
  ConversationRecord,
  ConversationSummary,
  ChatMessage,
} from '../types/conversation.types';
import type { AIContextReference } from '../types/cosmos-ai.types';
import type { ExplanationMode } from '../types/explanation.types';

const STORAGE_KEY = 'afterlight_cosmos_conversations_v2';
const ACTIVE_CONV_KEY = 'afterlight_cosmos_active_conv_id';

const INITIAL_CONVERSATIONS: ConversationRecord[] = [
  {
    id: 'conv-init-sdfs',
    title: 'Supernova AT-2025sdf Residual Verification',
    createdAt: '2026-11-14T10:00:00.000Z',
    updatedAt: '2026-11-14T12:30:00.000Z',
    context: {
      type: 'investigation',
      caseId: 'INV-2025-SDFS-001',
      targetId: 'spherex-deep-field-south',
      targetName: 'SPHEREx Deep Field South (SDF-S)',
      summaryLabel: 'Case Dossier: INV-2025-SDFS-001',
    },
    explanationMode: 'researcher',
    messages: [
      {
        id: 'msg-sdfs-1',
        sender: 'user',
        content: 'What measurements support the Type Ia supernova hypothesis for the SDFS point source?',
        timestamp: '2026-11-14T12:00:00.000Z',
        status: 'complete',
      },
      {
        id: 'msg-sdfs-2',
        sender: 'assistant',
        content:
          'In candidate AT-2025sdf, the point-source residual flux density is measured at +44.4 ± 1.44 μJy (5.1σ significance) between April 2025 and October 2025 in SPHEREx Band 3 (2.42 μm). The lack of detectable flux in the earlier epoch combined with a point-spread function matched profile strongly disfavors background diffuse emission.',
        timestamp: '2026-11-14T12:00:02.000Z',
        status: 'complete',
        explanationMode: 'researcher',
        isDemonstrationResponse: false,
        structured: {
          directAnswer:
            'A 5.1σ point-source flux density residual (+44.4 ± 1.44 μJy) in Band 3 (2.42 μm) across a 185-day temporal baseline supports the transient hypothesis.',
          observationalEvidence: [
            'Baseline Epoch (SPX-OBS-2025-0104-B3): Undetected (< 3.0 μJy 3σ upper limit).',
            'Comparison Epoch (SPX-OBS-2025-0320-B3): Detected at pixel centroid (78, 62).',
            'Spatial profile matches 6.2″ FWHM telescope point-spread function.',
          ],
          measurements: [
            { parameter: 'Δ Flux Density', value: '+44.4', unit: 'μJy', uncertainty: '1.44' },
            { parameter: 'Bandpass Effective λ', value: '2.42', unit: 'μm' },
            { parameter: 'Detection Significance', value: '5.1', unit: 'σ' },
          ],
          interpretation:
            'Consistent with an optical/near-infrared luminous core-collapse or Type Ia supernova declining along its radioactive 56Co decay tail.',
          limitations: [
            'SPHEREx DR1 Survey Baseline: Multi-epoch spectrophotometry calibrated with CALSPEC standards.',
            'Light curve peak date unconstrained by two-epoch sampling.',
            'Host galaxy redshift unconfirmed without slitless follow-up spectroscopy.',
          ],
          sourceReferences: [
            {
              id: 'OBS-SDFS-B3',
              title: 'Earlier Baseline SPX-OBS-2025-0104-B3',
              type: 'observation',
              internalRoute: '/explore/spherex-deep-field-south',
            },
            {
              id: 'INV-SDFS-001',
              title: 'Investigation Dossier INV-2025-SDFS-001',
              type: 'pipeline',
              internalRoute: '/investigations/INV-2025-SDFS-001',
            },
          ],
        },
      },
    ],
  },
  {
    id: 'conv-init-kbo',
    title: 'Trans-Neptunian Candidate 2024-XR1 Proper Motion',
    createdAt: '2026-11-14T09:15:00.000Z',
    updatedAt: '2026-11-14T11:00:00.000Z',
    context: {
      type: 'temporal',
      targetId: 'kbo-2024-xr1',
      targetName: 'Trans-Neptunian Candidate 2024-XR1',
      comparisonId: 'cmp-kbo-2025-1002',
      summaryLabel: 'Temporal Comparison: kbo-2024-xr1',
    },
    explanationMode: 'curious_explorer',
    messages: [
      {
        id: 'msg-kbo-1',
        sender: 'user',
        content: 'Why does a dipole shape appear in the difference map for 2024-XR1?',
        timestamp: '2026-11-14T11:00:00.000Z',
        status: 'complete',
      },
      {
        id: 'msg-kbo-2',
        sender: 'assistant',
        content:
          'When an object moves between two photo passes, subtracting the older image from the newer image leaves a dark "hole" where it used to be and a bright "spot" where it moved to. This characteristic positive-and-negative pair is called an astrometric dipole, and it is a classic sign of an outer solar system body moving across the star field.',
        timestamp: '2026-11-14T11:00:02.000Z',
        status: 'complete',
        explanationMode: 'curious_explorer',
        isDemonstrationResponse: false,
        structured: {
          directAnswer:
            'An astrometric dipole occurs because the candidate object physically changed position relative to stationary background stars over the 184-day temporal baseline.',
          observationalEvidence: [
            'Negative flux residual at T0 position (RA 348.1125°, Dec -12.4560°).',
            'Positive flux residual at T1 position (displacement Δ = 4.82 arcsec).',
          ],
          limitations: [
            'SPHEREx DR1 Survey Baseline: High-inclination trans-Neptunian orbital model calibrated with Gaia DR3 astrometry.',
            'Cannot determine full Keplerian orbital elements without a third epoch.',
          ],
        },
      },
    ],
  },
];

function loadStoredConversations(): ConversationRecord[] {
  try {
    if (typeof localStorage === 'undefined') return INITIAL_CONVERSATIONS;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CONVERSATIONS));
      return INITIAL_CONVERSATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CONVERSATIONS;
  } catch {
    return INITIAL_CONVERSATIONS;
  }
}

function saveStoredConversations(records: ConversationRecord[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // Demo quota error handling
  }
}

export function listConversations(): ConversationSummary[] {
  const records = loadStoredConversations();
  return records.map((r) => ({
    id: r.id,
    title: r.title,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    context: r.context,
    explanationMode: r.explanationMode,
    messageCount: r.messages.length,
  }));
}

export function loadConversation(id: string): ConversationRecord | null {
  const records = loadStoredConversations();
  return records.find((r) => r.id === id) || null;
}

export function saveConversation(record: ConversationRecord): void {
  const records = loadStoredConversations();
  const index = records.findIndex((r) => r.id === record.id);
  const updatedRecords =
    index >= 0
      ? records.map((r) => (r.id === record.id ? record : r))
      : [record, ...records];
  saveStoredConversations(updatedRecords);
}

export function createConversation(
  context: AIContextReference,
  mode: ExplanationMode = 'researcher',
  title?: string
): ConversationRecord {
  const records = loadStoredConversations();
  const id = `conv-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date().toISOString();

  const generatedTitle =
    title?.trim() ||
    (context.caseId
      ? `Investigation Inquiry (${context.caseId})`
      : context.targetName
      ? `${context.targetName} Analysis`
      : 'General Astronomical Exploration');

  const newRecord: ConversationRecord = {
    id,
    title: generatedTitle,
    createdAt: now,
    updatedAt: now,
    context,
    explanationMode: mode,
    messages: [],
  };

  saveStoredConversations([newRecord, ...records]);
  saveActiveConversationId(id);
  return newRecord;
}

export function renameConversation(id: string, newTitle: string): void {
  const records = loadStoredConversations();
  const updated = records.map((r) =>
    r.id === id ? { ...r, title: newTitle.trim() || r.title, updatedAt: new Date().toISOString() } : r
  );
  saveStoredConversations(updated);
}

export function deleteConversation(id: string): boolean {
  const records = loadStoredConversations();
  const filtered = records.filter((r) => r.id !== id);
  saveStoredConversations(filtered);
  return filtered.length < records.length;
}

export function getActiveConversationId(): string | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(ACTIVE_CONV_KEY);
  } catch {
    return null;
  }
}

export function appendMessage(
  conversationId: string,
  message: ChatMessage
): ConversationRecord | null {
  const records = loadStoredConversations();
  const conv = records.find((c) => c.id === conversationId);
  if (!conv) return null;

  const updated: ConversationRecord = {
    ...conv,
    updatedAt: new Date().toISOString(),
    messages: [...conv.messages, message],
  };

  saveConversation(updated);
  return updated;
}

export function updateConversationRecord(record: ConversationRecord): void {
  saveConversation(record);
}

export const createConversationRecord = (
  context: AIContextReference,
  title?: string,
  mode: ExplanationMode = 'researcher'
) => createConversation(context, mode, title);

export const renameConversationRecord = (id: string, newTitle: string): ConversationRecord | null => {
  renameConversation(id, newTitle);
  return loadConversation(id);
};

export const deleteConversationRecord = (id: string): boolean => deleteConversation(id);

export function saveActiveConversationId(id: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(ACTIVE_CONV_KEY, id);
  } catch {
    // Ignore error
  }
}

export const setActiveConversationId = (id: string): void => saveActiveConversationId(id);

