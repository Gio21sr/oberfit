// src/components/Providers.tsx
"use client"; // ¡IMPORTANTE! Este es un Client Component

import { SessionProvider } from "next-auth/react"; // Importa SessionProvider
import { SidebarProvider } from "@/lib/SidebarContext"; // Importa SidebarProvider
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    // Los proveedores de contexto se envuelven aquí
    <SessionProvider>
      <SidebarProvider>
        {children} {/* El contenido real de la aplicación */}
      </SidebarProvider>
    </SessionProvider>
  );
}