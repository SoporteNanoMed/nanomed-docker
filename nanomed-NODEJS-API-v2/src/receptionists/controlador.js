const db = require("../db/sqlserver");
const { error } = require("../red/errors");
const mailService = require("../utils/mailService");

// ==========================================
// FUNCIONES PARA GESTIÓN DE CITAS
// ==========================================

async function listarTodasLasCitas(filtros) {
  try {
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
        u.nombre as paciente_nombre,
        u.apellido as paciente_apellido,
        u.email as paciente_email,
        u.telefono as paciente_telefono,
        u.rut as paciente_rut,
        m.nombre as medico_nombre,
        m.apellido as medico_apellido
      FROM CitasMedicas c
      INNER JOIN Usuarios u ON c.usuario_id = u.id
      LEFT JOIN Usuarios m ON c.medico_id = m.id AND m.role = 'medico'
      WHERE 1=1
    `;
    
    const params = {};
    
    // Aplicar filtros
    if (filtros.paciente_id) {
      query += " AND c.usuario_id = @paciente_id";
      params.paciente_id = filtros.paciente_id;
    }
    
    if (filtros.medico_id) {
      query += " AND c.medico_id = @medico_id";
      params.medico_id = filtros.medico_id;
    }
    
    if (filtros.estado) {
      query += " AND c.estado = @estado";
      params.estado = filtros.estado;
    }
    
    if (filtros.fecha_desde) {
      query += " AND c.fecha_hora >= @fecha_desde";
      params.fecha_desde = filtros.fecha_desde;
    }
    
    if (filtros.fecha_hasta) {
      query += " AND c.fecha_hora <= @fecha_hasta";
      params.fecha_hasta = filtros.fecha_hasta;
    }
    
    if (filtros.especialidad) {
      query += " AND m.especialidad = @especialidad";
      params.especialidad = filtros.especialidad;
    }
    
    // Ordenar por fecha
    query += " ORDER BY c.fecha_hora DESC";
    
    // Paginación
    const page = filtros.page || 1;
    const limit = filtros.limit || 20;
    const offset = (page - 1) * limit;
    
    query += " OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY";
    params.offset = offset;
    params.limit = limit;
    
    const citas = await db.query(query, params);
    
    // Contar total de registros
    let countQuery = `
      SELECT COUNT(*) as total
      FROM CitasMedicas c
      INNER JOIN Usuarios u ON c.usuario_id = u.id
      LEFT JOIN Usuarios m ON c.medico_id = m.id AND m.role = 'medico'
      WHERE 1=1
    `;
    
    // Aplicar los mismos filtros para el conteo
    if (filtros.paciente_id) countQuery += " AND c.usuario_id = @paciente_id";
    if (filtros.medico_id) countQuery += " AND c.medico_id = @medico_id";
    if (filtros.estado) countQuery += " AND c.estado = @estado";
    if (filtros.fecha_desde) countQuery += " AND c.fecha_hora >= @fecha_desde";
    if (filtros.fecha_hasta) countQuery += " AND c.fecha_hora <= @fecha_hasta";
    if (filtros.especialidad) countQuery += " AND m.especialidad = @especialidad";
    
    const [countResult] = await db.query(countQuery, params);
    const total = countResult.total;
    
    return {
      citas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (err) {
    console.error("Error al listar citas:", err);
    throw error("Error al obtener las citas", 500);
  }
}

async function crearCitaPaciente(datosCita) {
  try {
    // Verificar que el paciente existe y obtener sus datos completos
    const [paciente] = await db.query(
      "SELECT id, nombre, apellido, email FROM Usuarios WHERE id = @paciente_id AND role = 'user'",
      { paciente_id: datosCita.paciente_id }
    );
    
    if (!paciente) {
      throw error("Paciente no encontrado", 404);
    }
    
    // Verificar que el médico existe si se especifica y obtener sus datos completos
    let medico = null;
    if (datosCita.medico_id) {
      const [medicoEncontrado] = await db.query(
        "SELECT id, nombre, apellido, especialidad FROM Usuarios WHERE id = @medico_id AND role = 'medico' AND email_verified = 1",
        { medico_id: datosCita.medico_id }
      );
      
      if (!medicoEncontrado) {
        throw error("Médico no encontrado o inactivo", 404);
      }
      
      medico = medicoEncontrado;
    }
    
    // Verificar disponibilidad del horario
    const conflictos = await db.query(`
      SELECT id FROM CitasMedicas 
      WHERE fecha_hora = @fecha_hora 
      AND estado IN ('programada', 'confirmada')
      AND (medico_id = @medico_id OR usuario_id = @paciente_id)
    `, {
      fecha_hora: datosCita.fecha_hora,
      medico_id: datosCita.medico_id,
      paciente_id: datosCita.paciente_id
    });
    
    if (conflictos.length > 0) {
      throw error("Ya existe una cita programada para este horario", 409);
    }
    
    // Crear la cita
    const nuevaCita = {
      usuario_id: datosCita.paciente_id,
      medico_id: datosCita.medico_id,
      fecha_hora: datosCita.fecha_hora,
      duracion: datosCita.duracion || 30,
      lugar: datosCita.lugar,
      direccion: datosCita.direccion,
      estado: 'programada',
      notas: datosCita.notas
    };
    
    const result = await db.query(`
      INSERT INTO CitasMedicas (usuario_id, medico_id, fecha_hora, duracion, lugar, direccion, estado, notas)
      OUTPUT INSERTED.id
      VALUES (@usuario_id, @medico_id, @fecha_hora, @duracion, @lugar, @direccion, @estado, @notas)
    `, nuevaCita);
    
    const citaId = result[0].id;
    
    // NUEVO: Vincular la cita con el bloque de disponibilidad correspondiente
    if (datosCita.medico_id) {
      try {
        // Buscar el bloque de disponibilidad que corresponde a esta cita
        const [bloqueCorrespondiente] = await db.query(`
          SELECT id FROM BloquesDisponibilidad
          WHERE medico_id = @medico_id
          AND fecha_hora_inicio <= @fecha_hora
          AND fecha_hora_fin > @fecha_hora
          AND disponible = 1
          AND cita_id IS NULL
        `, {
          medico_id: datosCita.medico_id,
          fecha_hora: datosCita.fecha_hora
        });
        
        // Si encontramos un bloque correspondiente, vincularlo con la cita
        if (bloqueCorrespondiente) {
          await db.query(`
            UPDATE BloquesDisponibilidad
            SET cita_id = @cita_id, actualizado_en = GETDATE()
            WHERE id = @bloque_id
          `, {
            cita_id: citaId,
            bloque_id: bloqueCorrespondiente.id
          });
          
          console.log(`Cita ${citaId} vinculada con bloque ${bloqueCorrespondiente.id} (creada por recepcionista)`);
        } else {
          console.log(`No se encontró bloque de disponibilidad para la cita ${citaId} en ${datosCita.fecha_hora}`);
        }
      } catch (bloqueError) {
        // No fallar la creación de la cita si hay error al vincular el bloque
        console.error('Error al vincular bloque con cita (recepcionista):', bloqueError);
      }
    }
    
    // Crear notificación para el paciente
    await db.query(`
      INSERT INTO Notificaciones (usuario_id, tipo, titulo, contenido, referencia_tipo, referencia_id)
      VALUES (@usuario_id, 'cita', 'Cita programada', 'Se ha programado una nueva cita médica para ti', 'cita', @cita_id)
    `, {
      usuario_id: datosCita.paciente_id,
      cita_id: citaId
    });
    
    // Enviar correo de agendamiento de cita médica al paciente
    try {
      if (paciente.email) {
        const appointmentData = {
          fecha_hora: datosCita.fecha_hora,
          medico_nombre: medico ? `${medico.nombre} ${medico.apellido}` : null,
          especialidad: medico ? medico.especialidad : null,
          lugar: datosCita.lugar || 'Centro Médico nanoMED',
          direccion: datosCita.direccion || 'José Joaquín Pérez 240, Salamanca',
          duracion: datosCita.duracion || 30,
          notas: datosCita.notas
        };
        
        const userName = `${paciente.nombre} ${paciente.apellido}`;
        
        await mailService.sendAppointmentSchedulingEmail(
          paciente.email,
          appointmentData,
          userName
        );
        
        console.log(`Correo de agendamiento enviado a ${paciente.email} para la cita ${citaId} (creada por recepcionista)`);
      } else {
        console.log(`No se pudo enviar correo: El paciente ${paciente.nombre} ${paciente.apellido} no tiene email registrado`);
      }
    } catch (emailError) {
      // No fallar la creación de la cita si hay error al enviar el correo
      console.error('Error al enviar correo de agendamiento (recepcionista):', emailError);
    }
    
    // Obtener la cita creada con datos completos
    const [citaCompleta] = await db.query(`
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
        u.nombre as paciente_nombre,
        u.apellido as paciente_apellido,
        u.email as paciente_email,
        u.telefono as paciente_telefono,
        u.rut as paciente_rut,
        m.nombre as medico_nombre,
        m.apellido as medico_apellido,
        m.especialidad as medico_especialidad
      FROM CitasMedicas c
      INNER JOIN Usuarios u ON c.usuario_id = u.id
      LEFT JOIN Usuarios m ON c.medico_id = m.id AND m.role = 'medico'
      WHERE c.id = @citaId
    `, { citaId });

    // Devolver la cita completa en el formato esperado por el frontend
    return {
      id: citaCompleta.id,
      usuario_id: citaCompleta.usuario_id,
      paciente_id: citaCompleta.usuario_id, // Alias para compatibilidad
      medico_id: citaCompleta.medico_id,
      fecha_hora: citaCompleta.fecha_hora,
      duracion: citaCompleta.duracion,
      lugar: citaCompleta.lugar,
      direccion: citaCompleta.direccion,
      estado: citaCompleta.estado,
      notas: citaCompleta.notas,
      paciente_nombre: citaCompleta.paciente_nombre,
      paciente_apellido: citaCompleta.paciente_apellido,
      paciente_email: citaCompleta.paciente_email,
      paciente_telefono: citaCompleta.paciente_telefono,
      paciente_rut: citaCompleta.paciente_rut,
      medico_nombre: citaCompleta.medico_nombre,
      medico_apellido: citaCompleta.medico_apellido,
      medico_especialidad: citaCompleta.medico_especialidad,
      nombre_medico: citaCompleta.medico_nombre ? `${citaCompleta.medico_nombre} ${citaCompleta.medico_apellido}` : 'Sin asignar',
      especialidad: citaCompleta.medico_especialidad,
      creado_en: citaCompleta.creado_en,
      actualizado_en: citaCompleta.actualizado_en
    };
  } catch (err) {
    console.error("Error al crear cita para paciente:", err);
    throw err;
  }
}

async function actualizarCualquierCita(citaId, datosActualizacion) {
  try {
    // Verificar que la cita existe
    const [citaExistente] = await db.query(
      "SELECT * FROM CitasMedicas WHERE id = @citaId",
      { citaId }
    );
    
    if (!citaExistente) {
      throw error("Cita no encontrada", 404);
    }
    
    // Verificar paciente si se está cambiando
    if (datosActualizacion.paciente_id) {
      const [paciente] = await db.query(
        "SELECT id FROM Usuarios WHERE id = @paciente_id AND role = 'user'",
        { paciente_id: datosActualizacion.paciente_id }
      );
      
      if (!paciente) {
        throw error("Paciente no encontrado", 404);
      }
    }
    
    // Verificar médico si se está cambiando
    if (datosActualizacion.medico_id) {
      const [medico] = await db.query(
        "SELECT id FROM Usuarios WHERE id = @medico_id AND role = 'medico' AND email_verified = 1",
        { medico_id: datosActualizacion.medico_id }
      );
      
      if (!medico) {
        throw error("Médico no encontrado o inactivo", 404);
      }
    }
    
    // Verificar conflictos de horario si se está cambiando la fecha
    if (datosActualizacion.fecha_hora) {
      const conflictos = await db.query(`
        SELECT id FROM CitasMedicas 
        WHERE fecha_hora = @fecha_hora 
        AND estado IN ('programada', 'confirmada')
        AND id != @citaId
        AND (medico_id = @medico_id OR usuario_id = @paciente_id)
      `, {
        fecha_hora: datosActualizacion.fecha_hora,
        medico_id: datosActualizacion.medico_id || citaExistente.medico_id,
        paciente_id: datosActualizacion.paciente_id || citaExistente.usuario_id,
        citaId
      });
      
      if (conflictos.length > 0) {
        throw error("Ya existe una cita programada para este horario", 409);
      }
    }
    
    // Construir query de actualización dinámicamente
    const campos = [];
    const params = { citaId };
    
    Object.keys(datosActualizacion).forEach(key => {
      if (key === 'paciente_id') {
        campos.push('usuario_id = @usuario_id');
        params.usuario_id = datosActualizacion[key];
      } else if (key !== 'actualizada_por_recepcionista') {
        campos.push(`${key} = @${key}`);
        params[key] = datosActualizacion[key];
      }
    });
    
    campos.push('actualizado_en = GETDATE()');
    
    const query = `
      UPDATE CitasMedicas 
      SET ${campos.join(', ')}
      WHERE id = @citaId
    `;
    
    await db.query(query, params);
    
    // Obtener la cita actualizada con datos completos del paciente y médico
    const [citaActualizada] = await db.query(`
      SELECT 
        c.*,
        u.nombre as paciente_nombre,
        u.apellido as paciente_apellido,
        u.email as paciente_email,
        m.nombre as medico_nombre,
        m.apellido as medico_apellido,
        m.especialidad as medico_especialidad
      FROM CitasMedicas c
      INNER JOIN Usuarios u ON c.usuario_id = u.id
      LEFT JOIN Usuarios m ON c.medico_id = m.id AND m.role = 'medico'
      WHERE c.id = @citaId
    `, { citaId });
    
    // Enviar correos según el cambio de estado
    if (datosActualizacion.estado && datosActualizacion.estado !== citaExistente.estado) {
      try {
        if (citaActualizada.paciente_email) {
          const appointmentData = {
            fecha_hora: citaActualizada.fecha_hora,
            medico_nombre: citaActualizada.medico_nombre ? `${citaActualizada.medico_nombre} ${citaActualizada.medico_apellido}` : 'Sin asignar',
            especialidad: citaActualizada.medico_especialidad,
            lugar: citaActualizada.lugar || 'Centro Médico nanoMED',
            direccion: citaActualizada.direccion || 'José Joaquín Pérez 240, Salamanca',
            duracion: citaActualizada.duracion || 30,
            notas: citaActualizada.notas
          };
          
          const userName = `${citaActualizada.paciente_nombre} ${citaActualizada.paciente_apellido}`;
          
          // Enviar correo según el nuevo estado
          if (datosActualizacion.estado === 'confirmada') {
            await mailService.sendAppointmentConfirmationEmail(
              citaActualizada.paciente_email,
              appointmentData,
              userName
            );
            console.log(`Correo de confirmación enviado a ${citaActualizada.paciente_email} para la cita ${citaId} (confirmada por recepcionista)`);
            
          } else if (datosActualizacion.estado === 'cancelada') {
            await mailService.sendAppointmentCancellationEmail(
              citaActualizada.paciente_email,
              appointmentData,
              userName
            );
            console.log(`Correo de cancelación enviado a ${citaActualizada.paciente_email} para la cita ${citaId} (cancelada por recepcionista vía actualización)`);
          }
          
        } else {
          console.log(`No se pudo enviar correo: El paciente ${citaActualizada.paciente_nombre} ${citaActualizada.paciente_apellido} no tiene email registrado`);
        }
      } catch (emailError) {
        // No fallar la actualización si hay error al enviar el correo
        console.error('Error al enviar correo desde recepcionista:', emailError);
      }
    }
    
    return citaActualizada;
  } catch (err) {
    console.error("Error al actualizar cita:", err);
    throw err;
  }
}

async function cancelarCualquierCita(citaId, recepcionistaId) {
  try {
    // Verificar que la cita existe
    const [cita] = await db.query(
      "SELECT * FROM CitasMedicas WHERE id = @citaId",
      { citaId }
    );
    
    if (!cita) {
      throw error("Cita no encontrada", 404);
    }
    
    if (cita.estado === 'cancelada') {
      throw error("La cita ya está cancelada", 400);
    }
    
    // NUEVO: Desvincular bloque de disponibilidad antes de cancelar (igual que en appointments)
    if (cita.medico_id) {
      try {
        await db.query(`
          UPDATE BloquesDisponibilidad
          SET cita_id = NULL, actualizado_en = GETDATE()
          WHERE cita_id = @cita_id
        `, { cita_id: citaId });
        
        console.log(`Bloque desvinculado de la cita cancelada ${citaId} por recepcionista`);
      } catch (bloqueError) {
        console.error('Error al desvincular bloque de cita cancelada por recepcionista:', bloqueError);
      }
    }
    
    // Cancelar la cita
    await db.query(`
      UPDATE CitasMedicas 
      SET estado = 'cancelada', 
          actualizado_en = GETDATE(),
          notas = CONCAT(ISNULL(notas, ''), ' - Cancelada por recepcionista ID: ${recepcionistaId}')
      WHERE id = @citaId
    `, { citaId });
    
    // Obtener la cita cancelada con email del paciente
    const [citaCancelada] = await db.query(`
      SELECT 
        c.*,
        u.nombre as paciente_nombre,
        u.apellido as paciente_apellido,
        u.email as paciente_email,
        m.nombre as medico_nombre,
        m.apellido as medico_apellido,
        m.especialidad as medico_especialidad
      FROM CitasMedicas c
      INNER JOIN Usuarios u ON c.usuario_id = u.id
      LEFT JOIN Usuarios m ON c.medico_id = m.id AND m.role = 'medico'
      WHERE c.id = @citaId
    `, { citaId });
    
    // Enviar correo de cancelación de cita médica al paciente
    try {
      if (citaCancelada.paciente_email) {
        const appointmentData = {
          fecha_hora: citaCancelada.fecha_hora,
          medico_nombre: citaCancelada.medico_nombre ? `${citaCancelada.medico_nombre} ${citaCancelada.medico_apellido}` : 'Sin asignar',
          especialidad: citaCancelada.medico_especialidad,
          lugar: citaCancelada.lugar || 'Centro Médico nanoMED',
          direccion: citaCancelada.direccion || 'José Joaquín Pérez 240, Salamanca',
          duracion: citaCancelada.duracion || 30,
          notas: citaCancelada.notas
        };
        
        const userName = `${citaCancelada.paciente_nombre} ${citaCancelada.paciente_apellido}`;
        
        await mailService.sendAppointmentCancellationEmail(
          citaCancelada.paciente_email,
          appointmentData,
          userName
        );
        
        console.log(`Correo de cancelación enviado a ${citaCancelada.paciente_email} para la cita ${citaId} (cancelada por recepcionista)`);
      } else {
        console.log(`No se pudo enviar correo: El paciente ${citaCancelada.paciente_nombre} ${citaCancelada.paciente_apellido} no tiene email registrado`);
      }
    } catch (emailError) {
      // No fallar la cancelación de la cita si hay error al enviar el correo
      console.error('Error al enviar correo de cancelación desde recepcionista:', emailError);
    }
    
    return citaCancelada;
  } catch (err) {
    console.error("Error al cancelar cita:", err);
    throw err;
  }
}

// ==========================================
// FUNCIONES PARA GESTIÓN DE PACIENTES
// ==========================================

async function listarPacientes(filtros) {
  try {
    let query = `
      SELECT 
        id,
        nombre,
        apellido,
        email,
        telefono,
        rut,
        fecha_nacimiento,
        genero,
        direccion,
        ciudad,
        region,
        creado_en
      FROM Usuarios 
      WHERE role = 'user'
    `;
    
    const params = {};
    
    if (filtros.search) {
      query += ` AND (
        nombre LIKE @search OR 
        apellido LIKE @search OR 
        email LIKE @search OR 
        rut LIKE @search
      )`;
      params.search = `%${filtros.search}%`;
    }
    
    query += " ORDER BY apellido, nombre";
    
    // Paginación
    const page = filtros.page || 1;
    const limit = filtros.limit || 20;
    const offset = (page - 1) * limit;
    
    query += " OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY";
    params.offset = offset;
    params.limit = limit;
    
    const pacientes = await db.query(query, params);
    
    // Contar total
    let countQuery = "SELECT COUNT(*) as total FROM Usuarios WHERE role = 'user'";
    if (filtros.search) {
      countQuery += ` AND (
        nombre LIKE @search OR 
        apellido LIKE @search OR 
        email LIKE @search OR 
        rut LIKE @search
      )`;
    }
    
    const [countResult] = await db.query(countQuery, params);
    const total = countResult.total;
    
    return {
      pacientes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  } catch (err) {
    console.error("Error al listar pacientes:", err);
    throw error("Error al obtener los pacientes", 500);
  }
}

async function obtenerPaciente(pacienteId) {
  try {
    const [paciente] = await db.query(`
      SELECT 
        u.id,
        u.nombre,
        u.apellido,
        u.email,
        u.telefono,
        u.rut,
        u.fecha_nacimiento,
        u.genero,
        u.direccion,
        u.ciudad,
        u.region,
        u.creado_en,
        im.grupo_sanguineo,
        im.alergias,
        im.medicamentos,
        im.condiciones_medicas
      FROM Usuarios u
      LEFT JOIN InformacionMedica im ON u.id = im.usuario_id
      WHERE u.id = @pacienteId AND u.role = 'user'
    `, { pacienteId });
    
    if (!paciente) {
      return null;
    }
    
    // Obtener contactos de emergencia
    const contactos = await db.query(`
      SELECT nombre, relacion, telefono
      FROM ContactosEmergencia
      WHERE usuario_id = @pacienteId
    `, { pacienteId });
    
    // Obtener últimas citas
    const ultimasCitas = await db.query(`
      SELECT 
        c.id,
        c.fecha_hora,
        c.estado,
        c.lugar,
        m.nombre as medico_nombre,
        m.apellido as medico_apellido
      FROM CitasMedicas c
      LEFT JOIN Usuarios m ON c.medico_id = m.id AND m.role = 'medico'
      WHERE c.usuario_id = @pacienteId
      ORDER BY c.fecha_hora DESC
      OFFSET 0 ROWS FETCH NEXT 5 ROWS ONLY
    `, { pacienteId });
    
    return {
      ...paciente,
      contactos_emergencia: contactos,
      ultimas_citas: ultimasCitas
    };
  } catch (err) {
    console.error("Error al obtener paciente:", err);
    throw error("Error al obtener información del paciente", 500);
  }
}

// ==========================================
// FUNCIONES PARA GESTIÓN DE MÉDICOS
// ==========================================

async function listarMedicos(filtros) {
  try {
    let query = `
      SELECT 
        id,
        nombre,
        apellido,
        email,
        telefono,
        rut,
        genero,
        direccion,
        ciudad,
        region,
        especialidad,
        foto_perfil,
        email_verified,
        creado_en,
        actualizado_en
      FROM Usuarios
      WHERE role = 'medico'
    `;
    
    const params = {};
    
    if (filtros.especialidad) {
      query += " AND especialidad LIKE @especialidad";
      params.especialidad = `%${filtros.especialidad}%`;
    }
    
    if (filtros.activo !== undefined) {
      // En Usuarios no tenemos campo activo, pero podemos filtrar por email_verified
      query += " AND email_verified = @email_verified";
      params.email_verified = filtros.activo ? 1 : 0;
    }
    
    if (filtros.search) {
      query += ` AND (
        nombre LIKE @search OR 
        apellido LIKE @search OR 
        email LIKE @search OR
        rut LIKE @search OR
        especialidad LIKE @search
      )`;
      params.search = `%${filtros.search}%`;
    }
    
    query += " ORDER BY apellido, nombre";
    
    const medicos = await db.query(query, params);
    
    return { medicos };
  } catch (err) {
    console.error("Error al listar médicos:", err);
    throw error("Error al obtener los médicos", 500);
  }
}

async function obtenerDisponibilidadMedico(medicoId, fecha) {
  try {
    // Verificar que el médico existe
    const [medico] = await db.query(
      "SELECT id, nombre, apellido FROM Usuarios WHERE id = @medicoId AND role = 'medico' AND email_verified = 1",
      { medicoId }
    );
    
    if (!medico) {
      throw error("Médico no encontrado o inactivo", 404);
    }
    
    // Obtener citas del médico para la fecha especificada
    const citas = await db.query(`
      SELECT 
        fecha_hora,
        duracion,
        estado
      FROM CitasMedicas
      WHERE medico_id = @medicoId 
      AND CAST(fecha_hora AS DATE) = @fecha
      AND estado IN ('programada', 'confirmada')
      ORDER BY fecha_hora
    `, { medicoId, fecha });
    
    // Generar horarios disponibles (ejemplo: 9:00 AM a 6:00 PM, cada 30 minutos)
    const horariosDisponibles = [];
    const fechaBase = new Date(fecha + 'T09:00:00');
    const fechaFin = new Date(fecha + 'T18:00:00');
    
    while (fechaBase < fechaFin) {
      const horario = fechaBase.toISOString();
      
      // Verificar si hay conflicto con citas existentes
      const conflicto = citas.some(cita => {
        const inicioCita = new Date(cita.fecha_hora);
        const finCita = new Date(inicioCita.getTime() + (cita.duracion * 60000));
        const inicioHorario = new Date(horario);
        const finHorario = new Date(inicioHorario.getTime() + (30 * 60000));
        
        return (inicioHorario < finCita && finHorario > inicioCita);
      });
      
      if (!conflicto) {
        horariosDisponibles.push({
          // CORRECCIÓN: Mostrar horas directamente desde UTC sin conversión de zona horaria
          // Las fechas UTC ya representan las horas en Chile correctamente
          hora: `${new Date(horario).getUTCHours().toString().padStart(2, '0')}:${new Date(horario).getUTCMinutes().toString().padStart(2, '0')}`,
          fecha_hora: horario,
          disponible: true
        });
      }
      
      fechaBase.setMinutes(fechaBase.getMinutes() + 30);
    }
    
    return {
      medico,
      fecha,
      horarios_disponibles: horariosDisponibles,
      citas_existentes: citas
    };
  } catch (err) {
    console.error("Error al obtener disponibilidad:", err);
    throw err;
  }
}

// ==========================================
// FUNCIONES PARA ESTADÍSTICAS
// ==========================================

async function obtenerEstadisticasDiarias(fecha) {
  try {
    // Citas del día
    const [citasDelDia] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN estado = 'programada' THEN 1 ELSE 0 END) as programadas,
        SUM(CASE WHEN estado = 'confirmada' THEN 1 ELSE 0 END) as confirmadas,
        SUM(CASE WHEN estado = 'completada' THEN 1 ELSE 0 END) as completadas,
        SUM(CASE WHEN estado = 'cancelada' THEN 1 ELSE 0 END) as canceladas
      FROM CitasMedicas
      WHERE CAST(fecha_hora AS DATE) = @fecha
    `, { fecha });
    
    // Próximas citas del día
    const proximasCitas = await db.query(`
      SELECT 
        c.id,
        c.fecha_hora,
        c.estado,
        u.nombre as paciente_nombre,
        u.apellido as paciente_apellido,
        m.nombre as medico_nombre,
        m.apellido as medico_apellido
      FROM CitasMedicas c
      INNER JOIN Usuarios u ON c.usuario_id = u.id
      LEFT JOIN Usuarios m ON c.medico_id = m.id AND m.role = 'medico'
      WHERE CAST(c.fecha_hora AS DATE) = @fecha
      AND c.estado IN ('programada', 'confirmada')
      ORDER BY c.fecha_hora
    `, { fecha });
    
    // Médicos con más citas del día
    const medicosMasCitas = await db.query(`
      SELECT 
        m.nombre,
        m.apellido,
        COUNT(c.id) as total_citas
      FROM Usuarios m
      LEFT JOIN CitasMedicas c ON m.id = c.medico_id 
        AND CAST(c.fecha_hora AS DATE) = @fecha
      WHERE m.role = 'medico' AND m.email_verified = 1
      GROUP BY m.id, m.nombre, m.apellido
      HAVING COUNT(c.id) > 0
      ORDER BY total_citas DESC
    `, { fecha });
    
    return {
      fecha,
      resumen_citas: citasDelDia,
      proximas_citas: proximasCitas,
      medicos_mas_citas: medicosMasCitas
    };
  } catch (err) {
    console.error("Error al obtener estadísticas:", err);
    throw error("Error al obtener estadísticas diarias", 500);
  }
}

