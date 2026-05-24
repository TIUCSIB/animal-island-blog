CREATE TABLE `about_collapse_items` (
	`id` text PRIMARY KEY NOT NULL,
	`question` text NOT NULL,
	`content` text NOT NULL,
	`default_expanded` integer DEFAULT false NOT NULL,
	`disabled` integer DEFAULT false NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
