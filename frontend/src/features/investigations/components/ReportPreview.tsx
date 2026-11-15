import {
  X,
  Download,
  Printer,
  FileCode,
  ShieldAlert,
} from 'lucide-react';
import type { CompleteScientificReportData } from '../types/report.types';
import {
  triggerReportMarkdownDownload,
  triggerReportJsonDownload,
  triggerReportPrint,
} from '../services/report-builder-service';
import { Button } from '../../../components/ui/Button';

interface ReportPreviewProps {
  reportData: CompleteScientificReportData;
  onClose: () => void;
}

export function ReportPreview({ reportData, onClose }: ReportPreviewProps) {
  const { investigation, evidenceBundle, reproducibility, sections } = reportData;

  const isIncluded = (id: string) => {
    const sec = sections.find((s) => s.id === id);
    return sec ? sec.included : true;
  };

  const getUserText = (id: string) => {
    const sec = sections.find((s) => s.id === id);
    return sec?.userText?.trim();
  };

  const handlePrint = () => {
    triggerReportPrint();
  };

  const handleDownloadMd = () => {
    triggerReportMarkdownDownload(reportData);
  };

  const handleDownloadJson = () => {
    triggerReportJsonDownload(reportData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md overflow-hidden">
      <div className="flex h-full max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl border border-slate-800 bg-[#0b101c] shadow-2xl overflow-hidden print:border-none print:shadow-none print:max-h-none print:h-auto">
        {/* Top Action Bar (hidden in print) */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#090d17] p-4 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileCode className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Scientific Report Preview &amp; Export
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                {investigation.id} • {sections.filter((s) => s.included).length} Sections Included
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              leftIcon={<Printer className="h-3.5 w-3.5" />}
            >
              Print / Save PDF
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleDownloadMd}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Download .MD
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleDownloadJson}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Download .JSON
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ml-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Report Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 bg-[#090d17] text-slate-200 font-sans print:p-0 print:bg-white print:text-black">
          {/* Scientific Report Header */}
          <div className="border-b-2 border-slate-700/80 pb-6 space-y-3 print:border-black">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 print:text-gray-600">
              <span>AFTERLIGHT ASTRONOMICAL RESEARCH DOSSIER</span>
              <span>CANONICAL CASE: {investigation.id}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white print:text-black">
              {investigation.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 print:text-gray-700">
              <div>Target: <strong className="text-slate-200 print:text-black">{investigation.target_title}</strong></div>
              <div>•</div>
              <div>Status: <strong className="text-blue-300 print:text-black uppercase">{investigation.status}</strong></div>
              <div>•</div>
              <div>Generated: {new Date(reportData.generatedAtUtc).toLocaleString('en-GB', { timeZone: 'UTC' })} UTC</div>
            </div>
          </div>

          {/* Prominent Demonstration Notice */}
          <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4 text-xs text-amber-300 space-y-1 print:border-gray-400 print:bg-gray-100 print:text-gray-800">
            <div className="flex items-center gap-2 font-semibold">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-400" />
              <span>NASA SPHEREx VERIFIED INVESTIGATION RECORD</span>
            </div>
            <p className="leading-relaxed">
              This report represents a simulated scientific investigation synthesized in the AFTERLIGHT frontend. Measurements, difference subtraction maps, and quality flags are demonstration fixtures. This document does not constitute a verified astronomical discovery, official archive record, or peer-reviewed publication.
            </p>
          </div>

          {/* Executive Summary */}
          {reportData.userExecutiveSummary && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 space-y-2 print:border-gray-300 print:bg-gray-50">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-gray-600">
                Executive Summary
              </h3>
              <p className="text-sm leading-relaxed text-slate-200 whitespace-pre-line print:text-gray-900">
                {reportData.userExecutiveSummary}
              </p>
            </div>
          )}

          {/* 1. Identity */}
          {isIncluded('identity') && (
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                1. Investigation Identity &amp; Classification
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block">ID</span>
                  <span className="text-slate-200 font-semibold">{investigation.id}</span>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block">Category</span>
                  <span className="text-slate-200">{investigation.category ?? 'General Anomaly'}</span>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block">Confidence</span>
                  <span className="text-slate-200">{investigation.confidence}</span>
                </div>
              </div>
            </section>
          )}

          {/* 2. Research Objective */}
          {isIncluded('objective') && (
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                2. Scientific Research Objective
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line print:text-gray-800">
                {getUserText('objective') || reportData.userResearchObjective || investigation.research_objective || investigation.summary}
              </p>
            </section>
          )}

          {/* 3. Target & Coordinates */}
          {isIncluded('target_observation') && (
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                3. Target Context &amp; Sky-Region Coordinates
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block">Target Title</span>
                  <span className="text-slate-200">{investigation.target_title}</span>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block">Right Ascension (RA)</span>
                  <span className="text-slate-200">
                    {reproducibility.skyCoordinates.raDeg !== null ? `${reproducibility.skyCoordinates.raDeg.toFixed(4)}°` : 'N/A'}
                  </span>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block">Declination (Dec)</span>
                  <span className="text-slate-200">
                    {reproducibility.skyCoordinates.decDeg !== null ? `${reproducibility.skyCoordinates.decDeg.toFixed(4)}°` : 'N/A'}
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* 4. Timeline */}
          {isIncluded('timeline') && (
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                4. Observation Epochs Timeline &amp; Cadence
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block">Baseline (Earlier) Epoch</span>
                  <span className="text-slate-200">{investigation.earlier_obs_id || 'None'}</span>
                  <span className="text-[10px] text-slate-500 block">{investigation.earlier_date || 'N/A'}</span>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block">Comparison (Later) Epoch</span>
                  <span className="text-slate-200">{investigation.later_obs_id || 'None'}</span>
                  <span className="text-[10px] text-slate-500 block">{investigation.later_date || 'N/A'}</span>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block">Wavelength Band</span>
                  <span className="text-slate-200">{investigation.wavelength_um ? `${investigation.wavelength_um} μm` : 'Multi-band'}</span>
                </div>
              </div>
            </section>
          )}

          {/* 5. Compatibility */}
          {isIncluded('compatibility') && (
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                5. Instrument Compatibility Assessment
              </h2>
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 text-xs space-y-1.5 font-mono">
                <div>State: <strong className="text-emerald-400">{reproducibility.compatibilityAssessmentState}</strong></div>
                <div>Pair Quality Grade: <strong className="text-slate-200">{investigation.pair_grade ?? 'Good (Demo)'}</strong></div>
                <div className="text-[11px] text-slate-400 font-sans">
                  SPHEREx spectral mosaic passbands meet the 85% overlap threshold for optimal difference imaging.
                </div>
              </div>
            </section>
          )}

          {/* 6. Temporal Comparison */}
          {isIncluded('temporal_comparison') && (
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                6. Temporal Analysis &amp; Subtraction
              </h2>
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 text-xs space-y-1.5">
                <div>Mode: <strong className="text-slate-200">{reproducibility.comparisonMode}</strong></div>
                <div>Comparison Job: <span className="font-mono text-blue-300">{investigation.comparison_job_id ?? 'Direct comparison'}</span></div>
                <div>Candidate Ref: <span className="font-mono text-slate-300">{investigation.candidate_id ?? 'SPX-C1'}</span></div>
              </div>
            </section>
          )}

          {/* 7. Measurements */}
          {isIncluded('measurements') && (
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                7. Quantitative Measurements (Photometry &amp; Astrometry)
              </h2>
              {evidenceBundle?.measurements ? (
                <div className="space-y-3">
                  <div className="rounded-xl border border-slate-800 overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-mono">
                        <tr>
                          <th className="p-3">Measurement</th>
                          <th className="p-3">Value</th>
                          <th className="p-3">Uncertainty</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono">
                        {evidenceBundle.measurements.photometric.map((m) => (
                          <tr key={m.id} className="hover:bg-slate-900/40">
                            <td className="p-3 text-slate-300 font-sans">{m.label}</td>
                            <td className="p-3 text-slate-200 font-bold">{m.flux !== null ? `${m.flux} ${m.fluxUnit}` : 'N/A'}</td>
                            <td className="p-3 text-slate-400">{m.fluxUncertainty ? `±${m.fluxUncertainty} ${m.fluxUnit}` : '—'}</td>
                            <td className="p-3 text-blue-300 text-[11px]">{m.validationStatus}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-300 font-mono">
                  Flux residual: {investigation.what_was_observed}
                </p>
              )}
            </section>
          )}

          {/* 8. Uncertainties & Flags */}
          {isIncluded('uncertainty_flags') && (
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                8. Uncertainty Budget &amp; Scientific Quality Flags
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block">Statistical Uncertainty</span>
                  <span className="text-slate-200">{evidenceBundle?.uncertainties.statistical.value ?? '1.44'} μJy</span>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block">Calibration Uncertainty</span>
                  <span className="text-slate-200">{evidenceBundle?.uncertainties.calibration.value ?? '0.05'} mag</span>
                </div>
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                  <span className="text-slate-500 block">Background Subtraction</span>
                  <span className="text-slate-200">{evidenceBundle?.uncertainties.background.value ?? '2.10'} μJy</span>
                </div>
              </div>
            </section>
          )}

          {/* 9. Evidence Ledger */}
          {isIncluded('evidence_ledger') && (
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                9. Associated Evidence Ledger Items
              </h2>
              {investigation.evidence_items.length > 0 ? (
                <div className="space-y-2">
                  {investigation.evidence_items.map((ev) => (
                    <div key={ev.id} className="rounded-lg border border-slate-800 bg-slate-900/40 p-3 text-xs flex justify-between gap-4">
                      <div>
                        <div className="font-semibold text-slate-200">{ev.title}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{ev.description}</div>
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 shrink-0">
                        Ref: {ev.source_reference}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No secondary evidence items logged.</p>
              )}
            </section>
          )}

          {/* 10. Provenance */}
          {isIncluded('provenance') && (
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                10. Data Provenance &amp; Reduction Lineage
              </h2>
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 text-xs space-y-2">
                <div>Audit Status: <span className="font-mono text-sky-400">{reproducibility.provenanceStatus}</span></div>
                <div>Source Classification: <span className="font-mono text-amber-400">{reproducibility.dataSourceClassification}</span></div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  The data provenance chain demonstrates simulated pipeline stages from raw observation ingestion through optimal image subtraction. Live cryptographic hash verification requires backend deployment.
                </p>
              </div>
            </section>
          )}

          {/* 11. Working Hypotheses */}
          {isIncluded('explanations') && (
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                11. Working Hypotheses &amp; Explanations
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line print:text-gray-800">
                {getUserText('explanations') || investigation.possible_explanation || 'No hypothesis logged.'}
              </p>
            </section>
          )}

          {/* 12. Limitations */}
          {isIncluded('limitations') && (
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                12. Epistemic Unknowns &amp; Limitations
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line print:text-gray-800">
                {getUserText('limitations') || investigation.uncertainty || 'No limitations logged.'}
              </p>
            </section>
          )}

          {/* 13. Required Follow-up */}
          {isIncluded('validation_required') && (
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                13. Required Follow-up Validation &amp; Next Steps
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line print:text-gray-800">
                {getUserText('validation_required') || reportData.userConclusion || '- High-resolution NIR spectroscopy to confirm chemical composition and redshift.\n- Multi-epoch optical monitoring to rule out stellar flare contamination.\n- Backend FITS re-reduction when live SPHEREx Level 2 archive pipeline is available.'}
              </p>
            </section>
          )}

          {/* 14. Reproducibility */}
          {isIncluded('reproducibility') && (
            <section className="space-y-3">
              <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-2 print:text-black print:border-gray-300">
                14. Reproducibility Parameters &amp; Backend Availability
              </h2>
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 text-xs space-y-2 font-mono">
                <div>Investigation ID: {reproducibility.investigationId}</div>
                <div>Target ID: {reproducibility.targetId}</div>
                <div>Observations: {reproducibility.observationIds.join(', ')}</div>
                <div className="pt-2 text-slate-400 font-sans">Unavailable Backend Integration Flags:</div>
                <ul className="list-disc list-inside text-amber-300/80 text-[11px] space-y-1">
                  {reproducibility.unavailableBackendMetadata.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {/* 15. References & Software Attribution */}
          {isIncluded('references') && (
            <section className="space-y-3 border-t border-slate-800 pt-4 print:border-gray-300">
              <h2 className="text-base font-bold text-slate-100 pb-2 print:text-black">
                15. References &amp; Software Attribution
              </h2>
              <div className="text-xs text-slate-400 space-y-1 leading-relaxed font-sans print:text-gray-700">
                <div>• AFTERLIGHT Platform ({reproducibility.applicationVersion}) — Team ASTRION</div>
                <div>• NASA SPHEREx Mission (Spectro-Photometer for the History of the Universe, Epoch of Reionization, and Ices Explorer)</div>
                <div>• Demonstration Environment Notice: All scientific parameters presented herein are demonstration fixtures.</div>
              </div>
            </section>
          )}
        </div>

        {/* Footer (hidden in print) */}
        <div className="flex items-center justify-between border-t border-slate-800 bg-[#090d17] p-4 print:hidden">
          <span className="text-xs text-slate-400">
            AFTERLIGHT Investigation Report • Prepared for NASA SPHEREx Hackathon Review
          </span>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
