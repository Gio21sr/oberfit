/*
  Warnings:

  - A unique constraint covering the columns `[nombre_admin]` on the table `administradores` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[usuario]` on the table `empleados` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Usuario]` on the table `socios` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `last_reset_month` DATETIME(3) NULL,
    ADD COLUMN `role` VARCHAR(50) NOT NULL DEFAULT 'socio',
    MODIFY `clases_restantes` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `administradores_nombre_admin_key` ON `administradores`(`nombre_admin`);

-- CreateIndex
CREATE UNIQUE INDEX `empleados_usuario_key` ON `empleados`(`usuario`);

-- CreateIndex
CREATE UNIQUE INDEX `socios_Usuario_key` ON `socios`(`Usuario`);
