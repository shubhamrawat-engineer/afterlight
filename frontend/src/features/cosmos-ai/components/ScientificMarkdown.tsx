import React from 'react';

interface ScientificMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Lightweight scientific markdown & math renderer.
 * Formats headers, lists, code, bold, italic, and converts LaTeX mathematical
 * formulas (e.g., \Delta F_\nu, \pm, \mu\text{Jy}, \sigma, ^{\prime\prime}) into readable scientific typography.
 */
export const ScientificMarkdown: React.FC<ScientificMarkdownProps> = ({
  content,
  className = '',
}) => {
  // Clean and render math snippets into readable Unicode/HTML approximations
  const renderMath = (math: string): string => {
    return math
      .replace(/\\Delta\s*/g, 'Δ')
      .replace(/\\approx\s*/g, '≈')
      .replace(/\\pm\s*/g, '±')
      .replace(/\\mu\s*/g, 'μ')
      .replace(/\\sigma\s*/g, 'σ')
      .replace(/\\lambda\s*/g, 'λ')
      .replace(/\\nu\s*/g, 'ν')
      .replace(/\\text\{([^{}]+)\}/g, '$1')
      .replace(/\\mathrm\{([^{}]+)\}/g, '$1')
      .replace(/\\quad\s*/g, '  ')
      .replace(/\\,/g, ' ')
      .replace(/\^\{\\prime\\prime\}/g, '″')
      .replace(/\^\{\\prime\}/g, '′')
      .replace(/\^\{([^{}]+)\}/g, '<sup>$1</sup>')
      .replace(/_\{([^{}]+)\}/g, '<sub>$1</sub>')
      .replace(/_([a-zA-Z0-9])/g, '<sub>$1</sub>');
  };

  const lines = (content || '').split('\n');

  return (
    <div className={`space-y-2 text-sm leading-relaxed text-slate-200 ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Headers
        if (trimmed.startsWith('### ')) {
          const headerText = trimmed.substring(4);
          if (headerText.includes('💡') || headerText.toLowerCase().includes('simple terms')) {
            return (
              <h3 key={idx} className="text-sm font-semibold text-amber-300 bg-amber-500/10 border border-amber-500/25 px-3 py-1.5 rounded-lg flex items-center gap-2 mt-3 mb-1.5">
                {headerText}
              </h3>
            );
          }
          if (headerText.includes('🔍') || headerText.toLowerCase().includes('numbers & units')) {
            return (
              <h3 key={idx} className="text-sm font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/25 px-3 py-1.5 rounded-lg flex items-center gap-2 mt-3 mb-1.5">
                {headerText}
              </h3>
            );
          }
          if (headerText.includes('🔬') || headerText.toLowerCase().includes('scientific breakdown')) {
            return (
              <h3 key={idx} className="text-sm font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/25 px-3 py-1.5 rounded-lg flex items-center gap-2 mt-3 mb-1.5">
                {headerText}
              </h3>
            );
          }
          return (
            <h3 key={idx} className="text-base font-semibold text-sky-300 pt-2 pb-1 border-b border-sky-900/40">
              {headerText}
            </h3>
          );
        }
        if (trimmed.startsWith('#### ')) {
          return (
            <h4 key={idx} className="text-sm font-semibold text-slate-100 pt-1.5 pb-0.5">
              {trimmed.substring(5)}
            </h4>
          );
        }

        // Bullet lists
        if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
          const bulletText = trimmed.substring(2);
          return (
            <div key={idx} className="flex items-start space-x-2 pl-2">
              <span className="text-sky-400 mt-1 text-xs">•</span>
              <div
                className="flex-1"
                dangerouslySetInnerHTML={{
                  __html: formatInlineFormatting(bulletText, renderMath),
                }}
              />
            </div>
          );
        }

        // Numbered lists
        const numberedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (numberedMatch) {
          return (
            <div key={idx} className="flex items-start space-x-2 pl-2">
              <span className="text-amber-400 font-mono text-xs mt-0.5">{numberedMatch[1]}.</span>
              <div
                className="flex-1"
                dangerouslySetInnerHTML={{
                  __html: formatInlineFormatting(numberedMatch[2], renderMath),
                }}
              />
            </div>
          );
        }

        // Standard paragraphs
        return (
          <p
            key={idx}
            dangerouslySetInnerHTML={{
              __html: formatInlineFormatting(line, renderMath),
            }}
          />
        );
      })}
    </div>
  );
};

function formatInlineFormatting(text: string, renderMath: (m: string) => string): string {
  // Replace display math $$...$$
  let formatted = text.replace(/\$\$([^$]+)\$\$/g, (_, math) => {
    return `<span class="inline-block my-1 px-2 py-0.5 rounded bg-slate-900 border border-sky-900/50 text-sky-200 font-mono text-xs">${renderMath(
      math
    )}</span>`;
  });

  // Replace inline math $...$
  formatted = formatted.replace(/\$([^$]+)\$/g, (_, math) => {
    return `<span class="font-mono text-sky-300 bg-sky-950/40 px-1 py-0.5 rounded text-xs border border-sky-800/30">${renderMath(
      math
    )}</span>`;
  });

  // Replace bold **text**
  formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-100">$1</strong>');

  // Replace italic *text*
  formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-slate-300">$1</em>');

  // Replace inline code `code`
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="font-mono text-xs bg-slate-900 px-1 py-0.5 rounded text-amber-300 border border-slate-700/60">$1</code>');

  return formatted;
}
