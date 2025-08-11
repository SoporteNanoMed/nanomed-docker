const db = require("../db/sqlserver");

// const TABLA = "Medicos"; // Ya no se usa - migrado a Usuarios
const TABLA_CITAS = "CitasMedicas";
const TABLA_USUARIOS = "Usuarios";

// Listar todos los médicos (solo de tabla Usuarios)
async function listarMedicos(filtros = {}) {
  try {
    let query = `
      SELECT 
        id, nombre, apellido, email, telefono, especialidad,
        'medico' as tipo_registro, role, email_verified,
        creado_en, actualizado_en, foto_perfil
      FROM ${TABLA_USUARIOS}
      WHERE role = 'medico'
    `;
    
    const params = {};
    
    // Aplicar filtros
    if (filtros.nombre) {
      query += ` AND (nombre LIKE @nombre OR apellido LIKE @nombre)`;
      params.nombre = `%${filtros.nombre}%`;
    }
    
    // Ordenamiento
    query += ` ORDER BY apellido, nombre`;
    
    const medicos = await db.query(query, params);
    
    // Agregar fuente para compatibilidad
    return medicos.map(m => ({ ...m, fuente: 'usuarios' }));
  } catch (error) {
    throw error;
  }
}

// Obtener un médico específico por ID (solo tabla Usuarios)
async function obtenerMedico(id) {
  try {
    const [medico] = await db.query(
      `SELECT 
        id, nombre, apellido, email, telefono, especialidad,
        'medico' as tipo_registro, role, email_verified,
        creado_en, actualizado_en, foto_perfil,
        'usuarios' as fuente
      FROM ${TABLA_USUARIOS} 
      WHERE id = @id AND role = 'medico'`,
      { id }
    );
    
    return medico;
  } catch (error) {
    throw error;
  }
}

// Listar médicos por especialidad (función legacy - ahora retorna todos los médicos)
async function listarMedicosPorEspecialidad(especialidad) {
  try {
    // Buscar médicos en la tabla Usuarios con la especialidad especificada
    const medicos = await db.query(`
      SELECT 
        id, nombre, apellido, email, telefono, especialidad,
        foto_perfil, email_verified, creado_en
      FROM Usuarios 
      WHERE role = 'medico' AND especialidad LIKE @especialidad
      ORDER BY apellido, nombre
    `, { especialidad: `%${especialidad}%` });
    
    return medicos;
  } catch (error) {
    throw error;
  }
}

