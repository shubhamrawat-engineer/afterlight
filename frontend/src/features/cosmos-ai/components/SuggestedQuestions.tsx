import { Sparkles, ArrowRight } from 'lucide-react';
import type { SuggestedQuestion } from '../types/cosmos-ai.types';

interface SuggestedQuestionsProps {
  questions: SuggestedQuestion[];
  onSelectQuestion: (question: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SuggestedQuestions({
  questions,
  onSelectQuestion,
  disabled = false,
  className,
}: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div
      className={`rounded-xl border p-4 space-y-3 transition-colors ${className ?? ''}`}
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border-primary)',
      }}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
          Suggested Inquiries
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {questions.map((item) => (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelectQuestion(item.question)}
            className="group flex items-start justify-between gap-2 p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 text-left text-xs text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-850 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="leading-snug">{item.question}</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}
