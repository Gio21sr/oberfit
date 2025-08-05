// src/app/login-interno/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Button, Card as BsCard, Alert } from 'react-bootstrap';
import { signIn } from "next-auth/react";
import Link from 'next/link';

export default function InternalLoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(event.currentTarget);
    const roleIntent = formData.get('roleIntent') as string;
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
        roleIntent,
      });

      if (result?.error) {
        setErrorMessage("Credenciales o rol incorrectos. Inténtalo de nuevo.");
      } else if (result?.ok) {
        router.push(`/${roleIntent}`);
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Ocurrió un error inesperado.');
    }
  };

  return (
    // Se usa un contenedor similar al de la página de inicio
    <div className="container-fluid d-flex justify-content-center align-items-center py-5 min-vh-100">
      <BsCard className="p-4 shadow-sm text-center" style={{ maxWidth: '400px', margin: 'auto' }}>
        <BsCard.Title as="h2" className="mb-0 fs-1 fw-bold text-dark">
          Acceso Personal
        </BsCard.Title>
        <BsCard.Text className="lead text-muted mb-4">
          Ingresa con tus credenciales de Admin o Empleado
        </BsCard.Text>

        {errorMessage && (
          <Alert variant="danger" onClose={() => setErrorMessage(null)} dismissible>
            {errorMessage}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formRole">
            <Form.Label className="d-block text-start fw-bold text-dark">Selecciona tu Rol</Form.Label>
            <Form.Select name="roleIntent" required>
              <option value="">Selecciona tu rol...</option>
              <option value="admin">Admin</option>
              <option value="empleado">Empleado</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label className="d-block text-start fw-bold text-dark">Usuario</Form.Label>
            <Form.Control type="text" name="username" placeholder="Usuario" required />
          </Form.Group>

          <Form.Group className="mb-4" controlId="formPassword">
            <Form.Label className="d-block text-start fw-bold text-dark">Contraseña</Form.Label>
            <Form.Control type="password" name="password" placeholder="Contraseña" required />
          </Form.Group>

          <Button variant="dark" type="submit" className="w-100 py-3 fw-bold">
            Ingresar
          </Button>
        </Form>
        <div className="mt-3 text-center">
          <Link href="/" className="text-primary text-decoration-underline">
            Volver a la página principal
          </Link>
        </div>
      </BsCard>
    </div>
  );
}