DROP TABLE `account`;--> statement-breakpoint
DROP TABLE `bookmark_collections`;--> statement-breakpoint
DROP TABLE `bookmarks`;--> statement-breakpoint
DROP TABLE `hifz_entries`;--> statement-breakpoint
DROP TABLE `notes`;--> statement-breakpoint
DROP TABLE `progress`;--> statement-breakpoint
DROP TABLE `session`;--> statement-breakpoint
DROP TABLE `verification`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `email_verified`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `password_hash`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `password_changed_at`;