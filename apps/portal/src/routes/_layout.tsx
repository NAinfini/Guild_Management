import { createFileRoute } from '@tanstack/react-router'
import { Layout } from '../components/Layout'

// Make the app shell the root path
export const Route = createFileRoute('/_layout')({
  component: Layout,
})
