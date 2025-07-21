// app/api/test-clases/route.ts
import prisma from '@/lib/prisma'; // Usa tu instancia singleton

export async function GET() {
  try {
    const clases = await prisma.clase.findMany({
        orderBy: {
            fecha_hora: 'asc',
        }
    });
    console.log('Clases obtenidas de DB en API de prueba:', clases);
    return new Response(JSON.stringify(clases), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error en API Route de prueba de clases:', error);
    // Devuelve más detalles del error para depurar
    return new Response(JSON.stringify({
      error: (error as Error).message,
      name: (error as Error).name,
      stack: (error as Error).stack
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}