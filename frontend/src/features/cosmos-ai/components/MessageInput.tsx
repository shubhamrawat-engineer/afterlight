import { useState, useRef } from 'react';
import type { KeyboardEvent, FormEvent } from 'react';
import { Send, CornerDownLeft, Loader2 } from 'lucide-react';
import { IconButton } from '../../../components/ui/IconButton';

interface MessageInputProps {
  onSubmit: (text: string) => void;
  isProcessing: boolean;
  disabled?: boolean;
  placeholder?: string;
  initialValue?: string;
  onClearInitialValue?: () => void;
  className?: string;
}

export function MessageInput({
  onSubmit,
  isProcessing,
  disabled = false,
  placeholder = 'Ask COSMOS AI about astronomical observations, wavelength profiles, or temporal measurements...',
  initialValue = '',
  onClearInitialValue,
  className,
}: MessageInputProps) {
  const [text, setText] = useState(initialValue);
  const [prevInitial, setPrevInitial] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (initialValue && initialValue !== prevInitial) {
    setPrevInitial(initialValue);
    setText(initialValue);
    onClearInitialValue?.();
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isProcessing || disabled) return;
    onSubmit(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative rounded-2xl border border-slate-800/80 bg-[#0b101d]/90 p-3 backdrop-blur-xl shadow-lg transition-all focus-within:border-blue-500/60 focus-within:ring-2 focus-within:ring-blue-500/20 ${className ?? ''}`}
    >
      <div className="flex items-end gap-2.5">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          disabled={disabled || isProcessing}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder={placeholder}
          aria-label="Ask COSMOS AI"
          className="flex-1 max-h-44 resize-none bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none disabled:opacity-50 font-sans"
        />

        <div className="flex items-center gap-2.5 pb-0.5 pr-0.5 shrink-0">
          <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-slate-500">
            <span>Enter</span>
            <CornerDownLeft className="w-3 h-3" />
          </span>

          <IconButton
            type="submit"
            variant="primary"
            size="sm"
            disabled={!text.trim() || isProcessing || disabled}
            aria-label="Send inquiry"
          >
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </IconButton>
        </div>
      </div>
    </form>
  );
}