// ==========================================
// FUNCIONES PARA GESTIÓN DE HORARIOS MÉDICOS
// ==========================================

async function establecerHorarioMedico(medicoId, horarios) {
  try {
    // Verificar que el médico existe
    const [medico] = await db.query(
      "SELECT id, nombre, apellido FROM Usuarios WHERE id = @medicoId AND role = 'medico' AND email_verified = 1",
      { medicoId }
    );
    
    if (!medico) {
      throw error("Médico no encontrado", 404);
    }

    // Validar datos de horarios
    if (!Array.isArray(horarios) || horarios.length === 0) {
      throw error("Se requiere al menos un horario", 400);
    }

    // Validar cada horario
    for (const horario of horarios) {
      if (!horario.dia_semana && horario.dia_semana !== 0) {
        throw error("dia_semana es requerido (0-6)", 400);
      }
      if (horario.dia_semana < 0 || horario.dia_semana > 6) {
        throw error("dia_semana debe estar entre 0 y 6", 400);
      }
      if (!horario.hora_inicio || !horario.hora_fin) {
        throw error("hora_inicio y hora_fin son requeridos", 400);
      }
      
      // Validar que hora_inicio sea menor que hora_fin
      const inicio = new Date(`2024-01-01 ${horario.hora_inicio}`);
      const fin = new Date(`2024-01-01 ${horario.hora_fin}`);
      if (inicio >= fin) {
        throw error("hora_inicio debe ser menor que hora_fin", 400);
      }
    }

    // Insertar horarios
    const horariosCreados = [];
    for (const horario of horarios) {
      const result = await db.query(`
        INSERT INTO HorariosMedicos (medico_id, dia_semana, hora_inicio, hora_fin, duracion_cita, fecha_desde, fecha_hasta)
        OUTPUT INSERTED.id
        VALUES (@medico_id, @dia_semana, @hora_inicio, @hora_fin, @duracion_cita, @fecha_desde, @fecha_hasta)
      `, {
        medico_id: medicoId,
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
        duracion_cita: horario.duracion_cita || 30,
        fecha_desde: horario.fecha_desde || null,
        fecha_hasta: horario.fecha_hasta || null
      });

      const horarioCreado = await db.query(`
        SELECT * FROM HorariosMedicos WHERE id = @horarioId
      `, { horarioId: result[0].id });

      horariosCreados.push(horarioCreado[0]);
    }

    return {
      medico,
      horarios_creados: horariosCreados,
      mensaje: `Se establecieron ${horariosCreados.length} horarios para el médico`
    };
  } catch (err) {
    console.error("Error al establecer horarios:", err);
    throw err;
  }
}

