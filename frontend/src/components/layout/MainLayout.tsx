import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

/**
 * Main application layout wrapper.
 * Provides consistent Navbar, content area, and Footer across standard scrollable routes.
 */
export function MainLayout({ children }: MainLayoutProps) {
  const { pathname } = useLocation();
  const isFullViewportWorkspace = pathname.startsWith('/ai');

  return (
    <div className="flex min-h-screen flex-col" style={{ background: 'var(--color-bg-primary)' }}>
      <Navbar />
      <main
        className="flex-1"
        style={{ paddingTop: 'var(--navbar-height)' }}
      >
        {children}
      </main>
      {!isFullViewportWorkspace && <Footer />}
    </div>
  );
}
