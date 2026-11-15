import { Layers } from 'lucide-react';

interface ObservationReferencesProps {
  earlierObsId?: string | null;
  laterObsId?: string | null;
  earlierDate?: string | null;
  laterDate?: string | null;
  wavelengthUm?: number | null;
  className?: string;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return 'Not available';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  } catch {
    return iso;
  }
}

export function ObservationReferences({
  earlierObsId,
  laterObsId,
  earlierDate,
  laterDate,
  wavelengthUm,
  className,
}: ObservationReferencesProps) {
  if (!earlierObsId && !laterObsId) {
    return (
      <div className={`rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-xs text-slate-400 ${className ?? ''}`}>
        No explicit observation pass references attached to this case.
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className ?? ''}`}>
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4 text-blue-400" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
          Associated Observation Passes
        </h4>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {earlierObsId && (
          <div className="rounded-xl border border-sky-500/30 bg-sky-950/15 p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between border-b border-sky-500/20 pb-1.5">
              <span className="rounded bg-sky-950 px-2 py-0.5 text-[10px] font-bold text-sky-300 uppercase tracking-wider border border-sky-500/30">
                T0 Reference Pass
              </span>
              <span className="font-mono text-slate-300 text-[11px]">{earlierObsId}</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-1">
              <span>Date:</span>
              <span className="font-mono text-slate-200">{formatDate(earlierDate)}</span>
            </div>
            {wavelengthUm && (
              <div className="flex justify-between text-slate-400">
                <span>Passband:</span>
                <span className="font-mono text-sky-300 font-bold">{wavelengthUm} μm</span>
              </div>
            )}
          </div>
        )}

        {laterObsId && (
          <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/15 p-3.5 space-y-1.5 text-xs">
            <div className="flex items-center justify-between border-b border-indigo-500/20 pb-1.5">
              <span className="rounded bg-indigo-950 px-2 py-0.5 text-[10px] font-bold text-indigo-300 uppercase tracking-wider border border-indigo-500/30">
                T1 Follow-up Pass
              </span>
              <span className="font-mono text-slate-300 text-[11px]">{laterObsId}</span>
            </div>
            <div className="flex justify-between text-slate-400 pt-1">
              <span>Date:</span>
              <span className="font-mono text-slate-200">{formatDate(laterDate)}</span>
            </div>
            {wavelengthUm && (
              <div className="flex justify-between text-slate-400">
                <span>Passband:</span>
                <span className="font-mono text-indigo-300 font-bold">{wavelengthUm} μm</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
