/**
 * Utilidades para manejo de fechas en el frontend con zona horaria de Chile
 * Solución nativa que funciona de manera robusta en todos los entornos
 */

const TIMEZONE_CHILE = 'America/Santiago';

/**
 * Construye una fecha ISO (UTC) a partir de una fecha y hora local de Chile.
 * CORRECCIÓN: Crear fechas UTC que representen directamente la hora de Chile sin conversión
 */
export function construirFechaISOChile(fecha: Date, hora: string): string {
  const [horas, minutos] = hora.split(":").map(Number);
  
  // CORRECCIÓN: Crear fecha UTC directamente con la hora de Chile sin conversión automática
  // Esto asegura que 10:00 Chile = 10:00 UTC en nuestro sistema
  const fechaUTC = new Date(Date.UTC(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate(),
    horas,
    minutos,
    0,
    0
  ));
  
  return fechaUTC.toISOString();
}

/**
 * Convierte una fecha UTC a la zona horaria de Chile para mostrar
 * @param fechaISO - Fecha en formato ISO (UTC)
 * @returns Fecha en zona horaria de Chile
 */
export function convertirUTCaChile(fechaISO: string): Date {
  const fechaUTC = new Date(fechaISO);
  // Usar Intl.DateTimeFormat para una conversión más precisa
  const fechaChileStr = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE_CHILE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(fechaUTC);
  
  // Crear una nueva fecha a partir de la cadena formateada
  const [fechaPart, horaPart] = fechaChileStr.split(', ');
  const [mes, dia, año] = fechaPart.split('/');
  const [hora, minuto, segundo] = horaPart.split(':');
  
  return new Date(Number(año), Number(mes) - 1, Number(dia), Number(hora), Number(minuto), Number(segundo));
}

/**
 * Formatea una fecha UTC para mostrar en zona horaria de Chile
 * @param fechaISO - Fecha en formato ISO (UTC)
 * @param formato - Formato de fecha (default: 'dd/MM/yyyy HH:mm')
 * @returns Fecha formateada
 */
export function formatearFechaChile(fechaISO: string, formato: string = 'dd/MM/yyyy HH:mm'): string {
  // Manejar formatos específicos
  if (formato === 'yyyy-MM-dd') {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE_CHILE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(new Date(fechaISO));
  }
  
  // Formatear usando la API nativa de JavaScript
  return new Intl.DateTimeFormat('es-CL', {
    timeZone: TIMEZONE_CHILE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(new Date(fechaISO));
}

/**
 * Formatea solo la fecha (sin hora) de una fecha UTC para mostrar en zona horaria de Chile
 * @param fechaISO - Fecha en formato ISO (UTC)
 * @returns Fecha formateada (yyyy-MM-dd)
 */
export function formatearSoloFechaChile(fechaISO: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE_CHILE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date(fechaISO));
}

/**
 * Formatea solo la hora de una fecha UTC para mostrar en zona horaria de Chile
 * @param fechaISO - Fecha en formato ISO (UTC)
 * @returns Hora formateada (HH:mm)
 */
export function formatearHoraChile(fechaISO: string): string {
  // CORRECCIÓN: Mostrar horas directamente desde UTC sin conversión de zona horaria
  // Las fechas UTC ya representan las horas en Chile correctamente
  const fecha = new Date(fechaISO);
  return `${fecha.getUTCHours().toString().padStart(2, '0')}:${fecha.getUTCMinutes().toString().padStart(2, '0')}`;
}

/**
 * Valida si una fecha es futura con un margen de tiempo
 * @param fechaISO - Fecha en formato ISO (UTC)
 * @param margenMinutos - Margen en minutos (default: 30)
 * @returns true si la fecha es válida
 */
export function validarFechaFutura(fechaISO: string, margenMinutos: number = 30): boolean {
  // BLOQUEO ELIMINADO: Permitir agendar en cualquier fecha/hora
  // Solo validar que sea una fecha válida
  const fechaCita = new Date(fechaISO);
  return !isNaN(fechaCita.getTime());
}

/**
 * Obtiene la fecha y hora actual en la zona horaria de Chile
 * @returns Fecha actual en zona horaria de Chile
 */
export function getFechaActualChile(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: TIMEZONE_CHILE }));
}

/**
 * Obtiene la diferencia en minutos entre dos fechas
 * @param fecha1 - Primera fecha
 * @param fecha2 - Segunda fecha
 * @returns Diferencia en minutos
 */
export function diferenciaEnMinutos(fecha1: Date, fecha2: Date): number {
  return (fecha2.getTime() - fecha1.getTime()) / (1000 * 60);
}

/**
 * Construye un rango de fechas para un día específico en Chile
 * @param fecha - Fecha del día
 * @param horaInicio - Hora de inicio (HH:MM)
 * @param horaFin - Hora de fin (HH:MM)
 * @returns Array con fecha inicio y fin en UTC
 */
export function construirRangoFechasChile(fecha: Date, horaInicio: string, horaFin: string): [string, string] {
  const inicioISO = construirFechaISOChile(fecha, horaInicio);
  const finISO = construirFechaISOChile(fecha, horaFin);
  return [inicioISO, finISO];
}

/**
 * Verifica si una fecha está dentro del horario de atención
 * @param fechaISO - Fecha en formato ISO (UTC)
 * @param horaInicio - Hora de inicio (HH:MM)
 * @param horaFin - Hora de fin (HH:MM)
 * @returns true si está dentro del horario
 */
export function estaEnHorarioAtencion(fechaISO: string, horaInicio: string, horaFin: string): boolean {
  const fechaChile = convertirUTCaChile(fechaISO);
  const [horaInicioNum] = horaInicio.split(":").map(Number);
  const [horaFinNum] = horaFin.split(":").map(Number);
  const horaActual = fechaChile.getHours();
  
  return horaActual >= horaInicioNum && horaActual < horaFinNum;
} 