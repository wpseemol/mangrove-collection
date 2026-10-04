-- Blog: categories (with an icon from the category icon library), posts, and each post's gallery images and videos.
CREATE TABLE `blog_categories` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `icon` VARCHAR(64) NULL,
    `description` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `blog_categories_slug_unique`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `blog_posts` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `blog_category_id` BIGINT UNSIGNED NULL,
    `author_id` BIGINT UNSIGNED NULL,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `excerpt` VARCHAR(500) NULL,
    `content` LONGTEXT NULL,
    `cover_image` VARCHAR(2048) NULL,
    `tags` JSON NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'draft',
    `is_featured` BOOLEAN NOT NULL DEFAULT false,
    `published_at` TIMESTAMP(0) NULL,
    `views` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` VARCHAR(500) NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    UNIQUE INDEX `blog_posts_slug_unique`(`slug`),
    INDEX `blog_posts_blog_category_id_foreign`(`blog_category_id`),
    INDEX `blog_posts_author_id_foreign`(`author_id`),
    INDEX `blog_posts_status_published_at_index`(`status`, `published_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `blog_post_media` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `blog_post_id` BIGINT UNSIGNED NOT NULL,
    `type` VARCHAR(10) NOT NULL,
    `provider` VARCHAR(10) NOT NULL DEFAULT 'upload',
    `url` VARCHAR(2048) NOT NULL,
    `caption` VARCHAR(255) NULL,
    `sort_order` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `blog_post_media_blog_post_id_foreign`(`blog_post_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_blog_category_id_foreign` FOREIGN KEY (`blog_category_id`) REFERENCES `blog_categories`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE `blog_posts` ADD CONSTRAINT `blog_posts_author_id_foreign` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE `blog_post_media` ADD CONSTRAINT `blog_post_media_blog_post_id_foreign` FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
