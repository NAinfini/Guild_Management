import { describe, expect, it } from 'vitest';
import { getVisibleParticipants } from '@/features/Events/Events.participants';

describe('Events participant preview', () => {
  it('shows only the first 10 participants by default and reports hidden count', () => {
    const participants = Array.from({ length: 14 }, (_, idx) => ({ id: `${idx + 1}` }));

    const result = getVisibleParticipants(participants, false, 10);

    expect(result.visibleParticipants).toHaveLength(10);
    expect(result.hiddenCount).toBe(4);
  });

  it('shows all participants when expanded', () => {
    const participants = Array.from({ length: 14 }, (_, idx) => ({ id: `${idx + 1}` }));

    const result = getVisibleParticipants(participants, true, 10);

    expect(result.visibleParticipants).toHaveLength(14);
    expect(result.hiddenCount).toBe(0);
  });
});
