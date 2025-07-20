"use client";

import { Offcanvas, Nav } from 'react-bootstrap';
import Link from 'next/link';
import { useSidebar } from '@/lib/SidebarContext';
import { signOut, useSession } from "next-auth/react";
import { useEffect } from 'react';

export default function GlobalSidebar() {
  const { data: session } = useSession();
  const {
    showSidebar, setShowSidebar,
    currentRoleMenu, currentUserName,
    setCurrentRoleMenu, setCurrentUserName
  } = useSidebar();

  const handleClose = () => setShowSidebar(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
    setCurrentRoleMenu(null);
    setCurrentUserName(null);
    handleClose();
  };

  useEffect(() => {
    if (session?.user) {
      setCurrentRoleMenu((session.user as any).role || null);
      setCurrentUserName(session.user.name || null);
    } else {
      setCurrentRoleMenu(null);
      setCurrentUserName(null);
    }
  }, [session, setCurrentRoleMenu, setCurrentUserName]);

  const menuItemsByRole: { [key: string]: { label: string; href: string }[] } = {
    admin: [
      { label: 'Inicio', href: '/admin' },
      { label: 'Registro Usuarios', href: '/admin/registro-usuarios' },
      { label: 'Gestionar Usuarios', href: '/admin/gestion-usuarios' },
      { label: 'Registro Clases', href: '/admin/registro-clases' },
      { label: 'Clases', href: '/admin/clases' },
      { label: 'Listado Asistentes', href: '/admin/listado-asistentes' },
    ],
    empleado: [
      { label: 'Inicio', href: '/empleado' },
      { label: 'Registro Clases', href: '/empleado/registro-clases' },
      { label: 'Clases Disponibles', href: '/empleado/clases-disponibles' },
      { label: 'Listado Asistentes', href: '/empleado/listado-asistentes' },
    ],
    socio: [
      { label: 'Inicio', href: '/socio' },
      { label: 'Clases Disponibles', href: '/socio/clases-disponibles' },
      { label: 'Mis Clases', href: '/socio/mis-clases' },
    ],
    visitante: [
      { label: 'Inicio', href: '/visitante' },
      { label: 'Clases Disponibles', href: '/visitante/clases-disponibles' },
      { label: 'Confirmación de Inscripción', href: '/visitante/inscripcion' },
    ],
    default: [
      { label: 'Inicio', href: '/' },
      { label: 'Clases Disponibles', href: '/visitante/clases-disponibles' },
      { label: 'Login', href: '/login' },
    ],
  };

  const activeMenuItems = currentRoleMenu && menuItemsByRole[currentRoleMenu]
    ? menuItemsByRole[currentRoleMenu]
    : menuItemsByRole.default;

  let offcanvasTitle = "Menú";
  let titleBgClass = '';
  if (currentRoleMenu) {
    switch (currentRoleMenu) {
      case 'admin': offcanvasTitle = 'Admin'; titleBgClass = 'admin-bg'; break;
      case 'empleado': offcanvasTitle = 'Empleado'; titleBgClass = 'empleado-bg'; break;
      case 'socio':
        offcanvasTitle = currentUserName ? `Bienvenido, ${currentUserName}` : 'Bienvenido, Socio';
        titleBgClass = 'socio-bg';
        break;
      case 'visitante': offcanvasTitle = 'Menú'; titleBgClass = 'visitante-bg'; break;
    }
  }

  return (
    <Offcanvas show={showSidebar} onHide={handleClose} placement="end" className="bg-dark text-white">
      <Offcanvas.Header closeButton className="bg-dark text-white">
        <Offcanvas.Title className={`sidebar-title ${titleBgClass}`}>
          {offcanvasTitle}
        </Offcanvas.Title>
      </Offcanvas.Header>

      <Offcanvas.Body className="p-0 bg-dark text-white d-flex flex-column">
        <Nav className="flex-column w-100 flex-grow-1">
          {activeMenuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="sidebar-link nav-link"
              onClick={handleClose}
            >
              {item.label}
            </Link>
          ))}

          {session?.user && currentRoleMenu && currentRoleMenu !== 'visitante' && (
            <button
              className="sidebar-link nav-link logout-link mt-auto"
              onClick={handleLogout}
              style={{ background: 'none', border: 'none', textAlign: 'left' }}
            >
              Cerrar Sesión
            </button>
          )}
        </Nav>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
