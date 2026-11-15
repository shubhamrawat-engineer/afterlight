import { Link } from 'react-router-dom';
import { AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react';

interface ObjectErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ObjectErrorState({
  message = 'Failed to load celestial object profile from astronomical records.',
  onRetry,
}: ObjectErrorStateProps) {
  return (
    <div
      className="rounded-xl border p-12 text-center flex flex-col items-center justify-center my-8"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border-primary)',
      }}
    >
      <div className="w-12 h-12 rounded-full bg-rose-950/40 border border-rose-800/50 flex items-center justify-center mb-4 text-rose-400">
        <AlertCircle className="w-6 h-6" />
      </div>

      <h3 className="text-base font-semibold text-white">
        Object Telemetry Ingestion Failed
      </h3>

      <p className="text-xs text-rose-300/80 max-w-md mt-1.5 leading-relaxed font-mono">
        {message}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry Query</span>
          </button>
        )}
        <Link
          to="/objects"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Object Directory</span>
        </Link>
      </div>
    </div>
  );
}
