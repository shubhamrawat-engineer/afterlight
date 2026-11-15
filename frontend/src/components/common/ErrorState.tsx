import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

/**
 * Reusable accessible ErrorState panel for failed requests or missing manifests.
 */
export function ErrorState({
  title = 'Unable to Load Scientific Resource',
  message,
  onRetry,
  retryLabel = 'Retry Request',
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={`mx-auto flex max-w-2xl flex-col items-center justify-center rounded-xl border border-rose-500/35 bg-[#101A2B] p-8 text-center shadow-lg ${className ?? ''}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-rose-500/40 bg-rose-500/10 text-rose-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-[family-name:var(--font-display)] text-base font-semibold text-[#F4F7FF]">{title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-[#B5C2D6] max-w-md">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#4388FF] px-4 py-2 text-xs font-medium text-[#F4F7FF] hover:bg-[#5A9BFF] transition-colors cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>{retryLabel}</span>
        </button>
      )}
    </div>
  );
}
