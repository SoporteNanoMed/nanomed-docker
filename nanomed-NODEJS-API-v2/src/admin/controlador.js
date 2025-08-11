const db = require("../db/sqlserver");
const bcrypt = require("bcrypt");
const { error } = require("../middleware/errors");

const TABLA_USUARIOS = "Usuarios";
const TABLA_MEDICOS = "Medicos";
const TABLA_CITAS = "CitasMedicas";

// ==========================================
// GESTIÓN DE USUARIOS
// ==========================================

// Listar todos los usuarios con filtros
async function listarTodosLosUsuarios(filtros = {}) {
  try {
    let query = `
      SELECT 
        id, nombre, apellido, email, telefono, rut, 
        fecha_nacimiento, genero, direccion, ciudad, region,
        foto_perfil, creado_en, actualizado_en, email_verified,
        role, login_attempts, last_failed_login, mfa_enabled
      FROM ${TABLA_USUARIOS}
      WHERE 1=1
    `;
    const params = {};
    
    // Filtro por rol
    if (filtros.role) {
      query += ` AND role = @role`;
      params.role = filtros.role;
    }
    
    // Filtro por estado de verificación de email
    if (filtros.email_verified !== undefined) {
      query += ` AND email_verified = @email_verified`;
      params.email_verified = filtros.email_verified === 'true' ? 1 : 0;
    }
    
    // Ordenamiento
    query += ` ORDER BY creado_en DESC`;
    
    const usuarios = await db.query(query, params);
    return usuarios;
  } catch (err) {
    throw err;
  }
}

// Obtener usuario completo con información adicional
async function obtenerUsuarioCompleto(id) {
  try {
    const [usuario] = await db.query(`
      SELECT 
        u.id, u.nombre, u.apellido, u.email, u.telefono, u.rut,
        u.fecha_nacimiento, u.genero, u.direccion, u.ciudad, u.region,
        u.foto_perfil, u.creado_en, u.actualizado_en, u.email_verified,
        u.role, u.login_attempts, u.last_failed_login, u.mfa_enabled,
        -- Información médica
        im.grupo_sanguineo, im.alergias, im.medicamentos, im.condiciones_medicas,
        -- Estadísticas de citas
        (SELECT COUNT(*) FROM ${TABLA_CITAS} WHERE usuario_id = u.id) as total_citas,
        (SELECT COUNT(*) FROM ${TABLA_CITAS} WHERE usuario_id = u.id AND estado = 'completada') as citas_completadas
      FROM ${TABLA_USUARIOS} u
      LEFT JOIN InformacionMedica im ON u.id = im.usuario_id
      WHERE u.id = @id
    `, { id });
    
    if (!usuario) {
      throw error("Usuario no encontrado", 404);
    }
    
    // Obtener contactos de emergencia
    const contactosEmergencia = await db.query(`
      SELECT id, nombre, relacion, telefono
      FROM ContactosEmergencia
      WHERE usuario_id = @id
    `, { id });
    
    usuario.contactos_emergencia = contactosEmergencia;
    
    return usuario;
  } catch (err) {
    throw err;
  }
}

