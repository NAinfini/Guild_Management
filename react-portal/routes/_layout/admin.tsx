import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/admin')({
  component: lazyRouteComponent(() => import('../../features/Admin'), 'Admin'),
})