async function obtenerHorarioMedico(medicoId) {
  try {
    // Verificar que el médico existe
    const [medico] = await db.query(
      "SELECT id, nombre, apellido FROM Usuarios WHERE id = @medicoId AND role = 'medico' AND email_verified = 1",
      { medicoId }
    );
    
    if (!medico) {
      throw error("Médico no encontrado", 404);
    }

    // Obtener horarios regulares
    const horariosRegulares = await db.query(`
      SELECT 
        id,
        dia_semana,
        hora_inicio,
        hora_fin,
        duracion_cita,
        fecha_desde,
        fecha_hasta,
        activo,
        creado_en,
        actualizado_en
      FROM HorariosMedicos
      WHERE medico_id = @medicoId AND activo = 1
      ORDER BY dia_semana, hora_inicio
    `, { medicoId });

    // Obtener excepciones próximas (30 días)
    const fechaActual = new Date().toISOString().split('T')[0];
    const fecha30Dias = new Date();
    fecha30Dias.setDate(fecha30Dias.getDate() + 30);
    const fechaLimite = fecha30Dias.toISOString().split('T')[0];

    const excepciones = await db.query(`
      SELECT 
        id,
        fecha,
        motivo,
        todo_el_dia,
        hora_inicio,
        hora_fin,
        creado_en
      FROM ExcepcionesHorarios
      WHERE medico_id = @medicoId 
      AND fecha BETWEEN @fecha_actual AND @fecha_limite
      ORDER BY fecha
    `, { 
      medicoId, 
      fecha_actual: fechaActual, 
      fecha_limite: fechaLimite 
    });

    // Agrupar horarios por día de la semana
    const horariosPorDia = {};
    const diasSemana = {
      0: 'Domingo',
      1: 'Lunes', 
      2: 'Martes',
      3: 'Miércoles',
      4: 'Jueves',
      5: 'Viernes',
      6: 'Sábado'
    };

    horariosRegulares.forEach(horario => {
      const dia = horario.dia_semana;
      if (!horariosPorDia[dia]) {
        horariosPorDia[dia] = {
          dia_numero: dia,
          dia_nombre: diasSemana[dia],
          horarios: []
        };
      }
      horariosPorDia[dia].horarios.push(horario);
    });

    return {
      medico,
      horarios_por_dia: Object.values(horariosPorDia),
      total_horarios_regulares: horariosRegulares.length,
      excepciones_proximas: excepciones,
      total_excepciones: excepciones.length
    };
  } catch (err) {
    console.error("Error al obtener horarios:", err);
    throw err;
  }
}

