-- Blog engagement: signed-in users comment on and like posts; staff can hide or delete comments.
CREATE TABLE `blog_comments` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `blog_post_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `body` TEXT NOT NULL,
    `is_hidden` BOOLEAN NOT NULL DEFAULT false,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_at` TIMESTAMP(0) NULL,

    INDEX `blog_comments_blog_post_id_is_hidden_index`(`blog_post_id`, `is_hidden`),
    INDEX `blog_comments_user_id_foreign`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `blog_post_likes` (
    `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `blog_post_id` BIGINT UNSIGNED NOT NULL,
    `user_id` BIGINT UNSIGNED NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `blog_post_likes_post_user_unique`(`blog_post_id`, `user_id`),
    INDEX `blog_post_likes_user_id_foreign`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `blog_comments` ADD CONSTRAINT `blog_comments_blog_post_id_foreign` FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `blog_comments` ADD CONSTRAINT `blog_comments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `blog_post_likes` ADD CONSTRAINT `blog_post_likes_blog_post_id_foreign` FOREIGN KEY (`blog_post_id`) REFERENCES `blog_posts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE `blog_post_likes` ADD CONSTRAINT `blog_post_likes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;
