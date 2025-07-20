// src/app/admin/layout.tsx
"use client"; // Necesita ser Client Component para usar hooks

import { useEffect } from 'react';
import { useSidebar } from '@/lib/SidebarContext'; // Importa el hook

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { setCurrentRoleMenu } = useSidebar();

  useEffect(() => {
    setCurrentRoleMenu('admin'); // Establece el rol a 'admin' cuando este layout se monta
  }, [setCurrentRoleMenu]);

  return (
    <div className="container-fluid p-0 pt-5">
      <main className="d-flex flex-column flex-grow-1 p-3 p-md-4">
        {children}
      </main>
    </div>
  );
}