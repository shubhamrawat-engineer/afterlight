import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SpectralErrorStateProps {
  message?: string;
  targetId?: string;
  onRetry?: () => void;
}

export function SpectralErrorState({
  message,
  targetId,
  onRetry,
}: SpectralErrorStateProps) {
  return (
    <div className="mx-auto min-h-[50vh] max-w-2xl px-4 py-16 text-center">
      <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-8 shadow-xl">
        <ShieldAlert className="mx-auto h-12 w-12 text-rose-400" />
        <h2 className="mt-4 text-xl font-bold text-white">Spectral Data Unavailable</h2>
        <p className="mt-2 text-sm text-slate-300">
          {message ?? `Spectral measurements for "${targetId}" could not be retrieved from the scientific archive.`}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Retry Retrieval
            </button>
          )}
          <Link
            to={targetId ? `/explore/${targetId}` : '/explore'}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{targetId ? `Return to Target Detail` : 'Return to Universe Explorer'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
