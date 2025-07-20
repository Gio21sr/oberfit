/*
  Warnings:

  - Added the required column `id_clase` to the `inscripcionvisitante` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `inscripcionvisitante` ADD COLUMN `id_clase` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `inscripcionvisitante` ADD CONSTRAINT `inscripcionvisitante_id_clase_fkey` FOREIGN KEY (`id_clase`) REFERENCES `clases`(`id_clase`) ON DELETE RESTRICT ON UPDATE CASCADE;
