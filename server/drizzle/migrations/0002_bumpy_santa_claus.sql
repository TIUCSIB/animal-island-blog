CREATE TABLE `site_profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`avatar_url` text NOT NULL,
	`badge` text DEFAULT '♥' NOT NULL,
	`nickname` text NOT NULL,
	`handle` text NOT NULL,
	`bio` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL
);
