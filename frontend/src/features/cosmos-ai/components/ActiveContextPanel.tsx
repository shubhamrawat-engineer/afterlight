import React from 'react';
import { Link } from 'react-router-dom';
import type { AIContextReference } from '../types/cosmos-ai.types';
import { enrichContextMetadata } from '../services/cosmos-context-service';
import {
  Globe,
  Crosshair,
  Layers,
  History,
  FileText,
  Database,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

interface ActiveContextPanelProps {
  context: AIContextReference;
  onResetToGlobal?: () => void;
  className?: string;
}

export const ActiveContextPanel: React.FC<ActiveContextPanelProps> = ({
  context,
  onResetToGlobal,
  className = '',
}) => {
  const metadata = enrichContextMetadata(context);

  const getContextIcon = () => {
    switch (metadata.contextType) {
      case 'investigation':
        return <FileText className="w-4 h-4 text-purple-400" />;
      case 'evidence':
        return <Database className="w-4 h-4 text-cyan-400" />;
      case 'temporal':
      case 'multi_epoch':
        return <History className="w-4 h-4 text-emerald-400" />;
      case 'observations':
      case 'observation':
        return <Layers className="w-4 h-4 text-amber-400" />;
      case 'target':
        return <Crosshair className="w-4 h-4 text-sky-400" />;
      default:
        return <Globe className="w-4 h-4 text-blue-400" />;
    }
  };

  const getNavigationRoute = (): { label: string; url: string } | null => {
    if (metadata.investigation?.caseId) {
      return {
        label: 'View Investigation Dossier',
        url: `/investigations/${metadata.investigation.caseId}`,
      };
    }
    if (metadata.contextType === 'temporal' || metadata.contextType === 'multi_epoch') {
      return {
        label: 'View Temporal Analysis',
        url: `/temporal-analysis${metadata.targetId ? `?targetId=${metadata.targetId}` : ''}`,
      };
    }
    if (metadata.contextType === 'evidence') {
      return {
        label: 'View Evidence Workspace',
        url: `/evidence${metadata.targetId ? `?targetId=${metadata.targetId}` : ''}`,
      };
    }
    if (metadata.targetId) {
      return {
        label: 'Explore Celestial Target',
        url: `/explore/${metadata.targetId}`,
      };
    }
    return null;
  };

  const nav = getNavigationRoute();
  const hasDetails = Boolean(
    (metadata.coordinates && metadata.coordinates.raDeg !== null) ||
    metadata.observations ||
    metadata.evidenceSummary ||
    metadata.investigation ||
    nav
  );

  return (
    <div
      className={`bg-[#101A2B] border border-[#24344D] rounded-xl px-3.5 py-2.5 shadow-sm text-xs ${className}`}
    >
      <div className={`flex flex-wrap items-center justify-between gap-2 ${hasDetails ? 'mb-2 pb-2 border-b border-[#1A2940]' : ''}`}>
        <div className="flex items-center space-x-2">
          {getContextIcon()}
          <span className="text-xs font-medium text-[#8293AD]">
            Active Context:
          </span>
          <span className="font-semibold text-[#F4F7FF]">{metadata.title}</span>
          <span className="px-2 py-0.5 rounded-md bg-[#131F33] text-[#45D5F2] font-mono text-[10px] border border-[#24344D]">
            {metadata.summaryBadgeText}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Verified Archive Pill */}
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>VERIFIED ARCHIVE</span>
          </span>

          {context.type !== 'general' && onResetToGlobal && (
            <button
              type="button"
              onClick={onResetToGlobal}
              className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-slate-200 transition-colors px-1.5 py-0.5 rounded hover:bg-slate-800 cursor-pointer"
              title="Switch to Global Astronomical Context"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Context</span>
            </button>
          )}
        </div>
      </div>

      {hasDetails && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-slate-300 text-[11px]">
          {/* Coordinates */}
          {metadata.coordinates && metadata.coordinates.raDeg !== null && (
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">
                Coordinates ({metadata.coordinates.frame}):
              </span>
              <span className="font-mono text-slate-200">
                α {metadata.coordinates.raDeg.toFixed(4)}°, δ {metadata.coordinates.decDeg?.toFixed(4)}°
              </span>
            </div>
          )}

          {/* Observations / Epochs */}
          {metadata.observations && (
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">
                Obs Epochs:
              </span>
              <span className="font-mono text-slate-200">
                {metadata.observations.earlierObsId
                  ? `${metadata.observations.earlierObsId} → ${metadata.observations.laterObsId || 'N/A'}`
                  : `${metadata.observations.epochCount} epochs recorded`}
              </span>
            </div>
          )}

          {/* Evidence / Measurements Summary */}
          {metadata.evidenceSummary && (
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">
                Evidence Records:
              </span>
              <span className="text-slate-200">
                {metadata.evidenceSummary.photometricCount} phot / {metadata.evidenceSummary.astrometricCount} astrom / {metadata.evidenceSummary.qualityFlagsCount} flags
              </span>
            </div>
          )}

          {/* Investigation / Case info */}
          {metadata.investigation && (
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60">
              <span className="text-slate-500 block text-[10px] uppercase font-mono">
                Case Status:
              </span>
              <span className="font-semibold text-purple-300 uppercase">
                {metadata.investigation.status}
              </span>
            </div>
          )}

          {/* Tool Navigation Shortcut */}
          {nav && (
            <div className="bg-slate-950/60 p-2 rounded border border-slate-800/60 flex items-center justify-between col-span-1 sm:col-span-2 md:col-span-1">
              <span className="text-slate-400 text-[11px] truncate">{nav.label}</span>
              <Link
                to={nav.url}
                className="text-sky-400 hover:text-sky-300 inline-flex items-center space-x-1 pl-2 font-medium"
              >
                <span>Open</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
