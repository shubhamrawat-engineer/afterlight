import { LoadingIndicator } from './LoadingIndicator';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  fullHeight?: boolean;
  className?: string;
}

/**
 * Reusable LoadingState component for asynchronous views and scientific panels.
 */
export function LoadingState({
  message = 'Loading astronomical records...',
  size = 'lg',
  fullPage = false,
  fullHeight = false,
  className,
}: LoadingStateProps) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullPage || fullHeight
          ? 'min-h-[calc(100vh-var(--navbar-height))] bg-[#060810]'
          : 'min-h-[260px] rounded-2xl border border-slate-800/80 bg-slate-900/50 p-8'
      } ${className ?? ''}`}
    >
      <LoadingIndicator size={size} message={message} />
    </div>
  );
}
