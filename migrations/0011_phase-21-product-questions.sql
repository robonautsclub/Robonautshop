CREATE TABLE `product_questions` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`user_id` text NOT NULL,
	`question` text NOT NULL,
	`answer` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`answered_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_questions_product_status_idx` ON `product_questions` (`product_id`,`status`);--> statement-breakpoint
CREATE INDEX `product_questions_status_idx` ON `product_questions` (`status`);--> statement-breakpoint
CREATE INDEX `product_questions_user_id_idx` ON `product_questions` (`user_id`);