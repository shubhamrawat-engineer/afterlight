import React, { useState, useRef, useEffect } from 'react';
import type { ExplanationMode } from '../types/explanation.types';
import { Send, CornerDownLeft } from 'lucide-react';

interface ChatComposerProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  explanationMode: ExplanationMode;
  placeholder?: string;
  className?: string;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  isLoading,
  explanationMode,
  placeholder,
  className = '',
}) => {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const defaultPlaceholder =
    explanationMode === 'researcher'
      ? 'Ask a scientific inquiry (e.g. "Assess the spectrophotometric flux consistency...")'
      : explanationMode === 'curious_explorer'
      ? 'Ask an astronomy question (e.g. "Why did this object brighten in infrared?")'
      : 'Ask a fun space question (e.g. "Did an alien star explode?")';

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || isLoading) return;

    onSendMessage(content.trim());
    setContent('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [content]);

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative bg-[#101A2B] border border-[#24344D] rounded-xl p-3 focus-within:border-[#4388FF] shadow-lg ${className}`}
    >
      <textarea
        ref={textareaRef}
        rows={2}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isLoading}
        placeholder={placeholder || defaultPlaceholder}
        className="w-full bg-transparent text-[#F4F7FF] placeholder-[#6F829E] text-xs sm:text-sm resize-none focus:outline-none leading-relaxed pr-24"
      />

      <div className="flex items-center justify-between pt-2 border-t border-[#1A2940] mt-1">
        <div className="flex items-center space-x-2 text-[11px] text-[#8293AD]">
          <span className="flex items-center space-x-1">
            <CornerDownLeft className="w-3 h-3" />
            <span>Enter to send</span>
          </span>
          <span className="text-[#324869]">•</span>
          <span>Shift+Enter for newline</span>
        </div>

        <button
          type="submit"
          disabled={!content.trim() || isLoading}
          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all ${
            content.trim() && !isLoading
              ? 'bg-[#4388FF] hover:bg-[#5A9BFF] text-[#F4F7FF] shadow-md cursor-pointer'
              : 'bg-[#131F33] text-[#64758F] border border-[#24344D] cursor-not-allowed'
          }`}
        >
          <span>{isLoading ? 'Reasoning...' : 'Ask COSMOS'}</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
};
