import { Trash2, ShieldAlert } from 'lucide-react';

interface ConversationControlsProps {
  onClearHistory: () => void;
  messageCount: number;
  isPersistent: boolean;
  className?: string;
}

export function ConversationControls({
  onClearHistory,
  messageCount,
  isPersistent,
  className,
}: ConversationControlsProps) {
  if (messageCount === 0) return null;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 px-4 py-2 rounded-xl border border-slate-800/80 bg-slate-950/60 text-xs font-mono backdrop-blur-md ${className ?? ''}`}
    >
      <div className="flex items-center gap-2 text-slate-400">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
        <span>
          {isPersistent
            ? 'Authenticated Session Synced'
            : 'Session-only State: Messages are not persisted to database.'}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-slate-500 text-[11px]">
          {messageCount} {messageCount === 1 ? 'Message' : 'Messages'}
        </span>

        <button
          type="button"
          onClick={onClearHistory}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3 h-3" />
          <span>Clear Chat</span>
        </button>
      </div>
    </div>
  );
}
