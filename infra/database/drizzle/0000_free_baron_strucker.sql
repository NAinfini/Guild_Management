CREATE TABLE `audit_log` (
	`audit_id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`action` text NOT NULL,
	`actor_id` text,
	`entity_id` text NOT NULL,
	`diff_title` text,
	`detail_text` text,
	`created_at_utc` text NOT NULL,
	`updated_at_utc` text NOT NULL,
	FOREIGN KEY (`actor_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `event_teams` (
	`event_id` text NOT NULL,
	`team_id` text NOT NULL,
	`assigned_at_utc` text NOT NULL,
	PRIMARY KEY(`event_id`, `team_id`),
	FOREIGN KEY (`event_id`) REFERENCES `events`(`event_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`team_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `events` (
	`event_id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`start_at_utc` text NOT NULL,
	`end_at_utc` text,
	`capacity` integer,
	`is_pinned` integer DEFAULT 0 NOT NULL,
	`is_archived` integer DEFAULT 0 NOT NULL,
	`signup_locked` integer DEFAULT 0 NOT NULL,
	`deleted_at_utc` text,
	`created_by` text,
	`updated_by` text,
	`created_at_utc` text NOT NULL,
	`updated_at_utc` text NOT NULL,
	`archived_at_utc` text,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `media_objects` (
	`media_id` text PRIMARY KEY NOT NULL,
	`storage_type` text NOT NULL,
	`r2_key` text,
	`url` text,
	`content_type` text,
	`size_bytes` integer,
	`width` integer,
	`height` integer,
	`duration_ms` integer,
	`sha256` text,
	`created_by` text,
	`created_at_utc` text NOT NULL,
	`updated_at_utc` text NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `member_availability_blocks` (
	`block_id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`weekday` integer NOT NULL,
	`start_min` integer NOT NULL,
	`end_min` integer NOT NULL,
	`created_at_utc` text NOT NULL,
	`updated_at_utc` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `member_media` (
	`user_id` text NOT NULL,
	`media_id` text NOT NULL,
	`kind` text NOT NULL,
	`is_avatar` integer DEFAULT 0 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at_utc` text NOT NULL,
	`updated_at_utc` text NOT NULL,
	PRIMARY KEY(`user_id`, `media_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_id`) REFERENCES `media_objects`(`media_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `member_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`title_html` text,
	`bio_text` text,
	`vacation_start_at_utc` text,
	`vacation_end_at_utc` text,
	`created_at_utc` text NOT NULL,
	`updated_at_utc` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`team_id` text NOT NULL,
	`user_id` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`role_tag` text,
	`joined_at_utc` text NOT NULL,
	PRIMARY KEY(`team_id`, `user_id`),
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`team_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`team_id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`is_locked` integer DEFAULT 0 NOT NULL,
	`created_by` text,
	`created_at_utc` text NOT NULL,
	`updated_at_utc` text NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`user_id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`wechat_name` text,
	`role` text NOT NULL,
	`power` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT 1 NOT NULL,
	`deleted_at_utc` text,
	`created_at_utc` text NOT NULL,
	`updated_at_utc` text NOT NULL
);
