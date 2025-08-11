const express = require("express");
const router = express.Router();
const controlador = require("./controlador");
const respuesta = require("../red/respuestas");
const { verifyToken, requireRole } = require("../auth/middlewares");

// ==========================================
// RUTAS PARA GESTIÓN DE MÉDICOS
// ==========================================

// GET /api/doctors/specialties/:specialtyId - Listar médicos por especialidad - Usuario
// Esta ruta debe ir ANTES que /:id para evitar conflictos
router.get("/specialties/:specialtyId", verifyToken, listarMedicosPorEspecialidad);

// GET /api/doctors - Listar médicos (con filtros) - Usuario
router.get("/", verifyToken, listarMedicos);

// ==========================================
// RUTAS PARA MÉDICOS AUTENTICADOS
// ==========================================

// GET /api/doctors/me/appointments - Listar mis citas como médico
router.get("/me/appointments", verifyToken, requireRole(['medico', 'admin']), listarMisCitas);

// GET /api/doctors/me/appointments/:id - Obtener detalle de mi cita específica
router.get("/me/appointments/:id", verifyToken, requireRole(['medico', 'admin']), obtenerMiCita);

// PUT /api/doctors/me/appointments/:id/status - Actualizar estado de mi cita
router.put("/me/appointments/:id/status", verifyToken, requireRole(['medico', 'admin']), actualizarEstadoCita);

// GET /api/doctors/:id - Obtener perfil de médico específico - Usuario
router.get("/:id", verifyToken, obtenerMedico);

// ==========================================
// FUNCIONES DE GESTIÓN DE MÉDICOS
// ==========================================

async function listarMedicos(req, res, next) {
  try {
    // Extraer filtros de query parameters
    const filtros = {
      especialidad: req.query.especialidad,
      nombre: req.query.nombre
    };
    
    // Remover filtros vacíos
    Object.keys(filtros).forEach(key => {
      if (!filtros[key]) {
        delete filtros[key];
      }
    });
    
    const medicos = await controlador.listarMedicos(filtros);
    
    respuesta.success(req, res, {
      medicos,
      total: medicos.length,
      filtros_aplicados: filtros
    }, 200);
  } catch (err) {
    next(err);
  }
}

async function obtenerMedico(req, res, next) {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return respuesta.error(req, res, 'ID de médico inválido', 400);
    }
    
    const medico = await controlador.obtenerMedico(id);
    
    if (!medico) {
      return respuesta.error(req, res, 'Médico no encontrado', 404);
    }
    
    respuesta.success(req, res, medico, 200);
  } catch (err) {
    next(err);
  }
}

async function listarMedicosPorEspecialidad(req, res, next) {
  try {
    const { specialtyId } = req.params;
    
    // Decodificar el nombre de la especialidad
    const especialidadDecodificada = decodeURIComponent(specialtyId);
    
    const medicos = await controlador.listarMedicosPorEspecialidad(especialidadDecodificada);
    
    respuesta.success(req, res, {
      especialidad: especialidadDecodificada,
      medicos,
      total: medicos.length
    }, 200);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// FUNCIONES PARA MÉDICOS AUTENTICADOS
// ==========================================

async function listarMisCitas(req, res, next) {
  try {
    // Obtener el ID del médico desde el token
    const medicoId = req.user.id;
    
    // Extraer filtros de query parameters
    const filtros = {
      estado: req.query.estado,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta,
      paciente_nombre: req.query.paciente_nombre
    };
    
    // Remover filtros vacíos
    Object.keys(filtros).forEach(key => {
      if (!filtros[key]) {
        delete filtros[key];
      }
    });
    
    const resultado = await controlador.listarMisCitas(medicoId, filtros);
    
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
}

async function obtenerMiCita(req, res, next) {
  try {
    const citaId = parseInt(req.params.id);
    const medicoId = req.user.id;
    
    if (!citaId || isNaN(citaId)) {
      return respuesta.error(req, res, 'ID de cita inválido', 400);
    }
    
    const cita = await controlador.obtenerMiCita(citaId, medicoId);
    
    if (!cita) {
      return respuesta.error(req, res, 'Cita no encontrada o no tienes permisos para verla', 404);
    }
    
    respuesta.success(req, res, { cita }, 200);
  } catch (err) {
    next(err);
  }
}

async function actualizarEstadoCita(req, res, next) {
  try {
    const citaId = parseInt(req.params.id);
    const medicoId = req.user.id;
    const { estado, notas } = req.body;
    
    if (!citaId || isNaN(citaId)) {
      return respuesta.error(req, res, 'ID de cita inválido', 400);
    }
    
    if (!estado) {
      return respuesta.error(req, res, 'El estado es requerido', 400);
    }
    
    // Validar estado
    const estadosValidos = ['programada', 'confirmada', 'completada', 'cancelada'];
    if (!estadosValidos.includes(estado)) {
      return respuesta.error(req, res, 'Estado inválido. Estados válidos: ' + estadosValidos.join(', '), 400);
    }
    
    const cita = await controlador.actualizarEstadoCita(citaId, medicoId, estado, notas);
    
    respuesta.success(req, res, { 
      mensaje: 'Estado de cita actualizado exitosamente',
      cita 
    }, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = router; 