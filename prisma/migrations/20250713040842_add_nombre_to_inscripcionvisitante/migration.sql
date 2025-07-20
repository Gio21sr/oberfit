/*
  Warnings:

  - Added the required column `nombre` to the `inscripcionvisitante` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `inscripcionvisitante` ADD COLUMN `nombre` VARCHAR(255) NOT NULL;
