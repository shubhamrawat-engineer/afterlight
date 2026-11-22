import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
import { IconButton } from '../ui/IconButton';

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Explore', href: '/explore' },
  { label: 'Objects', href: '/objects' },
  { label: 'Investigations', href: '/investigations' },
  { label: 'Cosmos AI', href: '/ai' },
];

/** Four-point astronomical star emblem */
function FourPointStar({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className ?? 'h-4 w-4'}
      aria-hidden="true"
    >
      <path d="M12 0L14.7 9.3L24 12L14.7 14.7L12 24L9.3 14.7L0 12L9.3 9.3L12 0Z" />
    </svg>
  );
}

/**
 * Refined AFTERLIGHT Global Navigation Bar.
 * Features 4D Spacetime Telemetry and streamlined astronomical controls.
 */
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isRouteActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-50 h-16 border-b border-[#1A2940] bg-[rgba(7,11,20,0.86)] backdrop-blur-xl transition-all">
      <nav
        className="mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8 md:grid md:grid-cols-[1fr_auto_1fr]"
        style={{ maxWidth: 'var(--content-max-width)' }}
        aria-label="Global Navigation"
      >
        {/* Left Zone: Branding */}
        <div className="flex items-center justify-start gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-lg py-1.5 pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="AFTERLIGHT Home"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#4388FF]/35 bg-[#101A2B] text-[#45D5F2] shadow-sm">
              <FourPointStar className="h-4 w-4" />
            </div>
            <span className="font-[family-name:var(--font-display)] text-[15px] font-semibold tracking-[0.18em] text-[#F4F7FF] transition-colors hover:text-white">
              AFTERLIGHT
            </span>
          </Link>
        </div>

        {/* Center Zone: Desktop Navigation Links */}
        <div className="hidden md:flex md:items-center md:justify-center md:gap-1.5">
          {NAV_ITEMS.map((item) => {
            const active = isRouteActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'relative inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-[14px] font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#45D5F2]',
                  active
                    ? 'bg-[#4388FF]/14 text-[#F4F7FF]'
                    : 'text-[#8293AD] hover:bg-[#131F33]/80 hover:text-[#F4F7FF]',
                )}
              >
                <span>{item.label}</span>
                {active && (
                  <span
                    className="absolute -bottom-[13px] left-3 right-3 h-[2px] rounded-full bg-gradient-to-r from-[#4388FF] to-[#45D5F2]"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Zone: Desktop Actions */}
        <div className="hidden items-center justify-end md:flex" />

        {/* Mobile Menu Controls */}
        <div className="flex items-center gap-2 md:hidden">
          <IconButton
            size="sm"
            variant="ghost"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </IconButton>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[#24344D] bg-[rgba(7,11,20,0.97)] backdrop-blur-xl md:hidden">
          <div className="mx-auto space-y-1.5 px-4 pt-3 pb-5 sm:px-6">
            {NAV_ITEMS.map((item) => {
              const active = isRouteActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center rounded-lg px-3.5 py-2.5 text-[14px] font-medium transition-colors',
                    active
                      ? 'bg-[#4388FF]/15 text-[#F4F7FF]'
                      : 'text-[#B5C2D6] hover:bg-[#131F33] hover:text-[#F4F7FF]',
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