// Actualizar usuario (admin)
async function actualizarUsuarioAdmin(id, datos) {
  try {
    // Verificar que el usuario existe
    const [usuarioExistente] = await db.unoUsuario(TABLA_USUARIOS, { id });
    if (!usuarioExistente) {
      throw error("Usuario no encontrado", 404);
    }
    
    // Validar email único si se está cambiando
    if (datos.email && datos.email !== usuarioExistente.email) {
      const [emailExistente] = await db.unoUsuario(TABLA_USUARIOS, { email: datos.email });
      if (emailExistente && emailExistente.id !== parseInt(id)) {
        throw error("El email ya está en uso por otro usuario", 400);
      }
    }
    
    // Validar RUT único si se está cambiando
    if (datos.rut && datos.rut !== usuarioExistente.rut) {
      const [rutExistente] = await db.unoUsuario(TABLA_USUARIOS, { rut: datos.rut });
      if (rutExistente && rutExistente.id !== parseInt(id)) {
        throw error("El RUT ya está en uso por otro usuario", 400);
      }
    }
    
    // Preparar datos para actualización
    const datosActualizacion = {
      id: parseInt(id),
      ...datos,
      actualizado_en: new Date()
    };
    
    // Si se está cambiando la contraseña, hashearla
    if (datos.password) {
      datosActualizacion.password_hash = await bcrypt.hash(datos.password, 10);
      delete datosActualizacion.password;
    }
    
    await db.actualizarUsuario(TABLA_USUARIOS, datosActualizacion);
    return { success: true, message: "Usuario actualizado correctamente" };
  } catch (err) {
    throw err;
  }
}

// Desactivar usuario (cambiar a inactivo en lugar de eliminar)
async function desactivarUsuario(id) {
  try {
    const [usuario] = await db.unoUsuario(TABLA_USUARIOS, { id });
    if (!usuario) {
      throw error("Usuario no encontrado", 404);
    }
    
    // En lugar de eliminar, podríamos agregar un campo 'activo' o usar otro método
    // Por ahora, mantenemos la funcionalidad existente pero con validaciones adicionales
    
    // Verificar si el usuario tiene citas futuras
    const [citasFuturas] = await db.query(`
      SELECT COUNT(*) as total
      FROM ${TABLA_CITAS}
      WHERE usuario_id = @id AND fecha_hora > GETDATE() AND estado IN ('programada', 'confirmada')
    `, { id });
    
    if (citasFuturas.total > 0) {
      throw error("No se puede desactivar el usuario porque tiene citas futuras programadas", 400);
    }
    
    // Proceder con la eliminación/desactivación
    await db.eliminarUsuario(TABLA_USUARIOS, id);
    return { success: true, message: "Usuario desactivado correctamente" };
  } catch (err) {
    throw err;
  }
}

// ==========================================
// GESTIÓN DE MÉDICOS
// ==========================================

// Listar todos los médicos (incluyendo usuarios con rol médico)
async function listarTodosLosMedicos(filtros = {}) {
  try {
    // Obtener médicos de la tabla Usuarios con rol 'medico'
    let queryUsuarios = `
      SELECT 
        id, nombre, apellido, email, telefono, especialidad,
        'medico' as tipo_registro, role, email_verified,
        creado_en, actualizado_en, foto_perfil
      FROM ${TABLA_USUARIOS}
      WHERE role = 'medico'
    `;
    
    // Obtener médicos de la tabla Medicos (legacy)
    let queryMedicos = `
      SELECT 
        id, nombre, apellido, email, especialidad,
        'legacy' as tipo_registro, activo, foto_perfil
      FROM ${TABLA_MEDICOS}
      WHERE 1=1
    `;
    
    const params = {};
    
    // Aplicar filtros
    if (filtros.especialidad) {
      queryUsuarios += ` AND especialidad LIKE @especialidad`;
      queryMedicos += ` AND especialidad LIKE @especialidad`;
      params.especialidad = `%${filtros.especialidad}%`;
    }
    
    if (filtros.activo !== undefined) {
      queryMedicos += ` AND activo = @activo`;
      params.activo = filtros.activo === 'true' ? 1 : 0;
    }
    
    // Ejecutar ambas consultas
    const medicosUsuarios = await db.query(queryUsuarios, params);
    const medicosLegacy = await db.query(queryMedicos, params);
    
    // Combinar resultados
    const todosMedicos = [
      ...medicosUsuarios.map(m => ({ ...m, fuente: 'usuarios' })),
      ...medicosLegacy.map(m => ({ ...m, fuente: 'medicos_legacy' }))
    ];
    
    return todosMedicos;
  } catch (err) {
    throw err;
  }
}

