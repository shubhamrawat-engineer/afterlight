import { Link } from 'react-router-dom';
import { Clock, Layers, ArrowUpRight, Radio, Eye } from 'lucide-react';
import type { ObjectObservationEntry } from '../types/object.types';

interface ObservationHistoryProps {
  observations: ObjectObservationEntry[];
  targetId: string;
}

export function ObservationHistory({ observations, targetId }: ObservationHistoryProps) {
  return (
    <div
      className="rounded-xl border p-5 transition-colors"
      style={{
        backgroundColor: 'var(--color-bg-secondary)',
        borderColor: 'var(--color-border-primary)',
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b" style={{ borderColor: 'var(--color-border-primary)' }}>
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-base font-semibold tracking-wide text-white">
              Observation History
            </h3>
            <span
              className="text-xs px-2 py-0.5 rounded font-mono font-medium"
              style={{
                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                color: '#38bdf8',
                border: '1px solid rgba(56, 189, 248, 0.25)',
              }}
            >
              {observations.length} {observations.length === 1 ? 'EPOCH' : 'EPOCHS'}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Chronological multi-epoch SPHEREx spectral-photometric survey observations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to={`/temporal-analysis/${targetId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-white bg-blue-600 hover:bg-blue-500 shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Temporal Lab</span>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-70" />
          </Link>
          <Link
            to={`/observations/${targetId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border text-slate-300 hover:text-white hover:bg-slate-800"
            style={{ borderColor: 'var(--color-border-primary)' }}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Target Manifest</span>
          </Link>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr
              className="border-b uppercase tracking-wider font-mono text-[11px]"
              style={{
                borderColor: 'var(--color-border-primary)',
                color: 'var(--color-text-tertiary)',
              }}
            >
              <th className="py-2.5 px-3">Observation ID</th>
              <th className="py-2.5 px-3">Date (UTC)</th>
              <th className="py-2.5 px-3">Passband</th>
              <th className="py-2.5 px-3">Detector</th>
              <th className="py-2.5 px-3">Product Type</th>
              <th className="py-2.5 px-3">Release</th>
            </tr>
          </thead>
          <tbody className="divide-y font-mono" style={{ borderColor: 'var(--color-border-secondary)' }}>
            {observations.map((obs) => (
              <tr
                key={obs.observation_id}
                className="hover:bg-slate-800/30 transition-colors"
              >
                <td className="py-3 px-3 font-semibold text-white">
                  <div className="flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>{obs.observation_id}</span>
                  </div>
                </td>
                <td className="py-3 px-3 text-slate-300">
                  {obs.date_utc}
                </td>
                <td className="py-3 px-3">
                  <span className="inline-flex items-center gap-1 text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                    {obs.wavelength_um.toFixed(2)} μm
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-300">
                  {obs.detector}
                </td>
                <td className="py-3 px-3 text-slate-400">
                  {obs.product_type}
                </td>
                <td className="py-3 px-3 text-slate-400">
                  {obs.data_release}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
