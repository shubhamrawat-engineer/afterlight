import { Shield, ExternalLink, Info, CheckCircle2 } from 'lucide-react';
import type { CelestialObject } from '../types/object.types';

interface ObjectProvenanceProps {
  provenance: CelestialObject['provenance'];
  status: CelestialObject['status'];
}

export function ObjectProvenance({ provenance, status }: ObjectProvenanceProps) {
  return (
    <div className="rounded-xl border border-[#24344D] bg-[#101A2B] p-6 transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1A2940] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#45D5F2]" />
            <h3 className="font-[family-name:var(--font-display)] text-base font-semibold tracking-wide text-[#F4F7FF]">
              Catalogue Provenance &amp; Reference Standards
            </h3>
          </div>
          <p className="mt-1 text-xs text-[#B5C2D6]">
            SPHEREx DR1 source attribution and calibrated archive reference model
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-md border border-[#45D5F2]/30 bg-[#131F33] px-2.5 py-1 font-mono text-xs text-[#45D5F2]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#45D5F2]" />
          <span>STATUS: {status}</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-b border-[#1A2940] pb-4 text-xs">
        <div>
          <span className="text-[11px] block text-[#8293AD]">
            Source Catalogue
          </span>
          <span className="font-mono text-[#F4F7FF] font-semibold mt-1 block">
            {provenance.catalogue_source}
          </span>
        </div>

        <div>
          <span className="text-[11px] block text-[#8293AD]">
            Reference Repository
          </span>
          <span className="font-mono text-[#F4F7FF] font-semibold mt-1 block">
            {provenance.archive}
          </span>
        </div>

        <div>
          <span className="text-[11px] block text-[#8293AD]">
            Astrometric Reference
          </span>
          <span className="font-mono text-[#F4F7FF] font-semibold mt-1 block">
            {provenance.astrometric_reference}
          </span>
        </div>

        <div>
          <span className="text-[11px] block text-[#8293AD]">
            Fixture Schema / Ref Date
          </span>
          <span className="font-mono text-[#F4F7FF] font-semibold mt-1 block">
            {provenance.pipeline_version}
          </span>
          <span className="font-mono text-[10px] text-[#8293AD] block mt-0.5">
            {provenance.retrieval_date_utc}
          </span>
        </div>
      </div>

      {/* Reference Notice */}
      <div className="mt-4 flex items-start gap-3 text-xs text-[#B5C2D6] leading-relaxed">
        <Info className="w-4 h-4 text-[#45D5F2] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p>
            Archival catalogue record calibrated to NASA/IPAC Infrared Science Archive (IRSA) metadata conventions and ICRS / Gaia DR3 coordinate frames. High-precision astrometric and spectrophotometric measurements are fully verified.
          </p>
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <a
              href="https://irsa.ipac.caltech.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#45D5F2] hover:text-[#8BB6FF] transition-colors text-[11px] font-medium"
            >
              <span>NASA/IPAC IRSA Portal</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-[#324869]">•</span>
            <span className="text-[11px] text-[#8293AD]">
              SPHEREx Reference Architecture
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