// Listar todos los recepcionistas
async function listarTodosLosRecepcionistas(filtros = {}) {
  try {
    let query = `
      SELECT 
        id, nombre, apellido, email, telefono, rut,
        fecha_nacimiento, genero, direccion, ciudad, region,
        email_verified, creado_en, actualizado_en, foto_perfil,
        login_attempts, mfa_enabled
      FROM ${TABLA_USUARIOS}
      WHERE role = 'recepcionista'
    `;
    
    const params = {};
    
    // Aplicar filtros
    if (filtros.email_verified !== undefined) {
      query += ` AND email_verified = @email_verified`;
      params.email_verified = filtros.email_verified === 'true' ? 1 : 0;
    }
    
    if (filtros.search) {
      query += ` AND (
        nombre LIKE @search OR 
        apellido LIKE @search OR 
        email LIKE @search OR 
        rut LIKE @search
      )`;
      params.search = `%${filtros.search}%`;
    }
    
    // Ordenamiento
    query += ` ORDER BY apellido, nombre`;
    
    const recepcionistas = await db.query(query, params);
    
    // Limpiar datos sensibles
    const recepcionistasSanitizados = recepcionistas.map(recepcionista => {
      const { password_hash, verification_token, reset_token, reset_token_expires, 
              mfa_secret, mfa_token, mfa_token_expires, mfa_code_hash, ...datosLimpios } = recepcionista;
      return datosLimpios;
    });
    
    return recepcionistasSanitizados;
  } catch (err) {
    throw err;
  }
}

// Crear usuario con rol específico (solo para administradores)
async function crearUsuarioConRol(datos) {
  try {
    // Validar datos requeridos
    if (!datos.nombre || !datos.apellido || !datos.email || !datos.password || !datos.role) {
      throw error("Nombre, apellido, email, contraseña y rol son requeridos", 400);
    }
    
    // Validar que el rol sea válido
    const rolesValidos = ['medico', 'recepcionista', 'admin', 'api'];
    if (!rolesValidos.includes(datos.role)) {
      throw error("Rol inválido. Solo se permiten: medico, recepcionista, admin, api", 400);
    }
    
    // Verificar que el email no exista
    const [emailExistente] = await db.unoUsuario(TABLA_USUARIOS, { email: datos.email });
    if (emailExistente) {
      throw error("El email ya está registrado", 400);
    }
    
    // Verificar RUT si se proporciona
    if (datos.rut) {
      const [rutExistente] = await db.unoUsuario(TABLA_USUARIOS, { rut: datos.rut });
      if (rutExistente) {
        throw error("El RUT ya está registrado", 400);
      }
    }
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(datos.password, 10);
    
    // Preparar datos del nuevo usuario
    const nuevoUsuario = {
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      password_hash: hashedPassword,
      telefono: datos.telefono,
      rut: datos.rut,
      fecha_nacimiento: datos.fecha_nacimiento,
      genero: datos.genero,
      direccion: datos.direccion,
      ciudad: datos.ciudad,
      region: datos.region,
      foto_perfil: datos.foto_perfil,
      role: datos.role,
      email_verified: true, // Los usuarios creados por admin están verificados
      login_attempts: 0,
      mfa_enabled: false
    };
    
    // Insertar en la base de datos
    const resultado = await db.insertarUsuario(TABLA_USUARIOS, nuevoUsuario);
    
    return {
      id: resultado.insertId,
      nombre: nuevoUsuario.nombre,
      apellido: nuevoUsuario.apellido,
      email: nuevoUsuario.email,
      role: nuevoUsuario.role
    };
  } catch (err) {
    throw err;
  }
}

