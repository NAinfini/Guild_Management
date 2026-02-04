import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/wiki')({
  component: lazyRouteComponent(() => import('../../pages/Wiki'), 'Wiki'),
})
