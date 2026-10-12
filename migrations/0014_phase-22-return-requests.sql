CREATE TABLE `return_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`order_item_id` text NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`reason` text NOT NULL,
	`quantity` integer NOT NULL,
	`note` text,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`admin_note` text,
	`decided_at` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`order_item_id`) REFERENCES `order_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `return_requests_order_id_idx` ON `return_requests` (`order_id`);--> statement-breakpoint
CREATE INDEX `return_requests_order_item_id_idx` ON `return_requests` (`order_item_id`);--> statement-breakpoint
CREATE INDEX `return_requests_status_idx` ON `return_requests` (`status`);