async function actualizarHorarioMedico(horarioId, datosActualizacion) {
  try {
    // Verificar que el horario existe
    const [horarioExistente] = await db.query(
      "SELECT * FROM HorariosMedicos WHERE id = @horarioId",
      { horarioId }
    );
    
    if (!horarioExistente) {
      throw error("Horario no encontrado", 404);
    }

    // Validar datos si se proporcionan
    if (datosActualizacion.dia_semana !== undefined) {
      if (datosActualizacion.dia_semana < 0 || datosActualizacion.dia_semana > 6) {
        throw error("dia_semana debe estar entre 0 y 6", 400);
      }
    }

    if (datosActualizacion.hora_inicio && datosActualizacion.hora_fin) {
      const inicio = new Date(`2024-01-01 ${datosActualizacion.hora_inicio}`);
      const fin = new Date(`2024-01-01 ${datosActualizacion.hora_fin}`);
      if (inicio >= fin) {
        throw error("hora_inicio debe ser menor que hora_fin", 400);
      }
    }

    // Construir query de actualización dinámicamente
    const campos = [];
    const params = { horarioId };
    
    Object.keys(datosActualizacion).forEach(key => {
      if (key !== 'medico_id') { // No permitir cambiar el médico
        campos.push(`${key} = @${key}`);
        params[key] = datosActualizacion[key];
      }
    });

    campos.push('actualizado_en = GETDATE()');

    const query = `
      UPDATE HorariosMedicos 
      SET ${campos.join(', ')}
      WHERE id = @horarioId
    `;

    await db.query(query, params);

    // Obtener el horario actualizado
    const [horarioActualizado] = await db.query(
      "SELECT * FROM HorariosMedicos WHERE id = @horarioId",
      { horarioId }
    );

    return horarioActualizado;
  } catch (err) {
    console.error("Error al actualizar horario:", err);
    throw err;
  }
}

