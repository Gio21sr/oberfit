// src/app/empleado/listado-asistentes/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Form, Table, Spinner, Alert } from 'react-bootstrap';
import { getClasses, getAttendeesByClass } from '@/app/actions'; // Importa Server Actions

interface ClaseSelect {
  id_clase: number;
  nombre_clase: string;
  fecha_hora: Date;
}

interface Attendee {
  id: number;
  type: string;
  name: string | null;
  email?: string | null;
}

export default function EmpleadoAttendeesListPage() {
  const [classes, setClasses] = useState<ClaseSelect[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingAttendees, setLoadingAttendees] = useState(false);
  const [errorClasses, setErrorClasses] = useState<string | null>(null);
  const [errorAttendees, setErrorAttendees] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClassesForSelect() {
      try {
        setLoadingClasses(true);
        setErrorClasses(null);
        const fetchedClasses = await getClasses();
        const processedClasses = fetchedClasses.map(clase => ({
          id_clase: clase.id_clase,
          nombre_clase: clase.nombre_clase,
          fecha_hora: new Date(clase.fecha_hora),
        }));
        setClasses(processedClasses);
        if (processedClasses.length > 0) {
          setSelectedClassId(processedClasses[0].id_clase);
        }
      } catch (err: any) {
        console.error("Error al cargar clases para selector del empleado:", err);
        setErrorClasses(err.message || "No se pudieron cargar las clases para seleccionar.");
      } finally {
        setLoadingClasses(false);
      }
    }
    fetchClassesForSelect();
  }, []);

  useEffect(() => {
    if (selectedClassId === null) {
      setAttendees([]);
      return;
    }
    async function fetchAttendees() {
      try {
        setLoadingAttendees(true);
        setErrorAttendees(null);
        // Aseguramos que selectedClassId no es null antes de llamar a la función
        const fetchedAttendees = await getAttendeesByClass(selectedClassId as number);
        setAttendees(fetchedAttendees);
      } catch (err: any) {
        console.error("Error al cargar asistentes para empleado:", err);
        setErrorAttendees(err.message || "No se pudieron cargar los asistentes de la clase.");
      } finally {
        setLoadingAttendees(false);
      }
    }
    fetchAttendees();
  }, [selectedClassId]);

  return (
    <div className="role-page-content">
      <h1 className="main-title">Listado de Asistentes por Clase</h1>
      <p className="sub-title">Aquí puedes ver quiénes se han inscrito a cada clase.</p>

      {loadingClasses && (
        <div className="d-flex justify-content-center my-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando clases...</span>
          </Spinner>
        </div>
      )}

      {errorClasses && (
        <Alert variant="danger" className="my-4">
          {errorClasses}
        </Alert>
      )}

      {!loadingClasses && !errorClasses && classes.length === 0 && (
        <Alert variant="info" className="my-4">
          No hay clases disponibles para seleccionar asistentes.
        </Alert>
      )}

      {!loadingClasses && !errorClasses && classes.length > 0 && (
        <div className="my-4">
          <Form.Group controlId="classSelector" className="mb-3">
            <Form.Label className="d-block text-start fw-bold text-dark">Seleccionar Clase</Form.Label>
            <Form.Select
              value={selectedClassId || ''}
              onChange={(e) => setSelectedClassId(parseInt(e.target.value))}
            >
              {classes.map((clase) => (
                <option key={clase.id_clase} value={clase.id_clase}>
                  {clase.nombre_clase} ({clase.fecha_hora.toLocaleDateString()} {clase.fecha_hora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <h4>Asistentes para la clase seleccionada:</h4>

          {loadingAttendees && (
            <div className="d-flex justify-content-center my-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Cargando asistentes...</span>
              </Spinner>
            </div>
          )}

          {errorAttendees && (
            <Alert variant="danger" className="my-4">
              {errorAttendees}
            </Alert>
          )}

          {!loadingAttendees && !errorAttendees && attendees.length === 0 && (
            <Alert variant="info" className="my-4">
              No hay asistentes registrados para esta clase.
            </Alert>
          )}

          {!loadingAttendees && !errorAttendees && attendees.length > 0 && (
            <Table striped bordered hover responsive className="my-4">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Nombre</th>
                  <th>Correo</th>
                </tr>
              </thead>
              <tbody>
                {attendees.map((attendee) => (
                  <tr key={`${attendee.type}-${attendee.id}`}>
                    <td>{attendee.id}</td>
                    <td>{attendee.type === 'socio' ? 'Socio' : 'Visitante'}</td>
                    <td>{attendee.name || 'N/A'}</td>
                    <td>{attendee.email || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
} 