// Obtener estadísticas de médicos (actualizado para tabla Usuarios)
async function obtenerEstadisticasMedicos() {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_medicos,
        COUNT(DISTINCT especialidad) as total_especialidades
      FROM ${TABLA_USUARIOS} 
      WHERE role = 'medico'
    `);
    return stats;
  } catch (error) {
    throw error;
  }
}

// Listar citas asignadas al médico autenticado (solo tabla Usuarios)
async function listarMisCitas(medicoUserId, filtros = {}) {
  try {
    const { estado, fecha_desde, fecha_hasta, paciente_nombre } = filtros;
    
    let query = `
      SELECT 
        c.id,
        c.usuario_id,
        c.medico_id,
        c.fecha_hora,
        c.duracion,
        c.lugar,
        c.direccion,
        c.estado,
        c.notas,
        c.creado_en,
        c.actualizado_en,
        u.nombre + ' ' + u.apellido as nombre_paciente,
        u.email as email_paciente,
        u.telefono as telefono_paciente,
        u.rut as rut_paciente,
        um.nombre + ' ' + um.apellido as nombre_medico,
        um.especialidad as especialidad
      FROM ${TABLA_CITAS} c
      INNER JOIN ${TABLA_USUARIOS} u ON c.usuario_id = u.id
      INNER JOIN ${TABLA_USUARIOS} um ON c.medico_id = um.id AND um.role = 'medico'
      WHERE c.medico_id = @medicoUserId
    `;
    
    const params = { medicoUserId };
    
    // Aplicar filtros
    if (estado) {
      query += ` AND c.estado = @estado`;
      params.estado = estado;
    }
    
    if (fecha_desde) {
      query += ` AND c.fecha_hora >= @fecha_desde`;
      params.fecha_desde = fecha_desde;
    }
    
    if (fecha_hasta) {
      query += ` AND c.fecha_hora <= @fecha_hasta`;
      params.fecha_hasta = fecha_hasta;
    }
    
    if (paciente_nombre) {
      query += ` AND (u.nombre LIKE @paciente_nombre OR u.apellido LIKE @paciente_nombre)`;
      params.paciente_nombre = `%${paciente_nombre}%`;
    }
    
    query += ` ORDER BY c.fecha_hora ASC`;
    
    const citas = await db.query(query, params);
    
    return {
      citas,
      total: citas.length,
      filtros_aplicados: { estado, fecha_desde, fecha_hasta, paciente_nombre },
      medico_user_id: medicoUserId
    };
  } catch (error) {
    throw error;
  }
}

// Obtener detalle de una cita específica del médico (solo tabla Usuarios)
async function obtenerMiCita(citaId, medicoUserId) {
  try {
    const [cita] = await db.query(`
      SELECT 
        c.*,
        u.nombre + ' ' + u.apellido as nombre_paciente,
        u.email as email_paciente,
        u.telefono as telefono_paciente,
        u.rut as rut_paciente,
        u.fecha_nacimiento,
        u.genero,
        u.direccion as direccion_paciente,
        um.nombre + ' ' + um.apellido as nombre_medico,
        um.especialidad as especialidad
      FROM ${TABLA_CITAS} c
      INNER JOIN ${TABLA_USUARIOS} u ON c.usuario_id = u.id
      INNER JOIN ${TABLA_USUARIOS} um ON c.medico_id = um.id AND um.role = 'medico'
      WHERE c.id = @citaId AND c.medico_id = @medicoUserId
    `, { citaId, medicoUserId });
    
    return cita;
  } catch (error) {
    throw error;
  }
}

// Actualizar estado de cita (solo para médicos)
async function actualizarEstadoCita(citaId, medicoUserId, nuevoEstado, notas) {
  try {
    // Verificar que la cita existe y pertenece al médico
    const citaExistente = await obtenerMiCita(citaId, medicoUserId);
    if (!citaExistente) {
      throw new Error('Cita no encontrada o no tienes permisos para modificarla');
    }
    
    // Validar estado
    const estadosValidos = ['programada', 'confirmada', 'completada', 'cancelada'];
    if (!estadosValidos.includes(nuevoEstado)) {
      throw new Error('Estado inválido');
    }
    
    // NUEVO: Desvincular bloque de disponibilidad si se está cancelando la cita
    if (nuevoEstado === 'cancelada' && citaExistente.medico_id) {
      try {
        await db.query(`
          UPDATE BloquesDisponibilidad
          SET cita_id = NULL, actualizado_en = GETDATE()
          WHERE cita_id = @cita_id
        `, { cita_id: citaId });
        
      } catch (bloqueError) {
        console.error('Error al desvincular bloque de cita cancelada por médico:', bloqueError);
      }
    }
    
    await db.query(`
      UPDATE ${TABLA_CITAS} 
      SET 
        estado = @estado,
        notas = COALESCE(@notas, notas),
        actualizado_en = GETDATE()
      WHERE id = @citaId
    `, {
      estado: nuevoEstado,
      notas,
      citaId
    });
    
    // Crear notificación para el paciente
    await db.query(`
      INSERT INTO Notificaciones (usuario_id, tipo, titulo, contenido, referencia_tipo, referencia_id)
      VALUES (@usuario_id, 'cita', @titulo, @contenido, 'cita', @cita_id)
    `, {
      usuario_id: citaExistente.usuario_id,
      titulo: `Cita ${nuevoEstado}`,
      contenido: `Tu cita del ${new Date(citaExistente.fecha_hora).toLocaleDateString('es-CL')} ha sido ${nuevoEstado} por el médico`,
      cita_id: citaId
    });
    
    return await obtenerMiCita(citaId, medicoUserId);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  listarMedicos,
  obtenerMedico,
  listarMedicosPorEspecialidad,
  obtenerEstadisticasMedicos,
  listarMisCitas,
  obtenerMiCita,
  actualizarEstadoCita
}; 