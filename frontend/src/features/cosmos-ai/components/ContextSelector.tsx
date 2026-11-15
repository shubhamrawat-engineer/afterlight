import { Globe, Compass, Eye, Activity, FileText, Orbit, ShieldCheck } from 'lucide-react';
import type { AIContextReference, AIContextType } from '../types/cosmos-ai.types';

interface ContextSelectorProps {
  currentContext: AIContextReference;
  boundContext?: AIContextReference | null;
  onSelectContextType: (type: AIContextType) => void;
  hasContextualData: boolean;
  className?: string;
}

export function ContextSelector({
  currentContext,
  boundContext,
  onSelectContextType,
  hasContextualData,
  className,
}: ContextSelectorProps) {
  const contextualTarget = boundContext && boundContext.type !== 'general' ? boundContext : currentContext;
  return (
    <div
      className={`rounded-xl border p-4 space-y-3 transition-colors ${className ?? ''}`}
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border-primary)',
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
          Context Boundary
        </span>
        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>Zero Full-DB Transmission</span>
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* General Astronomy */}
        <button
          type="button"
          onClick={() => onSelectContextType('general')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all cursor-pointer ${
            currentContext.type === 'general'
              ? 'bg-blue-600 text-white shadow-sm border border-blue-500'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          <span>General Astronomy</span>
        </button>

        {/* Dynamic Context Button if available */}
        {hasContextualData && (
          <button
            type="button"
            onClick={() => onSelectContextType(contextualTarget.type)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition-all cursor-pointer ${
              currentContext.type !== 'general'
                ? 'bg-cyan-600 text-white shadow-sm border border-cyan-500'
                : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {contextualTarget.type === 'target' && <Compass className="w-3.5 h-3.5" />}
            {contextualTarget.type === 'temporal' && <Eye className="w-3.5 h-3.5" />}
            {contextualTarget.type === 'spectral' && <Activity className="w-3.5 h-3.5" />}
            {contextualTarget.type === 'investigation' && <FileText className="w-3.5 h-3.5" />}
            {contextualTarget.type === 'object' && <Orbit className="w-3.5 h-3.5" />}
            <span>{contextualTarget.summaryLabel}</span>
          </button>
        )}
      </div>

      <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
        {currentContext.type === 'general' ? (
          <p>
            General research mode: inquiries are interpreted without attaching specific astronomical observation identifiers.
          </p>
        ) : (
          <p className="text-cyan-300/90">
            Authoritative context bound to <span className="font-semibold text-white">{currentContext.summaryLabel}</span>. Only validated resource IDs are transmitted.
          </p>
        )}
      </div>
    </div>
  );
}
