const express = require("express");
const router = express.Router();
const controlador = require("./controlador");
const respuesta = require("../red/respuestas");
const { verifyToken } = require("../auth/middlewares");
const { crearCita, actualizarCita, validarIdCita } = require("./validaciones");
const { validarFechaFutura } = require("../utils/dateUtils");
const db = require("../db/sqlserver");

// Endpoint público de debug para tokens (SIN autenticación)
router.get("/payment/debug-public/:token", async (req, res) => {
  try {
    const { token } = req.params;
    console.log(`[DEBUG-PUBLIC] Verificando token: ${token}`);
    
    const [transaction] = await db.query(`
      SELECT * FROM TransaccionesPago WHERE token_transbank = @token
    `, { token });
    
    if (transaction) {
      const [cita] = await db.query(`
        SELECT usuario_id, estado FROM CitasMedicas WHERE id = @cita_id
      `, { cita_id: transaction.cita_id });
      
      res.json({
        encontrado: true,
        token: token,
        transaccion: transaction,
        cita: cita || null,
        timestamp: new Date().toISOString()
      });
    } else {
      res.json({
        encontrado: false,
        token: token,
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error('[DEBUG-PUBLIC] Error:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

// Middleware de autenticación para todas las rutas
router.use(verifyToken);

// IMPORTANTE: Montar rutas de pago ANTES que las rutas con parámetros (:id)
// para evitar conflictos de routing
const rutasPago = require("./rutas-pago");
router.use("/", rutasPago);

// GET /api/appointments - Listar citas del usuario (con filtros)
async function listarCitas(req, res, next) {
  try {
    const userId = req.user.id;
    
    // Extraer filtros de query parameters
    const filtros = {
      medico_id: req.query.medico_id,
      estado: req.query.estado,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta,
      especialidad: req.query.especialidad
    };
    
    // Remover filtros vacíos
    Object.keys(filtros).forEach(key => {
      if (!filtros[key]) {
        delete filtros[key];
      }
    });
    
    const resultado = await controlador.listarCitas(userId, filtros);
    
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
}

// GET /api/appointments/:id - Obtener detalle de una cita específica
async function obtenerCita(req, res, next) {
  try {
    const citaId = parseInt(req.params.id);
    const userId = req.user.id;
    
    if (!citaId || isNaN(citaId)) {
      return respuesta.error(req, res, 'ID de cita inválido', 400);
    }
    
    const cita = await controlador.obtenerCita(citaId, userId);
    
    if (!cita) {
      return respuesta.error(req, res, 'Cita no encontrada', 404);
    }
    
    respuesta.success(req, res, { cita }, 200);
  } catch (err) {
    next(err);
  }
}

// POST /api/appointments - Solicitar nueva cita
async function crearCitaHandler(req, res, next) {
  try {
    const userId = req.user.id;
    const { medico_id, fecha_hora, duracion, lugar, direccion, notas } = req.body;
    
    // Validaciones básicas
    if (!fecha_hora) {
      return respuesta.error(req, res, 'La fecha y hora son requeridas', 400);
    }
    
    // Validar formato de fecha
    const fechaValida = new Date(fecha_hora);
    if (isNaN(fechaValida.getTime())) {
      return respuesta.error(req, res, 'Formato de fecha inválido', 400);
    }
    
    // BLOQUEO ELIMINADO: Permitir agendar en cualquier fecha/hora
    // Solo validar que sea una fecha válida, sin restricciones de tiempo
    
    // Validar duración si se proporciona
    if (duracion && (duracion < 15 || duracion > 480)) {
      return respuesta.error(req, res, 'La duración debe estar entre 15 y 480 minutos', 400);
    }
    
    // Validar longitud de campos de texto
    if (lugar && lugar.length > 255) {
      return respuesta.error(req, res, 'El lugar es demasiado largo', 400);
    }
    if (direccion && direccion.length > 255) {
      return respuesta.error(req, res, 'La dirección es demasiado larga', 400);
    }
    if (notas && notas.length > 1000) {
      return respuesta.error(req, res, 'Las notas son demasiado largas', 400);
    }
    
    const datosCita = {
      medico_id: medico_id ? parseInt(medico_id) : null,
      fecha_hora,
      duracion: duracion ? parseInt(duracion) : 30,
      lugar: lugar || '',
      direccion: direccion || '',
      notas: notas || ''
    };
    
    try {
      const cita = await controlador.crearCita(userId, datosCita);
      
      respuesta.success(req, res, { 
        mensaje: 'Cita creada exitosamente',
        cita 
      }, 201);
    } catch (error) {
      // Manejar errores específicos del controlador
      if (error.message === 'El médico especificado no existe o no está disponible') {
        return respuesta.error(req, res, error.message, 404);
      }
      if (error.message === 'El horario seleccionado no está disponible') {
        return respuesta.error(req, res, error.message, 409);
      }
      throw error; // Propagar otros errores al middleware de errores
    }
  } catch (err) {
    next(err);
  }
}

// PUT /api/appointments/:id - Actualizar información de cita
async function actualizarCitaHandler(req, res, next) {
  try {
    const citaId = parseInt(req.params.id);
    const userId = req.user.id;
    const { fecha_hora, duracion, lugar, direccion, notas, estado } = req.body;
    
    if (!citaId || isNaN(citaId)) {
      return respuesta.error(req, res, 'ID de cita inválido', 400);
    }
    
    // Validar fecha si se proporciona
    if (fecha_hora) {
      const fechaValida = new Date(fecha_hora);
      if (isNaN(fechaValida.getTime())) {
        return respuesta.error(req, res, 'Formato de fecha inválido', 400);
      }
      
      // BLOQUEO ELIMINADO: Permitir actualizar a cualquier fecha/hora
      // Solo validar que sea una fecha válida, sin restricciones de tiempo
    }
    
    // Validar estado si se proporciona
    if (estado && !['programada', 'confirmada', 'completada', 'cancelada'].includes(estado)) {
      return respuesta.error(req, res, 'Estado inválido', 400);
    }
    
    const datosActualizacion = {
      fecha_hora,
      duracion: duracion ? parseInt(duracion) : undefined,
      lugar,
      direccion,
      notas,
      estado
    };
    
    // Remover campos undefined
    Object.keys(datosActualizacion).forEach(key => {
      if (datosActualizacion[key] === undefined) {
        delete datosActualizacion[key];
      }
    });
    
    const cita = await controlador.actualizarCita(citaId, userId, datosActualizacion);
    
    respuesta.success(req, res, { 
      mensaje: 'Cita actualizada exitosamente',
      cita 
    }, 200);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/appointments/:id - Cancelar cita
async function cancelarCita(req, res, next) {
  try {
    const citaId = parseInt(req.params.id);
    const userId = req.user.id;
    
    if (!citaId || isNaN(citaId)) {
      return respuesta.error(req, res, 'ID de cita inválido', 400);
    }
    
    const cita = await controlador.cancelarCita(citaId, userId);
    
    respuesta.success(req, res, { 
      mensaje: 'Cita cancelada exitosamente',
      cita 
    }, 200);
  } catch (err) {
    next(err);
  }
}

// GET /api/appointments/available-slots - Obtener horarios disponibles (con filtros)
async function obtenerHorariosDisponibles(req, res, next) {
  try {
    const filtros = {
      medico_id: req.query.medico_id ? parseInt(req.query.medico_id) : undefined,
      fecha: req.query.fecha,
      especialidad: req.query.especialidad
    };
    
    // Remover filtros undefined
    Object.keys(filtros).forEach(key => {
      if (filtros[key] === undefined) {
        delete filtros[key];
      }
    });
    
    // Validar fecha si se proporciona
    if (filtros.fecha) {
      const fechaValida = new Date(filtros.fecha);
      if (isNaN(fechaValida.getTime())) {
        return respuesta.error(req, res, 'Formato de fecha inválido', 400);
      }
    }
    
    const horarios = await controlador.obtenerHorariosDisponibles(filtros);
    
    respuesta.success(req, res, horarios, 200);
  } catch (err) {
    next(err);
  }
}

// POST /api/appointments/:id/confirm - Confirmar asistencia a cita
async function confirmarAsistencia(req, res, next) {
  try {
    const citaId = parseInt(req.params.id);
    const userId = req.user.id;
    
    if (!citaId || isNaN(citaId)) {
      return respuesta.error(req, res, 'ID de cita inválido', 400);
    }
    
    const cita = await controlador.confirmarAsistencia(citaId, userId);
    
    respuesta.success(req, res, { 
      mensaje: 'Asistencia confirmada exitosamente',
      cita 
    }, 200);
  } catch (err) {
    next(err);
  }
}

// POST /api/appointments/:id/reschedule - Reprogramar cita
async function reprogramarCita(req, res, next) {
  try {
    const citaId = parseInt(req.params.id);
    const userId = req.user.id;
    const { nueva_fecha_hora } = req.body;
    
    if (!citaId || isNaN(citaId)) {
      return respuesta.error(req, res, 'ID de cita inválido', 400);
    }
    
    if (!nueva_fecha_hora) {
      return respuesta.error(req, res, 'La nueva fecha y hora son requeridas', 400);
    }
    
    // Validar formato de fecha
    const fechaValida = new Date(nueva_fecha_hora);
    if (isNaN(fechaValida.getTime())) {
      return respuesta.error(req, res, 'Formato de fecha inválido', 400);
    }
    
    // BLOQUEO ELIMINADO: Permitir reprogramar a cualquier fecha/hora
    // Solo validar que sea una fecha válida, sin restricciones de tiempo
    
    const cita = await controlador.reprogramarCita(citaId, userId, nueva_fecha_hora);
    
    respuesta.success(req, res, { 
      mensaje: 'Cita reprogramada exitosamente',
      cita 
    }, 200);
  } catch (err) {
    next(err);
  }
}

// Definir las rutas
router.get("/", listarCitas);
router.get("/available-slots", obtenerHorariosDisponibles);
router.get("/:id", validarIdCita, obtenerCita);
router.post("/", crearCita, crearCitaHandler);
router.put("/:id", validarIdCita, actualizarCita, actualizarCitaHandler);
router.delete("/:id", validarIdCita, cancelarCita);
router.post("/:id/confirm", validarIdCita, confirmarAsistencia);
router.post("/:id/reschedule", validarIdCita, reprogramarCita);

module.exports = router; 