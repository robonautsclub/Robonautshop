ALTER TABLE `product_reviews` ADD `status` text DEFAULT 'PENDING' NOT NULL;--> statement-breakpoint
-- Reviews that were already public before moderation existed stay public.
UPDATE `product_reviews` SET `status` = 'APPROVED';
