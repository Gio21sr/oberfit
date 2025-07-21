// src/app/socio/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Spinner, Alert, Card as BsCard } from 'react-bootstrap';
import { getUserById } from '@/app/actions';
import { useSidebar } from '@/lib/SidebarContext';
import { useSession } from 'next-auth/react';

// Define la interfaz para los datos del usuario (socio)
interface SocioData {
  id_usuario: number; 
  nom_usuario: string | null; // <-- ¡CAMBIO CLAVE AQUÍ! 'nom_usuario' puede ser null
  clases_restantes: number | null;
}

export default function SocioHomePage() {
  const [socioData, setSocioData] = useState<SocioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { setCurrentRoleMenu, currentUserName, setCurrentUserName } = useSidebar();
  const { data: session, status } = useSession();

  useEffect(() => {
    setCurrentRoleMenu('socio'); 

    async function fetchSocioData() {
      if (status === 'loading') {
        setLoading(true);
        return;
      }
      if (!session?.user?.id) { 
        setError("No se pudo obtener el ID del socio desde la sesión. Por favor, inicie sesión.");
        setLoading(false);
        setCurrentUserName(null); 
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userId = parseInt(session.user.id as string); 

        const data = await getUserById(userId); 
        setSocioData(data);
        setCurrentUserName(data.nom_usuario); 
      } catch (err: any) {
        console.error("Error al cargar datos del socio:", err);
        setError(err.message || "No se pudieron cargar tus datos de socio.");
        setCurrentUserName(null); 
      } finally {
        setLoading(false);
      }
    }

    fetchSocioData();
  }, [session, status, setCurrentRoleMenu, setCurrentUserName]);


  return (
    <div className="role-page-content">
      <h1 className="main-title">Oberfit</h1>
      {/* Muestra el nombre del socio si está disponible. Usa 'Socio' como fallback si es null. */}
      <h2 className="sub-title">Bienvenido, {currentUserName || 'Socio'}</h2> 
      <p className="description-text">Este es tu área personal. Aquí podrás ver tus clases restantes y gestionar tus inscripciones.</p>

      {loading || status === 'loading' ? (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando datos...</span>
          </Spinner>
        </div>
      ) : error || status === 'unauthenticated' ? (
        <Alert variant="danger" className="my-4">
          {error || "Acceso denegado. Por favor, inicie sesión como socio."}
        </Alert>
      ) : !socioData ? (
        <Alert variant="info" className="my-4">
          No se encontraron datos de socio. Asegúrate de iniciar sesión como socio.
        </Alert>
      ) : ( 
        <BsCard className="p-3 shadow-sm text-center my-4" style={{ maxWidth: '300px' }}>
          <BsCard.Body>
            <BsCard.Title className="fs-4 text-primary">Clases Restantes</BsCard.Title>
            <p className="display-4 fw-bold">{socioData.clases_restantes !== null ? socioData.clases_restantes : 'N/A'}</p>
            <BsCard.Text className="text-muted">Tienes oportunidades para inscribirte este mes.</BsCard.Text>
          </BsCard.Body>
        </BsCard>
      )}
    </div>
  );
}