// src/app/admin/page.tsx
// Esta será la página que se muestra cuando alguien va a /admin
export default function AdminHomePage() {
  return (
    <div className="role-page-content">
      <h1 className="main-title">Oberfit</h1> {/* Título principal */}
      <h2 className="sub-title">Panel de Administración</h2> {/* Subtítulo */}
      <p className="description-text">Bienvenido al área de administración. Utiliza el menú lateral para navegar.</p>
      {/* Aquí podrías añadir un resumen de datos, estadísticas, etc. */}
    </div>
  );
}