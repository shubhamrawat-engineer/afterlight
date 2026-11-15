import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  AIAvailabilityStatus,
  AIContextReference,
  ChatMessage,
} from '../types/cosmos-ai.types';
import {
  probeAIAvailability,
  sendAIInquiry,
  createUnconfiguredNoticeMessage,
} from '../services/cosmos-ai-service';
import { useConversationHistory } from './useConversationHistory';
import { useConversationContext } from './useConversationContext';

export function useCosmosAI() {
  const { context, boundContext, setContextType, initialQuery, clearQueryParam, hasContextualData } =
    useConversationContext();

  const { messages, addMessage, updateMessage, clearHistory, isPersistent } =
    useConversationHistory();

  const [availabilityStatus, setAvailabilityStatus] =
    useState<AIAvailabilityStatus>('checking');
  const [availabilityDetails, setAvailabilityDetails] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  const initialNoticeAdded = useRef(false);

  // Check availability on mount
  useEffect(() => {
    let cancelled = false;

    probeAIAvailability()
      .then((res) => {
        if (!cancelled) {
          setAvailabilityStatus(res.status);
          if (res.error) {
            setAvailabilityDetails(res.error);
          }
          if (
            (res.status === 'not_configured' || res.status === 'unavailable') &&
            !initialNoticeAdded.current &&
            messages.length === 0
          ) {
            initialNoticeAdded.current = true;
            addMessage(createUnconfiguredNoticeMessage(res.status));
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAvailabilityStatus('unavailable');
          setAvailabilityDetails('Could not establish connection to the backend service.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [addMessage, messages.length]);

  const submitInquiry = useCallback(
    async (promptText: string, contextOverride?: AIContextReference) => {
      const trimmed = promptText.trim();
      if (!trimmed || isProcessing) return;

      setIsProcessing(true);
      setLastQuery(trimmed);

      const activeContext = contextOverride || context;
      const userMessageId = `user-${Date.now()}`;
      const assistantMessageId = `asst-${Date.now()}`;

      // 1. Add User Message
      const userMessage: ChatMessage = {
        id: userMessageId,
        sender: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
        status: 'complete',
        context: activeContext,
      };
      addMessage(userMessage);

      // 2. Add Pending Assistant Message
      const pendingAssistantMessage: ChatMessage = {
        id: assistantMessageId,
        sender: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        status: 'sending',
        context: activeContext,
      };
      addMessage(pendingAssistantMessage);

      try {
        // Send inquiry to backend endpoint
        const result = await sendAIInquiry({
          prompt: trimmed,
          context: activeContext,
        });

        // Update assistant message with verified response
        updateMessage(assistantMessageId, {
          content: result.content,
          structured: result.structured,
          status: 'complete',
          isDemonstrationResponse: result.isDemonstrationResponse,
          guardrailFlags: result.guardrailFlags,
        });
      } catch (err: unknown) {
        const errorText =
          err instanceof Error
            ? err.message
            : 'AI inference service unavailable. Please check backend configuration.';

        updateMessage(assistantMessageId, {
          content: `Inquiry could not be processed by backend inference gateway. ${errorText}`,
          status: 'error',
          errorMessage: errorText,
          structured: {
            directAnswer: 'Backend AI endpoint (/api/ai/query) is currently inactive.',
            limitations: [
              'No synthetic or mock responses are produced on the client side per strict astronomical accuracy standards.',
              'Awaiting FastAPI LLM provider gateway implementation.',
            ],
            sourceReferences: [
              {
                id: 'NAV-EXPLORE-FALLBACK',
                title: 'Return to Universe Explorer',
                type: 'catalogue',
                internalRoute: '/explore',
              },
            ],
          },
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [context, isProcessing, addMessage, updateMessage]
  );

  const retryLastInquiry = useCallback(() => {
    if (lastQuery) {
      submitInquiry(lastQuery);
    }
  }, [lastQuery, submitInquiry]);

  return {
    messages,
    availabilityStatus,
    availabilityDetails,
    isProcessing,
    context,
    boundContext,
    setContextType,
    hasContextualData,
    initialQuery,
    clearQueryParam,
    submitInquiry,
    retryLastInquiry,
    clearHistory,
    isPersistent,
  };
}
