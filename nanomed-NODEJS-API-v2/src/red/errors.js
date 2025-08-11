const respuesta = require("./respuestas");

function errors(err, req, res, next) {
  console.error("[Error]:", {
    message: err.message,
    code: err.code,
    stack: err.stack,
  });

  // Asegurarse de que el status sea un número
  let status = 500;
  if (typeof err.code === 'number' && !isNaN(err.code)) {
    status = err.code;
  }

  // Mensaje personalizado según el código de estado
  let message = err.message || "Error interno del servidor";
  switch (status) {
    case 400:
      message = message || "Solicitud incorrecta";
      break;
    case 401:
      message = message || "No autorizado";
      break;
    case 403:
      message = message || "Acceso prohibido";
      break;
    case 404:
      message = message || "Recurso no encontrado";
      break;
    case 409:
      message = message || "Conflicto con el recurso actual";
      break;
    case 429:
      message = message || "Demasiadas solicitudes";
      break;
    default:
      if (status >= 500) {
        // En producción, no exponer detalles de errores del servidor
        message = process.env.NODE_ENV === 'production' 
          ? "Error interno del servidor"
          : message;
      }
  }

  respuesta.error(req, res, message, status);
}

module.exports = errors;
