-- CreateTable
CREATE TABLE `ptk_pendamping` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `nip` VARCHAR(30) NULL,
    `nomor_hp` VARCHAR(20) NULL,
    `keterangan` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `jadwal_pelajaran` ADD COLUMN `ptk_pendamping_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `jadwal_pelajaran` ADD CONSTRAINT `jadwal_pelajaran_ptk_pendamping_id_fkey` FOREIGN KEY (`ptk_pendamping_id`) REFERENCES `ptk_pendamping`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;