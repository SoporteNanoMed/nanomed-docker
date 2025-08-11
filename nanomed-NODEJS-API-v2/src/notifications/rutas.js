const express = require("express");
const router = express.Router();
const controlador = require("./controlador");
const respuesta = require("../red/respuestas");
const { verifyToken } = require("../auth/middlewares");

// GET /api/notifications - Listar notificaciones del usuario
async function listarNotificaciones(req, res, next) {
  try {
    const filtros = {
      limite: req.query.limite,
      offset: req.query.offset,
      leida: req.query.leida
    };
    
    const resultado = await controlador.listarNotificaciones(req.user.id, filtros);
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
}

// PUT /api/notifications/:id/read - Marcar notificación como leída
async function marcarComoLeida(req, res, next) {
  try {
    const notificacionId = parseInt(req.params.id);
    
    if (!notificacionId || isNaN(notificacionId)) {
      return respuesta.error(req, res, 'ID de notificación inválido', 400);
    }
    
    const resultado = await controlador.marcarComoLeida(notificacionId, req.user.id);
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
}

// PUT /api/notifications/read-all - Marcar todas las notificaciones como leídas
async function marcarTodasComoLeidas(req, res, next) {
  try {
    const resultado = await controlador.marcarTodasComoLeidas(req.user.id);
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/notifications/:id - Eliminar notificación
async function eliminarNotificacion(req, res, next) {
  try {
    const notificacionId = parseInt(req.params.id);
    
    if (!notificacionId || isNaN(notificacionId)) {
      return respuesta.error(req, res, 'ID de notificación inválido', 400);
    }
    
    const resultado = await controlador.eliminarNotificacion(notificacionId, req.user.id);
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
}

// GET /api/notifications/preferences - Obtener preferencias de notificación
async function obtenerPreferencias(req, res, next) {
  try {
    const resultado = await controlador.obtenerPreferencias(req.user.id);
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
}

// PUT /api/notifications/preferences - Actualizar preferencias de notificación
async function actualizarPreferencias(req, res, next) {
  try {
    const nuevasPreferencias = req.body;
    
    // Validar que al menos una preferencia esté presente
    const preferencesKeys = [
      'email_citas',
      'email_resultados', 
      'email_promociones',
      'sms_citas',
      'sms_resultados'
    ];
    
    const hasValidPreference = preferencesKeys.some(key => 
      nuevasPreferencias.hasOwnProperty(key)
    );
    
    if (!hasValidPreference) {
      return respuesta.error(req, res, 'Debe proporcionar al menos una preferencia para actualizar', 400);
    }
    
    const resultado = await controlador.actualizarPreferencias(req.user.id, nuevasPreferencias);
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
}

// Definir las rutas
// IMPORTANTE: Las rutas específicas deben ir antes que las rutas con parámetros
router.get("/preferences", verifyToken, obtenerPreferencias);
router.put("/preferences", verifyToken, actualizarPreferencias);
router.put("/read-all", verifyToken, marcarTodasComoLeidas);
router.get("/", verifyToken, listarNotificaciones);
router.put("/:id/read", verifyToken, marcarComoLeida);
router.delete("/:id", verifyToken, eliminarNotificacion);

module.exports = router; 