const jwt = require("jsonwebtoken");
const config = require("../../config");
const { error } = require("../middleware/errors");

const rateLimit = require("express-rate-limit");
const db = require("../db/sqlserver");

// Función helper para crear rate limiters condicionales
function createConditionalLimiter(limiterConfig, name) {
  if (!config.rateLimiting.enabled) {
    return (req, res, next) => next(); // Skip rate limiting
  }
  
  return rateLimit({
    windowMs: limiterConfig.windowMs,
    max: limiterConfig.max,
    message: {
      error: true,
      message: limiterConfig.message || "Demasiadas solicitudes. Por favor intente más tarde."
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: limiterConfig.keyGenerator,
    skip: limiterConfig.skip,
    // Agregar logging para debugging
    handler: (req, res) => {
      console.log(` Rate limit excedido en ${name}:`, {
        ip: req.ip,
        path: req.path,
        method: req.method,
        userAgent: req.headers['user-agent'],
        timestamp: new Date().toISOString()
      });
      res.status(429).json({
        error: true,
        message: limiterConfig.message || "Demasiadas solicitudes. Por favor intente más tarde.",
        rateLimitType: name
      });
    }
  });
}

// Rate limiting para registro
const registerLimiter = createConditionalLimiter({
  windowMs: config.rateLimiting.auth.register.windowMs,
  max: config.rateLimiting.auth.register.max,
  message: "Demasiados intentos de registro. Por favor intente más tarde."
}, 'register');

// Rate limiting para login más estricto
const loginLimiter = createConditionalLimiter({
  windowMs: config.rateLimiting.auth.login.windowMs,
  max: config.rateLimiting.auth.login.max,
  message: "Demasiados intentos de login. Por favor intente más tarde.",
  keyGenerator: (req) => {
    // Usar una combinación de IP y email para el rate limiting
    return req.ip + (req.body.email || '');
  }
}, 'login');

// Rate limiting para endpoints de administración
const adminLimiter = createConditionalLimiter({
  windowMs: config.rateLimiting.admin.windowMs,
  max: config.rateLimiting.admin.max,
  message: "Demasiadas solicitudes administrativas. Por favor intente más tarde."
}, 'admin');

// Rate limiting para uploads de archivos
const uploadLimiter = createConditionalLimiter({
  windowMs: config.rateLimiting.upload.windowMs,
  max: config.rateLimiting.upload.max,
  message: "Demasiados archivos subidos. Por favor intente más tarde."
}, 'upload');

// Rate limiting para búsquedas
const searchLimiter = createConditionalLimiter({
  windowMs: config.rateLimiting.search.windowMs,
  max: config.rateLimiting.search.max,
  message: "Demasiadas búsquedas. Por favor intente más tarde."
}, 'search');

// Middleware para verificar bloqueos de cuenta
async function checkAccountLock(req, res, next) {
  if (req.path === "/login" && req.method === "POST") {
    const { email } = req.body;

    try {
      const [user] = await db.unoUsuario("Usuarios", { email });
      
      if (user) {
        // Verificar bloqueo temporal
        if (user.login_attempts >= 5) {
          const lockoutDuration = 15 * 60 * 1000; // 15 minutos
          const lastFailedLogin = new Date(user.last_failed_login).getTime();
          const now = Date.now();
          
          if (lastFailedLogin && (now - lastFailedLogin) < lockoutDuration) {
            const remainingTime = Math.ceil((lockoutDuration - (now - lastFailedLogin)) / 60000);
        return res.status(429).json({
          error: true,
              message: `Cuenta temporalmente bloqueada. Intente nuevamente en ${remainingTime} minutos.`
            });
          } else {
            // Si ya pasó el tiempo de bloqueo, resetear los intentos
            await db.actualizarUsuario("Usuarios", {
              id: user.id,
              login_attempts: 0,
              last_failed_login: null
            });
          }
        }
        
        // Registrar intento de login en logs
        await db.query(`
          INSERT INTO RequestLogs (ip_address, email, route, method, user_agent)
          VALUES (@ip, @email, '/login', 'POST', @userAgent)
        `, {
          ip: req.ip,
          email: email,
          userAgent: req.headers['user-agent']
        });
      }
    } catch (err) {
      console.error("Error checking account lock:", err);
    }
  }
  next();
}

// Middleware para verificar token JWT
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw error("Se requiere el header Authorization", 401);
    }

    if (!authHeader.startsWith('Bearer ')) {
      throw error("El formato del token debe ser: Bearer <token>", 401);
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      throw error("Token no proporcionado", 401);
    }

    try {
      const decoded = jwt.verify(token, config.app.jwtSecret);
      req.user = decoded;
      
      // Solo verificar revocación si existe jti
      if (decoded.jti) {
        const [refreshToken] = await db.query(
          "SELECT is_revoked FROM RefreshTokens WHERE token_id = @tokenId",
          { tokenId: decoded.jti }
        );

        if (refreshToken && refreshToken.is_revoked) {
          throw error("Token revocado", 401);
        }
      }

      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        throw error("Token expirado", 401);
      } else if (err.name === 'JsonWebTokenError') {
        throw error("Token malformado o firma inválida", 401);
      }
      throw error("Error al verificar el token: " + err.message, 401);
    }
  } catch (err) {
    next(err);
  }
}

