import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/guild-war')({
  component: lazyRouteComponent(() => import('../../pages/GuildWar'), 'GuildWar'),
})
