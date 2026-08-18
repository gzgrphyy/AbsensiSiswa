-- AlterTable
ALTER TABLE `ruangan` ADD COLUMN `kelas_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `ruangan` ADD CONSTRAINT `ruangan_kelas_id_fkey` FOREIGN KEY (`kelas_id`) REFERENCES `kelas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
