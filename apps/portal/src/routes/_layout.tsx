import { createFileRoute } from '@tanstack/react-router'
import { AppShell } from '@/layouts'

// Make the app shell the root path
export const Route = createFileRoute('/_layout')({
  component: AppShell,
})
