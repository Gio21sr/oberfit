// src/utils/formatDate.ts
"use client";

// Define las opciones de formato para la zona horaria de la Ciudad de México
const timeZoneOptions: Intl.DateTimeFormatOptions = {
  timeZone: 'America/Mexico_City',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
};

/**
 * Formatea una fecha/hora UTC de la base de datos a un formato legible
 * en la zona horaria de la Ciudad de México.
 * @param date La fecha/hora como objeto Date o cadena de fecha válida.
 * @returns La fecha/hora formateada como string.
 */
export function formatDbDateTimeToLocal(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }

  // Usa la API de Intl para formatear directamente a la zona horaria de CDMX
  // y luego parsear el resultado para un formato específico.
  const formatter = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // Formato AM/PM para mayor claridad
  });

  return formatter.format(dateObj);
}

/**
 * Obtiene la fecha en formato YYYY-MM-DD para la zona horaria de la Ciudad de México.
 * @param date La fecha/hora como objeto Date o cadena de fecha válida.
 * @returns La fecha en formato de string.
 */
export function getLocalISODate(date: Date): string {
  // Crea un objeto de formato para la zona horaria de CDMX
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find(part => part.type === 'year')?.value;
  const month = parts.find(part => part.type === 'month')?.value;
  const day = parts.find(part => part.type === 'day')?.value;

  return `${year}-${month}-${day}`;
}

/**
 * Obtiene la hora en formato HH:mm para la zona horaria de la Ciudad de México.
 * @param date La fecha/hora como objeto Date o cadena de fecha válida.
 * @returns La hora en formato de string.
 */
export function getLocalTime(date: Date): string {
  // Crea un objeto de formato para la zona horaria de CDMX
  const formatter = new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Mexico_City',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return formatter.format(date);
}