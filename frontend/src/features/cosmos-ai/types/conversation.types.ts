import type {
  AIContextReference,
  StructuredAIResponse,
} from './cosmos-ai.types';
import type {
  ExplanationMode,
  EvidenceExplanationData,
  PossibleExplanationItem,
} from './explanation.types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  status: 'sending' | 'streaming' | 'complete' | 'error';
  context?: AIContextReference;
  structured?: StructuredAIResponse;
  errorMessage?: string;
  explanationMode?: ExplanationMode;
  evidenceExplanation?: EvidenceExplanationData;
  possibleExplanations?: PossibleExplanationItem[];
  guardrailFlags?: string[];
  isDemonstrationResponse?: boolean;
}

export interface ConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  context: AIContextReference;
  explanationMode: ExplanationMode;
  messageCount: number;
}

export interface ConversationRecord {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  context: AIContextReference;
  explanationMode: ExplanationMode;
  messages: ChatMessage[];
}