async function eliminarHorarioMedico(horarioId) {
  try {
    // Verificar que el horario existe
    const [horarioExistente] = await db.query(
      "SELECT * FROM HorariosMedicos WHERE id = @horarioId",
      { horarioId }
    );
    
    if (!horarioExistente) {
      throw error("Horario no encontrado", 404);
    }

    // Marcar como inactivo en lugar de eliminar físicamente
    await db.query(`
      UPDATE HorariosMedicos 
      SET activo = 0, actualizado_en = GETDATE()
      WHERE id = @horarioId
    `, { horarioId });

    return { mensaje: "Horario eliminado exitosamente" };
  } catch (err) {
    console.error("Error al eliminar horario:", err);
    throw err;
  }
}

async function agregarExcepcionHorario(medicoId, datosExcepcion) {
  try {
    // Verificar que el médico existe
    const [medico] = await db.query(
      "SELECT id, nombre, apellido FROM Usuarios WHERE id = @medicoId AND role = 'medico' AND email_verified = 1",
      { medicoId }
    );
    
    if (!medico) {
      throw error("Médico no encontrado", 404);
    }

    // Validar datos requeridos
    if (!datosExcepcion.fecha) {
      throw error("fecha es requerida", 400);
    }

    // Validar que la fecha sea futura o actual
    const fechaExcepcion = new Date(datosExcepcion.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaExcepcion < hoy) {
      throw error("La fecha de excepción no puede ser en el pasado", 400);
    }

    // Verificar que no exista ya una excepción para esa fecha
    const [excepcionExistente] = await db.query(`
      SELECT id FROM ExcepcionesHorarios 
      WHERE medico_id = @medico_id AND fecha = @fecha
    `, { 
      medico_id: medicoId, 
      fecha: datosExcepcion.fecha 
    });

    if (excepcionExistente) {
      throw error("Ya existe una excepción para esta fecha", 409);
    }

    // Validar horarios si no es todo el día
    if (!datosExcepcion.todo_el_dia && (datosExcepcion.hora_inicio && datosExcepcion.hora_fin)) {
      const inicio = new Date(`2024-01-01 ${datosExcepcion.hora_inicio}`);
      const fin = new Date(`2024-01-01 ${datosExcepcion.hora_fin}`);
      if (inicio >= fin) {
        throw error("hora_inicio debe ser menor que hora_fin", 400);
      }
    }

    // Crear la excepción
    const result = await db.query(`
      INSERT INTO ExcepcionesHorarios (medico_id, fecha, motivo, todo_el_dia, hora_inicio, hora_fin)
      OUTPUT INSERTED.id
      VALUES (@medico_id, @fecha, @motivo, @todo_el_dia, @hora_inicio, @hora_fin)
    `, {
      medico_id: medicoId,
      fecha: datosExcepcion.fecha,
      motivo: datosExcepcion.motivo || 'No especificado',
      todo_el_dia: datosExcepcion.todo_el_dia !== false, // Por defecto true
      hora_inicio: datosExcepcion.hora_inicio || null,
      hora_fin: datosExcepcion.hora_fin || null
    });

    // Obtener la excepción creada
    const [excepcionCreada] = await db.query(`
      SELECT * FROM ExcepcionesHorarios WHERE id = @excepcionId
    `, { excepcionId: result[0].id });

    return {
      medico,
      excepcion: excepcionCreada,
      mensaje: "Excepción de horario agregada exitosamente"
    };
  } catch (err) {
    console.error("Error al agregar excepción:", err);
    throw err;
  }
}

async function listarExcepcionesHorario(medicoId, filtros = {}) {
  try {
    // Verificar que el médico existe
    const [medico] = await db.query(
      "SELECT id, nombre, apellido FROM Usuarios WHERE id = @medicoId AND role = 'medico' AND email_verified = 1",
      { medicoId }
    );
    
    if (!medico) {
      throw error("Médico no encontrado", 404);
    }

    let query = `
      SELECT 
        id,
        fecha,
        motivo,
        todo_el_dia,
        hora_inicio,
        hora_fin,
        creado_en
      FROM ExcepcionesHorarios
      WHERE medico_id = @medicoId
    `;

    const params = { medicoId };

    // Aplicar filtros de fecha
    if (filtros.fecha_desde) {
      query += " AND fecha >= @fecha_desde";
      params.fecha_desde = filtros.fecha_desde;
    }

    if (filtros.fecha_hasta) {
      query += " AND fecha <= @fecha_hasta";
      params.fecha_hasta = filtros.fecha_hasta;
    } else {
      // Por defecto, mostrar solo excepciones futuras
      const hoy = new Date().toISOString().split('T')[0];
      query += " AND fecha >= @fecha_hoy";
      params.fecha_hoy = hoy;
    }

    query += " ORDER BY fecha ASC";

    const excepciones = await db.query(query, params);

    return {
      medico,
      excepciones,
      total: excepciones.length,
      filtros_aplicados: filtros
    };
  } catch (err) {
    console.error("Error al listar excepciones:", err);
    throw err;
  }
}

async function eliminarExcepcionHorario(excepcionId) {
  try {
    // Verificar que la excepción existe
    const [excepcionExistente] = await db.query(
      "SELECT * FROM ExcepcionesHorarios WHERE id = @excepcionId",
      { excepcionId }
    );
    
    if (!excepcionExistente) {
      throw error("Excepción no encontrada", 404);
    }

    // Verificar que la fecha no sea en el pasado
    const fechaExcepcion = new Date(excepcionExistente.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaExcepcion < hoy) {
      throw error("No se puede eliminar una excepción de fecha pasada", 400);
    }

    // Eliminar la excepción
    await db.query(`
      DELETE FROM ExcepcionesHorarios WHERE id = @excepcionId
    `, { excepcionId });

    return { mensaje: "Excepción eliminada exitosamente" };
  } catch (err) {
    console.error("Error al eliminar excepción:", err);
    throw err;
  }
}

// ==========================================
// FUNCIÓN ACTUALIZADA PARA OBTENER DISPONIBILIDAD
// ==========================================

