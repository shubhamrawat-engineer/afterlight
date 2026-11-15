import type {
  ReportSectionConfig,
  ReportSectionId,
  CompleteScientificReportData,
} from '../types/report.types';

export const STANDARD_REPORT_SECTIONS: { id: ReportSectionId; title: string; isEditableText: boolean; defaultDescription: string }[] = [
  {
    id: 'identity',
    title: '1. Investigation Identity & Canonical Classification',
    isEditableText: false,
    defaultDescription: 'Core metadata identifying this scientific investigation dossier.',
  },
  {
    id: 'objective',
    title: '2. Scientific Research Objective & Hypothesis Context',
    isEditableText: true,
    defaultDescription: 'Specific scientific problem, inquiry, or hypothesis investigated.',
  },
  {
    id: 'target_observation',
    title: '3. Target Context & Sky-Region Coordinates',
    isEditableText: false,
    defaultDescription: 'Target name, astronomical coordinates (ICRS J2000), and region classification.',
  },
  {
    id: 'timeline',
    title: '4. Observation Epochs Timeline & Cadence',
    isEditableText: false,
    defaultDescription: 'Temporal baseline, acquisition dates, and instrument passbands.',
  },
  {
    id: 'compatibility',
    title: '5. SPHEREx Instrument Compatibility Assessment',
    isEditableText: false,
    defaultDescription: 'Compatibility evaluation, passband overlap, and resolution ratio.',
  },
  {
    id: 'temporal_comparison',
    title: '6. Temporal Analysis & Image Subtraction',
    isEditableText: false,
    defaultDescription: 'Image subtraction method, PSF homogenization, and residual evaluation.',
  },
  {
    id: 'measurements',
    title: '7. Quantitative Measurements (Photometry & Astrometry)',
    isEditableText: false,
    defaultDescription: 'Extracted point-source flux density, delta-magnitude, and coordinates.',
  },
  {
    id: 'uncertainty_flags',
    title: '8. Uncertainty Budget & Scientific Quality Flags',
    isEditableText: false,
    defaultDescription: 'Statistical, calibration, background uncertainties and quality flags.',
  },
  {
    id: 'evidence_ledger',
    title: '9. Associated Evidence Ledger Items',
    isEditableText: false,
    defaultDescription: 'Documented artifacts, reference frames, and anomaly recordings.',
  },
  {
    id: 'provenance',
    title: '10. Data Provenance & Reduction Lineage',
    isEditableText: false,
    defaultDescription: 'Data pipeline reduction stages and processing heritage.',
  },
  {
    id: 'explanations',
    title: '11. Working Hypotheses & Astrophysical Explanations',
    isEditableText: true,
    defaultDescription: 'Physically plausible astrophysical scenarios explaining observed residuals.',
  },
  {
    id: 'limitations',
    title: '12. Epistemic Unknowns & Systematic Limitations',
    isEditableText: true,
    defaultDescription: 'Observational gaps, ambiguities, and potential confounding factors.',
  },
  {
    id: 'validation_required',
    title: '13. Required Follow-up Validation & Next Steps',
    isEditableText: true,
    defaultDescription: 'Ground-based or space-based follow-up needed to confirm findings.',
  },
  {
    id: 'reproducibility',
    title: '14. Reproducibility Parameters & Backend Availability',
    isEditableText: false,
    defaultDescription: 'Target, observation IDs, pipeline states, and unavailable backend metadata.',
  },
  {
    id: 'references',
    title: '15. References, Software Attribution & Scientific Disclaimers',
    isEditableText: false,
    defaultDescription: 'Attributions, software versions, and hackathon demonstration notice.',
  },
];

export function getDefaultReportSections(): ReportSectionConfig[] {
  return STANDARD_REPORT_SECTIONS.map((sec) => ({
    id: sec.id,
    title: sec.title,
    included: true,
    isEditableText: sec.isEditableText,
    userText: '',
  }));
}

