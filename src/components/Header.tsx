// src/components/Header.tsx
"use client"; // Necesita ser Client Component si interactúa con estado global de la sidebar

import Image from 'next/image';
import Link from 'next/link';
import { Button } from 'react-bootstrap'; // Importa Button de React-Bootstrap

// Contexto para controlar la visibilidad de la sidebar global
import { useSidebar } from '@/lib/SidebarContext'; // Lo crearemos en el siguiente paso

export default function Header() {
  const { setShowSidebar } = useSidebar(); // Obtiene la función para mostrar la sidebar

  return (
    // Usamos Navbar de Bootstrap para un encabezado más robusto y fijo
    // 'fixed-top' para que quede fijo arriba, 'bg-light' para fondo claro, 'shadow-sm' para sombra
    // 'px-4 py-3' para padding
    <header className="fixed-top bg-light shadow-sm px-4 py-3 d-flex justify-content-between align-items-center">
      {/* Logo como enlace a la página principal */}
      <Link href="/" className="d-flex align-items-center">
        <Image
          src="/oberlicht-logo.png"
          alt="Logo de Oberlicht"
          width={150} // Ajusta el tamaño del logo si es necesario
          height={70}
          priority
        />
      </Link>

      {/* Botón de menú (hamburguesa) a la derecha */}
      <Button variant="link" onClick={() => setShowSidebar(true)} className="text-dark p-0">
        <i className="bi bi-list fs-1"></i> {/* Ícono de Bootstrap Icons */}
      </Button>
    </header>
  );
}