async function obtenerDisponibilidadMedicoActualizada(medicoId, fecha) {
  try {
    // Verificar que el médico existe
    const [medico] = await db.query(
      "SELECT id, nombre, apellido FROM Usuarios WHERE id = @medicoId AND role = 'medico' AND email_verified = 1",
      { medicoId }
    );
    
    if (!medico) {
      throw error("Médico no encontrado o inactivo", 404);
    }

    // Obtener día de la semana (0=Domingo, 1=Lunes, etc.)
    const fechaObj = new Date(fecha);
    const diaSemana = fechaObj.getDay();

    // Verificar si hay excepción para esta fecha
    const [excepcion] = await db.query(`
      SELECT * FROM ExcepcionesHorarios 
      WHERE medico_id = @medicoId AND fecha = @fecha
    `, { medicoId, fecha });

    if (excepcion && excepcion.todo_el_dia) {
      return {
        medico,
        fecha,
        horarios_disponibles: [],
        citas_existentes: [],
        excepcion: {
          motivo: excepcion.motivo,
          mensaje: "Médico no disponible todo el día"
        }
      };
    }

    // Obtener horarios configurados para este día de la semana
    const horariosConfigurados = await db.query(`
      SELECT 
        hora_inicio,
        hora_fin,
        duracion_cita
      FROM HorariosMedicos
      WHERE medico_id = @medicoId 
      AND dia_semana = @dia_semana 
      AND activo = 1
      AND (fecha_desde IS NULL OR fecha_desde <= @fecha)
      AND (fecha_hasta IS NULL OR fecha_hasta >= @fecha)
      ORDER BY hora_inicio
    `, { medicoId, dia_semana: diaSemana, fecha });

    if (horariosConfigurados.length === 0) {
      return {
        medico,
        fecha,
        horarios_disponibles: [],
        citas_existentes: [],
        mensaje: "No hay horarios configurados para este día"
      };
    }

    // Obtener citas existentes
    const citas = await db.query(`
      SELECT 
        fecha_hora,
        duracion,
        estado
      FROM CitasMedicas
      WHERE medico_id = @medicoId 
      AND CAST(fecha_hora AS DATE) = @fecha
      AND estado IN ('programada', 'confirmada')
      ORDER BY fecha_hora
    `, { medicoId, fecha });

    // Generar horarios disponibles basados en la configuración
    const horariosDisponibles = [];

    for (const config of horariosConfigurados) {
      const horaInicio = new Date(`${fecha}T${config.hora_inicio}`);
      const horaFin = new Date(`${fecha}T${config.hora_fin}`);
      const duracionCita = config.duracion_cita;

      const horarioActual = new Date(horaInicio);

      while (horarioActual < horaFin) {
        const siguienteHorario = new Date(horarioActual.getTime() + (duracionCita * 60000));
        
        if (siguienteHorario <= horaFin) {
          const horarioStr = horarioActual.toISOString();

          // Verificar conflictos con citas existentes
          const conflicto = citas.some(cita => {
            const inicioCita = new Date(cita.fecha_hora);
            const finCita = new Date(inicioCita.getTime() + (cita.duracion * 60000));
            const inicioHorario = new Date(horarioStr);
            const finHorario = new Date(inicioHorario.getTime() + (duracionCita * 60000));
            
            return (inicioHorario < finCita && finHorario > inicioCita);
          });

          // Verificar si está en excepción parcial
          let enExcepcion = false;
          if (excepcion && !excepcion.todo_el_dia && excepcion.hora_inicio && excepcion.hora_fin) {
            const inicioExcepcion = new Date(`${fecha}T${excepcion.hora_inicio}`);
            const finExcepcion = new Date(`${fecha}T${excepcion.hora_fin}`);
            const inicioHorario = new Date(horarioStr);
            const finHorario = new Date(inicioHorario.getTime() + (duracionCita * 60000));
            
            enExcepcion = (inicioHorario < finExcepcion && finHorario > inicioExcepcion);
          }

          if (!conflicto && !enExcepcion) {
            horariosDisponibles.push({
              // CORRECCIÓN: Mostrar horas directamente desde UTC sin conversión de zona horaria
              // Las fechas UTC ya representan las horas en Chile correctamente
              hora: `${new Date(horarioStr).getUTCHours().toString().padStart(2, '0')}:${new Date(horarioStr).getUTCMinutes().toString().padStart(2, '0')}`,
              fecha_hora: horarioStr,
              disponible: true,
              duracion: duracionCita
            });
          }
        }

        horarioActual.setMinutes(horarioActual.getMinutes() + duracionCita);
      }
    }

    return {
      medico,
      fecha,
      dia_semana: diaSemana,
      horarios_configurados: horariosConfigurados,
      horarios_disponibles: horariosDisponibles,
      citas_existentes: citas,
      excepcion: excepcion ? {
        motivo: excepcion.motivo,
        parcial: !excepcion.todo_el_dia,
        hora_inicio: excepcion.hora_inicio,
        hora_fin: excepcion.hora_fin
      } : null
    };
  } catch (err) {
    console.error("Error al obtener disponibilidad actualizada:", err);
    throw err;
  }
}

// ==========================================
// FUNCIONES PARA GESTIÓN DE BLOQUES DE DISPONIBILIDAD (NUEVA ESTRUCTURA)
// ==========================================

/**
 * Crear bloques de disponibilidad específicos para un médico
 * Cada bloque representa un slot de 30 minutos en una fecha y hora específica
 */
async function crearBloquesDisponibilidad(medicoId, bloques) {
  try {
    // Verificar que el médico existe
    const [medico] = await db.query(
      "SELECT id, nombre, apellido FROM Usuarios WHERE id = @medicoId AND role = 'medico' AND email_verified = 1",
      { medicoId }
    );
    
    if (!medico) {
      throw error("Médico no encontrado", 404);
    }

    // Validar datos de bloques
    if (!Array.isArray(bloques) || bloques.length === 0) {
      throw error("Se requiere al menos un bloque de disponibilidad", 400);
    }

    // Crear tabla temporal si no existe (para desarrollo)
    await db.query(`
      IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='BloquesDisponibilidad' AND xtype='U')
      CREATE TABLE BloquesDisponibilidad (
        id INT IDENTITY(1,1) PRIMARY KEY,
        medico_id INT NOT NULL,
        fecha_hora_inicio DATETIME NOT NULL,
        fecha_hora_fin DATETIME NOT NULL,
        disponible BIT DEFAULT 1,
        motivo_no_disponible VARCHAR(255) NULL,
        cita_id INT NULL,
        creado_por_recepcionista INT NULL,
        creado_en DATETIME DEFAULT GETDATE(),
        actualizado_en DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (medico_id) REFERENCES Usuarios(id),
        FOREIGN KEY (cita_id) REFERENCES CitasMedicas(id)
      )
    `);

    const bloquesCreados = [];
    
    for (const bloque of bloques) {
      // CORREGIDO: Manejar fechas en zona horaria de Chile
      let fechaHoraInicio, fechaHoraFin;
      
      // Si la fecha viene en formato UTC (con Z al final), convertirla directamente
      if (typeof bloque.fecha_hora_inicio === 'string' && bloque.fecha_hora_inicio.endsWith('Z')) {
        fechaHoraInicio = new Date(bloque.fecha_hora_inicio);
      }
      // Si la fecha ya viene con zona horaria (formato ISO con offset)
      else if (typeof bloque.fecha_hora_inicio === 'string' && bloque.fecha_hora_inicio.includes('-03:00')) {
        fechaHoraInicio = new Date(bloque.fecha_hora_inicio);
      } 
      // Si viene sin zona horaria, asumir que es en Chile
      else {
        fechaHoraInicio = new Date(bloque.fecha_hora_inicio + '-03:00');
      }
      
      if (isNaN(fechaHoraInicio.getTime())) {
        throw error(`Formato de fecha_hora_inicio inválido: ${bloque.fecha_hora_inicio}`, 400);
      }

      // Calcular hora de fin (30 minutos después por defecto)
      if (bloque.fecha_hora_fin) {
        // Si la fecha viene en formato UTC (con Z al final), convertirla directamente
        if (typeof bloque.fecha_hora_fin === 'string' && bloque.fecha_hora_fin.endsWith('Z')) {
          fechaHoraFin = new Date(bloque.fecha_hora_fin);
        }
        // Si la fecha ya viene con zona horaria (formato ISO con offset)
        else if (typeof bloque.fecha_hora_fin === 'string' && bloque.fecha_hora_fin.includes('-03:00')) {
          fechaHoraFin = new Date(bloque.fecha_hora_fin);
        } 
        // Si viene sin zona horaria, asumir que es en Chile
        else {
          fechaHoraFin = new Date(bloque.fecha_hora_fin + '-03:00');
        }
      } else {
        fechaHoraFin = new Date(fechaHoraInicio.getTime() + 30 * 60000);
      }

      // Validar que la hora de inicio sea menor que la de fin
      if (fechaHoraInicio >= fechaHoraFin) {
        throw error("La hora de inicio debe ser menor que la hora de fin", 400);
      }

      console.log(`=== DEBUG: Creando bloque ===`);
      console.log(`Fecha inicio original: ${bloque.fecha_hora_inicio}`);
      console.log(`Fecha inicio procesada: ${fechaHoraInicio.toISOString()}`);
      console.log(`Fecha fin procesada: ${fechaHoraFin.toISOString()}`);
      console.log(`Hora local (Chile): ${fechaHoraInicio.toLocaleTimeString('es-CL')} - ${fechaHoraFin.toLocaleTimeString('es-CL')}`);

      // Verificar que no exista conflicto con bloques existentes
      const conflictos = await db.query(`
        SELECT id FROM BloquesDisponibilidad 
        WHERE medico_id = @medico_id 
        AND (
          (fecha_hora_inicio <= @inicio AND fecha_hora_fin > @inicio) OR
          (fecha_hora_inicio < @fin AND fecha_hora_fin >= @fin) OR
          (fecha_hora_inicio >= @inicio AND fecha_hora_fin <= @fin)
        )
      `, {
        medico_id: medicoId,
        inicio: fechaHoraInicio.toISOString(),
        fin: fechaHoraFin.toISOString()
      });

      if (conflictos.length > 0) {
        throw error(`Ya existe un bloque en el horario ${fechaHoraInicio.toLocaleTimeString('es-CL')} - ${fechaHoraFin.toLocaleTimeString('es-CL')}`, 409);
      }

      // Crear el bloque
      const result = await db.query(`
        INSERT INTO BloquesDisponibilidad (medico_id, fecha_hora_inicio, fecha_hora_fin, disponible, creado_por_recepcionista)
        OUTPUT INSERTED.id, INSERTED.fecha_hora_inicio, INSERTED.fecha_hora_fin, INSERTED.disponible
        VALUES (@medico_id, @fecha_hora_inicio, @fecha_hora_fin, @disponible, @creado_por)
      `, {
        medico_id: medicoId,
        fecha_hora_inicio: fechaHoraInicio.toISOString(),
        fecha_hora_fin: fechaHoraFin.toISOString(),
        disponible: bloque.disponible !== false ? 1 : 0,
        creado_por: bloque.creado_por_recepcionista || null
      });

      bloquesCreados.push(result[0]);
    }

    return {
      medico,
      bloques_creados: bloquesCreados,
      mensaje: `Se crearon ${bloquesCreados.length} bloques de disponibilidad para el médico`
    };
  } catch (err) {
    console.error("Error al crear bloques de disponibilidad:", err);
    throw err;
  }
}

