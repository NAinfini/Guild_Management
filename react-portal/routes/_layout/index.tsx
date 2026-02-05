import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

// Root index renders Dashboard
export const Route = createFileRoute('/_layout/')({
  component: lazyRouteComponent(() => import('../../features/Dashboard'), 'Dashboard'),
})
