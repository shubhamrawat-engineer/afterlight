import { Bot, Loader2 } from 'lucide-react';

export function ChatLoadingState() {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/30 text-blue-400">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex items-center gap-2 text-xs font-mono">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-400" />
        <span>Evaluating SPHEREx mission telemetry and observation matrices...</span>
      </div>
    </div>
  );
}
