/**
 * Utilidades para manejo de fechas en el backend (siempre en UTC)
 */

/**
 * Obtiene la fecha y hora actual en UTC
 * @returns {Date} Fecha actual en UTC
 */
function getCurrentTimeUTC() {
  return new Date();
}

/**
 * Convierte una fecha ISO a fecha UTC
 * @param {string} isoString - Fecha en formato ISO
 * @returns {Date} Fecha en UTC
 */
function isoToUTCTime(isoString) {
  return new Date(isoString);
}

/**
 * Convierte fecha y hora local de Chile a ISO UTC
 * @param {Date} fecha - Fecha en zona horaria de Chile
 * @returns {string} Fecha en formato ISO UTC
 */
function chileTimeToISO(fecha) {
  return fecha.toISOString();
}

/**
 * Valida si una fecha es futura con margen de tiempo
 * @param {string|Date} fechaCita - Fecha de la cita (en UTC)
 * @param {number} margenMinutos - Margen en minutos (default: 30)
 * @returns {Object} {valida: boolean, error?: string}
 */
function validarFechaFutura(fechaCita, margenMinutos = 30) {
  const fecha = new Date(fechaCita);
  
  // Validar que la fecha sea válida
  if (isNaN(fecha.getTime())) {
    return {
      valida: false,
      error: "Formato de fecha inválido"
    };
  }
  
  // BLOQUEO ELIMINADO: Permitir agendar en cualquier fecha/hora
  // No validar si es futura, permitir cualquier fecha válida
  return { valida: true };
}

/**
 * Formatea una fecha UTC para mostrar en zona horaria de Chile
 * @param {Date|string} fecha - Fecha a formatear (en UTC)
 * @returns {string} Fecha formateada en zona horaria de Chile
 */
function formatearFechaChile(fecha) {
  const date = new Date(fecha);
  return date.toLocaleString('es-CL', {
    timeZone: 'America/Santiago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Obtiene la diferencia en minutos entre dos fechas
 * @param {Date|string} fecha1 - Primera fecha
 * @param {Date|string} fecha2 - Segunda fecha
 * @returns {number} Diferencia en minutos
 */
function diferenciaEnMinutos(fecha1, fecha2) {
  const f1 = new Date(fecha1);
  const f2 = new Date(fecha2);
  return (f2 - f1) / (1000 * 60);
}

/**
 * Convierte una fecha de zona horaria de Chile a UTC
 * @param {string} fechaChile - Fecha en formato ISO de Chile
 * @returns {string} Fecha en formato ISO UTC
 */
function convertirChileAUTC(fechaChile) {
  // Si la fecha viene como string, asumimos que está en zona horaria de Chile
  // y la convertimos a UTC
  const fecha = new Date(fechaChile);
  
  // Si la fecha es válida, la devolvemos en UTC
  if (!isNaN(fecha.getTime())) {
    return fecha.toISOString();
  }
  
  throw new Error("Formato de fecha inválido");
}

/**
 * Obtiene la fecha actual en zona horaria de Chile
 * @returns {Date} Fecha actual en zona horaria de Chile
 */
function getCurrentTimeChile() {
  const ahora = new Date();
  return new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Santiago' }));
}

/**
 * Valida que una fecha esté dentro del horario de atención
 * @param {string} fechaISO - Fecha en formato ISO (UTC)
 * @param {string} horaInicio - Hora de inicio (HH:MM)
 * @param {string} horaFin - Hora de fin (HH:MM)
 * @returns {boolean} true si está dentro del horario
 */
function estaEnHorarioAtencion(fechaISO, horaInicio, horaFin) {
  const fechaChile = new Date(fechaISO);
  const horaChile = fechaChile.toLocaleString('en-US', { timeZone: 'America/Santiago' });
  const fechaChileLocal = new Date(horaChile);
  
  const [horaInicioNum] = horaInicio.split(":").map(Number);
  const [horaFinNum] = horaFin.split(":").map(Number);
  const horaActual = fechaChileLocal.getHours();
  
  return horaActual >= horaInicioNum && horaActual < horaFinNum;
}

module.exports = {
  getCurrentTimeUTC,
  isoToUTCTime,
  chileTimeToISO,
  validarFechaFutura,
  formatearFechaChile,
  diferenciaEnMinutos,
  convertirChileAUTC,
  getCurrentTimeChile,
  estaEnHorarioAtencion
}; 