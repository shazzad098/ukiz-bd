CREATE TABLE `catalogInventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productSlug` varchar(128) NOT NULL,
	`variantSize` varchar(16) NOT NULL,
	`stock` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalogInventory_id` PRIMARY KEY(`id`),
	CONSTRAINT `inventory_product_variant_unique` UNIQUE(`productSlug`,`variantSize`)
);
--> statement-breakpoint
CREATE TABLE `checkoutSettings` (
	`id` int NOT NULL,
	`insideDhakaFee` decimal(12,2) NOT NULL,
	`outsideDhakaFee` decimal(12,2) NOT NULL,
	`estimatedInsideDays` int NOT NULL DEFAULT 2,
	`estimatedOutsideDays` int NOT NULL DEFAULT 4,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `checkoutSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `couponRedemptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`couponId` int NOT NULL,
	`orderId` int NOT NULL,
	`userId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `couponRedemptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupon_order_unique` UNIQUE(`couponId`,`orderId`)
);
--> statement-breakpoint
CREATE TABLE `coupons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`code` varchar(64) NOT NULL,
	`discountType` enum('percentage','flat') NOT NULL,
	`amount` decimal(12,2) NOT NULL,
	`minimumOrderAmount` decimal(12,2) NOT NULL DEFAULT '0',
	`expiresAt` timestamp,
	`usageLimit` int,
	`usageCount` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `coupons_id` PRIMARY KEY(`id`),
	CONSTRAINT `coupons_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `userId` int;--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `orderStatus` enum('pending','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `orders` ADD `orderAccessToken` varchar(64);--> statement-breakpoint
ALTER TABLE `orders` ADD `customerName` varchar(160);--> statement-breakpoint
ALTER TABLE `orders` ADD `customerEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `orders` ADD `customerPhone` varchar(32);--> statement-breakpoint
ALTER TABLE `orders` ADD `couponCode` varchar(64);--> statement-breakpoint
ALTER TABLE `orders` ADD `deliveryZone` enum('inside_dhaka','outside_dhaka');--> statement-breakpoint
ALTER TABLE `orders` ADD `deliveryInstructions` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `estimatedDeliveryAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `paymentReference` varchar(128);--> statement-breakpoint
ALTER TABLE `orders` ADD CONSTRAINT `orders_orderAccessToken_unique` UNIQUE(`orderAccessToken`);--> statement-breakpoint
CREATE INDEX `coupon_redemption_user_idx` ON `couponRedemptions` (`userId`);--> statement-breakpoint
CREATE INDEX `coupon_active_idx` ON `coupons` (`active`);