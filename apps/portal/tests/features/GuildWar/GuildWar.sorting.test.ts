import { describe, expect, it } from 'vitest';
import { nextGuildWarSortState, sortGuildWarMembers } from '@/features/GuildWar/GuildWar.sorting';

describe('Guild War sorting helpers', () => {
  const members = [
    { id: '1', power: 300, classes: ['qiansi_lin'] as any },
    { id: '2', power: 100, classes: ['mingjin_ying'] as any },
    { id: '3', power: 200, classes: ['pozhu_chen'] as any },
  ];

  it('sorts by power ascending and descending', () => {
    const ascending = sortGuildWarMembers(members as any, { field: 'power', direction: 'asc' });
    const descending = sortGuildWarMembers(members as any, { field: 'power', direction: 'desc' });

    expect(ascending.map((member) => member.id)).toEqual(['2', '3', '1']);
    expect(descending.map((member) => member.id)).toEqual(['1', '3', '2']);
  });

  it('toggles sort direction when selecting the same field', () => {
    const first = nextGuildWarSortState({ field: 'power', direction: 'desc' }, 'power');
    const second = nextGuildWarSortState(first, 'power');

    expect(first).toEqual({ field: 'power', direction: 'asc' });
    expect(second).toEqual({ field: 'power', direction: 'desc' });
  });
});
