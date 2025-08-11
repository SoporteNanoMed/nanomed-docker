// ==========================================
// SCRIPT PARA LIMPIAR CACHÉ DEL FRONTEND
// ==========================================
// Descripción: Limpia el caché del navegador y localStorage para forzar actualización
// Uso: Ejecutar en la consola del navegador

// 1. Limpiar localStorage relacionado con citas y médicos
const keysToRemove = [
  'doctors_for_appointments',
  'doctors_for_appointments_time',
  'doctors_cache',
  'doctors_cache_time',
  'appointments_cache',
  'appointments_cache_time'
];

keysToRemove.forEach(key => {
  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
  }
});

// 2. Limpiar sessionStorage
sessionStorage.clear();

// 3. Forzar recarga de la página
// Opción 1: Recarga simple
// window.location.reload();

// Opción 2: Recarga forzada (ignora caché)
// window.location.reload(true);

// Opción 3: Recarga con parámetro de tiempo para evitar caché
const timestamp = new Date().getTime();
const currentUrl = window.location.href;
const separator = currentUrl.includes('?') ? '&' : '?';
window.location.href = currentUrl + separator + '_t=' + timestamp; 