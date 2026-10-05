CREATE TABLE `bkash_pending_payments` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`payment_id` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `bkash_pending_payments_payment_id_unique` ON `bkash_pending_payments` (`payment_id`);--> statement-breakpoint
CREATE INDEX `bkash_pending_payments_user_id_idx` ON `bkash_pending_payments` (`user_id`);--> statement-breakpoint
CREATE INDEX `bkash_pending_payments_payment_id_idx` ON `bkash_pending_payments` (`payment_id`);