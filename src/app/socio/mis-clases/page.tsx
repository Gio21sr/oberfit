// src/app/socio/mis-clases/page.tsx
// Este es un componente de servidor, no necesita "use client"

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
// 🚨 Importa el componente desde la ruta correcta
import ClasesLista from '@/components/ClasesLista'; 

export default async function MisClasesPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'socio') {
        redirect('/login');
    }

    const userId = session.user.id;

    const inscripciones = await prisma.inscripcion.findMany({
        where: {
            id_usuario: parseInt(userId as string),
        },
        include: {
            clase: {
                select: {
                    id_clase: true,
                    nombre_clase: true,
                    fecha_hora: true,
                },
            },
        },
    });

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Mis Clases Inscritas</h1>
            {/* Renderizamos el componente de cliente y le pasamos los datos */}
            <ClasesLista inscripciones={inscripciones} />
        </div>
    );
}