ALTER TABLE `categories` ADD `parent_id` text REFERENCES categories(id);--> statement-breakpoint
CREATE INDEX `categories_parent_id_idx` ON `categories` (`parent_id`);