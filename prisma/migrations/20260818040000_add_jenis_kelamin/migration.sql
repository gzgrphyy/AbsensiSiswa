-- AlterTable
ALTER TABLE `users` ADD COLUMN `jenis_kelamin` ENUM('LAKI_LAKI', 'PEREMPUAN') NULL;

-- AlterTable
ALTER TABLE `ptk_pendamping` ADD COLUMN `jenis_kelamin` ENUM('LAKI_LAKI', 'PEREMPUAN') NULL;
