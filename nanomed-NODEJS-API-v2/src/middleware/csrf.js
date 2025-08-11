const csrf = require('csurf');
const crypto = require('crypto');
const { error } = require('./errors');

// Configuración del middleware CSRF
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Más permisivo en desarrollo
    maxAge: 3600000, // 1 hora
    key: '_csrf' // Nombre específico para la cookie
  },
  // Función personalizada para obtener el token del request
  value: function (req) {
    return (req.body && req.body._csrf) ||
           (req.query && req.query._csrf) ||
           (req.headers['csrf-token']) ||
           (req.headers['xsrf-token']) ||
           (req.headers['x-csrf-token']) ||
           (req.headers['x-xsrf-token']);
  }
});

// Middleware para manejar errores CSRF
const csrfErrorHandler = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return next(error('Token CSRF inválido o faltante', 403));
  }
  next(err);
};

// Middleware para proporcionar token CSRF al cliente
const provideCsrfToken = (req, res, next) => {
  res.locals.csrfToken = req.csrfToken();
  next();
};

// Endpoint simplificado para obtener token CSRF
const getCsrfToken = (req, res) => {
  // CSRF está deshabilitado por defecto, solo se habilita con ENABLE_CSRF=true
  const csrfEnabled = process.env.ENABLE_CSRF === 'true';
  
  if (!csrfEnabled) {
    return res.json({
      error: false,
      message: 'CSRF deshabilitado - no se requiere token',
      body: {
        csrfToken: 'csrf-disabled'
      }
    });
  }

  try {
    // Intentar aplicar el middleware CSRF para generar el token
    csrfProtection(req, res, (err) => {
      if (err) {
        console.log('Error en CSRF protection:', err.message);
        // Si hay error, generar un token simple para desarrollo
        const simpleToken = crypto.randomBytes(32).toString('hex');
        return res.json({
          error: false,
          message: 'Token CSRF generado (modo desarrollo)',
          body: {
            csrfToken: simpleToken
          }
        });
      }
      
      // Si todo está bien, devolver el token real
      res.json({
        error: false,
        message: 'Token CSRF generado',
        body: {
          csrfToken: req.csrfToken()
        }
      });
    });
  } catch (error) {
    console.log('Error en getCsrfToken:', error.message);
    // Fallback: generar token simple
    const fallbackToken = crypto.randomBytes(32).toString('hex');
    res.json({
      error: false,
      message: 'Token CSRF generado (fallback)',
      body: {
        csrfToken: fallbackToken
      }
    });
  }
};

// Middleware condicional - CSRF deshabilitado por defecto
const conditionalCsrf = (req, res, next) => {
  // CSRF está deshabilitado por defecto, solo se habilita con ENABLE_CSRF=true
  const csrfEnabled = process.env.ENABLE_CSRF === 'true';
  
  if (!csrfEnabled) {
    console.log('CSRF deshabilitado - permitiendo petición:', req.method, req.path);
    return next();
  }

  try {
    // Excluir el endpoint de obtener token CSRF
    if (req.path === '/api/csrf-token' && req.method === 'GET') {
      return next();
    }

    // Aplicar CSRF solo a rutas que modifican datos
    const protectedMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];
    const protectedRoutes = [
      '/api/auth/register',
      '/api/auth/login',
      '/api/users',
      '/api/doctors',
      '/api/appointments',
      '/api/admin'
    ];

    const shouldProtect = protectedMethods.includes(req.method) &&
                         protectedRoutes.some(route => req.path.startsWith(route));

    if (shouldProtect) {
      return csrfProtection(req, res, (err) => {
        if (err) {
          console.log('Error en CSRF middleware:', err.message);
          return next(error('Token CSRF inválido o faltante', 403));
        }
        next();
      });
    }
    
    next();
  } catch (err) {
    console.log('Error en conditionalCsrf:', err.message);
    next();
  }
};

module.exports = {
  csrfProtection,
  csrfErrorHandler,
  provideCsrfToken,
  getCsrfToken,
  conditionalCsrf
}; 