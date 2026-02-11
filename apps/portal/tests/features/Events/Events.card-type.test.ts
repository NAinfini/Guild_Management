import { describe, expect, it } from 'vitest';
import { getEventTypeFallbackTone, getEventTypeLabel } from '@/features/Events';

describe('Events card type mapping', () => {
  const t = (key: string) => key;

  it('uses localized label keys instead of raw type strings', () => {
    expect(getEventTypeLabel('weekly_mission', t as any)).toBe('events.filter_weekly');
    expect(getEventTypeLabel('guild_war', t as any)).toBe('events.filter_guild');
    expect(getEventTypeLabel('other', t as any)).toBe('events.filter_other');
  });

  it('uses distinct fallback tones for weekly and guild war pills', () => {
    const weekly = getEventTypeFallbackTone('weekly_mission');
    const war = getEventTypeFallbackTone('guild_war');

    expect(weekly.bg).not.toBe(war.bg);
    expect(weekly.border).not.toBe(war.border);
  });
});

