const express = require("express");
const router = express.Router();
const controlador = require("./controlador");
const respuesta = require("../red/respuestas");
const { verifyToken, verifyAdmin, adminLimiter } = require("../auth/middlewares");
const validaciones = require("./validaciones");
const migracion = require("./migracion-medicos");

// Middleware de autenticación, autorización y rate limiting para todas las rutas
router.use(verifyToken);
router.use(verifyAdmin);
router.use(adminLimiter);

// ==========================================
// GESTIÓN DE USUARIOS
// ==========================================

// GET /api/admin/users - Listar todos los usuarios
router.get("/users", listarUsuarios);

// GET /api/admin/users/:id - Ver detalle de usuario específico
router.get("/users/:id", validaciones.validarId, obtenerUsuario);

// PUT /api/admin/users/:id - Actualizar usuario
router.put("/users/:id", validaciones.validarId, validaciones.actualizarUsuario, actualizarUsuario);

// DELETE /api/admin/users/:id - Desactivar usuario
router.delete("/users/:id", validaciones.validarId, desactivarUsuario);

// ==========================================
// GESTIÓN DE MÉDICOS
// ==========================================

// GET /api/admin/doctors - Listar todos los médicos
router.get("/doctors", listarMedicos);

// POST /api/admin/doctors - Crear nuevo médico
router.post("/doctors", validaciones.crearMedico, crearMedico);

// ==========================================
// GESTIÓN DE RECEPCIONISTAS
// ==========================================

// GET /api/admin/recepcionistas - Listar todos los recepcionistas
router.get("/recepcionistas", listarRecepcionistas);

// ==========================================
// GESTIÓN DE ADMINISTRADORES
// ==========================================

// GET /api/admin/admin - Listar todos los administradores
router.get("/admin", listarAdministradores);

// ==========================================
// CREACIÓN DE USUARIOS CON ROLES ESPECIALES
// ==========================================

// POST /api/admin/users/medico - Crear nuevo usuario médico
router.post("/users/medico", validaciones.crearUsuarioEspecial, crearUsuarioMedico);

// POST /api/admin/users/recepcionista - Crear nuevo usuario recepcionista
router.post("/users/recepcionista", validaciones.crearUsuarioEspecial, crearUsuarioRecepcionista);

// POST /api/admin/users/admin - Crear nuevo usuario administrador
router.post("/users/admin", validaciones.crearUsuarioEspecial, crearUsuarioAdmin);

// POST /api/admin/users/api - Crear nuevo usuario API
router.post("/users/api", validaciones.crearUsuarioEspecial, crearUsuarioApi);

// PUT /api/admin/doctors/:id - Actualizar médico
router.put("/doctors/:id", validaciones.validarId, validaciones.actualizarMedico, actualizarMedico);

// DELETE /api/admin/doctors/:id - Desactivar médico
router.delete("/doctors/:id", validaciones.validarId, desactivarMedico);

// ==========================================
// MIGRACIÓN DE MÉDICOS LEGACY
// ==========================================

// GET /api/admin/doctors/migration/status - Verificar estado de migración
router.get("/doctors/migration/status", verificarEstadoMigracion);

// POST /api/admin/doctors/migration/execute - Ejecutar migración de médicos legacy
router.post("/doctors/migration/execute", ejecutarMigracion);

// POST /api/admin/doctors/migration/revert - Revertir migración
router.post("/doctors/migration/revert", revertirMigracion);

// ==========================================
// GESTIÓN DE CITAS
// ==========================================

// GET /api/admin/appointments - Ver todas las citas
router.get("/appointments", validaciones.validarFiltrosFecha, verTodasLasCitas);

// ==========================================
// ESTADÍSTICAS DEL SISTEMA
// ==========================================

// GET /api/admin/stats - Obtener estadísticas del sistema
router.get("/stats", obtenerEstadisticas);

// ==========================================
// FUNCIONES DE CONTROLADOR
// ==========================================

async function listarUsuarios(req, res, next) {
  try {
    const filtros = {
      role: req.query.role,
      activo: req.query.activo,
      email_verified: req.query.email_verified
    };
    
    // Remover filtros vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key] === undefined || filtros[key] === '') {
        delete filtros[key];
      }
    });
    
    const usuarios = await controlador.listarTodosLosUsuarios(filtros);
    
    respuesta.success(req, res, {
      usuarios,
      total: usuarios.length,
      filtros_aplicados: filtros
    }, 200);
  } catch (err) {
    next(err);
  }
}

async function obtenerUsuario(req, res, next) {
  try {
    const { id } = req.params;
    
    const usuario = await controlador.obtenerUsuarioCompleto(id);
    
    if (!usuario) {
      return respuesta.error(req, res, 'Usuario no encontrado', 404);
    }
    
    respuesta.success(req, res, usuario, 200);
  } catch (err) {
    next(err);
  }
}

async function actualizarUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;
    
    await controlador.actualizarUsuarioAdmin(id, datosActualizacion);
    
    respuesta.success(req, res, "Usuario actualizado correctamente", 200);
  } catch (err) {
    next(err);
  }
}

async function desactivarUsuario(req, res, next) {
  try {
    const { id } = req.params;
    
    await controlador.desactivarUsuario(id);
    
    respuesta.success(req, res, "Usuario desactivado correctamente", 200);
  } catch (err) {
    next(err);
  }
}

async function listarMedicos(req, res, next) {
  try {
    const filtros = {
      especialidad: req.query.especialidad,
      activo: req.query.activo
    };
    
    // Remover filtros vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key] === undefined || filtros[key] === '') {
        delete filtros[key];
      }
    });
    
    const medicos = await controlador.listarTodosLosMedicos(filtros);
    
    respuesta.success(req, res, {
      medicos,
      total: medicos.length,
      filtros_aplicados: filtros
    }, 200);
  } catch (err) {
    next(err);
  }
}

