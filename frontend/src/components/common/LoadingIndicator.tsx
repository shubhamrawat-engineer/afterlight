import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LoadingIndicatorProps {
  /** Optional message to display below the spinner. */
  message?: string;
  /** Size variant. */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes. */
  className?: string;
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
} as const;

/**
 * Reusable loading indicator with an animated spinner.
 */
export function LoadingIndicator({
  message,
  size = 'md',
  className,
}: LoadingIndicatorProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3',
        className,
      )}
      role="status"
      aria-label={message ?? 'Loading'}
    >
      <Loader2
        className={cn('animate-spin', sizeMap[size])}
        style={{ color: 'var(--color-accent-primary)' }}
      />
      {message && (
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {message}
        </p>
      )}
    </div>
  );
}
