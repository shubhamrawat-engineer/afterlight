import { Link } from 'react-router-dom';
import { ArrowLeft, Activity, Bot } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

interface SpectralLabHeaderProps {
  targetId: string;
  targetTitle: string;
  targetKind: string;
  status: string;
  wavelengthRange: string;
  profileCount: number;
}

export function SpectralLabHeader({
  targetId,
  targetTitle,
  targetKind,
  status,
  wavelengthRange,
  profileCount,
}: SpectralLabHeaderProps) {
  return (
    <div className="flex flex-col gap-5 border-b border-[#1A2940] pb-6">
      {/* Top Navigation Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <Link
            to={`/evidence/${targetId}`}
            className="inline-flex items-center gap-1.5 font-medium text-[#45D5F2] hover:text-[#8BB6FF] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Evidence</span>
          </Link>
          <span className="text-[#324869]">|</span>
          <Link
            to={`/temporal-analysis/${targetId}`}
            className="text-[#8293AD] hover:text-[#F4F7FF] transition-colors"
          >
            Temporal Analysis
          </Link>
          <span className="text-[#324869]">|</span>
          <Link
            to={`/observations/${targetId}`}
            className="text-[#8293AD] hover:text-[#F4F7FF] transition-colors"
          >
            Observation Catalogue
          </Link>
          <span className="text-[#324869]">|</span>
          <Link
            to="/explore"
            className="text-[#8293AD] hover:text-[#F4F7FF] transition-colors"
          >
            Universe Explorer
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            to={`/ai?contextType=spectral&targetId=${targetId}&targetName=${encodeURIComponent(targetTitle)}`}
            variant="secondary"
            size="sm"
            leftIcon={<Bot className="h-3.5 w-3.5 text-[#45D5F2]" />}
          >
            Explain this spectral profile
          </Button>
          <Badge variant="primary" mono>
            {profileCount} SPECTRAL {profileCount === 1 ? 'EPOCH' : 'EPOCHS'}
          </Badge>
          <Badge variant="success" mono>
            SPHEREx · {status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Main Title & Subtitle */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2.5">
          <Badge variant="primary">Infrared Spectroscopy</Badge>
          <span className="font-mono text-xs text-[#8293AD]">
            {targetKind} &bull; {targetId}
          </span>
        </div>

        <h1 className="text-page-heading text-[#F4F7FF]">
          Spectral Analysis: <span className="text-[#45D5F2]">{targetTitle}</span>
        </h1>

        <p className="max-w-3xl text-[14px] leading-relaxed text-[#B5C2D6]">
          Explore how demonstration flux profiles vary across infrared wavelengths, inspect signature emission/absorption bands, and compare multi-epoch spectral distributions.
        </p>
      </div>

      {/* Spectral Range Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1A2940] pt-4 text-xs">
        <div className="flex items-center gap-2 text-[#B5C2D6]">
          <Activity className="h-4 w-4 shrink-0 text-[#45D5F2]" />
          <span>Wavelength Range: <strong className="font-mono font-semibold text-[#F4F7FF]">{wavelengthRange}</strong></span>
        </div>
        <span className="text-[11px] text-[#8293AD]">
          SPHEREx Linear Variable Filter (LVF) Workflow Concept
        </span>
      </div>
    </div>
  );
}
