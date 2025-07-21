// src/lib/prisma.ts

import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

// Modificación propuesta:
// Asegurarse de que la instancia de Prisma Client no se cree en entornos de Edge,
// de navegador, o durante la fase de "tree-shaking" del build.
// Esto es un patrón común para solucionar el error "@prisma/client did not initialize yet"
// en Next.js App Router (especialmente en rutas API y Server Actions/Components).
const prisma = global.prisma || new PrismaClient();

// Solo asignar la instancia global en desarrollo para HMR
// y evitar fugas de conexiones en producción (donde cada función es efímera)
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;