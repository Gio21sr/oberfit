// src/app/admin/clases/page.tsx
import ClassListTable from '@/components/ClassListTable'; // <-- Importa el nuevo componente

export default function AdminClassesPage() {
  return (
    <div className="role-page-content">
      <h1 className="main-title">Gestión de Clases</h1>
      <p className="sub-title">Aquí puedes ver, editar y eliminar las clases registradas.</p>

      {/* Simplemente renderiza el componente de la tabla, pasándole showActions={true}
          para que se muestren los botones de editar y eliminar para el Admin. */}
      <ClassListTable showActions={true} /> 
    </div>
  );
} 