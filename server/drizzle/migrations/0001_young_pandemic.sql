CREATE TABLE `admin_users` (
	`id` text PRIMARY KEY NOT NULL,
	`account` text NOT NULL,
	`password_hash` text NOT NULL,
	`password_salt` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
