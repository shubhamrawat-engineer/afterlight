import { Database, ExternalLink } from 'lucide-react';
import type { SpectralProvenance as ProvenanceType } from '../types/spectral.types';

interface SpectralProvenanceProps {
  provenance: ProvenanceType;
  className?: string;
}

export function SpectralProvenance({ provenance, className }: SpectralProvenanceProps) {
  const {
    archive_source,
    mission,
    instrument_configuration,
    extraction_method,
    pipeline_version,
    retrieval_date_utc,
    archive_citation,
    doi_url,
  } = provenance;

  return (
    <div className={`rounded-xl border border-[#24344D] bg-[#101A2B] p-5 space-y-4 ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-[#1A2940] pb-3">
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-[#45D5F2]" />
          <h3 className="font-[family-name:var(--font-display)] text-sm font-semibold text-[#F4F7FF]">
            Spectral Fixture Provenance &amp; Citation Model
          </h3>
        </div>
        <span className="text-[11px] font-mono text-[#8293AD]">IRSA L3 Schema Reference</span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 border-b border-[#1A2940] pb-4 text-xs">
        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[#8293AD]">Archive Source</span>
          <p className="font-mono text-[#F4F7FF]">{archive_source}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[#8293AD]">Mission</span>
          <p className="font-mono text-[#F4F7FF]">{mission}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[#8293AD]">Instrument Configuration</span>
          <p className="font-mono text-[#F4F7FF]">{instrument_configuration}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[#8293AD]">Extraction Method</span>
          <p className="font-mono text-[#F4F7FF]">{extraction_method}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[#8293AD]">Pipeline Version</span>
          <p className="font-mono text-[#F4F7FF]">{pipeline_version}</p>
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-medium text-[#8293AD]">Retrieval Timestamp</span>
          <p className="font-mono text-[#F4F7FF]">{retrieval_date_utc}</p>
        </div>
      </div>

      {/* Citation and External Portal Link */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <span className="text-[11px] font-medium text-[#8293AD]">Mission Citation Reference:</span>
          <p className="text-[#B5C2D6] font-mono text-[11px]">{archive_citation}</p>
        </div>

        {doi_url && (
          <a
            href={doi_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#24344D] bg-[#131F33] px-3 py-1.5 text-xs font-medium text-[#45D5F2] hover:border-[#4388FF]/50 hover:text-[#F4F7FF] transition-colors"
          >
            <span>IRSA Portal</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
