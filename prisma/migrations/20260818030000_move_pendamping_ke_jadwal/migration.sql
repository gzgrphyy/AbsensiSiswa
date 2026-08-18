-- DropForeignKey
ALTER TABLE `ptk_pendamping` DROP FOREIGN KEY `ptk_pendamping_kelas_id_fkey`;

-- DropIndex
DROP INDEX `ptk_pendamping_kelas_id_key` ON `ptk_pendamping`;

-- AlterTable
ALTER TABLE `ptk_pendamping` DROP COLUMN `kelas_id`;

-- AlterTable
ALTER TABLE `jadwal_pelajaran` ADD COLUMN `ptk_pendamping_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `jadwal_pelajaran` ADD CONSTRAINT `jadwal_pelajaran_ptk_pendamping_id_fkey` FOREIGN KEY (`ptk_pendamping_id`) REFERENCES `ptk_pendamping`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
