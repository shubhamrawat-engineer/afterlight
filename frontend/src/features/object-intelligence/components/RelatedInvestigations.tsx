import { Link } from 'react-router-dom';
import { FileText, ArrowUpRight, Plus, ShieldCheck, HelpCircle } from 'lucide-react';
import type { RelatedInvestigationRef } from '../types/object.types';

interface RelatedInvestigationsProps {
  investigations: RelatedInvestigationRef[];
  objectId: string;
  targetId?: string;
  targetTitle?: string;
  earlierObsId?: string | null;
  laterObsId?: string | null;
  differenceImage?: string | null;
}

export function RelatedInvestigations({
  investigations,
  objectId,
  targetId,
  targetTitle,
  earlierObsId,
  laterObsId,
  differenceImage,
}: RelatedInvestigationsProps) {
  const newInvestigationState = {
    targetId: targetId ?? 'spherex-deep-field-south',
    targetTitle: targetTitle ?? null,
    earlierObsId: earlierObsId ?? null,
    laterObsId: laterObsId ?? null,
    candidateId: objectId,
    differenceImage: differenceImage ?? null,
    initiatedFrom: 'object',
  };
  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUBMITTED':
      case 'REVIEWED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
            <ShieldCheck className="w-3 h-3" />
            {status}
          </span>
        );
      case 'DRAFT':
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-950/40 text-blue-400 border border-blue-800/40">
            <HelpCircle className="w-3 h-3" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div
      className="rounded-xl border p-5 transition-colors"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border-primary)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b" style={{ borderColor: 'var(--color-border-primary)' }}>
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-semibold tracking-wide text-white">
              Related Scientific Case Files
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded font-mono font-medium"
              style={{
                backgroundColor: 'rgba(52, 211, 153, 0.1)',
                color: '#34d399',
                border: '1px solid rgba(52, 211, 153, 0.25)',
              }}
            >
              {investigations.length} CASES
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Investigative dossiers and scientific cases referencing this celestial source
          </p>
        </div>

        <Link
          to="/investigations/new"
          state={newInvestigationState}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-300 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-800/40 transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Investigation</span>
        </Link>
      </div>

      {investigations.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-xs text-slate-400">
            No active investigation cases reference this object identifier.
          </p>
          <Link
            to="/investigations/new"
            state={newInvestigationState}
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Initiate First Case File</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {investigations.map((item) => (
            <Link
              key={item.case_id}
              to={`/investigations/${item.case_id}`}
              className="group p-4 rounded-lg border transition-all hover:border-slate-600 hover:bg-slate-800/30 flex flex-col justify-between"
              style={{
                backgroundColor: 'var(--color-bg-primary)',
                borderColor: 'var(--color-border-primary)',
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs text-cyan-400 font-semibold">
                    {item.case_id}
                  </span>
                  {getStatusBadge(item.status)}
                </div>
                <h4 className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {item.title}
                </h4>
              </div>

              <div className="mt-3 pt-2.5 border-t flex items-center justify-between text-xs" style={{ borderColor: 'var(--color-border-secondary)' }}>
                <span className="text-[11px] text-slate-400">
                  Confidence: <span className="text-slate-200 font-medium">{item.confidence}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] text-blue-400 group-hover:translate-x-0.5 transition-transform">
                  View Case
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