export function generateScientificReportMarkdown(reportData: CompleteScientificReportData): string {
  const { investigation, evidenceBundle, reproducibility, sections } = reportData;
  const isIncluded = (id: ReportSectionId) => {
    const sec = sections.find((s) => s.id === id);
    return sec ? sec.included : true;
  };
  const getUserText = (id: ReportSectionId) => {
    const sec = sections.find((s) => s.id === id);
    return sec?.userText?.trim();
  };

  const mdParts: string[] = [];

  mdParts.push(`# AFTERLIGHT Scientific Investigation Report`);
  mdParts.push(`**Investigation ID:** ${investigation.id}  `);
  mdParts.push(`**Target:** ${investigation.target_title} (${investigation.target_id})  `);
  mdParts.push(`**Generated:** ${reportData.generatedAtUtc}  `);
  mdParts.push(`**Investigation Status:** ${investigation.status.toUpperCase()}  `);
  mdParts.push(`**Confidence Level:** ${investigation.confidence}  \n`);

  mdParts.push(`> [!IMPORTANT]`);
  mdParts.push(`> **DEMONSTRATION DISCLAIMER:** This report was generated within the AFTERLIGHT scientific research demonstration environment for the NASA SPHEREx hackathon.`);
  mdParts.push(`> Measurements, difference images, and quality flags are demonstration fixtures. This document represents user-logged investigation progress and does not constitute a verified astronomical discovery, official archive record, or peer-reviewed publication.\n`);

  if (reportData.userExecutiveSummary?.trim()) {
    mdParts.push(`## Executive Summary\n${reportData.userExecutiveSummary.trim()}\n`);
  }

  // 1. Identity
  if (isIncluded('identity')) {
    mdParts.push(`## 1. Investigation Identity & Canonical Classification`);
    mdParts.push(`- **Canonical ID:** ${investigation.id}`);
    mdParts.push(`- **Title:** ${investigation.title}`);
    mdParts.push(`- **Category:** ${investigation.category ?? 'General Anomaly'}`);
    mdParts.push(`- **Workflow Status:** ${investigation.status}`);
    mdParts.push(`- **Created (UTC):** ${investigation.created_at_utc}`);
    mdParts.push(`- **Last Updated (UTC):** ${investigation.updated_at_utc ?? investigation.created_at_utc}\n`);
  }

  // 2. Objective
  if (isIncluded('objective')) {
    mdParts.push(`## 2. Scientific Research Objective & Hypothesis Context`);
    const customObjective = getUserText('objective') || reportData.userResearchObjective || investigation.research_objective;
    mdParts.push(customObjective || `Investigate temporal flux variation, proper motion, or spectral anomalies observed in target ${investigation.target_title}.`);
    mdParts.push('');
  }

  // 3. Target & Coordinates
  if (isIncluded('target_observation')) {
    mdParts.push(`## 3. Target Context & Sky-Region Coordinates`);
    mdParts.push(`- **Target Name:** ${investigation.target_title}`);
    mdParts.push(`- **Target ID:** ${investigation.target_id}`);
    mdParts.push(`- **Right Ascension (RA):** ${reproducibility.skyCoordinates.raDeg !== null ? `${reproducibility.skyCoordinates.raDeg}°` : 'Not specified'}`);
    mdParts.push(`- **Declination (Dec):** ${reproducibility.skyCoordinates.decDeg !== null ? `${reproducibility.skyCoordinates.decDeg}°` : 'Not specified'}`);
    mdParts.push(`- **Coordinate Frame:** ${reproducibility.skyCoordinates.coordinateFrame}\n`);
  }

  // 4. Timeline
  if (isIncluded('timeline')) {
    mdParts.push(`## 4. Observation Epochs Timeline & Cadence`);
    mdParts.push(`- **Earlier Baseline Epoch:** ${investigation.earlier_obs_id ?? 'None selected'} (${investigation.earlier_date ?? 'N/A'})`);
    mdParts.push(`- **Later Comparison Epoch:** ${investigation.later_obs_id ?? 'None selected'} (${investigation.later_date ?? 'N/A'})`);
    mdParts.push(`- **Effective Wavelength:** ${investigation.wavelength_um ? `${investigation.wavelength_um} μm` : 'Multi-band'}`);
    mdParts.push(`- **Epoch Count:** ${investigation.associated_epochs_count ?? (investigation.earlier_obs_id ? 2 : 0)}\n`);
  }

  // 5. Compatibility
  if (isIncluded('compatibility')) {
    mdParts.push(`## 5. SPHEREx Instrument Compatibility Assessment`);
    mdParts.push(`- **Assessment State:** ${reproducibility.compatibilityAssessmentState}`);
    mdParts.push(`- **Pair Grade:** ${investigation.pair_grade ?? 'Assessed in Compatibility Inspector'}`);
    mdParts.push(`- *Note: Compatibility checks evaluate passband overlap, spatial resolution ratio, and WCS coverage according to demonstration threshold parameters.*\n`);
  }

  // 6. Temporal Comparison
  if (isIncluded('temporal_comparison')) {
    mdParts.push(`## 6. Temporal Analysis & Image Subtraction`);
    mdParts.push(`- **Comparison Mode:** ${reproducibility.comparisonMode}`);
    mdParts.push(`- **Comparison Job ID:** ${investigation.comparison_job_id ?? 'Direct pair comparison'}`);
    mdParts.push(`- **Candidate ID:** ${investigation.candidate_id ?? 'None tagged'}`);
    mdParts.push(`- **Residual Image:** ${investigation.difference_image ? 'Demonstration Subtraction Asset Referenced' : 'Not generated'}\n`);
  }

  // 7. Measurements
  if (isIncluded('measurements')) {
    mdParts.push(`## 7. Quantitative Measurements`);
    if (evidenceBundle?.measurements) {
      mdParts.push(`### Photometric Measurements`);
      for (const m of evidenceBundle.measurements.photometric) {
        mdParts.push(`- **${m.label} (${m.parameter}):** ${m.flux !== null ? `${m.flux} ${m.fluxUnit}` : 'N/A'}${m.fluxUncertainty ? ` ± ${m.fluxUncertainty} ${m.fluxUnit}` : ''} [${m.validationStatus}]`);
      }
      mdParts.push(`\n### Astrometric Measurements`);
      for (const m of evidenceBundle.measurements.astrometric) {
        mdParts.push(`- **${m.label} (${m.parameter}):** ${m.raDeg !== null ? `RA ${m.raDeg}°, Dec ${m.decDeg}°` : 'Proper motion centroid'}${m.positionalUncertaintyArcsec ? ` (±${m.positionalUncertaintyArcsec}″)` : ''} [${m.validationStatus}]`);
      }
    } else {
      mdParts.push(`- Measured flux density change: ${investigation.what_was_observed || 'Recorded in evidence dossier'}`);
    }
    mdParts.push('');
  }

  // 8. Uncertainties & Flags
  if (isIncluded('uncertainty_flags')) {
    mdParts.push(`## 8. Uncertainty Budget & Scientific Quality Flags`);
    if (evidenceBundle?.uncertainties) {
      mdParts.push(`- **Statistical Uncertainty:** ${evidenceBundle.uncertainties.statistical.value ?? 'N/A'} ${evidenceBundle.uncertainties.statistical.unit} (${evidenceBundle.uncertainties.statistical.status})`);
      mdParts.push(`- **Calibration Uncertainty:** ${evidenceBundle.uncertainties.calibration.value ?? 'N/A'} ${evidenceBundle.uncertainties.calibration.unit} (${evidenceBundle.uncertainties.calibration.status})`);
      mdParts.push(`- **Background Subtraction Uncertainty:** ${evidenceBundle.uncertainties.background.value ?? 'N/A'} ${evidenceBundle.uncertainties.background.unit} (${evidenceBundle.uncertainties.background.status})`);
    }
    if (evidenceBundle?.qualityFlags && evidenceBundle.qualityFlags.length > 0) {
      mdParts.push(`\n### Quality Flags`);
      for (const qf of evidenceBundle.qualityFlags) {
        mdParts.push(`- **[${qf.severity.toUpperCase()}] ${qf.name}:** ${qf.description} (Source: ${qf.source})`);
      }
    }
    mdParts.push('');
  }

  // 9. Evidence Ledger
  if (isIncluded('evidence_ledger')) {
    mdParts.push(`## 9. Associated Evidence Ledger Items`);
    if (investigation.evidence_items.length > 0) {
      for (const item of investigation.evidence_items) {
        mdParts.push(`- **[${item.type.toUpperCase()}] ${item.title}:** ${item.description} (Ref: \`${item.source_reference}\`)`);
      }
    } else {
      mdParts.push(`*No secondary evidence items logged for this investigation.*`);
    }
    mdParts.push('');
  }

  // 10. Provenance
  if (isIncluded('provenance')) {
    mdParts.push(`## 10. Data Provenance & Reduction Lineage`);
    mdParts.push(`- **Provenance Lineage Status:** ${reproducibility.provenanceStatus}`);
    mdParts.push(`- **Data Source Classification:** ${reproducibility.dataSourceClassification}`);
    mdParts.push(`- **Notice:** This is a frontend demonstration fixture. Live pipeline verification and cryptographic audit hashes require server-side backend integration.\n`);
  }

  // 11. Working Hypotheses
  if (isIncluded('explanations')) {
    mdParts.push(`## 11. Working Hypotheses & Astrophysical Explanations`);
    const customExpl = getUserText('explanations') || investigation.possible_explanation;
    mdParts.push(customExpl || 'No working hypothesis logged.');
    mdParts.push('');
  }

  // 12. Limitations & Unknowns
  if (isIncluded('limitations')) {
    mdParts.push(`## 12. Epistemic Unknowns & Systematic Limitations`);
    const customLimit = getUserText('limitations') || investigation.uncertainty;
    mdParts.push(customLimit || 'No limitations recorded.');
    mdParts.push('');
  }

  // 13. Required Follow-up
  if (isIncluded('validation_required')) {
    mdParts.push(`## 13. Required Follow-up Validation & Next Steps`);
    const customFollowup = getUserText('validation_required') || reportData.userConclusion;
    mdParts.push(customFollowup || '- High-resolution NIR spectroscopy (e.g. JWST NIRSpec or ground-based 8m class) to confirm chemical composition and redshift.\n- Multi-epoch optical monitoring to rule out stellar flare contamination.\n- Backend FITS re-reduction when live SPHEREx Level 2 archive pipeline is available.');
    mdParts.push('');
  }

  // 14. Reproducibility
  if (isIncluded('reproducibility')) {
    mdParts.push(`## 14. Reproducibility Parameters & Backend Availability`);
    mdParts.push(`- **Investigation Ref:** ${reproducibility.investigationId}`);
    mdParts.push(`- **Target Ref:** ${reproducibility.targetId}`);
    mdParts.push(`- **Observations:** ${reproducibility.observationIds.join(', ') || 'None'}`);
    mdParts.push(`\n### Unavailable Backend Metadata (Required for Production Reproducibility)`);
    for (const item of reproducibility.unavailableBackendMetadata) {
      mdParts.push(`- ⚠️ ${item}`);
    }
    mdParts.push('');
  }

  // 15. References
  if (isIncluded('references')) {
    mdParts.push(`## 15. References, Software Attribution & Scientific Disclaimers`);
    mdParts.push(`- **Application:** AFTERLIGHT (${reproducibility.applicationVersion})`);
    mdParts.push(`- **Team:** Team ASTRION (NASA SPHEREx Hackathon)`);
    mdParts.push(`- **Mission Context:** NASA SPHEREx (Spectro-Photometer for the History of the Universe, Epoch of Reionization, and Ices Explorer)`);
    mdParts.push(`- **Demonstration Notice:** All measurements and assessments in this report are demonstration artifacts and do not represent verified NASA SPHEREx mission data.`);
  }

  return mdParts.join('\n');
}