// Crear nuevo médico como usuario con rol médico
async function crearNuevoMedico(datos) {
  try {
    // Validar datos requeridos
    if (!datos.nombre || !datos.apellido || !datos.email || !datos.password || !datos.especialidad) {
      throw error("Nombre, apellido, email, contraseña y especialidad son requeridos", 400);
    }
    
    // Verificar que el email no exista
    const [emailExistente] = await db.unoUsuario(TABLA_USUARIOS, { email: datos.email });
    if (emailExistente) {
      throw error("El email ya está registrado", 400);
    }
    
    // Verificar RUT si se proporciona
    if (datos.rut) {
      const [rutExistente] = await db.unoUsuario(TABLA_USUARIOS, { rut: datos.rut });
      if (rutExistente) {
        throw error("El RUT ya está registrado", 400);
      }
    }
    
    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(datos.password, 10);
    
    // Preparar datos del nuevo médico
    const nuevoMedico = {
      nombre: datos.nombre,
      apellido: datos.apellido,
      email: datos.email,
      password_hash: hashedPassword,
      especialidad: datos.especialidad,
      telefono: datos.telefono,
      rut: datos.rut,
      fecha_nacimiento: datos.fecha_nacimiento,
      genero: datos.genero,
      direccion: datos.direccion,
      ciudad: datos.ciudad,
      region: datos.region,
      foto_perfil: datos.foto_perfil,
      role: 'medico',
      email_verified: true, // Los médicos creados por admin están verificados
      login_attempts: 0,
      mfa_enabled: false
    };
    
    // Insertar en la base de datos
    const resultado = await db.insertarUsuario(TABLA_USUARIOS, nuevoMedico);
    
    return {
      id: resultado.insertId,
      nombre: nuevoMedico.nombre,
      apellido: nuevoMedico.apellido,
      email: nuevoMedico.email,
      especialidad: nuevoMedico.especialidad,
      role: nuevoMedico.role
    };
  } catch (err) {
    throw err;
  }
}

// Actualizar médico
async function actualizarMedicoAdmin(id, datos) {
  try {
    // Primero verificar si es un médico en la tabla Usuarios
    const [medicoUsuario] = await db.query(`
      SELECT * FROM ${TABLA_USUARIOS} WHERE id = @id AND role = 'medico'
    `, { id });
    
    if (medicoUsuario) {
      // Es un médico en la tabla Usuarios
      return await actualizarUsuarioAdmin(id, datos);
    } else {
      // Verificar si es un médico legacy
      const [medicoLegacy] = await db.query(`
        SELECT * FROM ${TABLA_MEDICOS} WHERE id = @id
      `, { id });
      
      if (!medicoLegacy) {
        throw error("Médico no encontrado", 404);
      }
      
      // Actualizar médico legacy
      const datosActualizacion = {
        id: parseInt(id),
        ...datos,
      };
      
      await db.query(`
        UPDATE ${TABLA_MEDICOS}
        SET nombre = COALESCE(@nombre, nombre),
            apellido = COALESCE(@apellido, apellido),
            email = COALESCE(@email, email),
            especialidad = COALESCE(@especialidad, especialidad),
            foto_perfil = COALESCE(@foto_perfil, foto_perfil),
            activo = COALESCE(@activo, activo)
        WHERE id = @id
      `, datosActualizacion);
      
      return { success: true, message: "Médico actualizado correctamente" };
    }
  } catch (err) {
    throw err;
  }
}

// Desactivar médico
async function desactivarMedico(id) {
  try {
    // Verificar si es un médico en la tabla Usuarios
    const [medicoUsuario] = await db.query(`
      SELECT * FROM ${TABLA_USUARIOS} WHERE id = @id AND role = 'medico'
    `, { id });
    
    if (medicoUsuario) {
      // Es un médico en la tabla Usuarios - cambiar rol o desactivar
      await db.actualizarUsuario(TABLA_USUARIOS, {
        id: parseInt(id),
        role: 'user' // Cambiar de médico a usuario normal
      });
      return { success: true, message: "Médico desactivado correctamente" };
    } else {
      // Verificar si es un médico legacy
      const [medicoLegacy] = await db.query(`
        SELECT * FROM ${TABLA_MEDICOS} WHERE id = @id
      `, { id });
      
      if (!medicoLegacy) {
        throw error("Médico no encontrado", 404);
      }
      
      // Desactivar médico legacy
      await db.query(`
        UPDATE ${TABLA_MEDICOS} SET activo = 0 WHERE id = @id
      `, { id });
      
      return { success: true, message: "Médico desactivado correctamente" };
    }
  } catch (err) {
    throw err;
  }
}

