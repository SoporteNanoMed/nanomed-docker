const validator = require('validator');

/**
 * Middleware de sanitización global para limpiar inputs maliciosos
 */
function sanitizeInput(req, res, next) {
  try {
    // Sanitizar body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitizar query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitizar params
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    console.error('Error en sanitización:', error);
    next(error);
  }
}

/**
 * Sanitiza un objeto recursivamente
 */
function sanitizeObject(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => 
      typeof item === 'object' ? sanitizeObject(item) : sanitizeString(item)
    );
  }

  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = sanitizeString(key);
      
      if (typeof value === 'object' && value !== null) {
        sanitized[sanitizedKey] = sanitizeObject(value);
      } else {
        sanitized[sanitizedKey] = sanitizeString(value);
      }
    }
    return sanitized;
  }

  return sanitizeString(obj);
}

/**
 * Sanitiza strings individuales
 */
function sanitizeString(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // Escapar HTML para prevenir XSS
  let sanitized = validator.escape(input);
  
  // Remover caracteres de control peligrosos
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Normalizar espacios en blanco
  sanitized = sanitized.trim();
  
  return sanitized;
}

/**
 * Middleware específico para sanitizar solo ciertos campos
 */
function sanitizeFields(fields) {
  return (req, res, next) => {
    try {
      fields.forEach(field => {
        if (req.body && req.body[field]) {
          req.body[field] = sanitizeString(req.body[field]);
        }
      });
      next();
    } catch (error) {
      console.error('Error en sanitización de campos:', error);
      next(error);
    }
  };
}

/**
 * Validador personalizado para RUT chileno
 */
function validarRUT(rut) {
  if (!rut || typeof rut !== 'string') {
    return false;
  }

  // Limpiar el RUT
  const rutLimpio = rut.replace(/[^0-9kK]/g, '');
  
  if (rutLimpio.length < 8 || rutLimpio.length > 9) {
    return false;
  }

  const cuerpo = rutLimpio.slice(0, -1);
  const dv = rutLimpio.slice(-1).toLowerCase();

  // Calcular dígito verificador
  let suma = 0;
  let multiplo = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i]) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }

  const dvCalculado = 11 - (suma % 11);
  const dvEsperado = dvCalculado === 11 ? '0' : dvCalculado === 10 ? 'k' : dvCalculado.toString();

  return dv === dvEsperado;
}

/**
 * Validador para números de teléfono chilenos
 */
function validarTelefonoChileno(telefono) {
  if (!telefono || typeof telefono !== 'string') {
    return false;
  }

  // Limpiar el teléfono
  const telefonoLimpio = telefono.replace(/\D/g, '');
  
  // Patrones válidos para Chile
  const patronesValidos = [
    /^56[2-9]\d{8}$/,     // +56 + código área + número (fijo)
    /^569\d{8}$/,         // +56 + 9 + número móvil
    /^[2-9]\d{8}$/,       // Código área + número (fijo)
    /^9\d{8}$/            // 9 + número móvil
  ];

  return patronesValidos.some(patron => patron.test(telefonoLimpio));
}

/**
 * Middleware para prevenir ataques de NoSQL injection
 */
function preventNoSQLInjection(req, res, next) {
  try {
    const checkForInjection = (obj) => {
      if (typeof obj === 'object' && obj !== null) {
        for (const key in obj) {
          if (key.startsWith('$') || key.includes('.')) {
            throw new Error('Caracteres no permitidos en los campos');
          }
          if (typeof obj[key] === 'object') {
            checkForInjection(obj[key]);
          }
        }
      }
    };

    if (req.body) checkForInjection(req.body);
    if (req.query) checkForInjection(req.query);
    if (req.params) checkForInjection(req.params);

    next();
  } catch (error) {
    return res.status(400).json({
      error: true,
      message: 'Datos de entrada inválidos'
    });
  }
}

module.exports = {
  sanitizeInput,
  sanitizeFields,
  sanitizeString,
  sanitizeObject,
  validarRUT,
  validarTelefonoChileno,
  preventNoSQLInjection
}; 