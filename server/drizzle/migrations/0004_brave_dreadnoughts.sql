CREATE TABLE `about_pages` (
	`id` text PRIMARY KEY NOT NULL,
	`intro` text NOT NULL,
	`project_question` text NOT NULL,
	`project_summary` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `about_tech_sections` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`items_json` text NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contact_links` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`value` text NOT NULL,
	`href` text NOT NULL,
	`icon` text DEFAULT 'website' NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
