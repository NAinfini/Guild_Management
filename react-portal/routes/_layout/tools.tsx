import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/tools')({
  component: lazyRouteComponent(() => import('../../pages/Tools'), 'Tools'),
})
