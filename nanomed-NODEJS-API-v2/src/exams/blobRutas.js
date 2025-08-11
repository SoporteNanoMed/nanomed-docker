const express = require("express");
const router = express.Router();
const blobControlador = require("./blobControlador");
const blobExamsManager = require("../utils/blobExamsManager");
const respuesta = require("../red/respuestas");
const { verifyToken, verifyAdmin } = require("../auth/middlewares");
const { examUpload } = require("../middleware/azureUpload");

// Usamos verifyAdmin del módulo de middlewares

// Middleware para verificar que el usuario es admin o médico
const verificarAdminOMedico = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'medico') {
    return respuesta.error(req, res, 'Sin permisos para acceder a esta funcionalidad', 403);
  }
  next();
};

/**
 * @route GET /api/exams
 * @desc Listar exámenes del usuario desde blob storage
 * @access Cualquier usuario autenticado
 */
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const filtros = req.query;
    
    let resultado;
    
    if (userRole === 'user') {
      // Usuario normal: solo sus propios exámenes
      resultado = await blobControlador.getBlobExamsByUser(userId, filtros);
    } else if (userRole === 'admin' || userRole === 'medico' || userRole === 'recepcionista') {
      // Admin, médicos y recepcionistas pueden ver todos
      resultado = await blobControlador.getAllBlobExams(filtros);
    } else {
      return respuesta.error(req, res, 'Sin permisos para acceder a exámenes', 403);
    }
    
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/admin/exams/blob
 * @desc Obtener todos los exámenes del blob storage (solo admin)
 * @access Admin
 */
