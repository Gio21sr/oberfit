// src/utils/formatDate.ts

"use client";

/**
 * Formatea una fecha/hora UTC de la base de datos a la zona horaria de la Ciudad de México.
 * @param date La fecha/hora como objeto Date o cadena de fecha válida.
 * @returns La fecha/hora formateada como string en la zona horaria de CDMX.
 */
export function formatDbDateTimeToLocal(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Fecha inválida';
  }
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Mexico_City', // 🚨 Usa la zona horaria de CDMX
  };

  return dateObj.toLocaleString('es-MX', options);
}

// Función para obtener la fecha en formato local YYYY-MM-DD
export function getLocalISODate(date: Date): string {
  // Asegurarse de usar la zona horaria de CDMX para la conversión
  const localDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
  const year = localDate.getFullYear();
  const month = (localDate.getMonth() + 1).toString().padStart(2, '0');
  const day = localDate.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Función para obtener la hora en formato local HH:mm
export function getLocalTime(date: Date): string {
  // Asegurarse de usar la zona horaria de CDMX para la conversión
  const localDate = new Date(date.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));
  const hours = localDate.getHours().toString().padStart(2, '0');
  const minutes = localDate.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}