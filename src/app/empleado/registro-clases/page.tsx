// src/app/empleado/registro-clases/page.tsx
// No necesita "use client" ni estados, ya que el formulario está en el componente
import RegisterClassForm from '@/components/RegisterClassForm'; // <-- Reutiliza el componente

export default function EmpleadoRegisterClassPage() {
  return (
    <div className="role-page-content">
      <RegisterClassForm /> {/* Simplemente renderiza el componente del formulario */}
    </div>
  );
}