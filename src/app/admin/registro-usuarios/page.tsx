// src/app/admin/registro-usuarios/page.tsx
"use client"; // Este formulario necesita interactividad del cliente

import { useState } from 'react';
// Importa componentes de React-Bootstrap para el formulario
import { Form, Button, Card as BsCard, Alert } from 'react-bootstrap'; 

// Importa la Server Action para registrar usuarios por Admin (la crearemos en el siguiente paso)
import { registerUserByAdmin } from '@/app/actions';

export default function RegisterUserByAdminPage() {
  // Estado para mostrar mensajes de respuesta al usuario (éxito o error)
  const [responseMessage, setResponseMessage] = useState<{ type: 'success' | 'danger', message: string } | null>(null);

  // Función que se ejecutará al enviar el formulario
  // Recibe automáticamente un objeto FormData si el <Form> tiene la prop 'action'
  const handleSubmit = async (formData: FormData) => {
    setResponseMessage(null); // Limpiar mensajes de respuesta anteriores

    try {
      // Llama a la Server Action 'registerUserByAdmin'
      await registerUserByAdmin(formData);

      setResponseMessage({ type: 'success', message: 'Usuario registrado con éxito.' });
      // Opcional: Limpiar el formulario después de un registro exitoso
      (document.getElementById('formUsername') as HTMLInputElement).value = '';
      (document.getElementById('formEmail') as HTMLInputElement).value = '';
      (document.getElementById('formPassword') as HTMLInputElement).value = '';
      (document.getElementById('formConfirmPassword') as HTMLInputElement).value = '';
      (document.getElementById('formRole') as HTMLSelectElement).value = 'empleado'; // Reset a default
    } catch (error: any) {
      // Captura y muestra los errores lanzados desde la Server Action
      setResponseMessage({ type: 'danger', message: error.message || 'Error al registrar el usuario.' });
      console.error('Error al registrar usuario desde el cliente:', error);
    }
  };

  return (
    <div className="role-page-content"> {/* Usa la clase CSS general para el contenido de página de rol */}
      <BsCard className="p-4 shadow-sm text-center" style={{ maxWidth: '600px', margin: 'auto' }}>
        <BsCard.Title as="h2" className="mb-4 fs-3 fw-bold text-dark">Registrar Nuevo Usuario</BsCard.Title>

        {responseMessage && (
          <Alert variant={responseMessage.type} onClose={() => setResponseMessage(null)} dismissible>
            {responseMessage.message}
          </Alert>
        )}

        {/* Formulario de Bootstrap. El atributo 'action' apunta a la Server Action. */}
        <Form action={handleSubmit}>
          {/* Campo para el Nombre de Usuario */}
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label className="d-block text-start fw-bold text-dark">Nombre de Usuario</Form.Label>
            <Form.Control type="text" name="username" placeholder="Ingrese nombre de usuario" required />
          </Form.Group>

          {/* Campo para el Correo Electrónico (empleados y socios lo tienen) */}
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label className="d-block text-start fw-bold text-dark">Correo Electrónico</Form.Label>
            <Form.Control type="email" name="email" placeholder="Ingrese correo electrónico" required />
          </Form.Group>

          {/* Campo para la Contraseña */}
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label className="d-block text-start fw-bold text-dark">Contraseña</Form.Label>
            <Form.Control type="password" name="password" placeholder="Ingrese contraseña" required />
          </Form.Group>

          {/* Campo para Confirmar Contraseña */}
          <Form.Group className="mb-3" controlId="formConfirmPassword">
            <Form.Label className="d-block text-start fw-bold text-dark">Confirmar Contraseña</Form.Label>
            <Form.Control type="password" name="confirmPassword" placeholder="Confirme contraseña" required />
          </Form.Group>

          {/* Selector de Rol */}
          <Form.Group className="mb-4" controlId="formRole">
            <Form.Label className="d-block text-start fw-bold text-dark">Rol del Usuario</Form.Label>
            <Form.Select name="role" required>
              <option value="empleado">Empleado</option>
              <option value="socio">Socio</option>
            </Form.Select>
          </Form.Group>

          {/* Botón de envío del formulario */}
          <Button variant="primary" type="submit" className="w-100 py-2 fw-bold">
            Registrar Usuario
          </Button>
        </Form>
      </BsCard>
    </div>
  );
}