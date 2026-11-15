import { Database, ExternalLink, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import type { CatalogueMatch } from '../types/object.types';

interface CatalogueMatchesProps {
  matches: CatalogueMatch[];
}

export function CatalogueMatches({ matches }: CatalogueMatchesProps) {
  const getQualityBadge = (quality: CatalogueMatch['match_quality']) => {
    switch (quality) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
            <CheckCircle2 className="w-3 h-3" />
            CONFIRMED
          </span>
        );
      case 'TENTATIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-950/40 text-amber-400 border border-amber-800/40">
            <AlertTriangle className="w-3 h-3" />
            TENTATIVE
          </span>
        );
      case 'NO_MATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
            <XCircle className="w-3 h-3" />
            NO MATCH
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
      <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--color-border-primary)' }}>
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-semibold tracking-wide text-white">
              Catalogue Cross-Matches
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded font-mono font-medium"
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                color: '#c084fc',
                border: '1px solid rgba(168, 85, 247, 0.25)',
              }}
            >
              {matches.length} ARCHIVES
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Astrometric cross-identifications against major external astronomical databases
          </p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse font-mono">
          <thead>
            <tr
              className="border-b uppercase tracking-wider text-[11px]"
              style={{
                borderColor: 'var(--color-border-primary)',
                color: 'var(--color-text-tertiary)',
              }}
            >
              <th className="py-2.5 px-3">Catalogue</th>
              <th className="py-2.5 px-3">Catalogue ID</th>
              <th className="py-2.5 px-3">Separation</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Reference</th>
            </tr>
          </thead>
          <tbody className="divide-y" style={{ borderColor: 'var(--color-border-secondary)' }}>
            {matches.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-3 font-semibold text-white">
                  {item.catalogue_name}
                </td>
                <td className="py-3 px-3 text-cyan-300">
                  {item.catalogue_id}
                </td>
                <td className="py-3 px-3 text-slate-300">
                  {item.angular_separation_arcsec.toFixed(3)}″
                </td>
                <td className="py-3 px-3">
                  {getQualityBadge(item.match_quality)}
                </td>
                <td className="py-3 px-3 text-right">
                  {item.reference_url ? (
                    <a
                      href={item.reference_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span>Query</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
