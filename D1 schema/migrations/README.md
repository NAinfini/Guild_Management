# Database Migrations

## Mock Data Migration - 0001_seed_mock_data.sql

Comprehensive mock data for testing and development.

### Execution

```bash
# Remote database (production)
npx wrangler d1 execute testdatabase --remote --file="D1 schema/migrations/0001_seed_mock_data.sql"

# Local development database
npx wrangler d1 execute testdatabase --local --file="D1 schema/migrations/0001_seed_mock_data.sql"
```

### Data Summary

#### 1. Users (25 total)
- **2 Admins:** GuildMaster (95k power), ViceLeader (92k power)
- **3 Moderators:** EliteCommander, WarCoordinator, EventOrganizer (85k-88k power)
- **20 Members:** Various classes and power levels (62k-83k power)
- **Vacation Status:** 2 members on vacation (BloodMage, NightStalker)

**Test Accounts:**
- Admin: `usr_admin001` (GuildMaster)
- Moderator: `usr_mod001` (EliteCommander)
- Member: `usr_mem001` (SwordMaster - top performer)

#### 2. Announcements (10 total)
- **3 Pinned:** War notice, event schedule, welcome message
- **4 Archived:** Past summaries and old notices
- **3 Active:** Current guild info and rules

**Categories:**
- Important notices (war schedules, events)
- Welcome messages
- Guild rules and guidelines
- Activity summaries
- Special event announcements

#### 3. Events (15 total)
- **3 Upcoming (Pinned):**
  - evt_001: Guild War vs 霸王帮 (Feb 7, 20:00-22:00)
  - evt_002: Weekly 25-man normal dungeon (Feb 6, 19:00-21:30)
  - evt_003: Guild dinner meetup (Feb 8, 18:00-21:00)

- **2 Recent (Not Archived):**
  - evt_004: 10-man heroic dungeon (Feb 4, locked)
  - evt_005: Last week's war - Victory! (Jan 31, locked)

- **10 Archived:** Historical events from Dec 2025 - Jan 2026

**Event Types:**
- `guild_war`: Major war events with team assignments
- `weekly_mission`: Regular dungeon runs
- `other`: Social events, competitions, celebrations

#### 4. Teams & Assignments (5 teams, 30+ members)
**Teams:**
1. **主力突击队** (team_001) - 8 members, DPS-heavy assault team
2. **辅助支援队** (team_002) - 7 members, healers & support
3. **刺客特战队** (team_003) - 6 members, assassin squad
4. **防御坚守队** (team_004) - 4 members, tank/defense team
5. **预备队伍** (team_005) - Reserve/backup squad

**Event Assignments:**
- evt_001 (upcoming war): Teams 1-4 assigned
- evt_005 (last war): Teams 1-3 participated
- Historical wars have appropriate team assignments

#### 5. War History (7 wars)
**Recent Wars:**
- **war_001** (Jan 31, 2026): vs 天下帮 - **VICTORY**
  - Kills: 352 vs 298
  - Towers: 4 vs 2
  - Base HP: 85k vs 12k
  - Result: Dominant win with excellent tactics

- **war_002** (Jan 24, 2026): vs 无敌帮 - **LOSS**
  - Kills: 275 vs 318
  - Equipment disadvantage noted

- **war_003** (Jan 17, 2026): vs 龙门帮 - **NARROW WIN**
  - Kills: 289 vs 285
  - Won by tower capture in final moments

**Historical Wars:** 4 additional wars from Dec 2025 - Jan 2026 with varied results

#### 6. War Analytics (Individual Performance)
**Top Performers in war_001 (Victory):**
1. **SwordMaster** (usr_mem001): 42 kills, 3 deaths, 2.85M damage - **MVP**
2. **MoonlightBlade** (usr_mem002): 38 kills, 5 deaths, 2.42M damage
3. **PhoenixFire** (usr_mem003): 35 kills, 4 deaths, 2.68M damage

