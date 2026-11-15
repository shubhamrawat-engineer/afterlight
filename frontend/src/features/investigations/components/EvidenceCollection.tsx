import { FileText, Image, Activity, Bookmark } from 'lucide-react';
import type { InvestigationEvidenceItem, EvidenceItemType } from '../types/investigation.types';

interface EvidenceCollectionProps {
  evidenceItems: InvestigationEvidenceItem[];
  className?: string;
}

function getEvidenceTypeBadge(type: EvidenceItemType) {
  switch (type) {
    case 'difference_asset':
      return {
        icon: Image,
        label: 'DIFFERENCE MAP',
        className: 'bg-indigo-950 text-indigo-300 border-indigo-500/40',
      };
    case 'candidate_measurement':
      return {
        icon: Activity,
        label: 'MEASUREMENT RECORD',
        className: 'bg-emerald-950 text-emerald-300 border-emerald-500/40',
      };
    case 'observation_reference':
      return {
        icon: Bookmark,
        label: 'OBSERVATION PASS',
        className: 'bg-sky-950 text-sky-300 border-sky-500/40',
      };
    case 'user_annotation':
    default:
      return {
        icon: FileText,
        label: 'RESEARCH ANNOTATION',
        className: 'bg-slate-900 text-slate-300 border-slate-700',
      };
  }
}

export function EvidenceCollection({ evidenceItems, className }: EvidenceCollectionProps) {
  return (
    <div className={`space-y-3 ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-100">
            Attached Evidence Collection ({evidenceItems.length})
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-400">Archival Evidence Records</span>
      </div>

      {evidenceItems.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-center text-xs text-slate-400">
          No explicit evidence attachments registered in this dossier yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {evidenceItems.map((item) => {
            const badge = getEvidenceTypeBadge(item.type);
            const Icon = badge.icon;
            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${badge.className}`}>
                      <Icon className="h-3 w-3" />
                      <span>{badge.label}</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">{item.id}</span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-100">{item.title}</h5>
                  <p className="text-[11px] text-slate-300 leading-relaxed mt-1">
                    {item.description}
                  </p>
                </div>

                <div className="text-[10px] font-mono text-slate-400 border-t border-slate-900 pt-2 truncate">
                  Ref: <span className="text-slate-300">{item.source_reference}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
