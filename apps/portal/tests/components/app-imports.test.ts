import { describe, expect, it } from 'vitest';

describe('app component module imports', () => {
  it('resolves app component modules from their current folder', async () => {
    await expect(import('@/components/navigation/BottomNavigation')).resolves.toBeDefined();
    await expect(import('@/components/data-display/HealthStatus')).resolves.toBeDefined();
    await expect(import('@/layouts')).resolves.toBeDefined();
    await expect(import('@/features/Auth/components/ProtectedRoute')).resolves.toBeDefined();
    await expect(import('@/features/Auth/components/SessionExpiredModal')).resolves.toBeDefined();
    await expect(import('@/features/Auth/components/SessionInitializer')).resolves.toBeDefined();
  }, 30000);
});