/**
 * Obtener bloques de disponibilidad de un médico por rango de fechas
 */
async function obtenerBloquesDisponibilidad(medicoId, fechaInicio, fechaFin) {
  try {
    // Verificar que el médico existe
    const [medico] = await db.query(
      "SELECT id, nombre, apellido FROM Usuarios WHERE id = @medicoId AND role = 'medico' AND email_verified = 1",
      { medicoId }
    );
    
    if (!medico) {
      throw error("Médico no encontrado", 404);
    }

    // Si no se proporciona rango, obtener próximos 7 días
    if (!fechaInicio) {
      fechaInicio = new Date().toISOString().split('T')[0];
    }
    if (!fechaFin) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fecha.getDate() + 7);
      fechaFin = fecha.toISOString().split('T')[0];
    }

    const bloques = await db.query(`
      SELECT 
        b.id,
        b.fecha_hora_inicio,
        b.fecha_hora_fin,
        b.disponible,
        b.motivo_no_disponible,
        b.cita_id,
        c.usuario_id as paciente_id,
        c.estado as cita_estado,
        u.nombre as paciente_nombre,
        u.apellido as paciente_apellido,
        b.creado_en
      FROM BloquesDisponibilidad b
      LEFT JOIN CitasMedicas c ON b.cita_id = c.id
      LEFT JOIN Usuarios u ON c.usuario_id = u.id
      WHERE b.medico_id = @medicoId
      AND CAST(b.fecha_hora_inicio AS DATE) >= @fechaInicio
      AND CAST(b.fecha_hora_inicio AS DATE) <= @fechaFin
      ORDER BY b.fecha_hora_inicio
    `, { 
      medicoId, 
      fechaInicio, 
      fechaFin 
    });

    // Agrupar por fecha
    const bloquesPorFecha = {};
    bloques.forEach(bloque => {
      const fecha = bloque.fecha_hora_inicio.toISOString().split('T')[0];
      if (!bloquesPorFecha[fecha]) {
        bloquesPorFecha[fecha] = [];
      }
      bloquesPorFecha[fecha].push({
        id: bloque.id,
        // CORRECCIÓN: Mostrar horas directamente desde UTC sin conversión de zona horaria
        // Las fechas UTC ya representan las horas en Chile correctamente
        hora_inicio: `${new Date(bloque.fecha_hora_inicio).getUTCHours().toString().padStart(2, '0')}:${new Date(bloque.fecha_hora_inicio).getUTCMinutes().toString().padStart(2, '0')}`,
        hora_fin: `${new Date(bloque.fecha_hora_fin).getUTCHours().toString().padStart(2, '0')}:${new Date(bloque.fecha_hora_fin).getUTCMinutes().toString().padStart(2, '0')}`,
        fecha_hora_inicio: bloque.fecha_hora_inicio,
        fecha_hora_fin: bloque.fecha_hora_fin,
        disponible: bloque.disponible,
        motivo_no_disponible: bloque.motivo_no_disponible,
        cita_reservada: bloque.cita_id ? {
          id: bloque.cita_id,
          paciente_id: bloque.paciente_id,
          paciente_nombre: bloque.paciente_nombre,
          paciente_apellido: bloque.paciente_apellido,
          estado: bloque.cita_estado
        } : null
      });
    });

    // Convertir a array ordenado
    const fechasOrdenadas = Object.keys(bloquesPorFecha).sort();
    const resumen = fechasOrdenadas.map(fecha => ({
      fecha,
      dia_semana: new Date(fecha).getDay(),
      total_bloques: bloquesPorFecha[fecha].length,
      bloques_disponibles: bloquesPorFecha[fecha].filter(b => b.disponible && !b.cita_reservada).length,
      bloques_ocupados: bloquesPorFecha[fecha].filter(b => b.cita_reservada).length,
      bloques_no_disponibles: bloquesPorFecha[fecha].filter(b => !b.disponible).length,
      bloques: bloquesPorFecha[fecha]
    }));

    return {
      medico,
      rango_fechas: { inicio: fechaInicio, fin: fechaFin },
      resumen_por_fecha: resumen,
      total_bloques: bloques.length,
      bloques_disponibles: bloques.filter(b => b.disponible && !b.cita_id).length,
      bloques_ocupados: bloques.filter(b => b.cita_id).length,
      bloques_no_disponibles: bloques.filter(b => !b.disponible).length
    };
  } catch (err) {
    console.error("Error al obtener bloques de disponibilidad:", err);
    throw err;
  }
}

/**
 * Generar bloques automáticamente para un rango de fechas y horas
 */
