// src/utils/formatDate.ts
"use client";

// No necesitamos importar 'format' ni 'utcToZonedTime' de librerías externas con esta opción
// import { format } from 'date-fns';
// import { utcToZonedTime } from 'date-fns-tz';

// No necesitamos userTimeZone directamente para toLocaleString, ya que lo usa por defecto.
// const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

/**
 * Formatea una fecha/hora UTC obtenida de la base de datos a la zona horaria local del usuario
 * usando la API nativa de JavaScript.
 * @param date La fecha/hora como objeto Date o cadena de fecha válida.
 * @returns La fecha/hora formateada como string.
 */
export function formatDbDateTimeToLocal(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }

  // Opciones de formato. Puedes ajustarlas según tus preferencias.
  // month: '2-digit' o 'numeric' o 'long' (ej. 07, 7, Julio)
  // day: '2-digit' o 'numeric'
  // year: 'numeric' (ej. 2025)
  // hour: '2-digit' o 'numeric'
  // minute: '2-digit'
  // hour12: true/false (formato 12h AM/PM o 24h)
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false, // Usar formato 24 horas (ej. 22:52)
    // No necesitas especificar timeZone aquí si quieres la zona horaria del usuario por defecto
    // timeZone: 'America/Mexico_City', // Si quisieras forzar una zona horaria específica
  };

  // El primer argumento es el locale (ej. 'es-MX' para español de México)
  // El segundo argumento son las opciones de formato
  return dateObj.toLocaleString(navigator.language, options); // Usa el idioma del navegador del usuario
}

// Opcional: Función para formatear solo la hora
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) {
    return 'Hora inválida';
  }
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  return dateObj.toLocaleString(navigator.language, options);
}