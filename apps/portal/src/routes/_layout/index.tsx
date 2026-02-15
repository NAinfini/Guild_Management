import React from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Skeleton } from '@/components/primitives';

const Dashboard = React.lazy(() =>
  import('../../features/Dashboard').then((module) => ({ default: module.Dashboard })),
);

function DashboardRoute() {
  return (
    <React.Suspense fallback={<Skeleton variant="rectangular" aria-label="Loading dashboard" className="min-h-[24rem] w-full" />}>
      <Dashboard />
    </React.Suspense>
  );
}

// Root dashboard route now resolves directly to the migrated default dashboard component.
export const Route = createFileRoute('/_layout/')({
  component: DashboardRoute,
});
