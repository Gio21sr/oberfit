// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './globals.css';

import Header from '@/components/Header'; // Este Header aún puede ser un Server Component o Client Component
import GlobalSidebar from '@/components/GlobalSidebar'; // Este GlobalSidebar puede ser un Client Component

// ¡NUEVA IMPORTACIÓN!
import Providers from '@/components/Providers'; // <-- Importa el nuevo componente Providers

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Oberfit App',
  description: 'Aplicación de gestión para Oberfit',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* El Header y GlobalSidebar ahora deben ir DENTRO de Providers,
            ya que necesitan el contexto de la sesión/sidebar.
            O pueden ser Client Components que obtengan los datos de sesión/sidebar si están fuera.
            Para simplificar, los ponemos dentro. */}
        <Providers> {/* <-- Envuelve con Providers */}
          {/* Header global */}
          <Header /> 
          {/* Sidebar global */}
          <GlobalSidebar /> 

          {/* El contenido de la página actual se renderiza aquí */}
          {children}
        </Providers> {/* <-- Cierre de Providers */}
      </body>
    </html>
  );
}