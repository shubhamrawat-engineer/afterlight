import { Link } from 'react-router-dom';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Global application footer.
 * Provides consistent NASA / IPAC IRSA & SPHEREx attribution and observatory links.
 */
export function Footer() {
  return (
    <footer
      aria-label="AFTERLIGHT Application Footer"
      className="border-t border-[#1A2940] bg-[#070B14] py-6"
    >
      <div
        className="mx-auto flex flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8"
        style={{ maxWidth: 'var(--content-max-width)' }}
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center rounded-md bg-[#101A2B] px-2 py-0.5 font-[family-name:var(--font-display)] text-[10px] font-semibold tracking-wider text-[#45D5F2] border border-[#24344D]">
            SPHEREx
          </span>
          <span className="text-xs text-[#8293AD]">
            AFTERLIGHT Mission Concept &bull; NASA / IPAC IRSA Reference Workflow
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#8293AD]">
          <Link to="/explore" className="hover:text-[#F4F7FF] transition-colors">
            Explore
          </Link>
          <span className="text-[#24344D]">&bull;</span>
          <Link to="/objects" className="hover:text-[#F4F7FF] transition-colors">
            Objects
          </Link>
          <span className="text-[#24344D]">&bull;</span>
          <Link to="/investigations" className="hover:text-[#F4F7FF] transition-colors">
            Investigations
          </Link>
          <span className="text-[#24344D]">&bull;</span>
          <Link to="/ai" className="hover:text-[#F4F7FF] transition-colors">
            Cosmos AI
          </Link>
        </div>

        <p className="text-[11px] text-[#8293AD]">
          &copy; {CURRENT_YEAR} Team ASTRION
        </p>
      </div>
    </footer>
  );
}
