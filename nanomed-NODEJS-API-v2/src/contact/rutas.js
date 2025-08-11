const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const config = require("../../config");
const controlador = require("./controlador");
const { validarMensajeContacto } = require("./validaciones");

// Rate limiting específico para el formulario de contacto
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: config.rateLimiting.enabled ? 3 : 100, // 3 mensajes por IP cada 15 minutos (o 100 si está deshabilitado)
  message: {
    error: true,
    message: "Has enviado demasiados mensajes de contacto. Por favor espera 15 minutos antes de intentar nuevamente."
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Contar tanto exitosos como fallidos
  // Logging para debugging
  handler: (req, res) => {
    console.log(`Rate limit de contacto excedido:`, {
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    });
    res.status(429).json({
      error: true,
      message: "Has enviado demasiados mensajes de contacto. Por favor espera 15 minutos antes de intentar nuevamente.",
      rateLimitType: 'contact'
    });
  }
});

// Aplicar rate limiting a todas las rutas de contacto
if (config.rateLimiting.enabled) {
  router.use(contactLimiter);
  console.log('Rate limiting de contacto habilitado: 3 mensajes por IP cada 15 minutos');
}

// POST /api/contact - Enviar mensaje de contacto
router.post("/", validarMensajeContacto, controlador.enviarMensajeContacto);

module.exports = router; 