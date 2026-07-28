-- CreateTable
CREATE TABLE `pengaturan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titel_aplikasi` VARCHAR(100) NOT NULL DEFAULT 'Sistem Absensi',
    `nama_aplikasi` VARCHAR(100) NOT NULL DEFAULT 'Aplikasi Skoria',
    `icon_path` VARCHAR(255) NULL,
    `favicon_path` VARCHAR(255) NULL,
    `logo_dinas_path` VARCHAR(255) NULL,
    `logo_kota_path` VARCHAR(255) NULL,
    `logo_provinsi_path` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
