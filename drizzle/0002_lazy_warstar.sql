CREATE TABLE `paymentAttempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`provider` varchar(48) NOT NULL,
	`providerTransactionId` varchar(128) NOT NULL,
	`sessionKey` varchar(128),
	`gatewayUrl` text,
	`status` enum('initiated','pending','paid','failed','cancelled','refunded') NOT NULL DEFAULT 'initiated',
	`amount` decimal(12,2) NOT NULL,
	`validationId` varchar(128),
	`callbackFingerprint` varchar(128),
	`gatewayStatus` varchar(64),
	`failureReason` text,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentAttempts_id` PRIMARY KEY(`id`),
	CONSTRAINT `paymentAttempts_providerTransactionId_unique` UNIQUE(`providerTransactionId`),
	CONSTRAINT `paymentAttempts_sessionKey_unique` UNIQUE(`sessionKey`),
	CONSTRAINT `paymentAttempts_validationId_unique` UNIQUE(`validationId`),
	CONSTRAINT `paymentAttempts_callbackFingerprint_unique` UNIQUE(`callbackFingerprint`)
);
--> statement-breakpoint
ALTER TABLE `orders` MODIFY COLUMN `paymentStatus` enum('pending','paid','failed','cancelled','refunded') NOT NULL DEFAULT 'pending';--> statement-breakpoint
CREATE INDEX `payment_attempt_order_idx` ON `paymentAttempts` (`orderId`);--> statement-breakpoint
CREATE INDEX `payment_attempt_status_idx` ON `paymentAttempts` (`status`);