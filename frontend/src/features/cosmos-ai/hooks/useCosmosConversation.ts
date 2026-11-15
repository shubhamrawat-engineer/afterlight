import { useState, useCallback, useTransition } from 'react';
import type {
  ConversationRecord,
  ConversationSummary,
  ChatMessage,
  AIContextReference,
  ExplanationMode,
} from '../types/cosmos-ai.types';
import {
  listConversations,
  loadConversation,
  createConversationRecord,
  appendMessage,
  updateConversationRecord,
  deleteConversationRecord,
  renameConversationRecord,
  getActiveConversationId,
  setActiveConversationId,
} from '../services/cosmos-conversation-service';
import { sendAIInquiry } from '../services/cosmos-ai-service';

function getInitialConversations(initialContext?: AIContextReference): {
  list: ConversationSummary[];
  activeRecord: ConversationRecord | null;
  activeId: string;
} {
  let list = listConversations();
  let activeRecord: ConversationRecord | null = null;
  let activeId = '';

  if (list.length === 0) {
    const fresh = createConversationRecord(
      initialContext || { type: 'general' },
      'Initial Astronomical Investigation',
      'researcher'
    );
    list = listConversations();
    activeRecord = fresh;
    activeId = fresh.id;
  } else {
    const storedActiveId = getActiveConversationId();
    activeId = list.find((c) => c.id === storedActiveId)?.id || list[0]?.id || '';
    if (activeId) {
      activeRecord = loadConversation(activeId);
    }
  }

  return { list, activeRecord, activeId };
}

