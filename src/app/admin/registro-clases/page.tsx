// src/app/admin/registro-clases/page.tsx
// Este archivo ahora es muy simple, ya que el formulario ha sido refactorizado
// a un componente reutilizable.

import RegisterClassForm from '@/components/RegisterClassForm'; // Importa el componente del formulario

export default function AdminRegisterClassPage() {
  return (
    <div className="role-page-content"> {/* Usa la clase CSS general para el contenido de página de rol */}
      {/* Simplemente renderiza el componente del formulario de registro de clases */}
      <RegisterClassForm />
    </div>
  );
}