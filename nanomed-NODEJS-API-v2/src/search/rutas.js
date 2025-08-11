const express = require("express");
const router = express.Router();
const controlador = require("./controlador");
const respuesta = require("../red/respuestas");
const { verifyToken, searchLimiter } = require("../auth/middlewares");

// GET /api/search/doctors - Buscar médicos - Usuario
router.get("/doctors", verifyToken, searchLimiter, buscarMedicos);

// GET /api/search/exams - Buscar exámenes - Usuario
router.get("/exams", verifyToken, searchLimiter, buscarExamenes);

async function buscarMedicos(req, res, next) {
  try {
    // Extraer filtros de query parameters
    const filtros = {
      especialidad: req.query.especialidad,
      nombre: req.query.nombre,
      apellido: req.query.apellido,
      activo: req.query.activo
    };
    
    // Remover filtros vacíos
    Object.keys(filtros).forEach(key => {
      if (!filtros[key]) {
        delete filtros[key];
      }
    });
    
    const medicos = await controlador.buscarMedicos(filtros);
    
    respuesta.success(req, res, {
      medicos,
      total: medicos.length,
      filtros_aplicados: filtros
    }, 200);
  } catch (err) {
    next(err);
  }
}

async function buscarExamenes(req, res, next) {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Extraer filtros de query parameters
    const filtros = {
      tipo_examen: req.query.tipo_examen,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta,
      estado: req.query.estado,
      medico_id: req.query.medico_id,
      paciente_id: req.query.paciente_id
    };
    
    // Remover filtros vacíos
    Object.keys(filtros).forEach(key => {
      if (!filtros[key]) {
        delete filtros[key];
      }
    });
    
    const examenes = await controlador.buscarExamenes(userId, userRole, filtros);
    
    respuesta.success(req, res, {
      examenes,
      total: examenes.length,
      filtros_aplicados: filtros
    }, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = router; 