router.get("/admin/exams/blob", verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const filtros = {
      tipo_examen: req.query.tipo_examen,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta,
      paciente_id: req.query.paciente_id
    };

    const resultado = await blobControlador.getAllBlobExams(filtros);
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/admin/exams/blob/stats
 * @desc Obtener estadísticas de exámenes del blob storage (solo admin)
 * @access Admin
 */
router.get("/admin/exams/blob/stats", verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const stats = await blobControlador.getBlobExamsStats();
    respuesta.success(req, res, stats, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/doctor/exams/blob
 * @desc Obtener todos los exámenes del blob storage (admin y médicos)
 * @access Admin, Médico
 */
router.get("/blob", verifyToken, verificarAdminOMedico, async (req, res, next) => {
  try {
    const filtros = {
      tipo_examen: req.query.tipo_examen,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta,
      paciente_id: req.query.paciente_id
    };

    const resultado = await blobControlador.getAllBlobExams(filtros);
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/doctor/exams/blob/stats
 * @desc Obtener estadísticas de exámenes del blob storage (admin y médicos)
 * @access Admin, Médico
 */
router.get("/blob/stats", verifyToken, verificarAdminOMedico, async (req, res, next) => {
  try {
    const stats = await blobControlador.getBlobExamsStats();
    respuesta.success(req, res, stats, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/doctor/exams/blob/file-types
 * @desc Obtener tipos de archivo únicos en el blob storage
 * @access Admin, Médico
 */
router.get("/blob/file-types", verifyToken, verificarAdminOMedico, async (req, res, next) => {
  try {
    const fileTypes = await blobControlador.getBlobFileTypes();
    respuesta.success(req, res, fileTypes, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/doctor/exams/blob/users
 * @desc Obtener usuarios con exámenes en el blob storage
 * @access Admin, Médico
 */
router.get("/blob/users", verifyToken, verificarAdminOMedico, async (req, res, next) => {
  try {
    const users = await blobControlador.getUsersWithBlobExams();
    respuesta.success(req, res, users, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/doctor/exams/blob/user/:userId
 * @desc Obtener exámenes del blob storage de un usuario específico
 * @access Admin, Médico
 */
router.get("/blob/user/:userId", verifyToken, verificarAdminOMedico, async (req, res, next) => {
  try {
    const { userId } = req.params;
    const filtros = {
      tipo_examen: req.query.tipo_examen,
      fecha_desde: req.query.fecha_desde,
      fecha_hasta: req.query.fecha_hasta
    };

    const resultado = await blobControlador.getBlobExamsByUser(parseInt(userId), filtros);
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/exams/blob/:id
 * @desc Obtener examen específico del blob storage
 * @access Admin, Médico, Usuario (solo sus propios exámenes)
 */
router.get("/blob/:id", verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar que el ID es un blob ID
    if (!id.startsWith('blob_')) {
      return respuesta.error(req, res, 'ID de examen inválido', 400);
    }

    const examen = await blobControlador.getBlobExamById(id, req.user.id, req.user.role);
    respuesta.success(req, res, examen, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/exams/blob/:id/download
 * @desc Descargar archivo del blob storage
 * @access Admin, Médico, Usuario (solo sus propios exámenes)
 */
router.get("/blob/:id/download", verifyToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar que el ID es un blob ID
    if (!id.startsWith('blob_')) {
      return respuesta.error(req, res, 'ID de examen inválido', 400);
    }

    const archivoInfo = await blobControlador.downloadBlobExam(id, req.user.id, req.user.role);
    
    // Redirigir a la URL de descarga temporal
    return res.redirect(archivoInfo.downloadUrl);
  } catch (err) {
    next(err);
  }
});

/**
 * @route DELETE /api/doctor/exams/blob/:id
 * @desc Eliminar examen del blob storage (médicos y admin)
 * @access Admin, Médico
 */
router.delete("/blob/:id", verifyToken, verificarAdminOMedico, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Verificar que el ID es un blob ID
    if (!id.startsWith('blob_')) {
      return respuesta.error(req, res, 'ID de examen inválido', 400);
    }

    // Decodificar el nombre del blob del ID usando la nueva función
    const blobName = blobExamsManager.decodeBlobNameFromId(id);
    
    const resultado = await blobControlador.deleteBlobExam(blobName, req.user.id, req.user.role);
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /api/doctor/exams/blob/:id/move
 * @desc Mover examen a otra carpeta (médicos y admin)
 * @access Admin, Médico
 */
router.post("/blob/:id/move", verifyToken, verificarAdminOMedico, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { target_folder, reason } = req.body;
    
    if (!target_folder) {
      return respuesta.error(req, res, 'Se requiere especificar la carpeta destino', 400);
    }
    
    // Verificar que el ID es un blob ID
    if (!id.startsWith('blob_')) {
      return respuesta.error(req, res, 'ID de examen inválido', 400);
    }

    // Decodificar el nombre del blob del ID usando la nueva función
    const blobName = blobExamsManager.decodeBlobNameFromId(id);
    
    const resultado = await blobControlador.moveBlobExam(blobName, target_folder, req.user.id, req.user.role);
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /api/doctor/exams/blob/:id/restore
 * @desc Restaurar examen archivado (médicos y admin)
 * @access Admin, Médico
 */
router.post("/blob/:id/restore", verifyToken, verificarAdminOMedico, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Verificar que el ID es un blob ID
    if (!id.startsWith('blob_')) {
      return respuesta.error(req, res, 'ID de examen inválido', 400);
    }

    // Decodificar el nombre del blob del ID usando la nueva función
    const blobName = blobExamsManager.decodeBlobNameFromId(id);
    
    const resultado = await blobControlador.restoreBlobExam(blobName, req.user.id, req.user.role);
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /api/doctor/exams/blob/bulk-action
 * @desc Realizar acción masiva sobre múltiples exámenes
 * @access Admin, Médico
 */
router.post("/blob/bulk-action", verifyToken, verificarAdminOMedico, async (req, res, next) => {
  try {
    const { blob_ids, action } = req.body;
    
    if (!blob_ids || !Array.isArray(blob_ids) || blob_ids.length === 0) {
      return respuesta.error(req, res, 'Se requiere una lista de IDs de blob válida', 400);
    }
    
    if (!action || !action.action) {
      return respuesta.error(req, res, 'Se requiere especificar la acción a realizar', 400);
    }
    
    const resultado = await blobControlador.performBulkAction(blob_ids, action, req.user.id, req.user.role);
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * @route DELETE /api/admin/exams/blob/:id
 * @desc Eliminar examen del blob storage (solo admin)
 * @access Admin
 */
router.delete("/admin/exams/blob/:id", verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar que el ID es un blob ID
    if (!id.startsWith('blob_')) {
      return respuesta.error(req, res, 'ID de examen inválido', 400);
    }

    // Decodificar el nombre del blob del ID usando la nueva función
    const blobName = blobExamsManager.decodeBlobNameFromId(id);
    
    const resultado = await blobControlador.deleteBlobExam(blobName, req.user.id, req.user.role);
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * @route PUT /api/admin/exams/blob/:id/move
 * @desc Mover examen a otra carpeta (solo admin)
 * @access Admin
 */
router.put("/admin/exams/blob/:id/move", verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newFolder } = req.body;
    
    if (!newFolder) {
      return respuesta.error(req, res, 'Se requiere especificar la nueva carpeta', 400);
    }
    
    // Verificar que el ID es un blob ID
    if (!id.startsWith('blob_')) {
      return respuesta.error(req, res, 'ID de examen inválido', 400);
    }

    // Decodificar el nombre del blob del ID usando la nueva función
    const blobName = blobExamsManager.decodeBlobNameFromId(id);
    
    const resultado = await blobControlador.moveBlobExam(blobName, newFolder, req.user.id, req.user.role);
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /api/admin/exams/blob/cleanup
 * @desc Limpiar blob storage (solo admin)
 * @access Admin
 */
router.post("/admin/exams/blob/cleanup", verifyToken, verifyAdmin, async (req, res, next) => {
  try {
    const options = {
      deleteTempFiles: req.body.deleteTempFiles !== false,
      deleteDuplicates: req.body.deleteDuplicates === true,
      olderThanDays: parseInt(req.body.olderThanDays) || 90,
      dryRun: req.body.dryRun !== false // Por defecto, solo simular
    };

    const resultado = await blobControlador.cleanupBlobStorage(options, req.user.id, req.user.role);
    respuesta.success(req, res, resultado, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * @route GET /api/doctor/exams/blob/search
 * @desc Buscar exámenes en el blob storage
 * @access Admin, Médico
 */
router.get("/blob/search", verifyToken, verificarAdminOMedico, async (req, res, next) => {
  try {
    const { q, tipo_examen, fecha_desde, fecha_hasta, paciente_id } = req.query;
    
    const filtros = {
      tipo_examen,
      fecha_desde,
      fecha_hasta,
      paciente_id
    };

    const resultado = await blobControlador.getAllBlobExams(filtros);
    
    // Si hay término de búsqueda, filtrar por nombre de archivo
    let examenesFiltrados = resultado.examenes;
    if (q) {
      const searchTerm = q.toLowerCase();
      examenesFiltrados = resultado.examenes.filter(exam => 
        exam.archivo_nombre_original.toLowerCase().includes(searchTerm) ||
        exam.tipo_examen.toLowerCase().includes(searchTerm) ||
        (exam.nombre_paciente && exam.nombre_paciente.toLowerCase().includes(searchTerm))
      );
    }
    
    respuesta.success(req, res, {
      ...resultado,
      examenes: examenesFiltrados,
      total: examenesFiltrados.length,
      filtros_aplicados: { ...filtros, q }
    }, 200);
  } catch (err) {
    next(err);
  }
});

/**
 * @route POST /api/doctor/exams/blob/upload
 * @desc Subir nuevo examen al blob storage (médicos y admin)
 * @access Admin, Médico
 */
router.post("/blob/upload", verifyToken, verificarAdminOMedico, examUpload, async (req, res, next) => {
  try {
    const { paciente_id, tipo_examen, fecha, descripcion } = req.body;
    
    if (!paciente_id) {
      return respuesta.error(req, res, 'Se requiere especificar el ID del paciente', 400);
    }
    
    if (!tipo_examen) {
      return respuesta.error(req, res, 'Se requiere especificar el tipo de examen', 400);
    }
    
    if (!req.azureBlob) {
      return respuesta.error(req, res, 'No se recibió archivo o falló la subida a Azure', 400);
    }

    const resultado = await blobControlador.createBlobExam({
      paciente_id: parseInt(paciente_id),
      medico_id: req.user.id,
      tipo_examen,
      fecha: fecha || new Date().toISOString().split('T')[0],
      descripcion: descripcion || `Examen subido por médico: ${req.azureBlob.blobName}`,
      azure_blob: req.azureBlob
    });
    
    respuesta.success(req, res, resultado, 201);
  } catch (err) {
    next(err);
  }
});

module.exports = router; 