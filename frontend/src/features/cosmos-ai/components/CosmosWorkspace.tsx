import React, { useState, useRef, useEffect } from 'react';
import { useCosmosConversation } from '../hooks/useCosmosConversation';
import { useConversationContext } from '../hooks/useConversationContext';
import { ConversationSidebar } from './ConversationSidebar';
import { ActiveContextPanel } from './ActiveContextPanel';
import { ExplanationModeSelector } from './ExplanationModeSelector';
import { ChatMessage } from './ChatMessage';
import { ChatComposer } from './ChatComposer';
import { InvestigationActionPanel } from './InvestigationActionPanel';
import { ScientificCaveatPanel } from './ScientificCaveatPanel';
import { AIAvailabilityIndicator } from './AIAvailabilityIndicator';
import { SuggestedQuestions } from './SuggestedQuestions';
import { getSuggestionsForContext, probeAIAvailability } from '../services/cosmos-ai-service';
import type { AIAvailabilityStatus, ChatMessage as ChatMessageType } from '../types/cosmos-ai.types';
import {
  Menu,
  Sparkles,
  HelpCircle,
  Shield,
  Layers,
} from 'lucide-react';

const PENDING_MESSAGE: ChatMessageType = {
  id: 'temp-loading',
  sender: 'assistant',
  content: '',
  timestamp: '',
  status: 'sending',
};

