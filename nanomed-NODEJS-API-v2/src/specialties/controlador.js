const db = require("../db/sqlserver");

// Obtener todas las especialidades médicas disponibles
async function listarEspecialidades() {
  try {
    // Obtener especialidades únicas de la tabla Usuarios con rol médico
    const especialidades = await db.query(`
      SELECT DISTINCT especialidad as nombre, COUNT(*) as total_medicos
      FROM Usuarios 
      WHERE role = 'medico' AND especialidad IS NOT NULL AND especialidad != ''
      GROUP BY especialidad
      ORDER BY especialidad
    `);
    
    return especialidades;
  } catch (error) {
    throw error;
  }
}

// Obtener información detallada de una especialidad específica
async function obtenerEspecialidad(nombre) {
  try {
    const [especialidad] = await db.query(`
      SELECT 
        especialidad as nombre,
        COUNT(*) as total_medicos
      FROM Usuarios 
      WHERE especialidad = @nombre AND role = 'medico'
      GROUP BY especialidad
    `, { nombre });
    
    if (!especialidad) {
      return null;
    }
    
    // Obtener los médicos de esta especialidad
    const medicos = await db.query(`
      SELECT id, nombre, apellido, email, foto_perfil, especialidad
      FROM Usuarios 
      WHERE especialidad = @nombre AND role = 'medico'
      ORDER BY apellido, nombre
    `, { nombre });
    
    return {
      ...especialidad,
      medicos
    };
  } catch (error) {
    throw error;
  }
}

// Obtener estadísticas generales de especialidades
async function obtenerEstadisticasEspecialidades() {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(DISTINCT especialidad) as total_especialidades,
        COUNT(*) as total_medicos,
        AVG(CAST(medicos_por_especialidad as FLOAT)) as promedio_medicos_por_especialidad
      FROM (
        SELECT especialidad, COUNT(*) as medicos_por_especialidad
        FROM Medicos 
        WHERE activo = 1 AND especialidad IS NOT NULL AND especialidad != ''
        GROUP BY especialidad
      ) as subquery
    `);
    
    return stats;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  listarEspecialidades,
  obtenerEspecialidad,
  obtenerEstadisticasEspecialidades
}; 