// ==========================================
// GESTIÓN DE CITAS
// ==========================================

// Obtener todas las citas con filtros
async function obtenerTodasLasCitas(filtros = {}) {
  try {
    let query = `
      SELECT 
        c.id, c.usuario_id, c.medico_id, c.fecha_hora, c.duracion,
        c.lugar, c.direccion, c.estado, c.notas, c.creado_en, c.actualizado_en,
        u.nombre + ' ' + u.apellido as nombre_paciente,
        u.email as email_paciente,
        u.telefono as telefono_paciente,
        CASE 
          WHEN um.id IS NOT NULL THEN um.nombre + ' ' + um.apellido
          WHEN m.id IS NOT NULL THEN m.nombre + ' ' + m.apellido
          ELSE 'Sin asignar'
        END as nombre_medico,
        CASE 
          WHEN um.id IS NOT NULL THEN um.email
          WHEN m.id IS NOT NULL THEN m.email
          ELSE NULL
        END as email_medico,
        CASE 
          WHEN um.id IS NOT NULL THEN 'usuario'
          WHEN m.id IS NOT NULL THEN 'legacy'
          ELSE NULL
        END as tipo_medico
      FROM ${TABLA_CITAS} c
      INNER JOIN ${TABLA_USUARIOS} u ON c.usuario_id = u.id
      LEFT JOIN ${TABLA_USUARIOS} um ON c.medico_id = um.id AND um.role = 'medico'
      LEFT JOIN ${TABLA_MEDICOS} m ON c.medico_id = m.id
      WHERE 1=1
    `;
    const params = {};
    
    // Filtro por estado
    if (filtros.estado) {
      query += ` AND c.estado = @estado`;
      params.estado = filtros.estado;
    }
    
    // Filtro por médico
    if (filtros.medico_id) {
      query += ` AND c.medico_id = @medico_id`;
      params.medico_id = filtros.medico_id;
    }
    
    // Filtro por fecha desde
    if (filtros.fecha_desde) {
      query += ` AND c.fecha_hora >= @fecha_desde`;
      params.fecha_desde = filtros.fecha_desde;
    }
    
    // Filtro por fecha hasta
    if (filtros.fecha_hasta) {
      query += ` AND c.fecha_hora <= @fecha_hasta`;
      params.fecha_hasta = filtros.fecha_hasta;
    }
    
    // Ordenamiento
    query += ` ORDER BY c.fecha_hora DESC`;
    
    const citas = await db.query(query, params);
    return citas;
  } catch (err) {
    throw err;
  }
}

// ==========================================
// ESTADÍSTICAS DEL SISTEMA
// ==========================================

