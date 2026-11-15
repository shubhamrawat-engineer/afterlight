import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  FilePlus2,
  Eye,
  Activity,
  Lightbulb,
  Download,
  Copy,
  FileCode,
  X,
  AlertTriangle,
} from 'lucide-react';
import type { InvestigationSummaryData } from '../types/evidence.types';
import type { PairGrade } from '../../observations/types/observation.types';
import type { CompleteEvidenceBundle } from '../services/evidence-service';
import { generateInvestigationDossierExport } from '../services/evidence-service';

interface InvestigationSummaryProps {
  summary: InvestigationSummaryData;
  targetId: string;
  targetTitle?: string;
  comparisonJobId?: string | null;
  selectedCandidateId?: string | null;
  earlierObsId?: string | null;
  laterObsId?: string | null;
  pairGrade?: PairGrade | null;
  differenceImage?: string | null;
  isPoorGrade?: boolean;
  completeBundle?: CompleteEvidenceBundle | null;
  className?: string;
}

export function InvestigationSummary({
  summary,
  targetId,
  targetTitle,
  comparisonJobId,
  selectedCandidateId,
  earlierObsId,
  laterObsId,
  pairGrade,
  differenceImage,
  isPoorGrade,
  completeBundle,
  className,
}: InvestigationSummaryProps) {
  const navigate = useNavigate();
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'markdown' | 'json'>('markdown');
  const [copied, setCopied] = useState(false);

  const handleCreateInvestigation = () => {
    navigate('/investigations/new', {
      state: {
        targetId,
        targetTitle: targetTitle ?? null,
        comparisonJobId: comparisonJobId ?? null,
        candidateId: selectedCandidateId ?? null,
        earlierObsId: earlierObsId ?? null,
        laterObsId: laterObsId ?? null,
        pairGrade: pairGrade ?? null,
        differenceImage: differenceImage ?? null,
        initiatedFrom: 'evidence',
      },
    });
  };

  const exportPayload = completeBundle
    ? generateInvestigationDossierExport(completeBundle, selectedCandidateId)
    : null;

  const handleCopy = async () => {
    if (!exportPayload) return;
    const text = exportFormat === 'markdown' ? exportPayload.markdown : exportPayload.json;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleDownload = () => {
    if (!exportPayload) return;
    const isMd = exportFormat === 'markdown';
    const content = isMd ? exportPayload.markdown : exportPayload.json;
    const filename = `afterlight-dossier-${targetId}.${isMd ? 'md' : 'json'}`;
    const blob = new Blob([content], {
      type: isMd ? 'text/markdown;charset=utf-8' : 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`rounded-2xl border border-slate-800/90 bg-[rgba(10,14,26,0.9)] p-6 backdrop-blur-xl shadow-xl space-y-6 ${
        className ?? ''
      }`}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-400" />
          <h2 className="text-base font-extrabold uppercase tracking-wider text-slate-100">
            SCIENTIFIC INVESTIGATION DOSSIER &amp; SYNTHESIS
          </h2>
        </div>

        {completeBundle && (
          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <FileCode className="h-3.5 w-3.5 text-blue-400" />
            <span>Export Dossier Preview</span>
          </button>
        )}
      </div>

      {/* 5-Point Scientific Synthesis Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* 1. What was observed */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-sky-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              1. What Was Observed
            </h4>
          </div>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
            {summary.what_was_observed.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* 2. What was measured */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              2. What Was Measured
            </h4>
          </div>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
            {summary.what_was_measured.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* 3. What could explain it */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              3. What Could Explain It
            </h4>
          </div>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
            {summary.what_could_explain_it.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* 4. What remains unknown */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-rose-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              4. What Remains Unknown
            </h4>
          </div>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
            {summary.what_remains_unknown.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* 5. What evidence is needed next */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 lg:col-span-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-purple-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              5. Outstanding Scientific Validation &amp; Next Steps
            </h4>
          </div>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
            {summary.what_evidence_is_needed_next.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Step 6 Forward Action CTA */}
      <div className="flex flex-col gap-4 rounded-xl border border-blue-500/30 bg-blue-950/30 p-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FilePlus2 className="h-4 w-4 text-blue-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
              Phase 6 Investigation Case
            </span>
          </div>
          <h3 className="text-sm font-bold text-white">
            Formalise Research Findings into a Persistent Case File
          </h3>
          <p className="text-xs text-slate-400 max-w-xl">
            Save this candidate detection, measured photometry, astrometric displacement, and provenance
            into an official Team ASTRION investigation dossier.
          </p>
        </div>

        <div className="flex shrink-0 items-center">
          {isPoorGrade ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/50 px-6 py-3 text-xs font-bold text-slate-400 opacity-60"
            >
              <span>INVESTIGATION LOCKED (INCOMPATIBLE PAIR)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCreateInvestigation}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all duration-200 hover:bg-blue-500 hover:shadow-[0_0_35px_rgba(59,130,246,0.7)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              <span>CREATE INVESTIGATION</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Export Preview Modal */}
      {showExportModal && exportPayload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl border border-slate-800 bg-[#0a0e1a] shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <FileCode className="h-5 w-5 text-blue-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">
                  Export Scientific Evidence Dossier Preview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Disclaimer */}
            <div className="border-b border-amber-500/20 bg-amber-950/20 px-6 py-2.5 text-[11px] text-amber-200/90 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>
                <strong>Demonstration Export Only:</strong> This dossier preview contains synthetic demonstration fixtures and user-logged research hypotheses. It is not a peer-reviewed publication.
              </span>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/40 px-6 py-3 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExportFormat('markdown')}
                  className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
                    exportFormat === 'markdown'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Markdown (.md)
                </button>
                <button
                  type="button"
                  onClick={() => setExportFormat('json')}
                  className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
                    exportFormat === 'json'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  JSON (.json)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 font-semibold text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  <Copy className="h-3.5 w-3.5 text-blue-400" />
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download File</span>
                </button>
              </div>
            </div>

            {/* Preview Box */}
            <div className="flex-1 overflow-auto p-6 font-mono text-xs text-slate-300 bg-slate-950/80">
              <pre className="whitespace-pre-wrap leading-relaxed">
                {exportFormat === 'markdown' ? exportPayload.markdown : exportPayload.json}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