export const CosmosWorkspace: React.FC = () => {
  const { context, setContextType, initialQuery, clearQueryParam } = useConversationContext();
  const {
    conversations,
    activeId,
    activeConversation,
    mode,
    isSending,
    error,
    selectConversation,
    createNewConversation,
    renameConversation,
    deleteConversation,
    updateMode,
    sendMessage,
    regenerateLastResponse,
  } = useCosmosConversation(context);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCaveats, setShowCaveats] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<AIAvailabilityStatus>('available');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    probeAIAvailability()
      .then((res) => setAvailabilityStatus(res.status))
      .catch(() => setAvailabilityStatus('unavailable'));
  }, []);

  // Auto-scroll when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversation?.messages, isSending]);

  // Handle URL query parameter 'q' if user navigated with a preset query
  useEffect(() => {
    if (initialQuery && initialQuery.trim().length > 0) {
      sendMessage(initialQuery, context);
      clearQueryParam();
    }
  }, [initialQuery, sendMessage, context, clearQueryParam]);

  const handleResetToGlobal = () => {
    setContextType('general');
  };

  const handleSelectSuggestedQuestion = (question: string) => {
    sendMessage(question, context);
  };

  const suggestedQuestions = getSuggestionsForContext(context.type);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#070B14] text-[#F4F7FF]">
      {/* Conversation Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={selectConversation}
        onNewConversation={() => createNewConversation(context)}
        onRenameConversation={renameConversation}
        onDeleteConversation={deleteConversation}
        onTriggerPrompt={(prompt) => sendMessage(prompt, context)}
        isOpen={sidebarOpen}
      />

      {/* Main Workspace Stream */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#070B14]">
        {/* Top Header Bar */}
        <header className="p-3 sm:px-5 bg-[#0A1020] border-b border-[#1A2940] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg border border-[#24344D] bg-[#101A2B] hover:bg-[#131F33] text-[#B5C2D6] hover:text-[#F4F7FF] transition-colors cursor-pointer"
              title="Toggle conversation sidebar"
              aria-label="Toggle conversation sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#45D5F2]" />
                <h1 className="font-[family-name:var(--font-display)] text-sm font-semibold tracking-tight text-[#F4F7FF]">
                  COSMOS AI <span className="text-[#45D5F2] font-mono text-xs font-normal">v2.0</span>
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[#131F33] text-[#45D5F2] text-[10px] font-medium border border-[#24344D]">
                  Investigation Assistant
                </span>
              </div>
              <p className="text-[11px] text-[#8293AD] hidden md:block">
                Context-aware scientific assistant for SPHEREx DR1 multi-epoch workflows
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <ExplanationModeSelector currentMode={mode} onModeChange={updateMode} />
            <AIAvailabilityIndicator status={availabilityStatus} />
          </div>
        </header>

        {/* Active Context Banner */}
        <div className="px-4 sm:px-5 pt-3 pb-1 shrink-0">
          <ActiveContextPanel
            context={context}
            onResetToGlobal={handleResetToGlobal}
          />
        </div>

        {/* Toolbar Toggles */}
        <div className="px-4 sm:px-5 py-2 flex items-center justify-between text-[11px] text-[#8293AD] border-b border-[#1A2940] shrink-0">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowCaveats(!showCaveats)}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                showCaveats
                  ? 'border-amber-500/40 bg-amber-500/12 text-amber-200'
                  : 'border-transparent hover:bg-[#101A2B] text-[#8293AD]'
              }`}
            >
              <Shield className="w-3 h-3 text-amber-400" />
              <span>Integrity Guardrails</span>
            </button>
          </div>

          <div className="text-[11px] text-[#8293AD] hidden sm:block">
            <span className="font-mono text-[#B5C2D6]">{activeConversation?.messages.length || 0}</span> message{activeConversation?.messages.length !== 1 ? 's' : ''} in thread
          </div>
        </div>

        {/* Collapsible Caveats Panel */}
        {showCaveats && (
          <div className="px-4 sm:px-5 py-2 shrink-0">
            <ScientificCaveatPanel />
          </div>
        )}

        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-4">
          {(!activeConversation || activeConversation.messages.length === 0) ? (
            <div className="max-w-2xl mx-auto py-8 text-center space-y-4">
              <div className="inline-flex p-3.5 rounded-2xl bg-[#101A2B] border border-[#24344D] text-[#45D5F2]">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#F4F7FF]">
                Astronomical Investigation Assistant Ready
              </h2>
              <p className="text-xs text-[#B5C2D6] leading-relaxed max-w-lg mx-auto">
                Ask questions about celestial coordinates, temporal image subtractions, photometric flux residuals, or SED characteristics.
              </p>

              {/* Suggested Questions */}
              <div className="pt-4 text-left">
                <div className="flex items-center space-x-1.5 text-xs text-[#B5C2D6] mb-2.5 font-medium">
                  <HelpCircle className="w-3.5 h-3.5 text-[#45D5F2]" />
                  <span>Suggested Inquiries for this Context</span>
                </div>
                <SuggestedQuestions
                  questions={suggestedQuestions}
                  onSelectQuestion={handleSelectSuggestedQuestion}
                  disabled={isSending}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
              {activeConversation.messages.map((msg, index) => {
                const isLastAssistant =
                  msg.sender === 'assistant' &&
                  index === activeConversation.messages.length - 1;

                return (
                  <ChatMessage
                    key={msg.id || index}
                    message={msg}
                    onRetry={
                      msg.status === 'error'
                        ? () => regenerateLastResponse()
                        : undefined
                    }
                    onRegenerate={
                      isLastAssistant ? () => regenerateLastResponse() : undefined
                    }
                  />
                );
              })}

              {isSending && <ChatMessage message={PENDING_MESSAGE} />}

              {error && (
                <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-xl text-rose-300 text-xs font-mono">
                  Error: {error}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Composer Footer */}
        <footer className="p-3 sm:px-5 bg-[#0A1020] border-t border-[#1A2940] shrink-0">
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Quick Action Chips Row */}
            <div className="flex items-center space-x-1.5 overflow-x-auto py-0.5 text-[11px] scrollbar-thin">
              <span className="text-[#8293AD] text-[10px] uppercase font-mono tracking-wider shrink-0 mr-1 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-[#45D5F2]" />
                <span className="hidden sm:inline">Quick Inquiries:</span>
              </span>
              {[
                { label: 'Explain Observation', prompt: 'Explain the observational properties, wavelength coverage, and detector characteristics of this observation.' },
                { label: 'Compare Epochs', prompt: 'Compare the selected temporal epochs and evaluate whether the detected change is consistent with a point-source transient.' },
                { label: 'Explain Compatibility', prompt: 'Explain the scientific compatibility between these epochs, detailing passband overlap, PSF ratio, and difference imaging validity.' },
                { label: 'Summarise Evidence', prompt: 'Provide a complete 7-part scientific evidence breakdown of all photometric, astrometric, and contextual evidence available.' },
                { label: 'Review Quality Flags', prompt: 'Review all detector and calibration quality flags associated with this candidate and identify potential instrumental caveats.' },
                { label: 'Missing Metadata', prompt: 'What critical observational metadata, follow-up spectroscopy, or archival observations are currently missing to verify this source?' },
                { label: 'Possible Hypotheses', prompt: 'Evaluate the 6 qualitative explanation categories (astrophysical, instrumental, calibration, background, astrometric, insufficient evidence).' },
                { label: 'Report Narrative', prompt: 'Synthesize a formal scientific report narrative suitable for inclusion in an astronomical investigation dossier.' },
              ].map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isSending}
                  onClick={() => sendMessage(chip.prompt, context)}
                  className="shrink-0 px-2.5 py-1 rounded-full bg-[#101A2B] hover:bg-[#1a2942] border border-[#24344D] hover:border-[#45D5F2]/50 text-[#B5C2D6] hover:text-[#F4F7FF] transition-all cursor-pointer text-[11px]"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <ChatComposer
              onSendMessage={(text) => sendMessage(text, context)}
              isLoading={isSending}
              explanationMode={mode}
            />
          </div>
        </footer>
      </main>
    </div>
  );
};
