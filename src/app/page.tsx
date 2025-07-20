// src/app/page.tsx
import Card from '@/components/Card'; // Importa el componente Card

export default function HomePage() {
  return (
    // Reemplazamos 'container' personalizado por clases de Bootstrap
    // 'container-fluid' para que ocupe todo el ancho, 'd-flex flex-column' para flexbox
    // 'align-items-center justify-content-center' para centrado, 'min-vh-100' para altura mínima
    <div className="container-fluid d-flex flex-column align-items-center justify-content-center py-5">
      {/* Reemplazamos 'main-content' por clases directas en este div */}
      <h1 className="display-1 fw-bold text-dark mb-3">Oberfit</h1> {/* 'display-1' para tamaño grande, 'fw-bold' para negrita */}
      <p className="lead text-muted mb-5">¡BIENVENIDO!</p> {/* 'lead' para texto destacado, 'text-muted' para color suave */}

      {/* Usamos 'row' y 'justify-content-center' para el contenedor de tarjetas */}
      {/* 'g-4' para un gap entre las columnas */}
      <div className="row justify-content-center g-4 w-100" style={{ maxWidth: '1000px' }}>
        {/* Cada Card estará dentro de una columna de Bootstrap */}
        <div className="col-12 col-md-6 col-lg-3"> {/* 12 columnas en móvil, 6 en md, 3 en lg */}
          <Card title="Admin" />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <Card title="Empleado" />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <Card title="Socio" />
        </div>
        <div className="col-12 col-md-6 col-lg-3">
          <Card title="Visitante" />
        </div>
      </div>
    </div>
  );
}