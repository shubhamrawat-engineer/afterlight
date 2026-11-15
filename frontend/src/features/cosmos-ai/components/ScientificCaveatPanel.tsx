import React from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle } from 'lucide-react';

interface ScientificCaveatPanelProps {
  className?: string;
}

export const ScientificCaveatPanel: React.FC<ScientificCaveatPanelProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`bg-slate-950/90 border border-amber-900/40 rounded-lg p-3 text-xs space-y-2 text-slate-300 ${className}`}
    >
      <div className="flex items-center space-x-2 text-amber-300 font-semibold">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
        <span>Scientific Integrity & AI Guardrails</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
        <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
          <div className="flex items-center space-x-1.5 text-amber-300 font-medium mb-1">
            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
            <span>Demonstration Fixtures</span>
          </div>
          <p className="text-slate-400 leading-normal">
            Measurements & difference images are simulated laboratory fixtures for UX evaluation and do not represent verified flight SPHEREx data.
          </p>
        </div>

        <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
          <div className="flex items-center space-x-1.5 text-sky-300 font-medium mb-1">
            <CheckCircle className="w-3 h-3 text-sky-400 shrink-0" />
            <span>Uncertainties Disclosed</span>
          </div>
          <p className="text-slate-400 leading-normal">
            Every quantitative claim must state its standard error (±σ). Uncalibrated certainty or arbitrary probability numbers are strictly withheld.
          </p>
        </div>

        <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
          <div className="flex items-center space-x-1.5 text-purple-300 font-medium mb-1">
            <ShieldAlert className="w-3 h-3 text-purple-400 shrink-0" />
            <span>Unconfirmed Candidates</span>
          </div>
          <p className="text-slate-400 leading-normal">
            Candidates remain unconfirmed until validated through multi-band infrared coverage, follow-up spectroscopy, and independent confirmation.
          </p>
        </div>
      </div>
    </div>
  );
};