**Support Stars:**
- **HealingLight** (usr_mem006): 1.85M healing, 8 kills, 32 assists
- **DragonKnight** (usr_mem004): Tank - 1.85M damage taken

**Stats Available:**
- Kills, Deaths, Assists (KDA)
- Damage dealt & taken
- Healing output
- Building damage
- Credits earned
- Performance notes

#### 7. Media & Gallery (8+ media objects)
**Gallery Images (5 featured/regular):**
- Victory screenshots
- Team photos
- Funny moments
- Achievement captures
- Event memories

**Member Media:**
- Avatar images for key members
- Video URLs (Bilibili links)
- Future: Audio profiles

**Categories:**
- screenshot, event, meme, achievement, other

#### 8. Member Profiles & Progression
- **Profiles:** Rich HTML titles, bios, vacation status
- **Classes:** Multi-class support (primary + secondary)
- **Notes:** Admin-only notes for key members
- **Availability:** Timezone-based weekly schedules (empty by default)
- **Progression:** Qishu, Xinfa, Wuxue tables (empty - can be populated later)

#### 9. Audit Logs (10 entries)
**Tracked Actions:**
- User creation & role changes
- Announcement creation/pinning/archiving
- Event creation & signup locks
- War record creation/updates
- Power level adjustments

**Entry Format:**
- Entity type, action, actor, target entity
- Diff title & JSON details
- Timestamps

### API Endpoints to Test

#### Public (No Auth Required)
```bash
# Health check
curl https://guild-management.na-infini.workers.dev/api/health

# Member roster
curl https://guild-management.na-infini.workers.dev/api/members?limit=5

# Announcements
curl https://guild-management.na-infini.workers.dev/api/announcements

# Events
curl https://guild-management.na-infini.workers.dev/api/events

# Gallery
curl https://guild-management.na-infini.workers.dev/api/gallery

# Wars list
curl https://guild-management.na-infini.workers.dev/api/wars
```

#### War History & Analytics
```bash
# Specific war history with stats
curl https://guild-management.na-infini.workers.dev/api/wars/history/war_001

# War member stats
curl https://guild-management.na-infini.workers.dev/api/wars/war_001/member-stats
```

#### Protected (Requires Auth)
```bash
# Audit logs (admin only)
curl -H "Cookie: session=<token>" https://guild-management.na-infini.workers.dev/api/admin/audit-logs

# Member details (self or admin)
curl -H "Cookie: session=<token>" https://guild-management.na-infini.workers.dev/api/members/usr_mem001
```

### Database Size

After migration:
- **Size:** ~0.48 MB
- **Tables:** 26 tables
- **Rows Written:** 885 rows
- **Execution Time:** ~12.4ms

### Reset Database

To clear all mock data and start fresh:

```bash
# WARNING: This will delete ALL data!
npx wrangler d1 execute testdatabase --remote --command="
DELETE FROM audit_log;
DELETE FROM war_member_stats;
DELETE FROM war_history;
DELETE FROM event_teams;
DELETE FROM event_attachments;
DELETE FROM team_members;
DELETE FROM teams;
DELETE FROM events;
DELETE FROM announcement_media;
DELETE FROM announcements;
DELETE FROM gallery_images;
DELETE FROM member_media;
DELETE FROM media_conversions;
DELETE FROM media_objects;
DELETE FROM member_availability_blocks;
DELETE FROM member_classes;
DELETE FROM member_notes;
DELETE FROM member_progression;
DELETE FROM member_wuxue;
DELETE FROM member_xinfa;
DELETE FROM member_qishu;
DELETE FROM member_profiles;
DELETE FROM api_keys;
DELETE FROM sessions;
DELETE FROM user_auth_password;
DELETE FROM users;
"
```

Then re-run the migration to restore mock data.

### Notes

- All passwords are fake hashes for demo purposes
- R2 URLs point to placeholder paths (actual files not uploaded)
- Video URLs are example Bilibili links
- Timestamps are realistic but dates may need adjustment
- Foreign key relationships are properly maintained
- Soft deletes use `deleted_at_utc` column (none deleted in mock data)
