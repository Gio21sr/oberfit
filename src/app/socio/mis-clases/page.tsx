// src/app/socio/mis-clases/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Table, Spinner, Alert } from 'react-bootstrap';
import { getSocioInscriptions } from '@/app/actions';
import { formatDbDateTimeToLocal } from '@/utils/formatDate';
import { useSession } from 'next-auth/react'; // <-- Importa useSession
import { useSidebar } from '@/lib/SidebarContext'; // Importa useSidebar

// Define interfaces para los datos que esperamos
interface ClaseDetalles {
  id_clase: number;
  nombre_clase: string;
  descripcion: string;
  fecha_hora: Date;
  cupo: number;
  capacidad_maxima: number;
}

interface Inscripcion {
  id_inscripcion: number;
  fecha_registro: Date; 
  metodo_pago: 'caja' | 'transferencia' | 'socio' | null; // Puede ser null
  clase: ClaseDetalles;
}

export default function SocioMisClasesPage() {
  const [inscriptions, setInscriptions] = useState<Inscripcion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [socioId, setSocioId] = useState<number | null>(null);

  const { setCurrentRoleMenu } = useSidebar();
  const { data: session, status } = useSession(); // <-- Usa useSession

  // Función asíncrona para obtener las inscripciones del socio
  const fetchInscriptions = async (userId: number) => {
    try {
      setLoading(true);
      setError(null);
      const fetchedInscriptions = await getSocioInscriptions(userId);
      const processedInscriptions = fetchedInscriptions.map((insc: any) => ({
        ...insc,
        fecha_registro: new Date(insc.fecha_registro),
        clase: {
          ...insc.clase,
          fecha_hora: new Date(insc.clase.fecha_hora),
        },
      }));
      setInscriptions(processedInscriptions);
    } catch (err: any) {
      console.error("Error al cargar inscripciones:", err);
      setError(err.message || "No se pudieron cargar tus clases inscritas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Asegura que el menú de la sidebar muestre el rol "socio"
    setCurrentRoleMenu('socio'); 

    // Obtener el ID del socio de la sesión de NextAuth.js
    if (status === 'authenticated' && session?.user?.id) {
      const userId = parseInt(session.user.id as string);
      setSocioId(userId);
      fetchInscriptions(userId); // Cargar inscripciones una vez que el ID esté disponible
    } else if (status === 'unauthenticated') {
      setError("Debe iniciar sesión como socio para ver sus clases inscritas.");
      setLoading(false);
    } else if (status === 'loading') {
      setLoading(true); // Mostrar carga mientras la sesión se autentica
    }
  }, [session, status, setCurrentRoleMenu]); // Dependencias

  return (
    <div className="role-page-content">
      <h1 className="main-title">Mis Clases Inscritas</h1>
      <p className="sub-title">Aquí puedes ver todas las clases a las que te has inscrito.</p>

      {loading || status === 'loading' ? (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando clases inscritas...</span>
          </Spinner>
        </div>
      ) : error || status === 'unauthenticated' ? (
        <Alert variant="danger" className="my-4">
          {error || "Acceso denegado. Por favor, inicie sesión como socio."}
        </Alert>
      ) : inscriptions.length === 0 ? (
        <Alert variant="info" className="my-4">
          Aún no te has inscrito en ninguna clase. ¡Explora las clases disponibles!
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="my-4">
          <thead>
            <tr>
              <th>ID Inscripción</th>
              <th>Clase</th>
              <th>Fecha Clase</th>
              <th>Hora Clase</th>
              <th>Fecha de Registro</th>
              <th>Método Pago</th>
            </tr>
          </thead>
          <tbody>
            {inscriptions.map((inscripcion) => (
              <tr key={inscripcion.id_inscripcion}>
                <td>{inscripcion.id_inscripcion}</td>
                <td>{inscripcion.clase.nombre_clase}</td>
                <td>{formatDbDateTimeToLocal(inscripcion.clase.fecha_hora).split(' ')[0]}</td>
                <td>{formatDbDateTimeToLocal(inscripcion.clase.fecha_hora).split(' ')[1]}</td>
                <td>{formatDbDateTimeToLocal(inscripcion.fecha_registro)}</td>
                <td>{inscripcion.metodo_pago || 'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}