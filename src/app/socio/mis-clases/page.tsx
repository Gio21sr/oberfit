// src/app/socio/mis-clases/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { redirect } from 'next/navigation';
import { getSocioInscriptions } from '@/app/actions'; 
import ClasesLista from '@/components/ClasesLista'; 

export default async function MisClasesPage() {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'socio') {
        redirect('/login');
    }

    const userId = parseInt(session.user.id);

    const inscripciones = await getSocioInscriptions(userId);

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Mis Clases Inscritas</h1>
            <ClasesLista inscripciones={inscripciones} />
        </div>
    );
}