import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/gallery')({
  component: lazyRouteComponent(() => import('../../features/Gallery'), 'Gallery'),
})
