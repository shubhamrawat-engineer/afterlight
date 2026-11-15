import {
  Download,
  AlertCircle,
  ShieldCheck,
  Compass,
  Layers,
  Database,
  Cpu,
  Fingerprint,
} from 'lucide-react';
import type { InvestigationCase } from '../types/investigation.types';
import type { CompleteEvidenceBundle } from '../../evidence/services/evidence-service';
import {
  buildReproducibilityRecord,
  exportReproducibilityJson,
} from '../services/reproducibility-service';
import { Button } from '../../../components/ui/Button';

interface ReproducibilityPanelProps {
  investigation: InvestigationCase;
  evidenceBundle: CompleteEvidenceBundle | null;
}

export function ReproducibilityPanel({
  investigation,
  evidenceBundle,
}: ReproducibilityPanelProps) {
  const record = buildReproducibilityRecord(investigation, evidenceBundle);

  const handleDownload = () => {
    exportReproducibilityJson(record);
  };

  return (
    <div className="rounded-2xl border border-[rgba(148,163,184,0.13)] bg-[rgba(15,21,35,0.78)] p-6 backdrop-blur-md shadow-lg space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5 text-sky-400" />
            <h2 className="text-base font-semibold text-slate-100">
              Scientific Reproducibility Record
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standardized execution parameters, coordinate frames, input observation IDs, and backend pipeline dependencies.
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleDownload}
          leftIcon={<Download className="h-4 w-4" />}
        >
          Export Reproducibility JSON
        </Button>
      </div>

      {/* Grid of Parameters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Identity & Revision */}
        <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Fingerprint className="h-4 w-4 text-purple-400" />
            <span>Case &amp; Revision</span>
          </div>
          <div className="font-mono text-xs text-slate-300 space-y-1">
            <div className="text-blue-300 font-semibold">{record.investigationId}</div>
            <div>Revision: <strong className="text-purple-300">#{record.revisionNumber}</strong></div>
            <div className="text-[11px] text-slate-500">Ref: {record.evidenceRecordReference}</div>
          </div>
        </div>

        {/* Sky Coordinates */}
        <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Compass className="h-4 w-4 text-sky-400" />
            <span>Target Coordinates</span>
          </div>
          <div className="font-mono text-xs text-slate-300 space-y-1">
            <div>RA: {record.skyCoordinates.raDeg !== null ? `${record.skyCoordinates.raDeg.toFixed(4)}°` : 'N/A'}</div>
            <div>Dec: {record.skyCoordinates.decDeg !== null ? `${record.skyCoordinates.decDeg.toFixed(4)}°` : 'N/A'}</div>
            <div className="text-[11px] text-slate-500">Frame: {record.skyCoordinates.coordinateFrame}</div>
          </div>
        </div>

        {/* Observations */}
        <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Layers className="h-4 w-4 text-blue-400" />
            <span>Referenced Observations</span>
          </div>
          <div className="font-mono text-xs text-slate-300 space-y-1">
            <div>Earlier: {record.selectedEarlierObsId || 'None'}</div>
            <div>Later: {record.selectedLaterObsId || 'None'}</div>
            <div className="text-[11px] text-slate-500">
              Total Epochs: {record.observationIds.length}
            </div>
          </div>
        </div>

        {/* Reduction Mode */}
        <div className="rounded-xl border border-slate-800/90 bg-slate-900/60 p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Cpu className="h-4 w-4 text-emerald-400" />
            <span>Processing Model</span>
          </div>
          <div className="text-xs text-slate-300 space-y-1">
            <div>{record.comparisonMode}</div>
            <div className="font-mono text-[11px] text-slate-400">
              Status: {record.compatibilityAssessmentState}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">
              Version: {record.applicationVersion}
            </div>
          </div>
        </div>
      </div>

      {/* Backend Integration Requirements (Explicit Gaps) */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/15 p-5 space-y-3">
        <div className="flex items-center gap-2 text-amber-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
          <h3 className="text-sm font-semibold">
            Missing Backend Pipeline Metadata (Production Readiness Gaps)
          </h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The following cryptographic hashes, calibrated point-spread function kernels, and reduction checksums are not yet available because server-side pipeline integration is in progress:
        </p>

        <ul className="space-y-2 text-xs font-mono">
          {record.unavailableBackendMetadata.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-slate-950/60 p-2 text-amber-200"
            >
              <Database className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Audit & Classification Notice */}
      <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-xs text-slate-400">
        <ShieldCheck className="h-5 w-5 shrink-0 text-sky-400 mt-0.5" />
        <div className="space-y-1">
          <div className="font-semibold text-slate-200">
            Classification: VERIFIED_ARCHIVE
          </div>
          <div>
            All observation IDs and difference map references are demonstration fixtures created for the NASA SPHEREx hackathon interface prototype. Full scientific validation requires backend FITS ingestion and IRSA archive queries.
          </div>
        </div>
      </div>
    </div>
  );
}
