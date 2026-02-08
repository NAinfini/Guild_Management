import { describe, expect, it } from 'vitest';
import { computePollingInterval } from '@/hooks/useServerState';

describe('useServerState polling strategy', () => {
  it('disables fallback polling when push is connected', () => {
    const interval = computePollingInterval(
      { enabled: true, intervalMs: 60_000, fallbackOnly: true, visibleOnly: true },
      { pushConnected: true, isVisible: true, random: () => 0.5 }
    );

    expect(interval).toBe(false);
  });

  it('enables fallback polling when push is disconnected', () => {
    const interval = computePollingInterval(
      { enabled: true, intervalMs: 60_000, fallbackOnly: true, visibleOnly: true },
      { pushConnected: false, isVisible: true, random: () => 0.5 }
    );

    expect(interval).toBe(60_000);
  });

  it('stops visible-only polling when page is hidden', () => {
    const interval = computePollingInterval(
      { enabled: true, intervalMs: 600_000, fallbackOnly: false, visibleOnly: true },
      { pushConnected: false, isVisible: false, random: () => 0.5 }
    );

    expect(interval).toBe(false);
  });

  it('applies jittered interval when polling is active', () => {
    const minInterval = computePollingInterval(
      { enabled: true, intervalMs: 100_000, fallbackOnly: false, visibleOnly: false },
      { pushConnected: false, isVisible: true, random: () => 0 }
    );
    const maxInterval = computePollingInterval(
      { enabled: true, intervalMs: 100_000, fallbackOnly: false, visibleOnly: false },
      { pushConnected: false, isVisible: true, random: () => 1 }
    );

    expect(minInterval).toBe(90_000);
    expect(maxInterval).toBe(110_000);
  });
});
