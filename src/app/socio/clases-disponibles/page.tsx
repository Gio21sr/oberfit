// src/app/socio/clases-disponibles/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Table, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap';
import { getClasses, enrollInClass } from '@/app/actions'; 
import { formatDbDateTimeToLocal } from '@/utils/formatDate';
import { useSidebar } from '@/lib/SidebarContext'; 
import { useSession } from 'next-auth/react'; 

interface Clase {
  id_clase: number;
  nombre_clase: string;
  descripcion: string;
  fecha_hora: Date;
  cupo: number;
  capacidad_maxima: number | null; // <-- ¡CORREGIDO! Puede ser number o null
}

export default function SocioClassesPage() {
  const [classes, setClasses] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'danger', message: string } | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Clase | null>(null);
  const [socioId, setSocioId] = useState<number | null>(null); // ID del socio logueado

  const { setCurrentRoleMenu } = useSidebar();
  const { data: session, status } = useSession(); // Usa useSession para obtener el estado de autenticación

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedClasses = await getClasses();
      const processedClasses = fetchedClasses.map(clase => ({
        ...clase,
        fecha_hora: new Date(clase.fecha_hora),
      }));
      setClasses(processedClasses.filter(clase => clase.cupo > 0)); // Solo clases con cupo disponible
    } catch (err: any) {
      console.error("Error al cargar clases:", err);
      setError(err.message || "No se pudieron cargar las clases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentRoleMenu('socio'); 

    // Obtener el ID del socio de la sesión de NextAuth.js
    if (status === 'authenticated' && session?.user?.id) {
      const userId = parseInt(session.user.id as string);
      setSocioId(userId);
      fetchClasses(); // Cargar clases una vez que el ID del socio esté disponible
    } else if (status === 'unauthenticated') {
      setError("Debe iniciar sesión como socio para ver las clases disponibles.");
      setLoading(false);
    } else if (status === 'loading') {
      setLoading(true); // Mostrar carga mientras la sesión se autentica
    }
  }, [session, status, setCurrentRoleMenu]); // Dependencias

  const handleEnrollClick = (clase: Clase) => {
    if (socioId === null) {
      setResponseMessage({ type: 'danger', message: 'Error: No se pudo identificar al socio. Inicia sesión.' });
      return;
    }
    setSelectedClass(clase);
    setShowEnrollModal(true);
  };

  const handleEnrollSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponseMessage(null);
    if (!selectedClass || socioId === null) return;

    const formData = new FormData(event.currentTarget);
    formData.append('claseId', selectedClass.id_clase.toString());
    formData.append('userId', socioId.toString()); // ID del socio desde la sesión

    try {
      await enrollInClass(formData);
      setResponseMessage({ type: 'success', message: '¡Inscripción exitosa! Tu clase restante ha sido descontada.' });
      setShowEnrollModal(false);
      fetchClasses(); // Recargar la lista de clases para reflejar el cupo
      // NOTA: Para actualizar el contador en /socio, necesitarías redirigir o refetch la sesión/datos del socio.
      // router.push('/socio'); // Una opción es redirigir, pero el usuario se queda en la página actual.
    } catch (err: any) {
      console.error("Error al inscribir:", err);
      setResponseMessage({ type: 'danger', message: err.message || 'Error al inscribirte en la clase.' });
    }
  };

  return (
    <div className="role-page-content">
      <h1 className="main-title">Clases Disponibles</h1>
      <p className="sub-title">Aquí puedes ver las clases programadas e inscribirte.</p>

      {responseMessage && (
        <Alert variant={responseMessage.type} onClose={() => setResponseMessage(null)} dismissible className="my-3">
          {responseMessage.message}
        </Alert>
      )}

      {loading || status === 'loading' ? (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando clases...</span>
          </Spinner>
        </div>
      ) : error || status === 'unauthenticated' ? (
        <Alert variant="danger" className="my-4">
          {error || "Acceso denegado. Por favor, inicie sesión como socio."}
        </Alert>
      ) : classes.length === 0 ? (
        <Alert variant="info" className="my-4">
          No hay clases disponibles en este momento.
        </Alert>
      ) : (
        <Table striped bordered hover responsive className="my-4">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Fecha y Hora</th>
              <th>Cupo</th>
              <th>Capacidad Máx.</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((clase) => (
              <tr key={clase.id_clase}>
                <td>{clase.id_clase}</td>
                <td>{clase.nombre_clase}</td>
                <td>{clase.descripcion}</td>
                <td>{formatDbDateTimeToLocal(clase.fecha_hora)}</td>
                <td>{clase.cupo}</td>
                <td>{clase.capacidad_maxima !== null ? clase.capacidad_maxima : 'N/A'}</td>
                <td>
                  <Button variant="success" size="sm" onClick={() => handleEnrollClick(clase)}
                          disabled={clase.cupo <= 0}>
                    Inscribirme
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal para Inscripción */}
      <Modal show={showEnrollModal} onHide={() => setShowEnrollModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Inscribirte en {selectedClass?.nombre_clase}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedClass && (
            <Form onSubmit={handleEnrollSubmit}>
              <p>Confirma tu inscripción a **{selectedClass.nombre_clase}** el **{formatDbDateTimeToLocal(selectedClass.fecha_hora)}**.</p>
              {/* El campo metodoPago se eliminó para socios en el diseño */}
              <Button variant="primary" type="submit" className="w-100">
                Confirmar Inscripción
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}