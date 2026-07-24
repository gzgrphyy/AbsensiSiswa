-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('ADMIN', 'GURU') NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tahun_ajaran` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(20) NOT NULL,
    `semester` ENUM('GANJIL', 'GENAP') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `tahun_ajaran_label_semester_key`(`label`, `semester`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `kelas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(50) NOT NULL,
    `wali_kelas_id` INTEGER NULL,
    `tahun_ajaran_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `kelas_nama_tahun_ajaran_id_key`(`nama`, `tahun_ajaran_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `siswa` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nisn` VARCHAR(20) NOT NULL,
    `nama` VARCHAR(100) NOT NULL,
    `kelas_id` INTEGER NOT NULL,
    `nama_wali` VARCHAR(100) NULL,
    `kontak_wali` VARCHAR(20) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `siswa_nisn_key`(`nisn`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `absensi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `siswa_id` INTEGER NOT NULL,
    `kelas_id` INTEGER NOT NULL,
    `tanggal` DATE NOT NULL,
    `status` ENUM('HADIR', 'SAKIT', 'IZIN', 'ALPHA') NOT NULL,
    `keterangan` VARCHAR(255) NULL,
    `dicatat_oleh` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `absensi_siswa_id_tanggal_key`(`siswa_id`, `tanggal`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `kelas` ADD CONSTRAINT `kelas_wali_kelas_id_fkey` FOREIGN KEY (`wali_kelas_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `kelas` ADD CONSTRAINT `kelas_tahun_ajaran_id_fkey` FOREIGN KEY (`tahun_ajaran_id`) REFERENCES `tahun_ajaran`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `siswa` ADD CONSTRAINT `siswa_kelas_id_fkey` FOREIGN KEY (`kelas_id`) REFERENCES `kelas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absensi` ADD CONSTRAINT `absensi_siswa_id_fkey` FOREIGN KEY (`siswa_id`) REFERENCES `siswa`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absensi` ADD CONSTRAINT `absensi_kelas_id_fkey` FOREIGN KEY (`kelas_id`) REFERENCES `kelas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absensi` ADD CONSTRAINT `absensi_dicatat_oleh_fkey` FOREIGN KEY (`dicatat_oleh`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
