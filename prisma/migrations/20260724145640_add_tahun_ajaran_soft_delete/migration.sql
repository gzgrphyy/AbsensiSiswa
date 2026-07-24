-- DropIndex
DROP INDEX `tahun_ajaran_label_semester_key` ON `tahun_ajaran`;

-- AlterTable
ALTER TABLE `tahun_ajaran` DROP COLUMN `label`,
    ADD COLUMN `deleted_at` DATETIME(3) NULL,
    ADD COLUMN `nama` VARCHAR(20) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `tahun_ajaran_nama_semester_key` ON `tahun_ajaran`(`nama`, `semester`);

