// src/components/RegisterClassForm.tsx
"use client"; // Este componente necesita interactividad del cliente (estados, eventos)

import { useState } from 'react';
// Importa componentes de React-Bootstrap para construir el formulario
import { Form, Button, Card as BsCard, Alert } from 'react-bootstrap'; 

// Importa la Server Action 'registerClass' desde tu archivo de acciones
import { registerClass } from '@/app/actions';

export default function RegisterClassForm() { // <-- ¡VERIFICA QUE ESTÉ 'export default' AQUÍ!
  // Estado para mostrar mensajes de respuesta al usuario (éxito o error)
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'danger', message: string } | null>(null);

  // Función que se ejecutará al enviar el formulario
  // Recibe automáticamente un objeto FormData si el <Form> tiene la prop 'action'
  const handleSubmit = async (formData: FormData) => {
    setResponseMessage(null); // Limpiar mensajes de respuesta anteriores al enviar

    try {
      // Llama a la Server Action 'registerClass' para manejar el registro en el servidor
      // La Server Action recibirá el FormData directamente desde el formulario HTML
      await registerClass(formData);

      // Si la Server Action no lanza un error, significa que la clase se registró con éxito
      setResponseMessage({ type: 'success', message: 'Clase registrada con éxito.' });

      // Opcional: Limpiar los campos del formulario después de un registro exitoso
      // Se accede a los elementos del formulario por su ID y se resetea su valor.
      // Es una forma de limpiar formularios no controlados por el estado de React.
      (document.getElementById('formClassName') as HTMLInputElement).value = '';
      (document.getElementById('formDescription') as HTMLTextAreaElement).value = '';
      (document.getElementById('formDateTime') as HTMLInputElement).value = '';
      (document.getElementById('formCapacity') as HTMLInputElement).value = '';

    } catch (error: any) {
      // Captura y muestra los errores lanzados desde la Server Action
      setResponseMessage({ type: 'danger', message: error.message || 'Error al registrar la clase.' });
      console.error('Error al registrar clase desde el componente RegisterClassForm:', error); // Log del error completo
    }
  };

  return (
    // Tarjeta de Bootstrap para contener el formulario, con padding, sombra y centrado
    <BsCard className="p-4 shadow-sm text-center" style={{ maxWidth: '600px', margin: 'auto' }}>
      {/* Título del formulario */}
      <BsCard.Title as="h2" className="mb-4 fs-3 fw-bold text-dark">Registrar Nueva Clase</BsCard.Title>

      {/* Muestra mensajes de respuesta (éxito o error) si existen */}
      {responseMessage && (
        <Alert variant={responseMessage.type} onClose={() => setResponseMessage(null)} dismissible>
          {responseMessage.message}
        </Alert>
      )}

      {/* Formulario de Bootstrap. El atributo 'action' apunta a la Server Action 'handleSubmit'. */}
      <Form action={handleSubmit}>
        {/* Grupo para el campo "Nombre de la Clase" */}
        <Form.Group className="mb-3" controlId="formClassName">
          <Form.Label className="d-block text-start fw-bold text-dark">Nombre de la Clase</Form.Label>
          <Form.Control type="text" name="name" placeholder="Ej: Yoga para Principiantes" required />
        </Form.Group>

        {/* Grupo para el campo "Descripción" */}
        <Form.Group className="mb-3" controlId="formDescription">
          <Form.Label className="d-block text-start fw-bold text-dark">Descripción</Form.Label>
          <Form.Control as="textarea" rows={3} name="description" placeholder="Describe brevemente la clase..." required />
        </Form.Group>

        {/* Grupo para el campo "Fecha y Hora" */}
        <Form.Group className="mb-3" controlId="formDateTime">
          <Form.Label className="d-block text-start fw-bold text-dark">Fecha y Hora</Form.Label>
          {/* type="datetime-local" proporciona un selector de fecha y hora nativo del navegador */}
          <Form.Control type="datetime-local" name="dateTime" required />
        </Form.Group>

        {/* Grupo para el campo "Cupo" */}
        <Form.Group className="mb-4" controlId="formCapacity">
          <Form.Label className="d-block text-start fw-bold text-dark">Cupo</Form.Label>
          {/* type="number" para entrada numérica, min="1" para asegurar al menos un cupo */}
          <Form.Control type="number" name="capacity" min="1" placeholder="Ej: 20" required />
        </Form.Group>

        {/* Botón de envío del formulario */}
        <Button variant="primary" type="submit" className="w-100 py-2 fw-bold">
          Registrar Clase
        </Button>
      </Form>
    </BsCard>
  );
}