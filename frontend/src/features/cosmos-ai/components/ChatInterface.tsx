import { useRef, useEffect } from 'react';
import type { ChatMessage as ChatMessageType } from '../types/cosmos-ai.types';
import { ChatMessage } from './ChatMessage';
import { MessageInput } from './MessageInput';
import { ConversationControls } from './ConversationControls';

interface ChatInterfaceProps {
  messages: ChatMessageType[];
  isProcessing: boolean;
  onSubmit: (prompt: string) => void;
  onClearHistory: () => void;
  onRetryMessage?: () => void;
  initialQuery?: string;
  onClearInitialQuery?: () => void;
  isPersistent: boolean;
  className?: string;
}

export function ChatInterface({
  messages,
  isProcessing,
  onSubmit,
  onClearHistory,
  onRetryMessage,
  initialQuery,
  onClearInitialQuery,
  isPersistent,
  className,
}: ChatInterfaceProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  return (
    <div className={`flex flex-col h-full rounded-2xl border border-slate-800 bg-[rgba(10,14,26,0.85)] backdrop-blur-xl shadow-xl overflow-hidden ${className ?? ''}`}>
      {/* Session Controls bar */}
      <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
        <ConversationControls
          onClearHistory={onClearHistory}
          messageCount={messages.length}
          isPersistent={isPersistent}
        />
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-[380px] max-h-[580px]">
        {messages.map((msg) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onRetry={onRetryMessage}
          />
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Fixed Bottom Input Area */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <MessageInput
          onSubmit={onSubmit}
          isProcessing={isProcessing}
          initialValue={initialQuery}
          onClearInitialValue={onClearInitialQuery}
        />
      </div>
    </div>
  );
}
