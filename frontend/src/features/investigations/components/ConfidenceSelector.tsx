import { ShieldAlert, ShieldCheck, Shield } from 'lucide-react';
import type { InvestigationConfidence } from '../types/investigation.types';

interface ConfidenceSelectorProps {
  value: InvestigationConfidence;
  onChange: (val: InvestigationConfidence) => void;
  className?: string;
}

const OPTIONS: Array<{
  id: InvestigationConfidence;
  title: string;
  description: string;
  icon: typeof ShieldCheck;
  borderClass: string;
  selectedBg: string;
  textColor: string;
}> = [
  {
    id: 'HIGH',
    title: 'High Confidence',
    description: 'High SNR detection (>5σ), clear PSF profile match, confirmed stationary or moving vector.',
    icon: ShieldCheck,
    borderClass: 'border-emerald-500/40',
    selectedBg: 'bg-emerald-950/40 border-emerald-500',
    textColor: 'text-emerald-300',
  },
  {
    id: 'MEDIUM',
    title: 'Medium Confidence',
    description: 'Moderate SNR (3–5σ), potential background continuum noise or slight PSF residuals.',
    icon: Shield,
    borderClass: 'border-amber-500/40',
    selectedBg: 'bg-amber-950/40 border-amber-500',
    textColor: 'text-amber-300',
  },
  {
    id: 'LOW',
    title: 'Low Confidence / Tentative',
    description: 'Near detection threshold (2–3σ) or high probability of detector/registration residual.',
    icon: ShieldAlert,
    borderClass: 'border-slate-700',
    selectedBg: 'bg-slate-900 border-slate-500',
    textColor: 'text-slate-300',
  },
];

export function ConfidenceSelector({
  value,
  onChange,
  className,
}: ConfidenceSelectorProps) {
  return (
    <div className={`space-y-3 ${className ?? ''}`}>
      <div>
        <label className="text-xs font-bold text-slate-200 block">
          Investigator Confidence Assessment
        </label>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Subjective assessment of candidate reality. Does not substitute for statistical significance.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {OPTIONS.map((opt) => {
          const isSelected = value === opt.id;
          const Icon = opt.icon;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onChange(opt.id)}
              className={`flex flex-col items-start gap-1.5 rounded-xl border p-3.5 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                isSelected
                  ? `${opt.selectedBg} shadow-md`
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${opt.textColor}`} />
                <span className={`text-xs font-bold ${opt.textColor}`}>{opt.title}</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">{opt.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
