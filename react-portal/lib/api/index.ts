/**
 * API Services Index
 * Central export for all API services
 */

export { eventsAPI } from './events';
export { announcementsAPI } from './announcements';
export { membersAPI } from './members';
export { mediaAPI } from './media';
export { warsAPI } from './wars';
export { adminAPI } from './admin';

// Re-export specific API input types
export type { CreateEventData } from './events';
export type { CreateAnnouncementData } from './announcements';
export type { UpdateProfileData, AvailabilityBlock, ProgressionItem } from './members';
// Data types
export type { WarTeam, WarHistoryEntry as WarHistory, WarMemberStat as MemberStats } from '../../types';
// Data types (MediaObject might be in media.ts)
// export type { MediaObject } from './media'; 
// (If media.ts was not refactored yet, check it. Assuming it is valid or I will remove it to be safe if not used)

// For Domain Entities (User, Event, etc.), import directly from '@/types' (src/types.ts)
