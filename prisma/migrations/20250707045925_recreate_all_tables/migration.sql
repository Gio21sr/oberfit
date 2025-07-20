-- CreateTable
CREATE TABLE `administradores` (
    `id_admin` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_admin` VARCHAR(255) NOT NULL,
    `contrasena` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id_admin`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clases` (
    `id_clase` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_clase` VARCHAR(255) NOT NULL,
    `descripcion` TEXT NOT NULL,
    `fecha_hora` DATETIME(3) NOT NULL,
    `cupo` INTEGER NOT NULL,

    PRIMARY KEY (`id_clase`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `empleados` (
    `id_empleado` SMALLINT NOT NULL AUTO_INCREMENT,
    `nombre_empleado` VARCHAR(255) NOT NULL,
    `correo` VARCHAR(255) NOT NULL,
    `usuario` VARCHAR(100) NOT NULL,
    `contrasena` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id_empleado`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inscripciones` (
    `id_inscripcion` INTEGER NOT NULL AUTO_INCREMENT,
    `id_usuario` INTEGER NOT NULL,
    `id_clase` INTEGER NOT NULL,
    `fecha_registro` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `metodo_pago` ENUM('caja', 'transferencia') NULL,

    PRIMARY KEY (`id_inscripcion`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `inscripcionvisitante` (
    `id_visitante` INTEGER NOT NULL AUTO_INCREMENT,
    `correo` VARCHAR(255) NOT NULL,
    `codigo` INTEGER NOT NULL,

    PRIMARY KEY (`id_visitante`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `socios` (
    `id_socio` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre_socio` VARCHAR(255) NOT NULL,
    `Usuario` VARCHAR(100) NOT NULL,
    `Contrasena` VARCHAR(100) NOT NULL,

    PRIMARY KEY (`id_socio`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `id_usuario` INTEGER NOT NULL AUTO_INCREMENT,
    `nom_usuario` VARCHAR(255) NOT NULL,
    `correo` VARCHAR(100) NOT NULL,
    `contrasena` VARCHAR(255) NOT NULL,
    `es_socio` BOOLEAN NOT NULL,
    `clases_restantes` INTEGER NOT NULL,

    UNIQUE INDEX `usuarios_nom_usuario_key`(`nom_usuario`),
    UNIQUE INDEX `usuarios_correo_key`(`correo`),
    PRIMARY KEY (`id_usuario`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `visitante` (
    `id_Visitante` INTEGER NOT NULL AUTO_INCREMENT,
    `clase` VARCHAR(255) NOT NULL,
    `correo` VARCHAR(255) NOT NULL,
    `nombre` VARCHAR(255) NOT NULL,
    `contrasena` VARCHAR(100) NOT NULL,
    `metodo_pago` BOOLEAN NOT NULL,

    PRIMARY KEY (`id_Visitante`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `inscripciones` ADD CONSTRAINT `inscripciones_id_usuario_fkey` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios`(`id_usuario`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `inscripciones` ADD CONSTRAINT `inscripciones_id_clase_fkey` FOREIGN KEY (`id_clase`) REFERENCES `clases`(`id_clase`) ON DELETE RESTRICT ON UPDATE CASCADE;
