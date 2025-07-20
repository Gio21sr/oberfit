// src/components/Card.tsx
// Adaptado para usar componentes de React-Bootstrap

import Link from 'next/link'; // Importa el componente Link de Next.js

// Importamos los componentes Card y Button de react-bootstrap usando aliases (BsCard, BsButton)
// para evitar conflictos de nombres con tu propio componente Card.
// También importamos CardBody, CardTitle, y CardFooter directamente con aliases.
import {
  Card as BsCard,           // Componente principal de Card de Bootstrap
  Button as BsButton,         // Componente Button de Bootstrap
  CardBody as BsCardBody,     // Sub-componente Card.Body de Bootstrap
  CardTitle as BsCardTitle,   // Sub-componente Card.Title de Bootstrap
  CardFooter as BsCardFooter  // Sub-componente Card.Footer de Bootstrap
} from 'react-bootstrap';

// Definición de las propiedades (props) que el componente Card puede recibir
interface CardProps {
  title: string; // El título de la tarjeta (ej. "Admin", "Empleado", "Socio", "Visitante")
}

// Componente funcional de React 'Card'
export default function Card({ title }: CardProps) {
  // Variable para almacenar la ruta de destino del enlace
  let hrefPath: string;

  // Lógica para determinar la ruta de destino basada en el título de la tarjeta
  if (title === "Visitante") {
    hrefPath = "/visitante"; // Si es Visitante, va directamente a la página /visitante
  } else if (title === "Socio") {
    // Si es Socio, va a la página /login y pasa el rol como parámetro de consulta
    hrefPath = "/login?role=socio";
  } else if (title === "Admin") {
    // Si es Admin, va a la página /login y pasa el rol como parámetro de consulta
    hrefPath = "/login?role=admin";
  } else if (title === "Empleado") {
    // Si es Empleado, va a la página /login y pasa el rol como parámetro de consulta
    hrefPath = "/login?role=empleado";
  } else {
    // Ruta de fallback por si el título no coincide con ninguna opción conocida
    hrefPath = "/login";
  }

  return (
    // Usa el componente principal BsCard de React-Bootstrap
    // Aplica clases de Bootstrap para centrado de texto, sombra, altura completa
    // 'transform-on-hover' es una clase CSS personalizada para el efecto de animación
    <BsCard className="text-center shadow h-100 transform-on-hover">
      {/* Contenido del cuerpo de la tarjeta, usando BsCardBody */}
      {/* Clases de Bootstrap para flexbox y centrado de contenido dentro del cuerpo */}
      <BsCardBody className="d-flex flex-column justify-content-center align-items-center">
        {/* Título de la tarjeta, usando BsCardTitle */}
        {/* 'as="h2"' renderiza el título como una etiqueta h2 */}
        {/* Clases de Bootstrap para margen, color y negrita */}
        <BsCardTitle as="h2" className="mb-0 text-primary fw-bold">
          {title}
        </BsCardTitle>
      </BsCardBody>

      {/* Pie de página de la tarjeta, usando BsCardFooter */}
      {/* Clases de Bootstrap para fondo y padding */}
      <BsCardFooter className="bg-light p-0">
        {/*
          Componente Link de Next.js para la navegación.
          - 'href': La ruta de destino determinada por la lógica anterior.
          - 'className': Aplica estilos directamente al Link para que se vea como un botón de bloque.
            'text-decoration-none' elimina el subrayado predeterminado del enlace.
            'w-100' hace que ocupe todo el ancho disponible.
        */}
        <Link href={hrefPath} className="text-decoration-none w-100">
          {/*
            Componente Button de React-Bootstrap.
            - 'variant="link"': Hace que el botón se vea como un enlace de texto plano de Bootstrap.
            - Otras clases de Bootstrap para padding, color de texto y negrita.
            El Link de Next.js envuelve a BsButton, manejando la navegación.
          */}
          <BsButton variant="link" className="text-decoration-none w-100 py-3 text-dark fw-bold">
            Acceder
          </BsButton>
        </Link>
      </BsCardFooter>
    </BsCard>
  );
}