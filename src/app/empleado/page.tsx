// src/app/empleado/page.tsx
// Esta será la página que se muestra cuando alguien va a /empleado
export default function EmpleadoHomePage() {
  return (
    <div className="role-page-content">
      <h1 className="main-title">Oberfit</h1>
      <h2 className="sub-title">Panel de Empleados</h2>
      <p className="description-text">Bienvenido al área de empleados. Utiliza el menú lateral para gestionar las clases.</p>
      {/* Aquí podrías añadir widgets para clases pendientes de registro, etc. */}
    </div>
  );
}