import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ExplorerErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/**
 * Error state with retry action for the Universe Explorer.
 */
export function ExplorerErrorState({ message, onRetry }: ExplorerErrorStateProps) {
  return (
    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-950/20 p-8 text-center backdrop-blur-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-400">
        <AlertTriangle className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-rose-200">
        Astronomical Archive Error
      </h3>

      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-300">
        {message}
      </p>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
}
