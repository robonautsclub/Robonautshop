CREATE TABLE `back_in_stock_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`variant_id` text,
	`variant_key` text DEFAULT '' NOT NULL,
	`email` text NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`sent_at` text,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `back_in_stock_unique` ON `back_in_stock_subscriptions` (`email`,`product_id`,`variant_key`);--> statement-breakpoint
CREATE INDEX `back_in_stock_product_idx` ON `back_in_stock_subscriptions` (`product_id`,`variant_id`);