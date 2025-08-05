// src/components/ClassListTable.tsx
"use client";

import { useState, useEffect } from 'react';
import { Table, Spinner, Alert, Button, Modal, Form, Row, Col } from 'react-bootstrap';
import { getClasses, updateClass, deleteClass } from '@/app/actions';
import { formatDbDateTimeToLocal } from '@/utils/formatDate';

interface Clase {
  id_clase: number;
  nombre_clase: string;
  descripcion: string;
  fecha_hora: Date;
  cupo: number;
  capacidad_maxima: number | null;
}

interface ClassListTableProps {
  showActions?: boolean;
}

export default function ClassListTable({ showActions = false }: ClassListTableProps) {
  const [classes, setClasses] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentClass, setCurrentClass] = useState<Clase | null>(null);
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'danger', message: string } | null>(null);
  
  // Nuevos estados para manejar los campos de fecha y hora en el modal
  const [minDate, setMinDate] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [timeOptions, setTimeOptions] = useState<string[]>([]);

  // Función para obtener las clases de la base de datos
  const fetchClasses = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedClasses = await getClasses();
      const processedClasses = fetchedClasses.map((clase: Clase) => ({
        ...clase,
        fecha_hora: new Date(clase.fecha_hora),
      }));
      setClasses(processedClasses);
    } catch (err: any) {
      console.error("Error al cargar clases:", err);
      setError(err.message || "No se pudieron cargar las clases.");
    } finally {
      setLoading(false);
    }
  };

  // Se ejecuta al montar el componente para obtener las clases
  useEffect(() => {
    fetchClasses();
  }, []);

  // Se ejecuta cuando se abre el modal y cuando cambia la fecha en el modal para generar las opciones de hora
  useEffect(() => {
    if (!editDate) return;

    const fecha = new Date(editDate);
    const dayOfWeek = fecha.getDay();

    const newTimeOptions = [];
    let startHour = 0;
    let endHour = 0;

    switch (dayOfWeek) {
      case 1: case 2: case 3: case 4:
        startHour = 6;
        endHour = 22;
        break;
      case 5:
        startHour = 6;
        endHour = 21;
        break;
      case 6:
        startHour = 6;
        endHour = 14;
        break;
      case 0:
        startHour = 7;
        endHour = 14;
        break;
      default:
        break;
    }

    for (let hour = startHour; hour < endHour; hour++) {
      newTimeOptions.push(`${String(hour).padStart(2, '0')}:00`);
    }

    setTimeOptions(newTimeOptions);
  }, [editDate]);


  // Manejador para el botón "Editar" de una clase
  const handleEditClick = (clase: Clase) => {
    setCurrentClass(clase);
    // Extrae la fecha y la hora de la fecha_hora de la clase
    const datePart = clase.fecha_hora.toISOString().split('T')[0];
    const timePart = clase.fecha_hora.toTimeString().split(' ')[0].substring(0, 5);
    setEditDate(datePart);
    setEditTime(timePart);
    setShowEditModal(true);
  };
  
  // Manejador para el botón "Eliminar" de una clase
  const handleDeleteClick = async (id_clase: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta clase? Esta acción es irreversible.')) {
      return;
    }
    setResponseMessage(null);
    try {
      const formData = new FormData();
      formData.append('id_clase', id_clase.toString());
      await deleteClass(formData);
      setResponseMessage({ type: 'success', message: 'Clase eliminada con éxito.' });
      fetchClasses();
    } catch (err: any) {
      console.error("Error al eliminar clase:", err);
      setResponseMessage({ type: 'danger', message: err.message || 'Error al eliminar la clase.' });
    }
  };

  // Manejador para el envío del formulario de actualización en el modal
  const handleUpdateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setResponseMessage(null);
    if (!currentClass) return;

    const formData = new FormData(event.currentTarget);
    const date = formData.get('date') as string;
    const time = formData.get('time') as string;
    
    // Combina la fecha y la hora para enviarla a la Server Action
    const dateTime = `${date}T${time}`;
    formData.set('dateTime', dateTime);

    formData.append('id_clase', currentClass.id_clase.toString());

    try {
      await updateClass(formData);
      setResponseMessage({ type: 'success', message: 'Clase actualizada con éxito.' });
      setShowEditModal(false);
      fetchClasses();
    } catch (err: any) {
      console.error("Error al actualizar clase:", err);
      setResponseMessage({ type: 'danger', message: err.message || 'Error al actualizar la clase.' });
    }
  };
  
  return (
    <>
      {responseMessage && (
        <Alert variant={responseMessage.type} onClose={() => setResponseMessage(null)} dismissible className="my-3">
          {responseMessage.message}
        </Alert>
      )}
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
          No hay clases registradas aún.
        </Alert>
      )}
      {!loading && !error && classes.length > 0 && (
        <Table striped bordered hover responsive className="my-4">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Fecha y Hora</th>
              <th>Cupo Disp.</th>
              <th>Cupo Máx.</th>
              {showActions && <th>Acciones</th>}
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
                {showActions && (
                  <td>
                    <Button variant="warning" size="sm" className="me-2" onClick={() => handleEditClick(clase)}>
                      Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteClick(clase.id_clase)}>
                      Eliminar
                    </Button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal para Editar Clase */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Clase</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentClass && (
            <Form onSubmit={handleUpdateSubmit}>
              <Form.Group className="mb-3" controlId="editClassName">
                <Form.Label>Nombre de la Clase</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  defaultValue={currentClass.nombre_clase}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="editDescription">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  defaultValue={currentClass.descripcion}
                  required
                />
              </Form.Group>
              
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="editDate">
                    <Form.Label>Fecha</Form.Label>
                    <Form.Control 
                      type="date" 
                      name="date" 
                      required 
                      min={minDate}
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)} 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="editTime">
                    <Form.Label>Hora</Form.Label>
                    <Form.Select name="time" required value={editTime} onChange={(e) => setEditTime(e.target.value)}>
                      <option value="">Selecciona la hora</option>
                      {timeOptions.map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3" controlId="editCapacity">
                <Form.Label>Cupo Disponible</Form.Label>
                <Form.Control
                  type="number"
                  name="capacity"
                  min="0"
                  defaultValue={currentClass.cupo}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editCapacidadMaxima">
                <Form.Label>Capacidad Máxima</Form.Label>
                <Form.Control
                  type="number"
                  name="capacidadMaxima"
                  min="1"
                  defaultValue={currentClass.capacidad_maxima !== null ? currentClass.capacidad_maxima : 0}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                Guardar Cambios
              </Button>
            </Form>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}