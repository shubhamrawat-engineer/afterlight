import { Link } from 'react-router-dom';
import { ExternalLink, ArrowUpRight, BookOpen, Layers } from 'lucide-react';
import type { AISourceReference } from '../types/cosmos-ai.types';
import { isValidInternalAppRoute } from '../services/cosmos-ai-service';

interface SourceReferencesProps {
  references: AISourceReference[];
}

export function SourceReferences({ references }: SourceReferencesProps) {
  if (references.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {references.map((ref) => {
        if (ref.internalRoute && isValidInternalAppRoute(ref.internalRoute)) {
          return (
            <Link
              key={ref.id}
              to={ref.internalRoute}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-cyan-300 hover:text-white hover:border-cyan-500/60 transition-colors"
            >
              <Layers className="w-3 h-3 text-cyan-400" />
              <span>{ref.title}</span>
              <ArrowUpRight className="w-3 h-3 opacity-60" />
            </Link>
          );
        }

        if (ref.referenceUrl && (ref.referenceUrl.startsWith('http://') || ref.referenceUrl.startsWith('https://'))) {
          return (
            <a
              key={ref.id}
              href={ref.referenceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-700/80 text-[11px] font-mono text-blue-300 hover:text-white hover:border-blue-500/60 transition-colors"
            >
              <BookOpen className="w-3 h-3 text-blue-400" />
              <span>{ref.title}</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          );
        }

        return (
          <span
            key={ref.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300"
          >
            <span>{ref.title}</span>
          </span>
        );
      })}
    </div>
  );
}
