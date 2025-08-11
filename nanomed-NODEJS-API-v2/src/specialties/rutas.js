const express = require("express");
const router = express.Router();
const controlador = require("./controlador");
const respuesta = require("../red/respuestas");

// GET /api/specialties - Listar especialidades médicas - Público
router.get("/", listarEspecialidades);

// GET /api/specialties/stats - Obtener estadísticas de especialidades - Público
// Esta ruta debe ir ANTES que /:nombre para evitar conflictos
router.get("/stats", obtenerEstadisticasEspecialidades);

// GET /api/specialties/:nombre - Obtener información detallada de una especialidad - Público
router.get("/:nombre", obtenerEspecialidad);

async function listarEspecialidades(req, res, next) {
  try {
    const especialidades = await controlador.listarEspecialidades();
    
    respuesta.success(req, res, {
      especialidades,
      total: especialidades.length
    }, 200);
  } catch (err) {
    next(err);
  }
}

async function obtenerEspecialidad(req, res, next) {
  try {
    const { nombre } = req.params;
    
    // Decodificar el nombre de la especialidad (en caso de que venga con caracteres especiales)
    const nombreDecodificado = decodeURIComponent(nombre);
    
    const especialidad = await controlador.obtenerEspecialidad(nombreDecodificado);
    
    if (!especialidad) {
      return respuesta.error(req, res, 'Especialidad no encontrada', 404);
    }
    
    respuesta.success(req, res, especialidad, 200);
  } catch (err) {
    next(err);
  }
}

async function obtenerEstadisticasEspecialidades(req, res, next) {
  try {
    const estadisticas = await controlador.obtenerEstadisticasEspecialidades();
    
    respuesta.success(req, res, estadisticas, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = router; 