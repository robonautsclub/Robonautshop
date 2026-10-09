ALTER TABLE `orders` ADD `stock_state` text DEFAULT 'NONE' NOT NULL;--> statement-breakpoint
-- Every order created before this migration reserved stock at insert time
-- (lib/server-cart/order-queries.ts insertOrderWithItems), so mark them RESERVED.
UPDATE `orders` SET `stock_state` = 'RESERVED';
