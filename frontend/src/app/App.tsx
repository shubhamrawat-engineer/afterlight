import { Suspense, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { LoadingIndicator } from '../components/common/LoadingIndicator';

interface AppLayoutProps {
  /** Optional children for error-element rendering where Outlet is not used. */
  children?: ReactNode;
}

/**
 * Root layout component used by the router.
 * Wraps all route content with ErrorBoundary, Suspense, and MainLayout.
 */
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ErrorBoundary>
      <MainLayout>
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <LoadingIndicator size="lg" message="Loading scientific module..." />
            </div>
          }
        >
          {children ?? <Outlet />}
        </Suspense>
      </MainLayout>
    </ErrorBoundary>
  );
}
