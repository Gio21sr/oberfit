// src/app/acceso-denegado/page.tsx
"use client"; // Es necesario para usar componentes de React-Bootstrap con interactividad o que no son puros Server Components

import Link from 'next/link';
// Importa los componentes de React-Bootstrap que se usarán, con sus aliases si es necesario
import { Card as BsCard, Button as BsButton, CardTitle as BsCardTitle, CardText as BsCardText, CardBody as BsCardBody } from 'react-bootstrap';

export default function AccessDeniedPage() {
  return (
    // Contenedor principal para centrar el contenido en la página
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Tarjeta de Bootstrap para el mensaje de acceso denegado */}
      <BsCard className="p-4 shadow-sm text-center" style={{ maxWidth: '500px', backgroundColor: '#e8e8e8' }}>
        {/* Cuerpo de la tarjeta */}
        <BsCardBody>
          {/* Título del mensaje */}
          <BsCardTitle as="h2" className="mb-3 fs-1 fw-bold text-danger">Acceso Denegado</BsCardTitle>
          {/* Texto del mensaje */}
          <BsCardText className="lead text-muted mb-4">
            No tienes permiso para acceder a esta página.
          </BsCardText>
          {/* Enlace para volver al inicio */}
          {/* ¡¡¡CORRECCIÓN CLAVE AQUÍ!!! Añadir passHref y legacyBehavior */}
          <Link href="/" passHref legacyBehavior> 
            <BsButton variant="dark" className="w-100 py-3 fw-bold">
              Volver al Inicio
            </BsButton>
          </Link>
        </BsCardBody>
      </BsCard>
    </div>
  );
}