import React from 'react';
import type { AIContextReference } from '../types/cosmos-ai.types';
import {
  Sparkles,
  Compass,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Activity,
} from 'lucide-react';

interface InvestigationActionPanelProps {
  context: AIContextReference;
  onTriggerPrompt: (promptText: string) => void;
  disabled?: boolean;
  className?: string;
}

interface ActionPrompt {
  id: string;
  label: string;
  prompt: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ACTION_PROMPTS: ActionPrompt[] = [
  {
    id: 'explain-obs',
    label: 'Explain this observation',
    prompt: 'Explain the observational properties, wavelength coverage, and detector characteristics of this observation.',
    icon: Search,
  },
  {
    id: 'compare-epochs',
    label: 'Compare selected epochs',
    prompt: 'Compare the selected temporal epochs and evaluate whether the detected change is consistent with a point-source transient.',
    icon: Activity,
  },
  {
    id: 'explain-compat',
    label: 'Explain compatibility',
    prompt: 'Explain the scientific compatibility between these epochs, detailing passband overlap, PSF ratio, and difference imaging validity.',
    icon: CheckCircle2,
  },
  {
    id: 'summarise-evidence',
    label: 'Summarise evidence',
    prompt: 'Provide a complete 7-part scientific evidence breakdown of all photometric, astrometric, and contextual evidence available.',
    icon: FileText,
  },
  {
    id: 'review-flags',
    label: 'Review quality flags',
    prompt: 'Review all detector and calibration quality flags associated with this candidate and identify potential instrumental caveats.',
    icon: AlertCircle,
  },
  {
    id: 'missing-metadata',
    label: 'Identify missing metadata',
    prompt: 'What critical observational metadata, follow-up spectroscopy, or archival observations are currently missing to verify this source?',
    icon: HelpCircle,
  },
  {
    id: 'possible-explanations',
    label: 'Generate possible explanations',
    prompt: 'Evaluate the 6 qualitative explanation categories (astrophysical, instrumental, calibration, background, astrometric, insufficient evidence).',
    icon: Sparkles,
  },
  {
    id: 'report-narrative',
    label: 'Prepare report narrative',
    prompt: 'Synthesize a formal scientific report narrative suitable for inclusion in an astronomical investigation dossier.',
    icon: Compass,
  },
];

export const InvestigationActionPanel: React.FC<InvestigationActionPanelProps> = ({
  onTriggerPrompt,
  disabled = false,
  className = '',
}) => {
  return (
    <div className={`p-3 bg-[#0A1020] border border-[#24344D] rounded-xl text-xs ${className}`}>
      <div className="flex items-center space-x-2 mb-2.5">
        <Sparkles className="w-3.5 h-3.5 text-[#45D5F2]" />
        <span className="font-semibold text-[#F4F7FF]">Investigation Actions</span>
        <span className="text-[11px] text-[#8293AD]">(1-Click Contextual Inquiries)</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {ACTION_PROMPTS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              disabled={disabled}
              onClick={() => onTriggerPrompt(action.prompt)}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-slate-300 hover:text-sky-200 transition-colors text-[11px] ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <Icon className="w-3 h-3 text-sky-400 shrink-0" />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
