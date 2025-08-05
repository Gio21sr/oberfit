// src/components/LoginForm.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Form, Button, Card as BsCard, Alert } from 'react-bootstrap';
import { signIn } from "next-auth/react";

import { registerUser } from '@/app/actions'; 

interface LoginFormProps {
  currentRole: string;
}

export default function LoginForm({ currentRole }: LoginFormProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const showRegisterOption = currentRole === 'socio';
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setErrorMessage(null);
    setSuccessMessage(null); 

    try {
      if (showRegisterOption && isRegistering) {
        if (formData.get('password') !== formData.get('confirmPassword')) {
            setErrorMessage("Las contraseñas no coinciden.");
            return;
        }
        
        const result = await registerUser(formData); 
        
        if (result?.success) {
          setSuccessMessage(result.message); 
          setIsRegistering(false); 
        } else {
          setErrorMessage(result?.message || 'Error al registrar el usuario.');
        }
      } else {
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;

        const result = await signIn("credentials", {
          username,
          password,
          roleIntent: currentRole,
          redirect: false,
        });

        if (result?.error) {
          setErrorMessage(result.error); 
        } else if (result?.ok) {
          router.push(`/${currentRole}`);
        }
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Ocurrió un error inesperado.');
      console.error('Error en el formulario:', error);
    }
  };

  return (
    <BsCard className="p-4 shadow-sm text-center" style={{ maxWidth: '400px', margin: 'auto', backgroundColor: '#e8e8e8' }}>
      <BsCard.Title as="h2" className="mb-0 fs-1 fw-bold text-dark">Oberfit</BsCard.Title>
      <BsCard.Text className="lead text-muted mb-4">
        {isRegistering && showRegisterOption
          ? 'Registro de Nuevo Socio'
          : 'Inicio de Sesión'}
      </BsCard.Text>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form action={handleSubmit}>
        {isRegistering && showRegisterOption && (
          <Form.Group className="mb-3" controlId="formFullName">
            <Form.Label className="d-block text-start fw-bold text-dark">Nombre Completo</Form.Label>
            <Form.Control type="text" name="fullName" placeholder="Ingrese su nombre completo" required />
          </Form.Group>
        )}

        <Form.Group className="mb-3" controlId="formUsername">
          <Form.Label className="d-block text-start fw-bold text-dark">Usuario</Form.Label>
          <Form.Control type="text" name="username" placeholder="Usuario" required />
        </Form.Group>
        
        {isRegistering && showRegisterOption && (
          <Form.Group className="mb-3" controlId="formEmail">
            <Form.Label className="d-block text-start fw-bold text-dark">Correo Electrónico</Form.Label>
            <Form.Control type="email" name="email" placeholder="Ingrese su correo electrónico" required />
          </Form.Group>
        )}

        <Form.Group className="mb-3" controlId="formPassword">
          <Form.Label className="d-block text-start fw-bold text-dark">Contraseña</Form.Label>
          <Form.Control type="password" name="password" placeholder="Contraseña" required />
        </Form.Group>

        {isRegistering && showRegisterOption && (
          <Form.Group className="mb-4" controlId="formConfirmPassword">
            <Form.Label className="d-block text-start fw-bold text-dark">Confirmar Contraseña</Form.Label>
            <Form.Control type="password" name="confirmPassword" placeholder="Confirmar Contraseña" required />
          </Form.Group>
        )}

        <Button variant="dark" type="submit" className="w-100 py-3 fw-bold">
          {isRegistering && showRegisterOption ? 'Registrarse' : 'Ingresar'}
        </Button>
      </Form>

      {showRegisterOption && (
        <Button
          variant="link"
          className="mt-3 text-primary text-decoration-underline"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
        >
          {isRegistering
            ? '¿Ya tienes una cuenta? Iniciar Sesión'
            : '¿No tienes una cuenta? Regístrate aquí'}
        </Button>
      )}
    </BsCard>
  );
}