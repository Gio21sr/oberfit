// src/app/login/page.tsx
"use client";

import LoginForm from '@/components/LoginForm';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react'; // <-- Import Suspense

// Componente auxiliar para renderizar LoginForm y usar useSearchParams
function LoginFormWrapper() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role');

  return <LoginForm currentRole={role || ''} />;
}

export default function LoginPage() {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center flex-grow-1 py-5" style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Envuelve el componente que usa useSearchParams en Suspense */}
      <Suspense fallback={<div>Cargando formulario...</div>}> {/* Puedes poner un spinner o null como fallback */}
        <LoginFormWrapper />
      </Suspense>
    </div>
  );
}