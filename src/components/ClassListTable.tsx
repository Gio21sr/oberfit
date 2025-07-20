// src/components/ClassListTable.tsx
"use client"; // Este componente necesita interactividad del cliente

import { useState, useEffect } from 'react';
// Importa componentes de React-Bootstrap para la tabla, spinner, alertas, botones, modales y formularios
import { Table, Spinner, Alert, Button, Modal, Form } from 'react-bootstrap'; 

// Importa las Server Actions necesarias para interactuar con las clases
import { getClasses, updateClass, deleteClass } from '@/app/actions'; 

// Importa la función de utilidad para formatear fechas a la zona horaria local
import { formatDbDateTimeToLocal } from '@/utils/formatDate'; 

// Define la interfaz para el objeto Clase, reflejando las columnas de la DB y el esquema de Prisma
interface Clase {
  id_clase: number;
  nombre_clase: string;
  descripcion: string;
  fecha_hora: Date;
  cupo: number; // Este es el cupo disponible
  capacidad_maxima: number | null;
}

// Propiedades que este componente puede recibir.
// showActions: un booleano para decidir si se muestran los botones de editar/eliminar.
interface ClassListTableProps {
  showActions?: boolean; 
}

// Componente principal de la tabla de listado de clases
export default function ClassListTable({ showActions = false }: ClassListTableProps) {
  const [classes, setClasses] = useState<Clase[]>([]); // Estado para almacenar la lista de clases
  const [loading, setLoading] = useState(true); // Estado para indicar si los datos están cargando
  const [error, setError] = useState<string | null>(null); // Estado para almacenar mensajes de error
  const [showEditModal, setShowEditModal] = useState(false); // Estado para controlar la visibilidad del modal de edición
  const [currentClass, setCurrentClass] = useState<Clase | null>(null); // Estado para la clase que se está editando
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'danger', message: string } | null>(null); // Estado para mensajes de éxito/error al usuario


  // Función asíncrona para obtener las clases de la base de datos
  const fetchClasses = async () => {
    try {
      setLoading(true); // Activa el estado de carga
      setError(null); // Limpia cualquier error previo
      const fetchedClasses = await getClasses(); // Llama a la Server Action para obtener las clases

      // Procesa las clases obtenidas: asegura que fecha_hora sea un objeto Date
      const processedClasses = fetchedClasses.map(clase => ({
        ...clase,
        fecha_hora: new Date(clase.fecha_hora), // Convierte la cadena de fecha a un objeto Date
      }));
      setClasses(processedClasses); // Actualiza el estado con las clases procesadas
    } catch (err: any) {
      console.error("Error al cargar clases:", err); // Log del error en consola
      setError(err.message || "No se pudieron cargar las clases."); // Muestra un mensaje de error al usuario
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  // useEffect para cargar las clases cuando el componente se monta
  useEffect(() => {
    fetchClasses();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  // Manejador para el botón "Editar" de una clase
  const handleEditClick = (clase: Clase) => {
    setCurrentClass(clase); // Establece la clase actual para el modal
    setShowEditModal(true); // Muestra el modal de edición
  };

  // Manejador para el botón "Eliminar" de una clase
  const handleDeleteClick = async (id_clase: number) => {
    // Pide confirmación al usuario antes de eliminar
    if (!confirm('¿Estás seguro de que quieres eliminar esta clase? Esta acción es irreversible.')) {
      return; // Si el usuario cancela, no hace nada
    }
    setResponseMessage(null); // Limpia cualquier mensaje de respuesta anterior
    try {
      // Crea un objeto FormData para enviar el ID de la clase a la Server Action
      const formData = new FormData();
      formData.append('id_clase', id_clase.toString());
      await deleteClass(formData); // Llama a la Server Action para eliminar la clase
      setResponseMessage({ type: 'success', message: 'Clase eliminada con éxito.' }); // Muestra mensaje de éxito
      fetchClasses(); // Vuelve a cargar la lista de clases para que el cambio se refleje
    } catch (err: any) {
      console.error("Error al eliminar clase:", err); // Log del error en consola
      setResponseMessage({ type: 'danger', message: err.message || 'Error al eliminar la clase.' }); // Muestra mensaje de error
    }
  };

  // Manejador para el envío del formulario de actualización en el modal
  const handleUpdateSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Evita el comportamiento por defecto de recargar la página

    setResponseMessage(null); // Limpia mensajes anteriores
    if (!currentClass) return; // Si no hay clase seleccionada, no hace nada

    const formData = new FormData(event.currentTarget); // Obtiene todos los datos del formulario

    // Añade el ID de la clase al FormData, ya que no es un campo directo del formulario
    formData.append('id_clase', currentClass.id_clase.toString()); 

    try {
      await updateClass(formData); // La Server Action espera 'name', 'description', 'dateTime', 'capacity', 'capacidadMaxima'
      setResponseMessage({ type: 'success', message: 'Clase actualizada con éxito.' }); // Muestra mensaje de éxito
      setShowEditModal(false); // Cierra el modal de edición
      fetchClasses(); // Recarga la lista de clases para que los cambios se vean
    } catch (err: any) {
      console.error("Error al actualizar clase:", err); // Log del error en consola
      setResponseMessage({ type: 'danger', message: err.message || 'Error al actualizar la clase.' }); // Muestra mensaje de error
    }
  };


  // Función de utilidad para formatear un objeto Date a la cadena esperada por input type="datetime-local"
  // Esto es necesario para que el valor por defecto del input funcione correctamente.
  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Meses son 0-indexados
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };


  return (
    <> {/* Fragmento para envolver múltiples elementos sin añadir un nodo DOM extra */}
      {/* Muestra mensajes de respuesta (éxito o error) */}
      {responseMessage && (
        <Alert variant={responseMessage.type} onClose={() => setResponseMessage(null)} dismissible className="my-3">
          {responseMessage.message}
        </Alert>
      )}

      {/* Muestra un spinner de carga mientras se obtienen los datos */}
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

      {/* Muestra un mensaje si no hay clases registradas y no hay errores */}
      {!loading && !error && classes.length === 0 && (
        <Alert variant="info" className="my-4">
          No hay clases registradas aún.
        </Alert>
      )}

      {/* Tabla para mostrar las clases si no está cargando y hay clases */}
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
            {/* ✅ CORRECCIÓN APLICADA AQUÍ */}
            {classes.map((clase) => (
              <tr key={clase.id_clase}><td>{clase.id_clase}</td>
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
          {currentClass && ( /* Renderiza el formulario solo si hay una clase seleccionada */
            <Form onSubmit={handleUpdateSubmit}>
              <Form.Group className="mb-3" controlId="editClassName">
                <Form.Label>Nombre de la Clase</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  defaultValue={currentClass.nombre_clase} // Precarga el valor actual
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editDescription">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  defaultValue={currentClass.descripcion} // Precarga el valor actual
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editDateTime">
                <Form.Label>Fecha y Hora</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="dateTime"
                  // Formatea la fecha para que el input datetime-local la entienda
                  defaultValue={formatDateTimeLocal(currentClass.fecha_hora)} 
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editCapacity">
                <Form.Label>Cupo Disponible</Form.Label>
                <Form.Control
                  type="number"
                  name="capacity"
                  min="0" // Permite 0 cupos disponibles
                  defaultValue={currentClass.cupo} // Precarga el valor actual
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="editCapacidadMaxima">
                <Form.Label>Capacidad Máxima</Form.Label>
                <Form.Control
                  type="number"
                  name="capacidadMaxima"
                  min="1" // La capacidad máxima debe ser al menos 1
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