async function generarBloquesAutomaticamente(medicoId, configuracion) {
  try {
    console.log('=== DEBUG: generarBloquesAutomaticamente ===');
    console.log('Medico ID:', medicoId);
    console.log('Configuración recibida:', JSON.stringify(configuracion, null, 2));
    console.log('Tipo de configuracion:', typeof configuracion);
    console.log('Es array:', Array.isArray(configuracion));
    console.log('Es objeto:', typeof configuracion === 'object' && configuracion !== null);

    // Verificar que el médico existe
    const [medico] = await db.query(
      "SELECT id, nombre, apellido FROM Usuarios WHERE id = @medicoId AND role = 'medico' AND email_verified = 1",
      { medicoId }
    );
    
    if (!medico) {
      throw error("Médico no encontrado", 404);
    }

    // Validar que configuracion sea un objeto
    if (!configuracion || typeof configuracion !== 'object' || Array.isArray(configuracion)) {
      console.error('Error: configuracion debe ser un objeto, recibido:', typeof configuracion);
      throw error("Configuración inválida: debe ser un objeto", 400);
    }

    const {
      fecha_inicio,
      fecha_fin,
      dias_semana = [1, 2, 3, 4, 5], // Lunes a viernes por defecto
      hora_inicio = "09:00",
      hora_fin = "17:00",
      duracion_bloque = 30,
      excluir_fechas = []
    } = configuracion;

    console.log('=== DEBUG: Datos extraídos ===');
    console.log('fecha_inicio:', fecha_inicio, 'tipo:', typeof fecha_inicio);
    console.log('fecha_fin:', fecha_fin, 'tipo:', typeof fecha_fin);
    console.log('dias_semana:', dias_semana, 'tipo:', typeof dias_semana);
    console.log('hora_inicio:', hora_inicio, 'tipo:', typeof hora_inicio);
    console.log('hora_fin:', hora_fin, 'tipo:', typeof hora_fin);
    console.log('duracion_bloque:', duracion_bloque, 'tipo:', typeof duracion_bloque);
    console.log('excluir_fechas:', excluir_fechas, 'tipo:', typeof excluir_fechas);

    // Validaciones específicas
    if (!fecha_inicio || !fecha_fin) {
      console.error('Error: fecha_inicio o fecha_fin faltantes');
      throw error("fecha_inicio y fecha_fin son requeridos", 400);
    }

    // Validar formato de fechas
    const fechaInicioDate = new Date(fecha_inicio);
    const fechaFinDate = new Date(fecha_fin);
    
    if (isNaN(fechaInicioDate.getTime()) || isNaN(fechaFinDate.getTime())) {
      console.error('Error: formato de fecha inválido');
      throw error("Formato de fecha inválido. Use YYYY-MM-DD", 400);
    }

    // Validar que fecha_inicio sea anterior a fecha_fin
    if (fechaInicioDate > fechaFinDate) {
      console.error('Error: fecha_inicio es posterior a fecha_fin');
      throw error("fecha_inicio debe ser anterior a fecha_fin", 400);
    }

    // Validar formato de horas
    const horaInicioRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const horaFinRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    
    if (!horaInicioRegex.test(hora_inicio) || !horaFinRegex.test(hora_fin)) {
      console.error('Error: formato de hora inválido');
      throw error("Formato de hora inválido. Use HH:MM", 400);
    }

    // Validar que hora_inicio sea anterior a hora_fin
    if (hora_inicio >= hora_fin) {
      console.error('Error: hora_inicio es posterior o igual a hora_fin');
      throw error("hora_inicio debe ser anterior a hora_fin", 400);
    }

    // Validar duración del bloque
    if (!Number.isInteger(duracion_bloque) || duracion_bloque <= 0) {
      console.error('Error: duracion_bloque inválida');
      throw error("duracion_bloque debe ser un número entero positivo", 400);
    }

    // Validar días de la semana
    if (!Array.isArray(dias_semana) || dias_semana.length === 0) {
      console.error('Error: dias_semana debe ser un array no vacío');
      throw error("dias_semana debe ser un array no vacío", 400);
    }

    // Validar que los días estén en el rango correcto
    const diasValidos = dias_semana.every(dia => Number.isInteger(dia) && dia >= 0 && dia <= 6);
    if (!diasValidos) {
      console.error('Error: días de la semana inválidos');
      throw error("dias_semana debe contener números del 0 al 6", 400);
    }

    // Validar fechas excluidas
    if (excluir_fechas && !Array.isArray(excluir_fechas)) {
      console.error('Error: excluir_fechas debe ser un array');
      throw error("excluir_fechas debe ser un array", 400);
    }

    const bloques = [];
    
    // CORREGIDO: Crear fechas en zona horaria de Chile
    // Parsear la fecha y crear objetos Date en la zona horaria local
    const [yearInicio, monthInicio, dayInicio] = fecha_inicio.split('-').map(Number);
    const [yearFin, monthFin, dayFin] = fecha_fin.split('-').map(Number);
    
    const fechaActual = new Date(yearInicio, monthInicio - 1, dayInicio);
    const fechaLimite = new Date(yearFin, monthFin - 1, dayFin);

    console.log('=== DEBUG: Generación de bloques ===');
    console.log('Fecha inicio configurada:', fecha_inicio);
    console.log('Fecha fin configurada:', fecha_fin);
    console.log('Hora inicio configurada:', hora_inicio);
    console.log('Hora fin configurada:', hora_fin);
    console.log('Fecha actual (local):', fechaActual.toISOString());
    console.log('Fecha límite (local):', fechaLimite.toISOString());

    while (fechaActual <= fechaLimite) {
      // Verificar si es un día de la semana incluido
      if (dias_semana.includes(fechaActual.getDay())) {
        // Verificar si no está en fechas excluidas
        const fechaStr = fechaActual.toISOString().split('T')[0];
        if (!excluir_fechas.includes(fechaStr)) {
          
          // Generar bloques para este día
          const [horaInicioNum, minutoInicioNum] = hora_inicio.split(':').map(Number);
          const [horaFinNum, minutoFinNum] = hora_fin.split(':').map(Number);
          
          // CORRECCIÓN DEFINITIVA: Crear fechas UTC que representen la hora de Chile
          let horaActual = new Date(Date.UTC(
            fechaActual.getFullYear(),
            fechaActual.getMonth(),
            fechaActual.getDate(),
            horaInicioNum,
            minutoInicioNum,
            0,
            0
          ));
          const horaLimite = new Date(Date.UTC(
            fechaActual.getFullYear(),
            fechaActual.getMonth(),
            fechaActual.getDate(),
            horaFinNum,
            minutoFinNum,
            0,
            0
          ));

          console.log(`Generando bloques para ${fechaStr}: ${horaActual.toISOString()} - ${horaLimite.toISOString()}`);

          while (horaActual < horaLimite) {
            const horaFin = new Date(horaActual.getTime() + duracion_bloque * 60000);
            
            if (horaFin <= horaLimite) {
              const fechaInicioISO = horaActual.toISOString();
              const fechaFinISO = horaFin.toISOString();

              bloques.push({
                fecha_hora_inicio: fechaInicioISO,
                fecha_hora_fin: fechaFinISO,
                disponible: true
              });

              console.log(`  Bloque: ${fechaInicioISO} - ${fechaFinISO}`);
            }
            
            horaActual = horaFin;
          }
        }
      }
      
      // Avanzar al siguiente día
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    console.log(`Total de bloques generados: ${bloques.length}`);

    if (bloques.length === 0) {
      throw error("No se generaron bloques con la configuración proporcionada", 400);
    }

    // Crear los bloques
    const resultado = await crearBloquesDisponibilidad(medicoId, bloques);
    
    return {
      ...resultado,
      configuracion_utilizada: configuracion,
      bloques_generados: bloques.length,
      fechas_excluidas: excluir_fechas,
      dias_incluidos: dias_semana
    };

  } catch (err) {
    console.error("Error al generar bloques automáticamente:", err);
    throw err;
  }
}

/**
 * Eliminar bloques de disponibilidad
 */
async function eliminarBloquesDisponibilidad(medicoId, filtros = {}) {
  try {
    // Verificar que el médico existe
    const [medico] = await db.query(
      "SELECT id, nombre, apellido FROM Usuarios WHERE id = @medicoId AND role = 'medico' AND email_verified = 1",
      { medicoId }
    );
    
    if (!medico) {
      throw error("Médico no encontrado", 404);
    }

    let whereClause = "WHERE medico_id = @medicoId";
    const params = { medicoId };

    // Aplicar filtros
    if (filtros.fecha) {
      whereClause += " AND CAST(fecha_hora_inicio AS DATE) = @fecha";
      params.fecha = filtros.fecha;
    }

    if (filtros.fecha_desde) {
      whereClause += " AND CAST(fecha_hora_inicio AS DATE) >= @fecha_desde";
      params.fecha_desde = filtros.fecha_desde;
    }

    if (filtros.fecha_hasta) {
      whereClause += " AND CAST(fecha_hora_inicio AS DATE) <= @fecha_hasta";
      params.fecha_hasta = filtros.fecha_hasta;
    }

    if (filtros.solo_disponibles) {
      whereClause += " AND disponible = 1 AND cita_id IS NULL";
    }

    if (filtros.bloque_ids && Array.isArray(filtros.bloque_ids)) {
      const ids = filtros.bloque_ids.map(id => parseInt(id)).filter(id => !isNaN(id));
      if (ids.length > 0) {
        whereClause += ` AND id IN (${ids.join(',')})`;
      }
    }

    // Verificar que no hay citas asignadas a los bloques que se van a eliminar
    const bloquesConCitas = await db.query(`
      SELECT COUNT(*) as total FROM BloquesDisponibilidad 
      ${whereClause} AND cita_id IS NOT NULL
    `, params);

    if (bloquesConCitas[0].total > 0) {
      throw error("No se pueden eliminar bloques que tienen citas asignadas", 400);
    }

    // Obtener bloques antes de eliminar (para el resumen)
    const bloquesAEliminar = await db.query(`
      SELECT id, fecha_hora_inicio, fecha_hora_fin FROM BloquesDisponibilidad ${whereClause}
    `, params);

    // Eliminar bloques
    const result = await db.query(`
      DELETE FROM BloquesDisponibilidad ${whereClause}
    `, params);

    return {
      medico,
      bloques_eliminados: bloquesAEliminar.length,
      bloques: bloquesAEliminar,
      mensaje: `Se eliminaron ${bloquesAEliminar.length} bloques de disponibilidad`
    };

  } catch (err) {
    console.error("Error al eliminar bloques de disponibilidad:", err);
    throw err;
  }
}

/**
 * Marcar bloque como no disponible (sin eliminarlo)
 */
async function marcarBloqueNoDisponible(bloqueId, motivo = null) {
  try {
    // Verificar que el bloque existe y no tiene cita asignada
    const [bloque] = await db.query(`
      SELECT b.*, u.nombre as medico_nombre, u.apellido as medico_apellido 
      FROM BloquesDisponibilidad b
      INNER JOIN Usuarios u ON b.medico_id = u.id
      WHERE b.id = @bloqueId
    `, { bloqueId });

    if (!bloque) {
      throw error("Bloque no encontrado", 404);
    }

    if (bloque.cita_id) {
      throw error("No se puede marcar como no disponible un bloque con cita asignada", 400);
    }

    // Marcar como no disponible
    await db.query(`
      UPDATE BloquesDisponibilidad 
      SET disponible = 0, motivo_no_disponible = @motivo, actualizado_en = GETDATE()
      WHERE id = @bloqueId
    `, { bloqueId, motivo });

    return {
      bloque_id: bloqueId,
      medico: `${bloque.medico_nombre} ${bloque.medico_apellido}`,
      fecha_hora: bloque.fecha_hora_inicio,
      motivo,
      mensaje: "Bloque marcado como no disponible"
    };

  } catch (err) {
    console.error("Error al marcar bloque como no disponible:", err);
    throw err;
  }
}

module.exports = {
  listarTodasLasCitas,
  crearCitaPaciente,
  actualizarCualquierCita,
  cancelarCualquierCita,
  listarPacientes,
  obtenerPaciente,
  listarMedicos,
  obtenerDisponibilidadMedico,
  obtenerEstadisticasDiarias,
  // Nuevas funciones para horarios
  establecerHorarioMedico,
  obtenerHorarioMedico,
  actualizarHorarioMedico,
  eliminarHorarioMedico,
  agregarExcepcionHorario,
  listarExcepcionesHorario,
  eliminarExcepcionHorario,
  obtenerDisponibilidadMedicoActualizada,
  // Nuevas funciones para bloques de disponibilidad
  crearBloquesDisponibilidad,
  obtenerBloquesDisponibilidad,
  generarBloquesAutomaticamente,
  eliminarBloquesDisponibilidad,
  marcarBloqueNoDisponible
}; 