export function useCosmosConversation(initialContext?: AIContextReference) {
  const [, startTransition] = useTransition();
  const [initial] = useState(() => getInitialConversations(initialContext));
  const [conversations, setConversations] = useState<ConversationSummary[]>(initial.list);
  const [activeId, setActiveId] = useState<string>(initial.activeId);
  const [activeConversation, setActiveConv] = useState<ConversationRecord | null>(initial.activeRecord);
  const [mode, setMode] = useState<ExplanationMode>(initial.activeRecord?.explanationMode || 'researcher');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setActiveId(id);
    const rec = loadConversation(id);
    setActiveConv(rec);
    if (rec?.explanationMode) {
      setMode(rec.explanationMode);
    }
    setError(null);
  }, []);

  const createNewConversation = useCallback(
    (context?: AIContextReference, title?: string, initialMode?: ExplanationMode) => {
      const chosenMode = initialMode || mode;
      const ctx = context || activeConversation?.context || { type: 'general' };
      const defaultTitle = title || (ctx.summaryLabel ? `Investigation: ${ctx.summaryLabel}` : 'New Astronomical Inquiry');
      const fresh = createConversationRecord(ctx, defaultTitle, chosenMode);
      setActiveConversationId(fresh.id);
      setActiveId(fresh.id);
      setActiveConv(fresh);
      setConversations(listConversations());
      setError(null);
      return fresh;
    },
    [mode, activeConversation]
  );

  const renameConversation = useCallback(
    (id: string, newTitle: string) => {
      const updated = renameConversationRecord(id, newTitle);
      if (updated && updated.id === activeId) {
        setActiveConv(updated);
      }
      setConversations(listConversations());
    },
    [activeId]
  );

  const deleteConversation = useCallback(
    (id: string) => {
      deleteConversationRecord(id);
      const list = listConversations();
      setConversations(list);

      if (id === activeId) {
        const next = list[0];
        if (next) {
          selectConversation(next.id);
        } else {
          // If all deleted, create fresh empty one
          const fresh = createConversationRecord(
            initialContext || { type: 'general' },
            'New Astronomical Inquiry',
            'researcher'
          );
          setActiveId(fresh.id);
          setActiveConv(fresh);
          setConversations(listConversations());
        }
      }
    },
    [activeId, selectConversation, initialContext]
  );

  const updateMode = useCallback(
    (newMode: ExplanationMode) => {
      setMode(newMode);
      if (activeConversation) {
        const updated: ConversationRecord = {
          ...activeConversation,
          explanationMode: newMode,
        };
        updateConversationRecord(updated);
        setActiveConv(updated);
        setConversations(listConversations());
      }
    },
    [activeConversation]
  );

  const sendMessage = useCallback(
    async (promptText: string, contextOverride?: AIContextReference) => {
      if (!promptText.trim() || isSending) return;

      const currentConv = activeConversation || createNewConversation(contextOverride);
      const effectiveContext = contextOverride || currentConv.context || { type: 'general' };

      const userMessage: ChatMessage = {
        id: `user-msg-${Date.now()}`,
        sender: 'user',
        content: promptText.trim(),
        timestamp: new Date().toISOString(),
        status: 'complete',
        context: effectiveContext,
      };

      // Instantly append user message
      const withUser = appendMessage(currentConv.id, userMessage);
      if (withUser) {
        setActiveConv(withUser);
        setConversations(listConversations());
      }

      setIsSending(true);
      setError(null);

      try {
        const aiResult = await sendAIInquiry(
          {
            prompt: promptText.trim(),
            context: effectiveContext,
            conversationId: currentConv.id,
          },
          mode
        );

        const assistantMessage: ChatMessage = {
          id: `ai-msg-${Date.now()}`,
          sender: 'assistant',
          content: aiResult.content,
          timestamp: new Date().toISOString(),
          status: 'complete',
          structured: aiResult.structured,
          explanationMode: mode,
          evidenceExplanation: aiResult.evidenceExplanation,
          possibleExplanations: aiResult.possibleExplanations,
          guardrailFlags: aiResult.guardrailFlags,
          isDemonstrationResponse: aiResult.isDemonstrationResponse,
          context: effectiveContext,
        };

        startTransition(() => {
          const withAi = appendMessage(currentConv.id, assistantMessage);
          if (withAi) {
            setActiveConv(withAi);
            setConversations(listConversations());
          }
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to query COSMOS AI';
        setError(errorMsg);

        const errorMessage: ChatMessage = {
          id: `err-msg-${Date.now()}`,
          sender: 'assistant',
          content: `Unable to complete reasoning query: ${errorMsg}`,
          timestamp: new Date().toISOString(),
          status: 'error',
          errorMessage: errorMsg,
        };
        startTransition(() => {
          const withErr = appendMessage(currentConv.id, errorMessage);
          if (withErr) {
            setActiveConv(withErr);
          }
        });
      } finally {
        setIsSending(false);
      }
    },
    [activeConversation, isSending, createNewConversation, mode]
  );

  const regenerateLastResponse = useCallback(async () => {
    if (!activeConversation || isSending) return;
    const messages = activeConversation.messages;
    if (messages.length === 0) return;

    // Find the last user message
    let lastUserPrompt = '';
    let lastUserContext: AIContextReference | undefined = undefined;

    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].sender === 'user') {
        lastUserPrompt = messages[i].content;
        lastUserContext = messages[i].context;
        break;
      }
    }

    if (!lastUserPrompt) return;

    // Pop off any trailing assistant response
    const updatedMessages = [...messages];
    if (updatedMessages[updatedMessages.length - 1].sender === 'assistant') {
      updatedMessages.pop();
    }

    const trimmedConv: ConversationRecord = {
      ...activeConversation,
      messages: updatedMessages,
    };
    updateConversationRecord(trimmedConv);
    setActiveConv(trimmedConv);

    setIsSending(true);
    setError(null);

    try {
      const effectiveContext = lastUserContext || trimmedConv.context || { type: 'general' };
      const aiResult = await sendAIInquiry(
        {
          prompt: lastUserPrompt,
          context: effectiveContext,
          conversationId: trimmedConv.id,
        },
        mode
      );

      const assistantMessage: ChatMessage = {
        id: `ai-msg-regen-${Date.now()}`,
        sender: 'assistant',
        content: aiResult.content,
        timestamp: new Date().toISOString(),
        status: 'complete',
        structured: aiResult.structured,
        explanationMode: mode,
        evidenceExplanation: aiResult.evidenceExplanation,
        possibleExplanations: aiResult.possibleExplanations,
        guardrailFlags: aiResult.guardrailFlags,
        isDemonstrationResponse: aiResult.isDemonstrationResponse,
        context: effectiveContext,
      };

      startTransition(() => {
        const finalConv = appendMessage(trimmedConv.id, assistantMessage);
        if (finalConv) {
          setActiveConv(finalConv);
          setConversations(listConversations());
        }
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Regeneration failed';
      setError(errorMsg);
    } finally {
      setIsSending(false);
    }
  }, [activeConversation, isSending, mode]);

  return {
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
  };
}
