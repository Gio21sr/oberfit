// src/app/empleado/clases-disponibles/page.tsx
// No necesita "use client" ni estados, ya que la tabla está en el componente
import ClassListTable from '@/components/ClassListTable'; // <-- Reutiliza el componente

export default function EmpleadoClassesPage() {
  return (
    <div className="role-page-content">
      <h1 className="main-title">Clases Disponibles</h1>
      <p className="sub-title">Aquí puedes ver todas las clases programadas.</p>

      {/* Simplemente renderiza el componente de la tabla, sin showActions */}
      <ClassListTable showActions={false} /> {/* Empleado solo ve, no edita/elimina clases desde esta vista */}
    </div>
  );
}