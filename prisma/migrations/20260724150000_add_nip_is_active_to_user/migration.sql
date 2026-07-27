-- AlterTable
ALTER TABLE `users` ADD COLUMN `nip` VARCHAR(30) NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX `users_nip_key` ON `users`(`nip`);
