import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ChatErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ChatErrorState({ message, onRetry }: ChatErrorStateProps) {
  return (
    <div className="p-4 rounded-xl border border-rose-900/40 bg-rose-950/20 text-rose-200 text-xs space-y-2 font-mono">
      <div className="flex items-center gap-2 font-bold text-rose-400">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <span>Inference Transmission Blocked</span>
      </div>
      <p className="text-slate-300 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Retry Last Request</span>
        </button>
      )}
    </div>
  );
}
