-- Email addresses collected by the storefront's newsletter form.
CREATE TABLE `newsletter_subscribers` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'subscribed',
    `source` VARCHAR(50) NULL,
    `ip_address` VARCHAR(45) NULL,
    `unsubscribed_at` TIMESTAMP(0) NULL,
    `created_at` TIMESTAMP(0) NULL,
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `newsletter_subscribers_email_unique`(`email`),
    INDEX `newsletter_subscribers_status_index`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
