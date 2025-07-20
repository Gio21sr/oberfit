// src/lib/SidebarContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextType {
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  currentRoleMenu: string | null;
  setCurrentRoleMenu: (role: string | null) => void;
  currentUserName: string | null; // <-- ¡ESTO DEBE ESTAR AQUÍ!
  setCurrentUserName: (name: string | null) => void; // <-- ¡Y ESTO!
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentRoleMenu, setCurrentRoleMenu] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null); // <-- ESTADO INICIALIZADO

  return (
    <SidebarContext.Provider value={{ showSidebar, setShowSidebar, currentRoleMenu, setCurrentRoleMenu, currentUserName, setCurrentUserName }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}