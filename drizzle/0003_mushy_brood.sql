CREATE TABLE `bookmark_collections` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`is_default` integer DEFAULT false NOT NULL,
	`bookmark_count` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `coll_user_default_idx` ON `bookmark_collections` (`user_id`,`is_default`);--> statement-breakpoint
CREATE UNIQUE INDEX `coll_user_name_idx` ON `bookmark_collections` (`user_id`,`name`);--> statement-breakpoint
CREATE TABLE `bookmarks` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`collection_id` text NOT NULL,
	`verse_key` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`collection_id`) REFERENCES `bookmark_collections`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bookmarks_user_verse_idx` ON `bookmarks` (`user_id`,`verse_key`);--> statement-breakpoint
CREATE INDEX `bookmarks_user_coll_idx` ON `bookmarks` (`user_id`,`collection_id`);--> statement-breakpoint
CREATE TABLE `hifz_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`verse_key` text NOT NULL,
	`surah_id` integer NOT NULL,
	`ayah_id` integer NOT NULL,
	`memorised_at` integer NOT NULL,
	`repetitions` integer DEFAULT 0,
	`interval_days` integer DEFAULT 0,
	`ease_factor` integer DEFAULT 2500,
	`next_review_at` integer,
	`last_reviewed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `hifz_user_surah_ayah_idx` ON `hifz_entries` (`user_id`,`surah_id`,`ayah_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `hifz_user_verse_idx` ON `hifz_entries` (`user_id`,`verse_key`);--> statement-breakpoint
CREATE TABLE `notes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`verse_key` text NOT NULL,
	`text` text NOT NULL,
	`highlight_color` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notes_user_verse_idx` ON `notes` (`user_id`,`verse_key`);--> statement-breakpoint
CREATE INDEX `notes_user_updated_idx` ON `notes` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `progress` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`surah_id` integer NOT NULL,
	`ranges` text DEFAULT '[]' NOT NULL,
	`date` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `progress_user_date_idx` ON `progress` (`user_id`,`date`);