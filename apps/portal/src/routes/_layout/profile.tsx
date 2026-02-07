import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/profile')({
  component: lazyRouteComponent(() => import('../../features/Profile'), 'Profile'),
})
