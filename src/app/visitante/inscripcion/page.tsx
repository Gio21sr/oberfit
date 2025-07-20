// src/app/visitante/inscripcion/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Form, Button, Card as BsCard, Alert, Spinner } from 'react-bootstrap';
import { getClasses, registerVisitorInscription } from '@/app/actions';
import { formatDbDateTimeToLocal } from '@/utils/formatDate';

interface ClaseSelect {
  id_clase: number;
  nombre_clase: string;
  fecha_hora: Date;
  cupo: number;
}

// Interfaz para los detalles de la inscripción a mostrar
interface ConfirmationDetails {
    id: number;
    nombre: string;
    correo: string;
    claseNombre: string;
    claseFechaHora: Date;
    codigo: number;
    metodoPago: string;
    detallesPago: {
        banco: string;
        cuenta: string;
        clabe: string;
        beneficiario: string;
    } | null;
}

export default function VisitanteInscriptionPage() {
  const [classes, setClasses] = useState<ClaseSelect[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [errorClasses, setErrorClasses] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'danger', message: string } | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationDetails | null>(null); // Estado para la confirmación


  useEffect(() => {
    async function fetchClassesForSelect() {
      try {
        setLoadingClasses(true);
        setErrorClasses(null);
        const fetchedClasses = await getClasses();
        const processedClasses = fetchedClasses.map(clase => ({
          ...clase,
          fecha_hora: new Date(clase.fecha_hora),
        }));
        setClasses(processedClasses.filter(clase => clase.cupo > 0));
      } catch (err: any) {
        console.error("Error al cargar clases para inscripción de visitante:", err);
        setErrorClasses(err.message || "No se pudieron cargar las clases para inscripción.");
      } finally {
        setLoadingClasses(false);
      }
    }
    fetchClassesForSelect();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    setResponseMessage(null);
    setConfirmation(null); // Limpiar confirmación anterior
    try {
      const selectedClassId = parseInt(formData.get('claseId') as string);
      if (isNaN(selectedClassId)) {
        throw new Error("Por favor, selecciona una clase.");
      }

      const selectedClass = classes.find(c => c.id_clase === selectedClassId);
      if (!selectedClass || selectedClass.cupo <= 0) {
        throw new Error("La clase seleccionada no tiene cupo disponible.");
      }

      const result = await registerVisitorInscription(formData);

      if (result.success && result.inscriptionDetails) {
          setConfirmation(result.inscriptionDetails); // Guarda los detalles para mostrar
          setResponseMessage({ type: 'success', message: '¡Inscripción exitosa! Detalles a continuación.' });

          // Limpiar el formulario después del envío exitoso
          (document.getElementById('formVisitorName') as HTMLInputElement).value = '';
          (document.getElementById('formVisitorEmail') as HTMLInputElement).value = '';
          (document.getElementById('formVisitorClassId') as HTMLSelectElement).value = '';
          (document.getElementById('formVisitorMetodoPago') as HTMLSelectElement).value = 'caja';

          // Opcional: Recargar las clases para reflejar el cupo actualizado si el usuario se queda en la página
          // fetchClasses(); 

      } else {
          throw new Error("Inscripción exitosa, pero hubo un problema al confirmar. Contacta soporte.");
      }

    } catch (error: any) {
      setResponseMessage({ type: 'danger', message: error.message || 'Error al inscribir como visitante.' });
      console.error('Error al inscribir visitante:', error);
    }
  };

  return (
    <div className="role-page-content">
      <BsCard className="p-4 shadow-sm text-center" style={{ maxWidth: '600px', margin: 'auto' }}>
        <BsCard.Title as="h2" className="mb-4 fs-3 fw-bold text-dark">Inscripción para Visitantes</BsCard.Title>
        <BsCard.Text className="text-muted mb-4">Regístrate para asistir a una de nuestras clases.</BsCard.Text>

        {responseMessage && (
          <Alert variant={responseMessage.type} onClose={() => setResponseMessage(null)} dismissible>
            {responseMessage.message}
          </Alert>
        )}

        {/* Panel de confirmación después de la inscripción exitosa */}
        {confirmation ? (
            <div className="confirmation-panel text-start my-4 p-3 border rounded bg-light">
                <h3 className="text-success mb-3">¡Inscripción Confirmada!</h3>
                <p><strong>Nombre:</strong> {confirmation.nombre}</p>
                <p><strong>Correo:</strong> {confirmation.correo}</p>
                <p><strong>Clase:</strong> {confirmation.claseNombre}</p>
                <p><strong>Fecha y Hora:</strong> {formatDbDateTimeToLocal(confirmation.claseFechaHora)}</p>
                <p><strong>Código de Confirmación:</strong> <span className="fw-bold text-primary">{confirmation.codigo}</span></p>
                <p><strong>Método de Pago:</strong> {confirmation.metodoPago}</p>

                {confirmation.detallesPago && (
                    <div className="mt-3 p-2 border rounded bg-white">
                        <p className="fw-bold">Detalles para Transferencia:</p>
                        <p><strong>Banco:</strong> {confirmation.detallesPago.banco}</p>
                        <p><strong>Cuenta:</strong> {confirmation.detallesPago.cuenta}</p>
                        <p><strong>Clabe:</strong> {confirmation.detallesPago.clabe}</p>
                        <p><strong>Beneficiario:</strong> {confirmation.detallesPago.beneficiario}</p>
                    </div>
                )}
                <Button variant="outline-secondary" className="mt-4" onClick={() => setConfirmation(null)}>
                    Realizar otra inscripción
                </Button>
            </div>
        ) : ( // Mostrar el formulario si no hay confirmación
            <>
            {loadingClasses ? (
              <div className="d-flex justify-content-center my-4">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Cargando clases...</span>
                </Spinner>
              </div>
            ) : errorClasses ? (
              <Alert variant="danger" className="my-4">{errorClasses}</Alert>
            ) : classes.length === 0 ? (
              <Alert variant="info" className="my-4">No hay clases disponibles para inscripción de visitantes.</Alert>
            ) : (
              <Form action={handleSubmit}>
                <Form.Group className="mb-3" controlId="formVisitorName">
                  <Form.Label className="d-block text-start fw-bold text-dark">Nombre</Form.Label>
                  <Form.Control type="text" name="nombre" placeholder="Tu nombre completo" required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formVisitorEmail">
                  <Form.Label className="d-block text-start fw-bold text-dark">Correo Electrónico</Form.Label>
                  <Form.Control type="email" name="correo" placeholder="Tu correo electrónico" required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formVisitorClassId">
                  <Form.Label className="d-block text-start fw-bold text-dark">Seleccionar Clase</Form.Label>
                  <Form.Select name="claseId" required>
                    <option value="">Selecciona una clase</option>
                    {classes.map(clase => (
                      <option key={clase.id_clase} value={clase.id_clase}>
                        {clase.nombre_clase} ({formatDbDateTimeToLocal(clase.fecha_hora)} - Cupo: {clase.cupo})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4" controlId="formVisitorMetodoPago">
                  <Form.Label className="d-block text-start fw-bold text-dark">Método de Pago</Form.Label>
                  <Form.Select name="metodoPago" required defaultValue="caja">
                    <option value="caja">Caja</option>
                    <option value="transferencia">Transferencia</option>
                  </Form.Select>
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 py-2 fw-bold">
                  Confirmar Inscripción
                </Button>
              </Form>
            )}
            </>
        )} {/* Fin del renderizado condicional */}
      </BsCard>
    </div>
  );
}