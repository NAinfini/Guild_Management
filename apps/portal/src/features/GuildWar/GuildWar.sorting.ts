import type { User } from '../../types';

export type GuildWarSortField = 'power' | 'class';
export type GuildWarSortDirection = 'asc' | 'desc';

export type GuildWarSortState = {
  field: GuildWarSortField;
  direction: GuildWarSortDirection;
};

export function sortGuildWarMembers<T extends Pick<User, 'power' | 'classes'>>(
  members: T[],
  state: GuildWarSortState,
): T[] {
  const sorted = [...members].sort((a, b) => {
    if (state.field === 'power') {
      return (a.power || 0) - (b.power || 0);
    }
    return (a.classes?.[0] || '').localeCompare(b.classes?.[0] || '');
  });

  return state.direction === 'desc' ? sorted.reverse() : sorted;
}

export function nextGuildWarSortState(
  current: GuildWarSortState,
  field: GuildWarSortField,
): GuildWarSortState {
  if (current.field === field) {
    return {
      field,
      direction: current.direction === 'asc' ? 'desc' : 'asc',
    };
  }
  return { field, direction: 'desc' };
}
