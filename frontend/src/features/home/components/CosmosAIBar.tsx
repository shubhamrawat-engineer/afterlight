import { useState, useRef } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Bot } from 'lucide-react';
import { COSMOS_AI_SUGGESTIONS } from '../data/homeFeatures';
import { Input } from '../../../components/ui/Input';
import { IconButton } from '../../../components/ui/IconButton';

interface CosmosAIBarProps {
  className?: string;
}

/**
 * Cosmos AI Interactive Search Bar for AFTERLIGHT homepage.
 * Uses the standardized Input & IconButton design system to ensure
 * proper padding, icon clearance, and visual alignment.
 */
export function CosmosAIBar({ className }: CosmosAIBarProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    navigate(`/ai?q=${encodeURIComponent(trimmed)}`);
  };

  const handleSuggestionClick = (suggestionText: string) => {
    navigate(`/ai?q=${encodeURIComponent(suggestionText)}`);
  };

  return (
    <section
      aria-label="Cosmos AI Assistant Query"
      className={`rounded-xl border border-[#24344D] bg-[#101A2B] p-6 sm:p-7 shadow-[0_6px_24px_rgba(3,6,14,0.42)] ${className ?? ''}`}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Branding & Intro */}
        <div className="flex items-center gap-3.5 lg:min-w-[230px]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#4388FF]/35 bg-[#131F33] text-[#45D5F2] shadow-sm">
            <Bot className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-[family-name:var(--font-display)] text-[16px] font-semibold tracking-wide text-[#F4F7FF]">
                Cosmos AI
              </h2>
              <Sparkles className="h-3.5 w-3.5 text-[#45D5F2]" aria-hidden="true" />
            </div>
            <p className="text-[13px] text-[#B5C2D6]">
              Contextual investigation assistant.
            </p>
          </div>
        </div>

        {/* Center: Standardized Search Input Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 lg:max-w-xl"
          role="search"
        >
          <Input
            ref={inputRef}
            type="text"
            inputSize="lg"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about candidate targets, compatibility thresholds, or workflow steps..."
            aria-label="Ask anything about the universe"
            rightElement={
              <IconButton
                type="submit"
                size="sm"
                variant="active"
                disabled={!query.trim()}
                aria-label="Submit astronomical inquiry"
              >
                <ArrowRight className="h-4 w-4" />
              </IconButton>
            }
          />
        </form>

        {/* Right: Suggested Prompts */}
        <div className="flex flex-wrap items-center gap-2 lg:max-w-md lg:justify-end">
          <span className="mr-1 text-[11px] font-medium tracking-wider text-[#8293AD] uppercase">
            Suggested:
          </span>
          {COSMOS_AI_SUGGESTIONS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSuggestionClick(item.text)}
              className="inline-flex h-8 items-center rounded-lg border border-[#24344D] bg-[#131F33] px-3 text-xs font-medium text-[#B5C2D6] transition-colors duration-200 hover:border-[#4388FF]/50 hover:bg-[#192842] hover:text-[#F4F7FF] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#45D5F2] cursor-pointer"
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
