CREATE TABLE `adminNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`notificationType` enum('new_order','low_stock','payment_issue','system') NOT NULL,
	`title` varchar(256) NOT NULL,
	`body` text,
	`entityType` varchar(64),
	`entityId` varchar(128),
	`readAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `adminNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `adminSettings` (
	`id` int NOT NULL,
	`lowStockThreshold` int NOT NULL DEFAULT 5,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `adminSettings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `catalogCategories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`name` varchar(128) NOT NULL,
	`description` text,
	`imageUrl` text,
	`enabled` boolean NOT NULL DEFAULT true,
	`archived` boolean NOT NULL DEFAULT false,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalogCategories_id` PRIMARY KEY(`id`),
	CONSTRAINT `catalogCategories_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `catalogMedia` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`mediaType` enum('image','video') NOT NULL DEFAULT 'image',
	`storageKey` varchar(512),
	`url` text NOT NULL,
	`altText` varchar(256),
	`sortOrder` int NOT NULL DEFAULT 0,
	`isPrimary` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `catalogMedia_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `catalogProducts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(128) NOT NULL,
	`name` varchar(256) NOT NULL,
	`brand` varchar(128) NOT NULL,
	`categoryId` int,
	`categoryName` varchar(128) NOT NULL,
	`gender` enum('Men','Women','Unisex') NOT NULL DEFAULT 'Unisex',
	`fragranceFamilies` text,
	`familySummary` varchar(256),
	`badge` varchar(64),
	`tone` varchar(32) NOT NULL DEFAULT 'stone',
	`published` boolean NOT NULL DEFAULT false,
	`archived` boolean NOT NULL DEFAULT false,
	`featuredRank` int NOT NULL DEFAULT 999,
	`isNew` boolean NOT NULL DEFAULT false,
	`notesTop` text,
	`notesMiddle` text,
	`notesBase` text,
	`longevity` varchar(128),
	`sillage` varchar(128),
	`concentration` varchar(128),
	`ingredients` text,
	`usageInstructions` text,
	`story` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalogProducts_id` PRIMARY KEY(`id`),
	CONSTRAINT `catalogProducts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `catalogVariants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` int NOT NULL,
	`size` varchar(32) NOT NULL,
	`sku` varchar(128) NOT NULL,
	`price` decimal(12,2) NOT NULL,
	`originalPrice` decimal(12,2),
	`stock` int NOT NULL DEFAULT 0,
	`published` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `catalogVariants_id` PRIMARY KEY(`id`),
	CONSTRAINT `catalogVariants_sku_unique` UNIQUE(`sku`),
	CONSTRAINT `catalog_variant_product_size_unique` UNIQUE(`productId`,`size`)
);
--> statement-breakpoint
CREATE TABLE `homepageSlots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slotKey` varchar(64) NOT NULL,
	`eyebrow` varchar(160),
	`title` varchar(320),
	`body` text,
	`ctaLabel` varchar(96),
	`ctaHref` varchar(256),
	`imageUrl` text,
	`productSlug` varchar(128),
	`enabled` boolean NOT NULL DEFAULT true,
	`sortOrder` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `homepageSlots_id` PRIMARY KEY(`id`),
	CONSTRAINT `homepageSlots_slotKey_unique` UNIQUE(`slotKey`)
);
--> statement-breakpoint
CREATE INDEX `admin_notification_read_idx` ON `adminNotifications` (`readAt`,`createdAt`);--> statement-breakpoint
CREATE INDEX `category_active_idx` ON `catalogCategories` (`enabled`,`archived`);--> statement-breakpoint
CREATE INDEX `catalog_media_product_idx` ON `catalogMedia` (`productId`,`sortOrder`);--> statement-breakpoint
CREATE INDEX `catalog_product_visibility_idx` ON `catalogProducts` (`published`,`archived`);--> statement-breakpoint
CREATE INDEX `catalog_product_category_idx` ON `catalogProducts` (`categoryId`);--> statement-breakpoint
CREATE INDEX `catalog_variant_product_idx` ON `catalogVariants` (`productId`);--> statement-breakpoint
CREATE INDEX `homepage_slot_visibility_idx` ON `homepageSlots` (`enabled`,`sortOrder`);