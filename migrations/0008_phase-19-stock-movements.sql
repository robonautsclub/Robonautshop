CREATE TABLE `stock_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`inventory_id` text NOT NULL,
	`sku` text NOT NULL,
	`delta` integer NOT NULL,
	`stock_after` integer NOT NULL,
	`reason` text NOT NULL,
	`note` text,
	`actor_user_id` text,
	`order_id` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`inventory_id`) REFERENCES `inventory`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `stock_movements_inventory_id_idx` ON `stock_movements` (`inventory_id`);--> statement-breakpoint
CREATE INDEX `stock_movements_created_at_idx` ON `stock_movements` (`created_at`);