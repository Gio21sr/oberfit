
import { PrismaClient } from '@prisma/client'; // <-- Ruta relativa desde src/lib/ a src/generated/prisma

// Declaración global para evitar que Next.js cree múltiples instancias en desarrollo
// durante el "Hot Module Reloading" (HMR), lo que podría
// agotar las conexiones a la base de datos.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Si ya existe una instancia global (en desarrollo), la usamos.
// De lo contrario, creamos una nueva instancia de PrismaClient.
const prisma = global.prisma || new PrismaClient();

// En el entorno de desarrollo, asignamos la instancia a la variable global
// para que sea reutilizada en subsiguientes hot reloads.
if (process.env.NODE_ENV === 'development') global.prisma = prisma;

export default prisma;