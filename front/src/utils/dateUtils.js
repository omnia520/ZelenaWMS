/**
 * Utilidades para formateo de fechas en zona horaria de Colombia (UTC-5)
 *
 * IMPORTANTE: Estas funciones SIEMPRE muestran la hora de Colombia,
 * sin importar la zona horaria del navegador del usuario.
 *
 * El backend usa 'timestamp without time zone' en PostgreSQL configurado
 * en zona horaria de Colombia. El driver pg-node lo envía como UTC, pero
 * representa la hora de Colombia. Usamos timeZone: 'UTC' para interpretar
 * el timestamp tal cual viene, y mostrarlo correctamente.
 */

/**
 * Formatea una fecha a formato colombiano con hora
 * @param {string} dateString - ISO date string from backend
 * @returns {string} Formatted date in Colombia timezone
 */
export const formatDate = (dateString) => {
  if (!dateString) return '-';

  return new Date(dateString).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'  // Interpreta el timestamp como está (ya viene en hora Colombia)
  });
};

/**
 * Formatea una fecha a formato colombiano solo fecha (sin hora)
 * @param {string} dateString - ISO date string from backend
 * @returns {string} Formatted date in Colombia timezone
 */
export const formatDateOnly = (dateString) => {
  if (!dateString) return '-';

  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'  // Interpreta el timestamp como está (ya viene en hora Colombia)
  });
};

/**
 * Formatea una fecha a formato corto (DD/MM/YYYY HH:mm)
 * @param {string} dateString - ISO date string from backend
 * @returns {string} Formatted date in Colombia timezone
 */
export const formatDateShort = (dateString) => {
  if (!dateString) return '-';

  return new Date(dateString).toLocaleString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'  // Interpreta el timestamp como está (ya viene en hora Colombia)
  });
};

/**
 * Formatea solo la hora en formato colombiano
 * @param {string} dateString - ISO date string from backend
 * @returns {string} Formatted time in Colombia timezone
 */
export const formatTimeOnly = (dateString) => {
  if (!dateString) return '-';

  return new Date(dateString).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'  // Interpreta el timestamp como está (ya viene en hora Colombia)
  });
};
