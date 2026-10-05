CREATE TABLE `bkash_tokens` (
	`id` text PRIMARY KEY NOT NULL,
	`id_token` text NOT NULL,
	`refresh_token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `orders` ADD `bkash_payment_id` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `bkash_transaction_id` text;--> statement-breakpoint
CREATE INDEX `orders_bkash_payment_id_idx` ON `orders` (`bkash_payment_id`);