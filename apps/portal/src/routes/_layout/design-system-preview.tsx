import { createFileRoute, lazyRouteComponent } from '@tanstack/react-router';

/**
 * Dedicated route for primitive showcase during phased frontend migration.
 * This stays isolated from product pages so component hardening can iterate safely.
 */
export const Route = createFileRoute('/_layout/design-system-preview')({
  component: lazyRouteComponent(() => import('../../features/DesignSystemPreview'), 'DesignSystemPreview'),
});
