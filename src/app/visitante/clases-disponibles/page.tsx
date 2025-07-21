// src/app/visitante/clases-disponibles/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Table, Spinner, Alert, Button } from 'react-bootstrap';
import Link from 'next/link';

import { getClasses } from '@/app/actions';
import { formatDbDateTimeToLocal } from '@/utils/formatDate';

interface Clase {
  id_clase: number;
  nombre_clase: string;
  descripcion: string;
  fecha_hora: Date;
  cupo: number;
  capacidad_maxima: number | null;
}

export default function VisitanteClassesPage() {
  const [classes, setClasses] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedClasses = await getClasses();
      const processedClasses = fetchedClasses.map((clase:Clase ) => ({
        ...clase,
        fecha_hora: new Date(clase.fecha_hora),
      }));
      setClasses(processedClasses.filter((clase:Clase) => clase.cupo > 0));
    } catch (err: any) {
      console.error("Error al cargar clases para visitante:", err);
      setError(err.message || "No se pudieron cargar las clases.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  return (
    <div className="role-page-content">
      <h1 className="main-title">Clases Disponibles para Visitantes</h1>
      <p className="sub-title">Explora nuestras clases y regístrate para asistir.</p>

      {loading && (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando clases...</span>
          </Spinner>
        </div>
      )}

      {error && (
        <Alert variant="danger" className="my-4">
          {error}
        </Alert>
      )}

      {!loading && !error && classes.length === 0 && (
        <Alert variant="info" className="my-4">
          No hay clases disponibles en este momento.
        </Alert>
      )}

      {!loading && !error && classes.length > 0 && (
        <>
          <Table striped bordered hover responsive className="my-4">
            <thead>
              <tr><th>ID</th><th>Nombre</th><th>Descripción</th><th>Fecha y Hora</th><th>Cupo Disp.</th><th>Cupo Máx.</th></tr>
            </thead>
            <tbody>
              {classes.map((clase) => (
                <tr key={clase.id_clase}><td>{clase.id_clase}</td><td>{clase.nombre_clase}</td><td>{clase.descripcion}</td><td>{formatDbDateTimeToLocal(clase.fecha_hora)}</td><td>{clase.cupo}</td><td>{clase.capacidad_maxima !== null ? clase.capacidad_maxima : 'N/A'}</td></tr>
              ))}
            </tbody>
          </Table>
          <Link href="/visitante/inscripcion" className="d-inline-block">
            <Button variant="primary" className="my-3 py-2 px-4 fw-bold">
              Inscribirme como Visitante
            </Button>
          </Link>
        </>
      )}
    </div>
  );
}