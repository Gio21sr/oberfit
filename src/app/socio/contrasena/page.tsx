// src/app/socio/contrasena/page.tsx
"use client";

import { useState } from 'react';
import { updatePassword } from '@/app/actions';
import { Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function PasswordChangeForm() {
  const [response, setResponse] = useState<{ success: boolean; message: string } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setResponse(null);

    const formData = new FormData(event.currentTarget);
    const result = await updatePassword(formData);

    setResponse(result);
  };
  
  return (
    <Card className="p-4 shadow-sm">
      <h3 className="text-center mb-4">Cambiar Contraseña</h3>
      {response && (
        <Alert variant={response.success ? 'success' : 'danger'}>
          {response.message}
        </Alert>
      )}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="formCurrentPassword">
          <Form.Label>Contraseña Actual</Form.Label>
          <InputGroup>
            <Form.Control 
              type={showCurrentPassword ? 'text' : 'password'} 
              name="currentPassword" 
              required 
            />
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-3" controlId="formNewPassword">
          <Form.Label>Nueva Contraseña</Form.Label>
          <InputGroup>
            <Form.Control 
              type={showNewPassword ? 'text' : 'password'} 
              name="newPassword" 
              required 
            />
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroup>
        </Form.Group>

        <Form.Group className="mb-4" controlId="formConfirmNewPassword">
          <Form.Label>Confirmar Nueva Contraseña</Form.Label>
          <InputGroup>
            <Form.Control 
              type={showConfirmNewPassword ? 'text' : 'password'} 
              name="confirmNewPassword" 
              required 
            />
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
            >
              {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
            </Button>
          </InputGroup>
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100">
          Guardar Cambios
        </Button>
      </Form>
    </Card>
  );
}