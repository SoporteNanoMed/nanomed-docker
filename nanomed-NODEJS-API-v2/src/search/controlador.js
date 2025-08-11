const db = require("../db/sqlserver");

// Buscar médicos con filtros avanzados
async function buscarMedicos(filtros = {}) {
  try {
    let query = `SELECT * FROM Usuarios WHERE role = 'medico'`;
    const params = {};
    
    // Filtro por especialidad
    if (filtros.especialidad) {
      query += ` AND especialidad LIKE @especialidad`;
      params.especialidad = `%${filtros.especialidad}%`;
    }
    
    // Filtro por nombre
    if (filtros.nombre) {
      query += ` AND (nombre LIKE @nombre OR apellido LIKE @nombre)`;
      params.nombre = `%${filtros.nombre}%`;
    }
    
    // Filtro por apellido específico
    if (filtros.apellido) {
      query += ` AND apellido LIKE @apellido`;
      params.apellido = `%${filtros.apellido}%`;
    }
    
    // Filtro por estado activo (usando email_verified)
    if (filtros.activo !== undefined) {
      query += ` AND email_verified = @email_verified`;
      params.email_verified = filtros.activo === 'true' || filtros.activo === true ? 1 : 0;
    }
    
    // Ordenamiento
    query += ` ORDER BY apellido, nombre`;
    
    const medicos = await db.query(query, params);
    return medicos;
  } catch (error) {
    throw error;
  }
}

// Buscar exámenes con filtros avanzados - Ahora usa solo blob storage
async function buscarExamenes(userId, userRole, filtros = {}) {
  try {
    // Importar el controlador de blob para realizar búsquedas
    const blobControlador = require("../exams/blobControlador");
    const blobController = new blobControlador();
    
    // Determinar qué exámenes buscar según el rol
    let examenes = [];
    
    if (userRole === 'user') {
      // Usuario normal: solo puede ver sus propios exámenes del blob
      const resultado = await blobController.getBlobExamsByUser(userId, filtros);
      examenes = resultado.examenes;
    } else if (userRole === 'admin' || userRole === 'medico') {
      // Admin y médicos pueden ver todos los exámenes del blob
      const resultado = await blobController.getAllBlobExams(filtros);
      examenes = resultado.examenes;
    } else {
      // Rol no autorizado para buscar exámenes
      throw new Error('Sin permisos para buscar exámenes');
    }
    
    // Aplicar filtros adicionales si es necesario
    let examenesFiltrados = examenes;
    
    // Filtro por término de búsqueda general
    if (filtros.q) {
      const searchTerm = filtros.q.toLowerCase();
      examenesFiltrados = examenes.filter(exam => 
        exam.archivo_nombre_original?.toLowerCase().includes(searchTerm) ||
        exam.tipo_examen?.toLowerCase().includes(searchTerm) ||
        exam.nombre_paciente?.toLowerCase().includes(searchTerm) ||
        exam.descripcion?.toLowerCase().includes(searchTerm)
      );
    }
    
    // Filtro por médico específico (para admins)
    if (filtros.medico_id && userRole === 'admin') {
      examenesFiltrados = examenesFiltrados.filter(exam => 
        exam.medico_id == filtros.medico_id
      );
    }
    
    return examenesFiltrados;
  } catch (error) {
    console.error('Error en búsqueda de exámenes:', error);
    throw error;
  }
}

module.exports = {
  buscarMedicos,
  buscarExamenes
}; 