import { Bot, Sparkles, ArrowLeft, BookOpen } from 'lucide-react';
import { AIAvailabilityIndicator } from './AIAvailabilityIndicator';
import type { AIAvailabilityStatus } from '../types/cosmos-ai.types';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

interface CosmosAIHeaderProps {
  status: AIAvailabilityStatus;
  statusDetails?: string | null;
}

export function CosmosAIHeader({ status, statusDetails }: CosmosAIHeaderProps) {
  return (
    <header className="rounded-xl border border-[rgba(148,163,184,0.13)] bg-[rgba(15,21,35,0.78)] p-6 backdrop-blur-md shadow-[0_2px_10px_rgba(2,6,23,0.4)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Left: Branding & Tagline */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-950/60 text-blue-400 shadow-sm">
            <Bot className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-page-heading text-slate-100">
                Cosmos AI
              </h1>
              <Badge variant="primary" icon={<Sparkles className="h-3 w-3 text-sky-400" />}>
                Intelligence
              </Badge>
            </div>
            <p className="mt-1 text-[14px] text-slate-400">
              Your intelligent guide to the universe.
            </p>
          </div>
        </div>

        {/* Right: Availability Indicator & Navigation Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <AIAvailabilityIndicator status={status} details={statusDetails} />

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<BookOpen className="h-3.5 w-3.5 text-cyan-400" />}
            onClick={() => {
              alert(
                'AI Backend Specification document located at frontend/docs/AI_BACKEND_REQUIREMENTS.md. Inspect file for full API payload and response contract specifications.'
              );
            }}
            title="Inspect proposed backend AI specification"
          >
            AI Specs
          </Button>

          <Button
            to="/"
            variant="secondary"
            size="sm"
            leftIcon={<ArrowLeft className="h-3.5 w-3.5" />}
          >
            Return to Afterlight
          </Button>
        </div>
      </div>
    </header>
  );
}
