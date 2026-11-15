import { Activity, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SpectralEmptyStateProps {
  targetId: string;
}

export function SpectralEmptyState({ targetId }: SpectralEmptyStateProps) {
  return (
    <div className="flex min-h-[380px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center backdrop-blur-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
        <Activity className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-200">
        No Spectral Products Cataloged
      </h3>

      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-400">
        No calibrated 0.75–5.0 μm spectrophotometric profiles are currently registered for target "{targetId}" in the SPHEREx L3 spectral archive.
      </p>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <Link
          to={`/explore/${targetId}`}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to Target Detail</span>
        </Link>

        <Link
          to="/explore"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          <span>Browse Other Targets</span>
        </Link>
      </div>
    </div>
  );
}