export function generateScientificReportJson(reportData: CompleteScientificReportData) {
  return {
    schema_version: 'AFTERLIGHT-SCIENTIFIC-REPORT-V1',
    report_id: reportData.reportId,
    generated_at_utc: reportData.generatedAtUtc,
    is_demonstration_only: true,
    disclaimer:
      'DEMONSTRATION REPORT ONLY — Generated by AFTERLIGHT frontend. Measurements, difference maps, and quality flags are demonstration fixtures and do not represent verified NASA SPHEREx scientific results.',
    executive_summary: reportData.userExecutiveSummary ?? null,
    research_objective: reportData.userResearchObjective ?? reportData.investigation.research_objective ?? null,
    conclusion_and_next_steps: reportData.userConclusion ?? null,
    investigation: reportData.investigation,
    evidence_bundle: reportData.evidenceBundle,
    reproducibility_parameters: reportData.reproducibility,
    included_sections: reportData.sections.filter((s) => s.included).map((s) => ({
      id: s.id,
      title: s.title,
      custom_text: s.userText ?? null,
    })),
  };
}

export function triggerReportMarkdownDownload(reportData: CompleteScientificReportData) {
  const md = generateScientificReportMarkdown(reportData);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${reportData.investigation.id}_scientific_report.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function triggerReportJsonDownload(reportData: CompleteScientificReportData) {
  const jsonPayload = generateScientificReportJson(reportData);
  const blob = new Blob([JSON.stringify(jsonPayload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${reportData.investigation.id}_scientific_report.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function triggerReportPrint() {
  window.print();
}