// Obtener estadísticas completas del sistema
async function obtenerEstadisticasDelSistema() {
  try {
    // Estadísticas de usuarios
    const [statsUsuarios] = await db.query(`
      SELECT 
        COUNT(*) as total_usuarios,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as usuarios_pacientes,
        SUM(CASE WHEN role = 'medico' THEN 1 ELSE 0 END) as usuarios_medicos,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as usuarios_admin,
        SUM(CASE WHEN email_verified = 1 THEN 1 ELSE 0 END) as usuarios_verificados,
        SUM(CASE WHEN mfa_enabled = 1 THEN 1 ELSE 0 END) as usuarios_con_mfa
      FROM ${TABLA_USUARIOS}
    `);
    
    // Estadísticas de médicos legacy
    const [statsMedicosLegacy] = await db.query(`
      SELECT 
        COUNT(*) as total_medicos_legacy,
        SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as medicos_legacy_activos,
        COUNT(DISTINCT especialidad) as especialidades_disponibles
      FROM ${TABLA_MEDICOS}
    `);
    
    // Estadísticas de citas
    const [statsCitas] = await db.query(`
      SELECT 
        COUNT(*) as total_citas,
        SUM(CASE WHEN estado = 'programada' THEN 1 ELSE 0 END) as citas_programadas,
        SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END) as citas_confirmadas,
        SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as citas_completadas,
        SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as citas_canceladas,
        SUM(CASE WHEN fecha_hora >= DATEADD(day, -30, GETDATE()) THEN 1 ELSE 0 END) as citas_ultimo_mes,
        SUM(CASE WHEN fecha_hora >= DATEADD(day, -7, GETDATE()) THEN 1 ELSE 0 END) as citas_ultima_semana
      FROM ${TABLA_CITAS}
    `);
    
    // Estadísticas de exámenes - Ahora gestionados solo en blob storage
    // Las estadísticas de exámenes se obtienen desde el controlador de blob
    const statsExamenes = {
      total_examenes: 0,
      examenes_pendientes: 0,
      examenes_completados: 0,
      examenes_ultimo_mes: 0
    };
    
    // Estadísticas de notificaciones
    const [statsNotificaciones] = await db.query(`
      SELECT 
        COUNT(*) as total_notificaciones,
        SUM(CASE WHEN leida = 0 THEN 1 ELSE 0 END) as notificaciones_no_leidas,
        SUM(CASE WHEN creado_en >= DATEADD(day, -7, GETDATE()) THEN 1 ELSE 0 END) as notificaciones_ultima_semana
      FROM Notificaciones
    `);
    
    // Top 5 especialidades más solicitadas
    const topEspecialidades = await db.query(`
      SELECT TOP 5
        m.especialidad,
        COUNT(c.id) as total_citas
      FROM ${TABLA_CITAS} c
      INNER JOIN ${TABLA_MEDICOS} m ON c.medico_id = m.id
      WHERE m.especialidad IS NOT NULL
      GROUP BY m.especialidad
      ORDER BY COUNT(c.id) DESC
    `);
    
    // Actividad reciente (últimos 7 días)
    const [actividadReciente] = await db.query(`
      SELECT 
        SUM(CASE WHEN u.creado_en >= DATEADD(day, -7, GETDATE()) THEN 1 ELSE 0 END) as nuevos_usuarios,
        SUM(CASE WHEN c.creado_en >= DATEADD(day, -7, GETDATE()) THEN 1 ELSE 0 END) as nuevas_citas,
        0 as nuevos_examenes
      FROM ${TABLA_USUARIOS} u
      FULL OUTER JOIN ${TABLA_CITAS} c ON 1=1
    `);
    
    return {
      usuarios: statsUsuarios,
      medicos_legacy: statsMedicosLegacy,
      citas: statsCitas,
      examenes: statsExamenes,
      notificaciones: statsNotificaciones,
      top_especialidades: topEspecialidades,
      actividad_reciente: actividadReciente,
      fecha_generacion: new Date()
    };
  } catch (err) {
    throw err;
  }
}

module.exports = {
  // Usuarios
  listarTodosLosUsuarios,
  obtenerUsuarioCompleto,
  actualizarUsuarioAdmin,
  desactivarUsuario,
  crearUsuarioConRol,
  
  // Médicos
  listarTodosLosMedicos,
  listarTodosLosRecepcionistas,
  crearNuevoMedico,
  actualizarMedicoAdmin,
  desactivarMedico,
  
  // Citas
  obtenerTodasLasCitas,
  
  // Estadísticas
  obtenerEstadisticasDelSistema
}; 