/*
  Warnings:

  - Added the required column `metodo_pago` to the `inscripcionvisitante` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `inscripcionvisitante` ADD COLUMN `metodo_pago` BOOLEAN NOT NULL;
