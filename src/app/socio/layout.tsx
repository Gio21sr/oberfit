// src/app/socio/layout.tsx
"use client";

import { useEffect } from 'react';
import { useSidebar } from '@/lib/SidebarContext';

export default function SocioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setCurrentRoleMenu } = useSidebar();

  useEffect(() => {
    setCurrentRoleMenu('socio'); // Establece el rol a 'socio'
  }, [setCurrentRoleMenu]);

  return (
    <div className="container-fluid p-0 pt-5">
      <main className="d-flex flex-column flex-grow-1 p-3 p-md-4">
        {children}
      </main>
    </div>
  );
}