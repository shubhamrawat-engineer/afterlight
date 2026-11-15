import { useState } from 'react';
import {
  FileText,
  Eye,
  Download,
  Printer,
  CheckSquare,
  Square,
  ShieldAlert,
  Edit3,
  Layers,
} from 'lucide-react';
import type { InvestigationCase } from '../types/investigation.types';
import type { CompleteEvidenceBundle } from '../../evidence/services/evidence-service';
import type {
  ReportSectionConfig,
  ReportSectionId,
  CompleteScientificReportData,
} from '../types/report.types';
import {
  getDefaultReportSections,
  triggerReportMarkdownDownload,
  triggerReportJsonDownload,
  triggerReportPrint,
} from '../services/report-builder-service';
import { buildReproducibilityRecord } from '../services/reproducibility-service';
import { ReportPreview } from './ReportPreview';
import { Button } from '../../../components/ui/Button';

interface ReportBuilderProps {
  investigation: InvestigationCase;
  evidenceBundle: CompleteEvidenceBundle | null;
}

export function ReportBuilder({
  investigation,
  evidenceBundle,
}: ReportBuilderProps) {
  const [sections, setSections] = useState<ReportSectionConfig[]>(getDefaultReportSections());
  const [executiveSummary, setExecutiveSummary] = useState<string>(
    investigation.summary || ''
  );
  const [researchObjective, setResearchObjective] = useState<string>(
    investigation.research_objective ||
      `Conduct high-confidence temporal investigation into photometric and astrometric flux residuals observed for ${investigation.target_title}.`
  );
  const [conclusion, setConclusion] = useState<string>(
    '- Request high-resolution slitless NIR follow-up spectroscopy.\n- Verify photometric calibration against standard stars in Band 3.\n- Ingest upcoming Level 2 SPHEREx survey pass to confirm decline trajectory.'
  );
  const [generatedAtUtc] = useState<string>(() => new Date().toISOString());
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  const reproducibility = buildReproducibilityRecord(investigation, evidenceBundle);

  const toggleSection = (id: ReportSectionId) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, included: !s.included } : s))
    );
  };

  const selectAllSections = (included: boolean) => {
    setSections((prev) => prev.map((s) => ({ ...s, included })));
  };

  const handleUpdateSectionText = (id: ReportSectionId, text: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, userText: text } : s))
    );
  };

  const reportData: CompleteScientificReportData = {
    reportId: `REP-${investigation.id}`,
    investigation,
    evidenceBundle,
    reproducibility,
    sections,
    generatedAtUtc,
    isDemonstrationOnly: true,
    userExecutiveSummary: executiveSummary,
    userResearchObjective: researchObjective,
    userConclusion: conclusion,
  };

  const includedCount = sections.filter((s) => s.included).length;

  return (
    <div className="space-y-6">
      {/* Builder Header Card */}
      <div className="rounded-2xl border border-[rgba(148,163,184,0.13)] bg-[rgba(15,21,35,0.78)] p-6 backdrop-blur-md shadow-lg space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-400" />
              <h2 className="text-base font-semibold text-slate-100">
                Scientific Investigation Report Builder
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Assemble, customize, and export a 15-section scientific investigation report for case{' '}
              <span className="font-mono text-blue-300">{investigation.id}</span>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
              leftIcon={<Eye className="h-3.5 w-3.5" />}
            >
              Preview Formatted Report
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => triggerReportMarkdownDownload(reportData)}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Export Markdown (.md)
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => triggerReportJsonDownload(reportData)}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Export JSON
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => triggerReportPrint()}
              leftIcon={<Printer className="h-3.5 w-3.5" />}
            >
              Print
            </Button>
          </div>
        </div>

        {/* Demonstration Disclaimer Banner */}
        <div className="flex items-start gap-2.5 rounded-xl border border-sky-500/30 bg-sky-950/20 p-3.5 text-xs text-sky-300">
          <ShieldAlert className="h-4 w-4 shrink-0 text-sky-400 mt-0.5" />
          <span>
            <strong>Scientific Integrity &amp; Demonstration Notice:</strong> This builder structures user-documented investigation findings into a standard scientific layout. Measurements and telemetry originate from demonstration fixtures. Exported reports clearly carry demonstration disclaimers.
          </span>
        </div>

        {/* User-Editable Narrative Sections */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Edit3 className="h-3.5 w-3.5 text-blue-400" />
            <span>Editable Narrative &amp; Hypothesis Synthesis</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Executive Summary (High-Level Finding)
              </label>
              <textarea
                rows={3}
                value={executiveSummary}
                onChange={(e) => setExecutiveSummary(e.target.value)}
                placeholder="Summarize the core astrophysical finding, confidence level, and significance..."
                className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Scientific Research Objective
                </label>
                <textarea
                  rows={3}
                  value={researchObjective}
                  onChange={(e) => setResearchObjective(e.target.value)}
                  placeholder="State the formal research objective..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Required Follow-Up &amp; Verification Recommendations
                </label>
                <textarea
                  rows={3}
                  value={conclusion}
                  onChange={(e) => setConclusion(e.target.value)}
                  placeholder="List next verification steps, telescope follow-up, spectroscopy..."
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section Inclusion Selector (15 Sections) */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                15 Standard Report Sections ({includedCount} Selected)
              </h3>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => selectAllSections(true)}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Select All
              </button>
              <span className="text-slate-600">•</span>
              <button
                type="button"
                onClick={() => selectAllSections(false)}
                className="text-slate-400 hover:text-slate-200 font-medium"
              >
                Deselect All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((sec) => (
              <div
                key={sec.id}
                onClick={() => toggleSection(sec.id)}
                className={`flex items-start gap-2.5 rounded-xl border p-3 cursor-pointer transition-all ${
                  sec.included
                    ? 'border-blue-500/30 bg-blue-950/20 text-slate-200'
                    : 'border-slate-800 bg-slate-900/40 text-slate-500 hover:border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSection(sec.id);
                  }}
                  className="mt-0.5 text-blue-400"
                >
                  {sec.included ? (
                    <CheckSquare className="h-4 w-4 text-blue-400" />
                  ) : (
                    <Square className="h-4 w-4 text-slate-600" />
                  )}
                </button>

                <div className="space-y-1 text-xs">
                  <div className={`font-medium ${sec.included ? 'text-slate-200' : 'text-slate-500'}`}>
                    {sec.title}
                  </div>

                  {sec.isEditableText && sec.included && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="pt-1"
                    >
                      <input
                        type="text"
                        placeholder="Add custom notes for this section..."
                        value={sec.userText ?? ''}
                        onChange={(e) => handleUpdateSectionText(sec.id, e.target.value)}
                        className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1 text-[11px] text-slate-300 focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <ReportPreview
          reportData={reportData}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  );
}
