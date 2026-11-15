import { Layers, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ViewerEmptyStateProps {
  targetId: string;
}

export function ViewerEmptyState({ targetId }: ViewerEmptyStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 p-8 text-center backdrop-blur-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-slate-400">
        <Layers className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-base font-semibold text-slate-200">
        No Temporal Comparison Observations
      </h3>

      <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-400">
        This target region does not currently have two verified multi-epoch observation passes registered in the SPHEREx pipeline.
      </p>

      <Link
        to={`/observations/${targetId}`}
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-500"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Return to Observation Catalogue</span>
      </Link>
    </div>
  );
}
