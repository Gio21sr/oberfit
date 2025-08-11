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
  capacidad_maxima: number | null;
}

export default function SocioClassesPage() {
  const [classes, setClasses] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'danger', message: string } | null>(null);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Clase | null>(null);
  const [socioId, setSocioId] = useState<number | null>(null);

  const { setCurrentRoleMenu } = useSidebar();
  const { data: session, status } = useSession();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getClasses();
      if (result.success) {
        const now = new Date();
        const processedClasses = (result.classes ?? [])
          .filter((clase: Clase) => clase.cupo > 0 && new Date(clase.fecha_hora) > now)
          .map((clase: Clase) => ({
            ...clase,
            fecha_hora: new Date(clase.fecha_hora),
          }));
        setClasses(processedClasses);
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      console.error("Error al cargar clases:", err);
      setError(err.message || "No se pudieron cargar las clases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentRoleMenu('socio');

    if (status === 'authenticated' && session?.user?.id) {
      const userId = parseInt(session.user.id as string);
      setSocioId(userId);
      fetchClasses();
    } else if (status === 'unauthenticated') {
      setError("Debe iniciar sesión como socio para ver las clases disponibles.");
      setLoading(false);
    } else if (status === 'loading') {
      setLoading(true);
    }
  }, [session, status, setCurrentRoleMenu]);

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
    formData.append('userId', socioId.toString());

    const result = await enrollInClass(formData);

    if (result.success) {
      setResponseMessage({ type: 'success', message: result.message });
      setShowEnrollModal(false);
      fetchClasses();
    } else {
      setResponseMessage({ type: 'danger', message: result.message });
    }
  };

  const now = new Date();

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
          <Spinner animation="border" role="st
