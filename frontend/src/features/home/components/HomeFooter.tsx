import { Link } from 'react-router-dom';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Minimalist astronomical footer matching SECTION E requirements.
 * Features NASA/IPAC IRSA & SPHEREx attribution with proper disclaimers
 * and quick exploration pathways.
 */
export function HomeFooter() {
  return (
    <footer
      aria-label="AFTERLIGHT Observatory Footer"
      className="mt-16 border-t border-slate-800/80 bg-[rgba(6,9,18,0.85)] pt-10 pb-8 backdrop-blur-md"
    >
      <div className="mx-auto flex flex-col justify-between gap-8 px-4 sm:px-6 lg:px-8" style={{ maxWidth: 'var(--content-max-width)' }}>
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          {/* Left: NASA / SPHEREx Attribution */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-sm bg-blue-950/80 px-2 py-0.5 text-[11px] font-semibold tracking-wider text-blue-300 border border-blue-500/20">
                SPHEREx
              </span>
              <span className="text-xs font-semibold text-slate-200">
                Powered by SPHEREx
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Astronomical archives courtesy of <span className="text-slate-300 font-medium">NASA / IPAC IRSA</span>
            </p>
          </div>

          {/* Center / Right: Navigation Explorations */}
          <nav aria-label="Footer Navigation" className="flex flex-wrap items-center gap-6">
            <Link
              to="/explore"
              className="text-xs font-medium text-slate-400 transition-colors hover:text-blue-300"
            >
              Explore
            </Link>
            <span className="text-slate-700" aria-hidden="true">•</span>
            <Link
              to="/explore?flow=spectral"
              className="text-xs font-medium text-slate-400 transition-colors hover:text-blue-300"
            >
              Understand
            </Link>
            <span className="text-slate-700" aria-hidden="true">•</span>
            <Link
              to="/investigations"
              className="text-xs font-medium text-slate-400 transition-colors hover:text-blue-300"
            >
              Investigate
            </Link>
          </nav>
        </div>

        {/* Subtle Horizontal Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-800 to-transparent" />

        {/* Bottom Legal Attribution */}
        <div className="flex flex-col items-center justify-between gap-3 text-[11px] text-slate-400 sm:flex-row">
          <p>
            &copy; {CURRENT_YEAR} Team ASTRION. Developed for the NASA Space Apps / Astronomical Research Initiative.
          </p>
          <p className="text-slate-400">
            SPHEREx data accessed via AFTERLIGHT scientific backend. Not an official NASA endorsement.
          </p>
        </div>
      </div>
    </footer>
  );
}
