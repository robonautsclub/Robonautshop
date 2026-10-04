CREATE TABLE `cart_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`product_id` text NOT NULL,
	`variant_id` text,
	`quantity` integer DEFAULT 1 NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `cart_items_user_id_idx` ON `cart_items` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `cart_items_user_variant_unique` ON `cart_items` (`user_id`,`variant_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `cart_items_user_product_level_unique` ON `cart_items` (`user_id`,`product_id`) WHERE "cart_items"."variant_id" is null;--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`payment_status` text DEFAULT 'PENDING' NOT NULL,
	`payment_method` text NOT NULL,
	`subtotal` integer NOT NULL,
	`shipping_total` integer NOT NULL,
	`total` integer NOT NULL,
	`shipping_full_name` text NOT NULL,
	`shipping_phone` text NOT NULL,
	`shipping_address_line1` text NOT NULL,
	`shipping_address_line2` text,
	`shipping_city` text NOT NULL,
	`shipping_postal_code` text,
	`shipping_lat` real,
	`shipping_lng` real,
	`special_instructions` text,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`updated_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE INDEX `orders_user_id_idx` ON `orders` (`user_id`);--> statement-breakpoint
CREATE INDEX `orders_status_idx` ON `orders` (`status`);--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_id` text,
	`variant_id` text,
	`product_name` text NOT NULL,
	`sku` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` integer NOT NULL,
	`line_total` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `order_items_order_id_idx` ON `order_items` (`order_id`);