// Middleware para verificar rol de médico
function verifyMedico(req, res, next) {
  try {
    if (!req.user) {
      throw error("Token requerido", 401);
    }
    
    if (req.user.role !== 'medico' && req.user.role !== 'admin') {
      throw error("Acceso denegado. Se requiere rol de médico o administrador", 403);
    }
    
    next();
  } catch (err) {
    next(err);
  }
}

// Middleware genérico para verificar roles específicos
function requireRole(allowedRoles) {
  return function(req, res, next) {
    try {
      if (!req.user) {
        throw error("Token requerido", 401);
      }
      
      if (!allowedRoles.includes(req.user.role)) {
        throw error(`Acceso denegado. Se requiere uno de los siguientes roles: ${allowedRoles.join(', ')}`, 403);
      }
      
      next();
    } catch (err) {
      next(err);
    }
  };
}

// Middleware para verificar rol de administrador
function verifyAdmin(req, res, next) {
  try {
    if (!req.user) {
      throw error("Token requerido", 401);
    }
    
    if (req.user.role !== 'admin') {
      throw error("Acceso denegado. Se requiere rol de administrador", 403);
    }
    
    next();
  } catch (err) {
    next(err);
  }
}

// Middleware para verificar rol de médico o admin
function verifyMedicoOrAdmin(req, res, next) {
  try {
    if (!req.user) {
      throw error("Token requerido", 401);
    }
    
    if (req.user.role !== 'medico' && req.user.role !== 'admin') {
      throw error("Acceso denegado. Se requiere rol de médico o administrador", 403);
    }
    
    next();
  } catch (err) {
    next(err);
  }
}

// Middleware para verificar rol de recepcionista
function verifyRecepcionista(req, res, next) {
  try {
    if (!req.user) {
      throw error("Token requerido", 401);
    }
    
    if (req.user.role !== 'recepcionista' && req.user.role !== 'admin' && req.user.role !== 'api') {
      throw error("Acceso denegado. Se requiere rol de recepcionista, API o administrador", 403);
    }
    
    next();
  } catch (err) {
    next(err);
  }
}

// Middleware para verificar rol de recepcionista, médico o admin
function verifyRecepcionistaMedicoOrAdmin(req, res, next) {
  try {
    if (!req.user) {
      throw error("Token requerido", 401);
    }
    
    if (!['recepcionista', 'medico', 'admin', 'api'].includes(req.user.role)) {
      throw error("Acceso denegado. Se requiere rol de recepcionista, médico, API o administrador", 403);
    }
    
    next();
  } catch (err) {
    next(err);
  }
}

// Middleware para verificar acceso a gestión de citas (recepcionista, médico o admin)
function verifyCitasAccess(req, res, next) {
  try {
    if (!req.user) {
      throw error("Token requerido", 401);
    }
    
    if (!['recepcionista', 'medico', 'admin', 'api'].includes(req.user.role)) {
      throw error("Acceso denegado. Se requiere rol de recepcionista, médico, API o administrador", 403);
    }
    
    next();
  } catch (err) {
    next(err);
  }
}

// Middleware para verificar acceso a gestión de exámenes (usuario, recepcionista, médico o admin)
function verifyExamenesAccess(req, res, next) {
  try {
    if (!req.user) {
      throw error("Token requerido", 401);
    }
    
    if (!['user', 'recepcionista', 'medico', 'admin', 'api'].includes(req.user.role)) {
      throw error("Acceso denegado. Se requiere rol válido", 403);
    }
    
    next();
  } catch (err) {
    next(err);
  }
}

// Middleware específico para verificar rol de API
function verifyApi(req, res, next) {
  try {
    if (!req.user) {
      throw error("Token requerido", 401);
    }
    
    if (req.user.role !== 'api' && req.user.role !== 'admin') {
      throw error("Acceso denegado. Se requiere rol de API o administrador", 403);
    }
    
    next();
  } catch (err) {
    next(err);
  }
}

// Middleware para verificar rol de API o recepcionista (equivalente a recepcionista)
function verifyApiOrRecepcionista(req, res, next) {
  try {
    if (!req.user) {
      throw error("Token requerido", 401);
    }
    
    if (req.user.role !== 'api' && req.user.role !== 'recepcionista' && req.user.role !== 'admin') {
      throw error("Acceso denegado. Se requiere rol de API, recepcionista o administrador", 403);
    }
    
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerLimiter,
  loginLimiter,
  checkAccountLock,
  verifyToken,
  verifyMedico,
  verifyAdmin,
  verifyMedicoOrAdmin,
  verifyRecepcionista,
  verifyRecepcionistaMedicoOrAdmin,
  verifyCitasAccess,
  verifyExamenesAccess,
  requireRole,
  adminLimiter,
  uploadLimiter,
  searchLimiter,
  verifyApi,
  verifyApiOrRecepcionista
};
