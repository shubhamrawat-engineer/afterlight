import { Link } from 'react-router-dom';
import { Home, Compass } from 'lucide-react';

/**
 * 404 Not Found page displayed for unmatched routes.
 */
export function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="flex flex-col items-center gap-2">
        <Compass
          className="h-16 w-16"
          style={{ color: 'var(--color-text-tertiary)' }}
        />
        <h1
          className="text-6xl font-bold tracking-tight"
          style={{ color: 'var(--color-text-primary)' }}
        >
          404
        </h1>
      </div>

      <div className="flex flex-col items-center gap-2">
        <h2
          className="text-xl font-semibold"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          Lost in Space
        </h2>
        <p
          className="max-w-md text-sm"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          The coordinates you entered don&apos;t match any known region. The page
          you&apos;re looking for may have been moved or doesn&apos;t exist.
        </p>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-colors"
        style={{
          background: 'var(--color-accent-primary)',
          color: 'var(--color-text-primary)',
        }}
      >
        <Home className="h-4 w-4" />
        Return Home
      </Link>
    </div>
  );
}
