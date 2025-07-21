// src/app/test-clases-ui/page.tsx
"use client"; // Es un componente de cliente porque interactúa con el navegador

import { useState, useEffect } from 'react';

interface Clase {
  id_clase: number;
  nombre_clase: string;
  fecha_hora: string; // La API devolverá la fecha como string
  // ... otras propiedades de Clase si las necesitas
}

export default function TestClasesPage() {
  const [clases, setClases] = useState<Clase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClases() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/test-clases'); // Llama a tu API Route
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error desconocido al obtener clases de la API.');
        }
        const data: Clase[] = await response.json();
        setClases(data);
      } catch (err: any) {
        console.error("Error al obtener clases:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchClases();
  }, []);

  if (loading) return <p>Cargando clases...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (clases.length === 0) return <p>No hay clases disponibles.</p>;

  return (
    <div>
      <h1>Clases de Prueba</h1>
      <ul>
        {clases.map(clase => (
          <li key={clase.id_clase}>
            {clase.nombre_clase} - {new Date(clase.fecha_hora).toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}