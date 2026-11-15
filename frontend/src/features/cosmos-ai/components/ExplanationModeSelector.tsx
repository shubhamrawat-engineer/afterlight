import React from 'react';
import type { ExplanationMode } from '../types/explanation.types';
import { Microscope, Compass, Sparkles } from 'lucide-react';

interface ExplanationModeSelectorProps {
  currentMode: ExplanationMode;
  onModeChange: (mode: ExplanationMode) => void;
  disabled?: boolean;
}

const MODES: {
  id: ExplanationMode;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge: string;
  badgeColor: string;
}[] = [
  {
    id: 'researcher',
    label: 'Researcher Mode',
    shortLabel: 'Researcher',
    icon: Microscope,
    description: 'Rigorous astrophysics, calibrated flux densities (μJy), WCS/PSF limits & detector caveats.',
    badge: 'ASTROPHYSICS',
    badgeColor: 'text-indigo-300 bg-indigo-950/60 border-indigo-800/40',
  },
  {
    id: 'curious_explorer',
    label: 'Curious Explorer Mode',
    shortLabel: 'Explorer',
    icon: Compass,
    description: 'Accessible astronomy, physical analogies, infrared insights & transient science.',
    badge: 'ACCESSIBLE',
    badgeColor: 'text-sky-300 bg-sky-950/60 border-sky-800/40',
  },
  {
    id: 'kids',
    label: 'Kids Mode',
    shortLabel: 'Kids',
    icon: Sparkles,
    description: 'Wonder-filled cosmic detective stories, fun metaphors, honest space science.',
    badge: 'WONDER',
    badgeColor: 'text-amber-300 bg-amber-950/60 border-amber-800/40',
  },
];

export const ExplanationModeSelector: React.FC<ExplanationModeSelectorProps> = ({
  currentMode,
  onModeChange,
  disabled = false,
}) => {
  return (
    <div className="flex items-center space-x-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-lg">
      <span className="text-xs font-mono uppercase tracking-wider text-slate-400 px-2 hidden sm:inline-block">
        Mode:
      </span>
      {MODES.map((item) => {
        const Icon = item.icon;
        const isActive = currentMode === item.id;

        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={() => onModeChange(item.id)}
            title={item.description}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
              isActive
                ? 'bg-slate-800 text-sky-200 border border-sky-500/40 shadow-sm shadow-sky-950'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
            <span>{item.shortLabel}</span>
            {isActive && (
              <span
                className={`hidden md:inline-block text-[10px] px-1 py-0.2 rounded border font-mono ${item.badgeColor}`}
              >
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
