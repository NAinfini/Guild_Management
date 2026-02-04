import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/announcements')({
  component: lazyRouteComponent(() => import('../../pages/Announcements'), 'Announcements'),
})
