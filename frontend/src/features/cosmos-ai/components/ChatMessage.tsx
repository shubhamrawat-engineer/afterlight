import { useState } from 'react';
import { Bot, User, Copy, Check, RotateCcw, AlertCircle, Sparkles, AlertTriangle } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '../types/cosmos-ai.types';
import { ResponseSection } from './ResponseSection';
import { ContextBadge } from './ContextBadge';
import { ScientificMarkdown } from './ScientificMarkdown';
import { EvidenceExplanationCard } from './EvidenceExplanationCard';
import { PossibleExplanationsPanel } from './PossibleExplanationsPanel';

interface ChatMessageProps {
  message: ChatMessageType;
  onRetry?: () => void;
  onRegenerate?: () => void;
}

export function ChatMessage({ message, onRetry, onRegenerate }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.sender === 'user';
  const isSending = message.status === 'sending';
  const isError = message.status === 'error';

  const handleCopy = () => {
    const textToCopy = message.content || message.structured?.directAnswer || '';
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className={`flex gap-3 sm:gap-4 transition-all ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Assistant Avatar */}
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#4388FF] to-[#45D5F2] text-[#F4F7FF] shadow-md">
          <Bot className="h-5 w-5" />
        </div>
      )}

      {/* Message Bubble Container */}
      <div
        className={`transition-colors space-y-3 ${
          isUser
            ? 'max-w-[85%] sm:max-w-[75%] bg-gradient-to-r from-blue-600 to-indigo-600 text-[#F4F7FF] shadow-md rounded-2xl rounded-tr-sm px-4 py-3'
            : isError
              ? 'max-w-[95%] bg-[#0c1424] border border-rose-500/40 text-[#F4F7FF] shadow-lg rounded-2xl p-5'
              : 'max-w-[95%] bg-[#0c1424] border border-[#1e2d47] text-[#F4F7FF] shadow-xl rounded-2xl p-5'
        }`}
      >
        {/* Top badges bar for assistant */}
        {!isUser && (
          <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 border-b border-[#1A2940] text-[10px]">
            <div className="flex items-center space-x-2">
              <span className="text-[#45D5F2] font-semibold flex items-center space-x-1">
                <Sparkles className="w-3 h-3" />
                <span>COSMOS AI</span>
              </span>
              {message.explanationMode && (
                <span className="px-2 py-0.5 rounded-md bg-[#131F33] border border-[#24344D] text-[#B5C2D6] uppercase">
                  {message.explanationMode.replace('_', ' ')}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1.5">
              <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-emerald-500/12 text-emerald-300 border border-emerald-500/30 uppercase font-medium">
                <Check className="w-2.5 h-2.5" />
                <span>SPHEREx DR1 Verified</span>
              </span>
            </div>
          </div>
        )}

        {/* Context metadata if attached to user message */}
        {message.context && message.context.type !== 'general' && (
          <div className="pb-1">
            <ContextBadge context={message.context} />
          </div>
        )}

        {/* Message Content */}
        {isSending ? (
          <div className="flex items-center gap-2.5 py-1 text-slate-400 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span>Consulting astronomical knowledge & evidence models...</span>
          </div>
        ) : isError ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Inference Gateway Notice</span>
            </div>
            <p className="text-xs text-rose-200/90 font-mono leading-relaxed">
              {message.errorMessage || message.content}
            </p>
            {message.structured && <ResponseSection structured={message.structured} />}
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-mono border border-rose-800/40 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retry Transmission</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Main content formatted with scientific markdown */}
            <ScientificMarkdown
              content={
                (message.content && message.content.trim().length > 0)
                  ? message.content
                  : message.structured?.directAnswer || (message.structured as any)?.text || ''
              }
            />

            {/* Embedded 7-part Evidence Explainer if present */}
            {message.evidenceExplanation && (
              <div className="pt-2">
                <EvidenceExplanationCard evidence={message.evidenceExplanation} />
              </div>
            )}

            {/* Embedded 6-category Possible Explanations if present */}
            {message.possibleExplanations && message.possibleExplanations.length > 0 && (
              <div className="pt-2">
                <PossibleExplanationsPanel explanations={message.possibleExplanations} />
              </div>
            )}

            {/* Structured response details if present and not already full formatted */}
            {message.structured && !message.evidenceExplanation && (
              <ResponseSection structured={message.structured} />
            )}
          </div>
        )}

        {/* Message Footer: Timestamp, Copy, Regenerate */}
        <div
          className={`flex items-center justify-between gap-4 pt-2 text-[10px] font-mono border-t ${
            isUser
              ? 'border-sky-500/40 text-sky-200'
              : 'border-slate-800 text-slate-500'
          }`}
        >
          <span>{formattedTime}</span>

          <div className="flex items-center space-x-3">
            {!isSending && !isError && onRegenerate && !isUser && (
              <button
                type="button"
                onClick={onRegenerate}
                className="inline-flex items-center gap-1 hover:text-sky-300 transition-colors cursor-pointer"
                title="Regenerate reasoning response"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Regenerate</span>
              </button>
            )}

            {!isSending && !isError && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1 hover:text-slate-300 transition-colors cursor-pointer"
                title="Copy response to clipboard"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-800 border border-slate-700 text-slate-300 shadow-sm">
          <User className="h-5 w-5" />
        </div>
      )}
    </div>
  );
}
