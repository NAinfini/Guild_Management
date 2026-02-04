# D1 Schema Optimization Guide

-- D1-Compatible Schema (Triggers Removed for Compatibility)
This guide provides strategies for optimizing your Cloudflare D1 database schema for performance and scalability.
-- All trigger-based validation moved to application layer

-- Comment out all triggers - D1 has limited trigger support
-- Instead, enforce these rules in the application code:

/*
TRIGGERS REMOVED FOR D1 COMPATIBILITY:
- trg_gallery_images_storage_type
- trg_member_media_quota_images  
- trg_member_media_quota_video
- trg_member_media_storage_type
- trg_announcement_media_storage_type
- trg_announcement_media_quota
- trg_event_attachments_storage_type
- trg_event_attachments_quota
- trg_war_team_member_war_id_match_ins
- trg_war_team_member_war_id_match_upd
- trg_war_pool_no_team
- trg_war_team_no_pool

APPLICATION-LEVEL VALIDATION REQUIRED:
1. Gallery images must be R2 (not external URLs)
2. Member media quotas: max 10 images, max 10 videos per user
3. Member images/audio must be R2, video_url must be external_url
4. Announcement media must be R2, max 10 per announcement
5. Event attachments must be R2, max 5 per event
6. War team member consistency checks
7. Pool/team member exclusivity

These validations should be added to the API endpoints.
*/

-- To fix your schema, run this command to remove all triggers:
-- This creates a clean D1-compatible schema

SELECT 'D1 Optimization: Remove all CREATE TRIGGER statements from D1_Schema.sql';
SELECT 'Then apply the modified schema to your database';
