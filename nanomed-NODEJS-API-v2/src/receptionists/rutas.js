const express = require("express");
const router = express.Router();
const controlador = require("./controlador");
const respuesta = require("../red/respuestas");
const db = require("../db/sqlserver");
const { verifyToken, verifyRecepcionista, verifyRecepcionistaMedicoOrAdmin } = require("../auth/middlewares");
const { validarFechaFutura } = require("../utils/dateUtils");

// Middleware de autenticación para todas las rutas
router.use(verifyToken);

// ==========================================
// RUTAS PARA GESTIÓN DE CITAS
// ==========================================

// GET /api/receptionists/appointments - Listar todas las citas (con filtros)
async function listarTodasLasCitas(req, res, next) {
  try {
    // Extraer filtros de query parameters
    const filtros = {
      paciente_id: req.query.paciente_id,
      medico_id: req.query.medico_id,
      estado: req.query.estado,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta,
      especialidad: req.query.especialidad,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };
    
    // Remover filtros vacíos
    Object.keys(filtros).forEach(key => {
      if (!filtros[key] && filtros[key] !== 0) {
        delete filtros[key];
      }
    });
    
    const resultado = await controlador.listarTodasLasCitas(filtros);
    
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
}

// POST /api/receptionists/appointments - Crear cita para cualquier paciente
async function crearCitaPaciente(req, res, next) {
  try {
    const { paciente_id, medico_id, fecha_hora, duracion, lugar, direccion, notas } = req.body;
    
    // Validaciones básicas
    if (!paciente_id || !fecha_hora) {
      return respuesta.error(req, res, 'El ID del paciente y la fecha/hora son requeridos', 400);
    }
    
    // Validar formato de fecha
    const fechaValida = new Date(fecha_hora);
    if (isNaN(fechaValida.getTime())) {
      return respuesta.error(req, res, 'Formato de fecha inválido', 400);
    }
    
    // Validar que la fecha sea futura con margen de 30 minutos usando utilidad
    const validacion = validarFechaFutura(fecha_hora, 30);
    if (!validacion.valida) {
      return respuesta.error(req, res, validacion.error, 400);
    }
    
    const datosCita = {
      paciente_id: parseInt(paciente_id),
      medico_id: medico_id ? parseInt(medico_id) : null,
      fecha_hora,
      duracion: duracion ? parseInt(duracion) : 30,
      lugar,
      direccion,
      notas,
      creada_por_recepcionista: req.user.id
    };
    
    const cita = await controlador.crearCitaPaciente(datosCita);
    
    respuesta.success(req, res, { 
      mensaje: 'Cita creada exitosamente',
      cita 
    }, 201);
  } catch (err) {
    next(err);
  }
}

// PUT /api/receptionists/appointments/:id - Actualizar cualquier cita
async function actualizarCualquierCita(req, res, next) {
  try {
    const citaId = parseInt(req.params.id);
    const { paciente_id, medico_id, fecha_hora, duracion, lugar, direccion, notas, estado } = req.body;
    
    if (!citaId || isNaN(citaId)) {
      return respuesta.error(req, res, 'ID de cita inválido', 400);
    }
    
    // Validar fecha si se proporciona
    if (fecha_hora) {
      const fechaValida = new Date(fecha_hora);
      if (isNaN(fechaValida.getTime())) {
        return respuesta.error(req, res, 'Formato de fecha inválido', 400);
      }
      
      // Validar que la fecha sea futura con margen de 30 minutos usando utilidad
      const validacion = validarFechaFutura(fecha_hora, 30);
      if (!validacion.valida) {
        return respuesta.error(req, res, validacion.error, 400);
      }
    }
    
    // Validar estado si se proporciona
    if (estado && !['programada', 'confirmada', 'completada', 'cancelada'].includes(estado)) {
      return respuesta.error(req, res, 'Estado inválido', 400);
    }
    
    const datosActualizacion = {
      paciente_id: paciente_id ? parseInt(paciente_id) : undefined,
      medico_id: medico_id ? parseInt(medico_id) : undefined,
      fecha_hora,
      duracion: duracion ? parseInt(duracion) : undefined,
      lugar,
      direccion,
      notas,
      estado,
      actualizada_por_recepcionista: req.user.id
    };
    
    // Remover campos undefined
    Object.keys(datosActualizacion).forEach(key => {
      if (datosActualizacion[key] === undefined) {
        delete datosActualizacion[key];
      }
    });
    
    const cita = await controlador.actualizarCualquierCita(citaId, datosActualizacion);
    
    respuesta.success(req, res, { 
      mensaje: 'Cita actualizada exitosamente',
      cita 
    }, 200);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/receptionists/appointments/:id - Cancelar cualquier cita
async function cancelarCualquierCita(req, res, next) {
  try {
    const citaId = parseInt(req.params.id);
    
    if (!citaId || isNaN(citaId)) {
      return respuesta.error(req, res, 'ID de cita inválido', 400);
    }
    
    const cita = await controlador.cancelarCualquierCita(citaId, req.user.id);
    
    respuesta.success(req, res, { 
      mensaje: 'Cita cancelada exitosamente',
      cita 
    }, 200);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// RUTAS PARA GESTIÓN DE PACIENTES
// ==========================================

// GET /api/receptionists/patients - Listar todos los pacientes
async function listarPacientes(req, res, next) {
  try {
    const filtros = {
      search: req.query.search,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };
    
    const resultado = await controlador.listarPacientes(filtros);
    
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
}

// GET /api/receptionists/patients/:id - Obtener información de un paciente específico
async function obtenerPaciente(req, res, next) {
  try {
    const pacienteId = parseInt(req.params.id);
    
    if (!pacienteId || isNaN(pacienteId)) {
      return respuesta.error(req, res, 'ID de paciente inválido', 400);
    }
    
    const paciente = await controlador.obtenerPaciente(pacienteId);
    
    if (!paciente) {
      return respuesta.error(req, res, 'Paciente no encontrado', 404);
    }
    
    respuesta.success(req, res, { paciente }, 200);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// RUTAS PARA GESTIÓN DE MÉDICOS
// ==========================================

// GET /api/receptionists/doctors - Listar todos los médicos
async function listarMedicos(req, res, next) {
  try {
    const filtros = {
      especialidad: req.query.especialidad,
      activo: req.query.activo !== undefined ? req.query.activo === 'true' : undefined,
      search: req.query.search
    };
    
    const resultado = await controlador.listarMedicos(filtros);
    
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
}

// GET /api/receptionists/doctors/:id/availability - Obtener disponibilidad de un médico
async function obtenerDisponibilidadMedico(req, res, next) {
  try {
    const medicoId = parseInt(req.params.id);
    const fecha = req.query.fecha;
    
    if (!medicoId || isNaN(medicoId)) {
      return respuesta.error(req, res, 'ID de médico inválido', 400);
    }
    
    if (!fecha) {
      return respuesta.error(req, res, 'Fecha requerida', 400);
    }
    
    const disponibilidad = await controlador.obtenerDisponibilidadMedico(medicoId, fecha);
    
    respuesta.success(req, res, disponibilidad, 200);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// RUTAS PARA REPORTES Y ESTADÍSTICAS
// ==========================================

// GET /api/receptionists/stats/daily - Estadísticas diarias
async function obtenerEstadisticasDiarias(req, res, next) {
  try {
    const fecha = req.query.fecha || new Date().toISOString().split('T')[0];
    
    const estadisticas = await controlador.obtenerEstadisticasDiarias(fecha);
    
    respuesta.success(req, res, estadisticas, 200);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// RUTAS PARA GESTIÓN DE HORARIOS MÉDICOS
// ==========================================

// POST /api/receptionists/doctors/:id/schedule - Establecer horarios regulares del médico
async function establecerHorarioMedico(req, res, next) {
  try {
    const medicoId = parseInt(req.params.id);
    const { horarios } = req.body;
    
    if (!medicoId || isNaN(medicoId)) {
      return respuesta.error(req, res, 'ID de médico inválido', 400);
    }
    
    if (!horarios || !Array.isArray(horarios)) {
      return respuesta.error(req, res, 'Se requiere un array de horarios', 400);
    }
    
    const resultado = await controlador.establecerHorarioMedico(medicoId, horarios);
    
    respuesta.success(req, res, resultado, 201);
  } catch (err) {
    next(err);
  }
}

// GET /api/receptionists/doctors/:id/schedule - Obtener horarios configurados del médico
async function obtenerHorarioMedico(req, res, next) {
  try {
    const medicoId = parseInt(req.params.id);
    
    if (!medicoId || isNaN(medicoId)) {
      return respuesta.error(req, res, 'ID de médico inválido', 400);
    }
    
    const horario = await controlador.obtenerHorarioMedico(medicoId);
    
    respuesta.success(req, res, horario, 200);
  } catch (err) {
    next(err);
  }
}

// PUT /api/receptionists/doctors/:id/schedule/:scheduleId - Actualizar horario específico
async function actualizarHorarioMedico(req, res, next) {
  try {
    const scheduleId = parseInt(req.params.scheduleId);
    const datosActualizacion = req.body;
    
    if (!scheduleId || isNaN(scheduleId)) {
      return respuesta.error(req, res, 'ID de horario inválido', 400);
    }
    
    // Remover campos vacíos o undefined
    Object.keys(datosActualizacion).forEach(key => {
      if (datosActualizacion[key] === undefined || datosActualizacion[key] === '') {
        delete datosActualizacion[key];
      }
    });
    
    if (Object.keys(datosActualizacion).length === 0) {
      return respuesta.error(req, res, 'Se requiere al menos un campo para actualizar', 400);
    }
    
    const resultado = await controlador.actualizarHorarioMedico(scheduleId, datosActualizacion);
    
    respuesta.success(req, res, { 
      mensaje: 'Horario actualizado exitosamente',
      horario: resultado 
    }, 200);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/receptionists/doctors/:id/schedule/:scheduleId - Eliminar horario específico
async function eliminarHorarioMedico(req, res, next) {
  try {
    const scheduleId = parseInt(req.params.scheduleId);
    
    if (!scheduleId || isNaN(scheduleId)) {
      return respuesta.error(req, res, 'ID de horario inválido', 400);
    }
    
    const resultado = await controlador.eliminarHorarioMedico(scheduleId);
    
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
}

// POST /api/receptionists/doctors/:id/schedule/exceptions - Agregar día/horario no disponible
async function agregarExcepcionHorario(req, res, next) {
  try {
    const medicoId = parseInt(req.params.id);
    const { fecha, motivo, todo_el_dia, hora_inicio, hora_fin } = req.body;
    
    if (!medicoId || isNaN(medicoId)) {
      return respuesta.error(req, res, 'ID de médico inválido', 400);
    }
    
    if (!fecha) {
      return respuesta.error(req, res, 'Fecha es requerida', 400);
    }
    
    // Validar formato de fecha
    const fechaValida = new Date(fecha);
    if (isNaN(fechaValida.getTime())) {
      return respuesta.error(req, res, 'Formato de fecha inválido', 400);
    }
    
    const datosExcepcion = {
      fecha,
      motivo: motivo || 'No especificado',
      todo_el_dia: todo_el_dia !== false, // Por defecto true
      hora_inicio: hora_inicio || null,
      hora_fin: hora_fin || null
    };
    
    const excepcion = await controlador.agregarExcepcionHorario(medicoId, datosExcepcion);
    
    respuesta.success(req, res, excepcion, 201);
  } catch (err) {
    next(err);
  }
}

// GET /api/receptionists/doctors/:id/schedule/exceptions - Listar excepciones del médico
async function listarExcepcionesHorario(req, res, next) {
  try {
    const medicoId = parseInt(req.params.id);
    const { fecha_desde, fecha_hasta } = req.query;
    
    if (!medicoId || isNaN(medicoId)) {
      return respuesta.error(req, res, 'ID de médico inválido', 400);
    }
    
    const filtros = {};
    
    if (fecha_desde) {
      const fechaValidaDesde = new Date(fecha_desde);
      if (isNaN(fechaValidaDesde.getTime())) {
        return respuesta.error(req, res, 'Formato de fecha_desde inválido', 400);
      }
      filtros.fecha_desde = fecha_desde;
    }
    
    if (fecha_hasta) {
      const fechaValidaHasta = new Date(fecha_hasta);
      if (isNaN(fechaValidaHasta.getTime())) {
        return respuesta.error(req, res, 'Formato de fecha_hasta inválido', 400);
      }
      filtros.fecha_hasta = fecha_hasta;
    }
    
    const excepciones = await controlador.listarExcepcionesHorario(medicoId, filtros);
    
    respuesta.success(req, res, excepciones, 200);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/receptionists/doctors/:id/schedule/exceptions/:exceptionId - Eliminar excepción
async function eliminarExcepcionHorario(req, res, next) {
  try {
    const exceptionId = parseInt(req.params.exceptionId);
    
    if (!exceptionId || isNaN(exceptionId)) {
      return respuesta.error(req, res, 'ID de excepción inválido', 400);
    }
    
    const resultado = await controlador.eliminarExcepcionHorario(exceptionId);
    
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
}

// GET /api/receptionists/doctors/:id/availability-updated - Obtener disponibilidad actualizada (usando horarios configurados)
async function obtenerDisponibilidadMedicoActualizada(req, res, next) {
  try {
    const medicoId = parseInt(req.params.id);
    const fecha = req.query.fecha;
    
    if (!medicoId || isNaN(medicoId)) {
      return respuesta.error(req, res, 'ID de médico inválido', 400);
    }
    
    if (!fecha) {
      return respuesta.error(req, res, 'Fecha requerida', 400);
    }
    
    // Validar formato de fecha
    const fechaValida = new Date(fecha);
    if (isNaN(fechaValida.getTime())) {
      return respuesta.error(req, res, 'Formato de fecha inválido', 400);
    }
    
    const disponibilidad = await controlador.obtenerDisponibilidadMedicoActualizada(medicoId, fecha);
    
    respuesta.success(req, res, disponibilidad, 200);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// RUTAS PARA GESTIÓN DE BLOQUES DE DISPONIBILIDAD (NUEVA ESTRUCTURA)
// ==========================================

// POST /api/receptionists/doctors/:id/availability-blocks - Crear bloques específicos
async function crearBloquesDisponibilidad(req, res, next) {
  try {
    const medicoId = parseInt(req.params.id);
    const { bloques } = req.body;
    
    if (!medicoId || isNaN(medicoId)) {
      return respuesta.error(req, res, 'ID de médico inválido', 400);
    }
    
    if (!bloques || !Array.isArray(bloques)) {
      return respuesta.error(req, res, 'Se requiere un array de bloques', 400);
    }
    
    // Agregar ID del recepcionista que crea los bloques
    const bloquesConRecepcionista = bloques.map(bloque => ({
      ...bloque,
      creado_por_recepcionista: req.user.id
    }));
    
    const resultado = await controlador.crearBloquesDisponibilidad(medicoId, bloquesConRecepcionista);
    
    respuesta.success(req, res, resultado, 201);
  } catch (err) {
    next(err);
  }
}

// GET /api/receptionists/doctors/:id/availability-blocks - Obtener bloques de disponibilidad
async function obtenerBloquesDisponibilidad(req, res, next) {
  try {
    const medicoId = parseInt(req.params.id);
    const { fecha_inicio, fecha_fin } = req.query;
    
    if (!medicoId || isNaN(medicoId)) {
      return respuesta.error(req, res, 'ID de médico inválido', 400);
    }
    
    const resultado = await controlador.obtenerBloquesDisponibilidad(medicoId, fecha_inicio, fecha_fin);
    
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
}

// POST /api/receptionists/doctors/:id/availability-blocks/generate - Generar bloques automáticamente
async function generarBloquesAutomaticamente(req, res, next) {
  try {
    const medicoId = parseInt(req.params.id);
    const configuracion = req.body;
    
    if (!medicoId || isNaN(medicoId)) {
      return respuesta.error(req, res, 'ID de médico inválido', 400);
    }
    
    if (!configuracion.fecha_inicio || !configuracion.fecha_fin) {
      return respuesta.error(req, res, 'fecha_inicio y fecha_fin son requeridos', 400);
    }
    
    // Agregar ID del recepcionista
    configuracion.creado_por_recepcionista = req.user.id;
    
    const resultado = await controlador.generarBloquesAutomaticamente(medicoId, configuracion);
    
    respuesta.success(req, res, resultado, 201);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/receptionists/doctors/:id/availability-blocks - Eliminar bloques
async function eliminarBloquesDisponibilidad(req, res, next) {
  try {
    const medicoId = parseInt(req.params.id);
    const filtros = req.query;
    
    if (!medicoId || isNaN(medicoId)) {
      return respuesta.error(req, res, 'ID de médico inválido', 400);
    }
    
    // Convertir bloque_ids de string a array si viene como query param
    if (filtros.bloque_ids && typeof filtros.bloque_ids === 'string') {
      filtros.bloque_ids = filtros.bloque_ids.split(',').map(id => parseInt(id.trim()));
    }
    
    const resultado = await controlador.eliminarBloquesDisponibilidad(medicoId, filtros);
    
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
}

// PUT /api/receptionists/availability-blocks/:bloqueId/disable - Marcar bloque como no disponible
async function marcarBloqueNoDisponible(req, res, next) {
  try {
    const bloqueId = parseInt(req.params.bloqueId);
    const { motivo } = req.body;
    
    if (!bloqueId || isNaN(bloqueId)) {
      return respuesta.error(req, res, 'ID de bloque inválido', 400);
    }
    
    const resultado = await controlador.marcarBloqueNoDisponible(bloqueId, motivo);
    
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
}

// PUT /api/receptionists/availability-blocks/:bloqueId/enable - Marcar bloque como disponible
async function marcarBloqueDisponible(req, res, next) {
  try {
    const bloqueId = parseInt(req.params.bloqueId);
    
    if (!bloqueId || isNaN(bloqueId)) {
      return respuesta.error(req, res, 'ID de bloque inválido', 400);
    }
    
    // Verificar que el bloque existe y no tiene cita asignada
    const [bloque] = await db.query(`
      SELECT b.*, u.nombre as medico_nombre, u.apellido as medico_apellido 
      FROM BloquesDisponibilidad b
      INNER JOIN Usuarios u ON b.medico_id = u.id
      WHERE b.id = @bloqueId
    `, { bloqueId });

    if (!bloque) {
      return respuesta.error(req, res, 'Bloque no encontrado', 404);
    }

    if (bloque.cita_id) {
      return respuesta.error(req, res, 'No se puede habilitar un bloque con cita asignada', 400);
    }

    // Marcar como disponible
    await db.query(`
      UPDATE BloquesDisponibilidad 
      SET disponible = 1, motivo_no_disponible = NULL, actualizado_en = GETDATE()
      WHERE id = @bloqueId
    `, { bloqueId });

    const resultado = {
      bloque_id: bloqueId,
      medico: `${bloque.medico_nombre} ${bloque.medico_apellido}`,
      fecha_hora: bloque.fecha_hora_inicio,
      mensaje: "Bloque marcado como disponible"
    };
    
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
}

// Definir las rutas con middlewares apropiados
router.get("/appointments", verifyRecepcionista, listarTodasLasCitas);
router.post("/appointments", verifyRecepcionista, crearCitaPaciente);
router.put("/appointments/:id", verifyRecepcionista, actualizarCualquierCita);
router.delete("/appointments/:id", verifyRecepcionista, cancelarCualquierCita);

router.get("/patients", verifyRecepcionistaMedicoOrAdmin, listarPacientes);
router.get("/patients/:id", verifyRecepcionistaMedicoOrAdmin, obtenerPaciente);

router.get("/doctors", verifyRecepcionista, listarMedicos);
router.get("/doctors/:id/availability", verifyRecepcionista, obtenerDisponibilidadMedico);

// Nuevas rutas para gestión de horarios médicos
router.post("/doctors/:id/schedule", verifyRecepcionista, establecerHorarioMedico);
router.get("/doctors/:id/schedule", verifyRecepcionista, obtenerHorarioMedico);
router.put("/doctors/:id/schedule/:scheduleId", verifyRecepcionista, actualizarHorarioMedico);
router.delete("/doctors/:id/schedule/:scheduleId", verifyRecepcionista, eliminarHorarioMedico);

router.post("/doctors/:id/schedule/exceptions", verifyRecepcionista, agregarExcepcionHorario);
router.get("/doctors/:id/schedule/exceptions", verifyRecepcionista, listarExcepcionesHorario);
router.delete("/doctors/:id/schedule/exceptions/:exceptionId", verifyRecepcionista, eliminarExcepcionHorario);

// Disponibilidad actualizada usando horarios configurados
router.get("/doctors/:id/availability-updated", verifyRecepcionista, obtenerDisponibilidadMedicoActualizada);

// NUEVAS RUTAS - Gestión de bloques de disponibilidad
router.post("/doctors/:id/availability-blocks", verifyRecepcionista, crearBloquesDisponibilidad);
router.get("/doctors/:id/availability-blocks", verifyRecepcionista, obtenerBloquesDisponibilidad);
router.post("/doctors/:id/availability-blocks/generate", verifyRecepcionista, generarBloquesAutomaticamente);
router.delete("/doctors/:id/availability-blocks", verifyRecepcionista, eliminarBloquesDisponibilidad);

router.put("/availability-blocks/:bloqueId/disable", verifyRecepcionista, marcarBloqueNoDisponible);
router.put("/availability-blocks/:bloqueId/enable", verifyRecepcionista, marcarBloqueDisponible);

router.get("/stats/daily", verifyRecepcionista, obtenerEstadisticasDiarias);

module.exports = router; 