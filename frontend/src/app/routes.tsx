/* oxlint-disable react/only-export-components */
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import { AppLayout } from './App';
import { NotFoundPage } from '../components/common/NotFoundPage';

// Lazy-loaded Feature Pages for optimal code-splitting and performance
const HomePage = lazy(() =>
  import('../features/home/HomePage').then((m) => ({ default: m.HomePage }))
);
const ExplorerPage = lazy(() =>
  import('../features/explorer/ExplorerPage').then((m) => ({ default: m.ExplorerPage }))
);
const TargetDetailPage = lazy(() =>
  import('../features/explorer/ExplorerPage').then((m) => ({ default: m.TargetDetailPage }))
);
const ObservationsPage = lazy(() =>
  import('../features/observations/ObservationsPage').then((m) => ({ default: m.ObservationsPage }))
);
const CompatibilityPage = lazy(() =>
  import('../features/compatibility/CompatibilityPage').then((m) => ({
    default: m.CompatibilityPage,
  }))
);
const TemporalAnalysisPage = lazy(() =>
  import('../features/temporal-analysis/TemporalAnalysisPage').then((m) => ({
    default: m.TemporalAnalysisPage,
  }))
);
const EvidencePage = lazy(() =>
  import('../features/evidence/EvidencePage').then((m) => ({ default: m.EvidencePage }))
);
const SpectralAnalysisPage = lazy(() =>
  import('../features/spectral-analysis/SpectralAnalysisPage').then((m) => ({
    default: m.SpectralAnalysisPage,
  }))
);
const ObjectsPage = lazy(() =>
  import('../features/object-intelligence/ObjectIntelligencePage').then((m) => ({
    default: m.ObjectsPage,
  }))
);
const ObjectDetailPage = lazy(() =>
  import('../features/object-intelligence/ObjectIntelligencePage').then((m) => ({
    default: m.ObjectDetailPage,
  }))
);
const InvestigationsPage = lazy(() =>
  import('../features/investigations/InvestigationsPage').then((m) => ({
    default: m.InvestigationsPage,
  }))
);
const NewInvestigationPage = lazy(() =>
  import('../features/investigations/InvestigationsPage').then((m) => ({
    default: m.NewInvestigationPage,
  }))
);
const InvestigationDetailPage = lazy(() =>
  import('../features/investigations/InvestigationsPage').then((m) => ({
    default: m.InvestigationDetailPage,
  }))
);
const CosmosAiPage = lazy(() =>
  import('../features/cosmos-ai/CosmosAiPage').then((m) => ({ default: m.CosmosAiPage }))
);

/**
 * Application router configuration.
 *
 * All routes are wrapped in the shared AppLayout which provides
 * Navbar, Footer, ErrorBoundary, and Suspense.
 */
export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: (
      <AppLayout>
        <NotFoundPage />
      </AppLayout>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'explore',
        element: <ExplorerPage />,
      },
      {
        path: 'explore/:targetId',
        element: <TargetDetailPage />,
      },
      {
        path: 'observations/:targetId',
        element: <ObservationsPage />,
      },
      {
        path: 'compatibility/:targetId',
        element: <CompatibilityPage />,
      },
      {
        path: 'temporal-analysis/:targetId',
        element: <TemporalAnalysisPage />,
      },
      {
        path: 'evidence/:targetId',
        element: <EvidencePage />,
      },
      {
        path: 'spectral-lab/:targetId',
        element: <SpectralAnalysisPage />,
      },
      {
        path: 'objects',
        element: <ObjectsPage />,
      },
      {
        path: 'objects/:objectId',
        element: <ObjectDetailPage />,
      },
      {
        path: 'investigations',
        element: <InvestigationsPage />,
      },
      {
        path: 'investigations/new',
        element: <NewInvestigationPage />,
      },
      {
        path: 'investigations/:caseId',
        element: <InvestigationDetailPage />,
      },
      {
        path: 'ai',
        element: <CosmosAiPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