async function listarRecepcionistas(req, res, next) {
  try {
    const filtros = {
      email_verified: req.query.email_verified,
      activo: req.query.activo,
      search: req.query.search
    };
    
    // Remover filtros vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key] === undefined || filtros[key] === '') {
        delete filtros[key];
      }
    });
    
    const recepcionistas = await controlador.listarTodosLosRecepcionistas(filtros);
    
    respuesta.success(req, res, {
      recepcionistas,
      total: recepcionistas.length,
      filtros_aplicados: filtros
    }, 200);
  } catch (err) {
    next(err);
  }
}

async function listarAdministradores(req, res, next) {
  try {
    const filtros = {
      role: 'admin',
      activo: req.query.activo
    };
    
    // Remover filtros vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key] === undefined || filtros[key] === '') {
        delete filtros[key];
      }
    });
    
    const administradores = await controlador.listarTodosLosUsuarios(filtros);
    
    respuesta.success(req, res, {
      administradores,
      total: administradores.length,
      filtros_aplicados: filtros
    }, 200);
  } catch (err) {
    next(err);
  }
}

async function crearMedico(req, res, next) {
  try {
    const datosMedico = req.body;
    
    const nuevoMedico = await controlador.crearNuevoMedico(datosMedico);
    
    respuesta.success(req, res, {
      message: "Médico creado correctamente",
      medico: nuevoMedico
    }, 201);
  } catch (err) {
    next(err);
  }
}

async function actualizarMedico(req, res, next) {
  try {
    const { id } = req.params;
    const datosActualizacion = req.body;
    
    await controlador.actualizarMedicoAdmin(id, datosActualizacion);
    
    respuesta.success(req, res, "Médico actualizado correctamente", 200);
  } catch (err) {
    next(err);
  }
}

async function crearUsuarioMedico(req, res, next) {
  try {
    const datosUsuario = { ...req.body, role: 'medico' };
    const nuevoUsuario = await controlador.crearUsuarioConRol(datosUsuario);
    
    respuesta.success(req, res, {
      message: "Usuario médico creado correctamente",
      usuario: nuevoUsuario
    }, 201);
  } catch (err) {
    next(err);
  }
}

async function crearUsuarioRecepcionista(req, res, next) {
  try {
    const datosUsuario = { ...req.body, role: 'recepcionista' };
    const nuevoUsuario = await controlador.crearUsuarioConRol(datosUsuario);
    
    respuesta.success(req, res, {
      message: "Usuario recepcionista creado correctamente",
      usuario: nuevoUsuario
    }, 201);
  } catch (err) {
    next(err);
  }
}

async function crearUsuarioAdmin(req, res, next) {
  try {
    const datosUsuario = { ...req.body, role: 'admin' };
    const nuevoUsuario = await controlador.crearUsuarioConRol(datosUsuario);
    
    respuesta.success(req, res, {
      message: "Usuario administrador creado correctamente",
      usuario: nuevoUsuario
    }, 201);
  } catch (err) {
    next(err);
  }
}

async function crearUsuarioApi(req, res, next) {
  try {
    const datosUsuario = { ...req.body, role: 'api' };
    const nuevoUsuario = await controlador.crearUsuarioConRol(datosUsuario);
    
    respuesta.success(req, res, {
      message: "Usuario API creado correctamente",
      usuario: nuevoUsuario
    }, 201);
  } catch (err) {
    next(err);
  }
}

async function desactivarMedico(req, res, next) {
  try {
    const { id } = req.params;
    
    await controlador.desactivarMedico(id);
    
    respuesta.success(req, res, "Médico desactivado correctamente", 200);
  } catch (err) {
    next(err);
  }
}

// ==========================================
// FUNCIONES DE MIGRACIÓN
// ==========================================

async function verificarEstadoMigracion(req, res, next) {
  try {
    const estado = await migracion.verificarEstadoMigracion();
    
    respuesta.success(req, res, {
      message: "Estado de migración obtenido correctamente",
      estado
    }, 200);
  } catch (err) {
    next(err);
  }
}

async function ejecutarMigracion(req, res, next) {
  try {
    const resultado = await migracion.migrarMedicosLegacyAUsuarios();
    
    respuesta.success(req, res, {
      message: "Migración ejecutada correctamente",
      resultado
    }, 200);
  } catch (err) {
    next(err);
  }
}

async function revertirMigracion(req, res, next) {
  try {
    const resultado = await migracion.revertirMigracion();
    
    respuesta.success(req, res, {
      message: "Migración revertida correctamente",
      resultado
    }, 200);
  } catch (err) {
    next(err);
  }
}

async function verTodasLasCitas(req, res, next) {
  try {
    const filtros = {
      estado: req.query.estado,
      medico_id: req.query.medico_id,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta
    };
    
    // Remover filtros vacíos
    Object.keys(filtros).forEach(key => {
      if (filtros[key] === undefined || filtros[key] === '') {
        delete filtros[key];
      }
    });
    
    const citas = await controlador.obtenerTodasLasCitas(filtros);
    
    respuesta.success(req, res, {
      citas,
      total: citas.length,
      filtros_aplicados: filtros
    }, 200);
  } catch (err) {
    next(err);
  }
}

async function obtenerEstadisticas(req, res, next) {
  try {
    const estadisticas = await controlador.obtenerEstadisticasDelSistema();
    
    respuesta.success(req, res, estadisticas, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = router; 