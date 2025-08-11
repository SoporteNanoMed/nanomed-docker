const db = require("../db/sqlserver");
const mailService = require("../utils/mailService");

const TABLA = "CitasMedicas";

// Listar citas del usuario (con filtros)
async function listarCitas(userId, filtros = {}) {
  try {
    const { medico_id, estado, fecha_desde, fecha_hasta, especialidad } = filtros;
    
    let query = `
      SELECT 
        c.*,
        CASE 
          WHEN um.id IS NOT NULL THEN um.nombre + ' ' + um.apellido
          ELSE 'Sin asignar'
        END as nombre_medico,
        CASE 
          WHEN um.id IS NOT NULL THEN um.especialidad
          ELSE NULL
        END as especialidad,
        um.email as email_medico,
        um.foto_perfil as foto_medico
      FROM ${TABLA} c
      LEFT JOIN Usuarios um ON c.medico_id = um.id AND um.role = 'medico'
      WHERE c.usuario_id = @userId
    `;
    
    const params = { userId };
    
    // Aplicar filtros
    if (medico_id) {
      query += ` AND c.medico_id = @medico_id`;
      params.medico_id = medico_id;
    }
    
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
    
    if (especialidad) {
      query += ` AND um.especialidad LIKE @especialidad`;
      params.especialidad = `%${especialidad}%`;
    }
    
    query += ` ORDER BY c.fecha_hora ASC`;
    
    const citas = await db.query(query, params);
    
    return {
      citas,
      total: citas.length,
      filtros_aplicados: { medico_id, estado, fecha_desde, fecha_hasta, especialidad }
    };
  } catch (error) {
    throw error;
  }
}

// Obtener detalle de una cita específica
async function obtenerCita(citaId, userId) {
  try {
    const [cita] = await db.query(`
      SELECT 
        c.*,
        CASE 
          WHEN um.id IS NOT NULL THEN um.nombre + ' ' + um.apellido
          ELSE 'Sin asignar'
        END as nombre_medico,
        CASE 
          WHEN um.id IS NOT NULL THEN 'Médico General'
          ELSE NULL
        END as especialidad,
        um.email as email_medico,
        um.foto_perfil as foto_medico,
        u.nombre + ' ' + u.apellido as nombre_paciente,
        u.email as email_paciente,
        u.telefono as telefono_paciente
      FROM ${TABLA} c
      LEFT JOIN Usuarios um ON c.medico_id = um.id AND um.role = 'medico'
      LEFT JOIN Usuarios u ON c.usuario_id = u.id
      WHERE c.id = @citaId AND c.usuario_id = @userId
    `, { citaId, userId });
    
    return cita;
  } catch (error) {
    throw error;
  }
}

// Solicitar nueva cita
async function crearCita(userId, datosCita) {
  try {
    const { medico_id, fecha_hora, duracion, lugar, direccion, notas } = datosCita;
    
    // Verificar que el usuario existe y obtener sus datos
    const [usuario] = await db.query(
      `SELECT id, nombre, apellido, email FROM Usuarios WHERE id = @usuario_id`,
      { usuario_id: userId }
    );
    
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    
    // Verificar que el médico existe en tabla Usuarios y obtener sus datos
    let medico = null;
    if (medico_id) {
      const [medicoEncontrado] = await db.query(
        `SELECT id, nombre, apellido, especialidad FROM Usuarios WHERE id = @medico_id AND role = 'medico'`,
        { medico_id }
      );
      
      if (!medicoEncontrado) {
        throw new Error('El médico especificado no existe o no está disponible');
      }
      
      medico = medicoEncontrado;
    }
    
    // Verificar disponibilidad del horario
    const [citaExistente] = await db.query(`
      SELECT id FROM ${TABLA} 
      WHERE medico_id = @medico_id 
      AND fecha_hora = @fecha_hora 
      AND estado != 'cancelada'
    `, { medico_id, fecha_hora });
    
    if (citaExistente) {
      throw new Error('El horario seleccionado no está disponible');
    }
    
    // OJO por que????
    // Verificar que no haya más de 3 citas programadas para el mismo día
    const fechaInicio = new Date(fecha_hora);
    fechaInicio.setHours(0, 0, 0, 0);
    const fechaFin = new Date(fecha_hora);
    fechaFin.setHours(23, 59, 59, 999);
    
    const [citasDelDia] = await db.query(`
      SELECT COUNT(*) as total
      FROM ${TABLA}
      WHERE usuario_id = @usuario_id
      AND fecha_hora BETWEEN @fecha_inicio AND @fecha_fin
      AND estado != 'cancelada'
    `, {
      usuario_id: userId,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin
    });
    
    if (citasDelDia.total >= 3) {
      throw new Error('No se pueden programar más de 3 citas para el mismo día');
    }
    
    const resultado = await db.query(`
      INSERT INTO ${TABLA} (usuario_id, medico_id, fecha_hora, duracion, lugar, direccion, estado, notas)
      OUTPUT INSERTED.id
      VALUES (@usuario_id, @medico_id, @fecha_hora, @duracion, @lugar, @direccion, 'programada', @notas)
    `, {
      usuario_id: userId,
      medico_id: medico_id || null,
      fecha_hora,
      duracion: duracion || 30,
      lugar: lugar || '',
      direccion: direccion || '',
      notas: notas || ''
    });
    
    const citaId = resultado[0].id;
    
    // NUEVO: Vincular la cita con el bloque de disponibilidad correspondiente
    if (medico_id) {
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
          medico_id,
          fecha_hora
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
          
          console.log(`Cita ${citaId} vinculada con bloque ${bloqueCorrespondiente.id}`);
        } else {
          console.log(`No se encontró bloque de disponibilidad para la cita ${citaId} en ${fecha_hora}`);
        }
      } catch (bloqueError) {
        // No fallar la creación de la cita si hay error al vincular el bloque
        console.error('Error al vincular bloque con cita:', bloqueError);
      }
    }
    
    // Crear notificación
    await db.query(`
      INSERT INTO Notificaciones (usuario_id, tipo, titulo, contenido, referencia_tipo, referencia_id)
      VALUES (@usuario_id, 'cita', 'Cita programada', 'Tu cita ha sido programada exitosamente', 'cita', @cita_id)
    `, {
      usuario_id: userId,
      cita_id: citaId
    });
    
    // Enviar correo de agendamiento de cita médica
    try {
      const appointmentData = {
        fecha_hora,
        medico_nombre: medico ? `${medico.nombre} ${medico.apellido}` : null,
        especialidad: medico ? medico.especialidad : null,
        lugar: lugar || 'Centro Médico nanoMED',
        direccion: direccion || 'José Joaquín Pérez 240, Salamanca',
        duracion: duracion || 30,
        notas
      };
      
      const userName = `${usuario.nombre} ${usuario.apellido}`;
      
      await mailService.sendAppointmentSchedulingEmail(
        usuario.email,
        appointmentData,
        userName
      );
      
      console.log(`Correo de agendamiento enviado a ${usuario.email} para la cita ${citaId}`);
    } catch (emailError) {
      // No fallar la creación de la cita si hay error al enviar el correo
      console.error('Error al enviar correo de agendamiento:', emailError);
    }
    
    return await obtenerCita(citaId, userId);
  } catch (error) {
    // Log del error para debugging
    console.error('Error al crear cita:', error);
    throw error;
  }
}

// Actualizar información de cita
async function actualizarCita(citaId, userId, datosActualizacion) {
  try {
    const { fecha_hora, duracion, lugar, direccion, notas, estado } = datosActualizacion;
    
    // Verificar que la cita existe y pertenece al usuario
    const citaExistente = await obtenerCita(citaId, userId);
    if (!citaExistente) {
      throw new Error('Cita no encontrada');
    }
    
    // Verificar si se está confirmando la asistencia (cambio a estado "confirmada")
    const estaConfirmandoAsistencia = estado === 'confirmada' && citaExistente.estado !== 'confirmada';
    
    // Si se está cambiando la fecha/hora, verificar disponibilidad
    if (fecha_hora && fecha_hora !== citaExistente.fecha_hora) {
      const [conflicto] = await db.query(`
        SELECT id FROM ${TABLA} 
        WHERE medico_id = @medico_id 
        AND fecha_hora = @fecha_hora 
        AND estado != 'cancelada'
        AND id != @cita_id
      `, { 
        medico_id: citaExistente.medico_id, 
        fecha_hora, 
        cita_id: citaId 
      });
      
      if (conflicto) {
        throw new Error('El nuevo horario no está disponible');
      }
    }
    
    await db.query(`
      UPDATE ${TABLA} 
      SET 
        fecha_hora = COALESCE(@fecha_hora, fecha_hora),
        duracion = COALESCE(@duracion, duracion),
        lugar = COALESCE(@lugar, lugar),
        direccion = COALESCE(@direccion, direccion),
        notas = COALESCE(@notas, notas),
        estado = COALESCE(@estado, estado),
        actualizado_en = GETDATE()
      WHERE id = @cita_id AND usuario_id = @usuario_id
    `, {
      fecha_hora,
      duracion,
      lugar,
      direccion,
      notas,
      estado,
      cita_id: citaId,
      usuario_id: userId
    });
    
    // Si se confirmó la asistencia, enviar correo de confirmación
    if (estaConfirmandoAsistencia) {
      try {
        // Obtener datos completos del usuario
        const [usuario] = await db.query(
          `SELECT id, nombre, apellido, email FROM Usuarios WHERE id = @usuario_id`,
          { usuario_id: userId }
        );
        
        // Obtener datos completos del médico si existe
        let medico = null;
        if (citaExistente.medico_id) {
          const [medicoEncontrado] = await db.query(
            `SELECT id, nombre, apellido, especialidad FROM Usuarios WHERE id = @medico_id AND role = 'medico'`,
            { medico_id: citaExistente.medico_id }
          );
          
          if (medicoEncontrado) {
            medico = medicoEncontrado;
          }
        }
        
        if (usuario && usuario.email) {
          const appointmentData = {
            fecha_hora: citaExistente.fecha_hora,
            medico_nombre: medico ? `${medico.nombre} ${medico.apellido}` : citaExistente.nombre_medico,
            especialidad: medico ? medico.especialidad : citaExistente.especialidad,
            lugar: citaExistente.lugar || 'Centro Médico nanoMED',
            direccion: citaExistente.direccion || 'José Joaquín Pérez 240, Salamanca',
            duracion: citaExistente.duracion || 30,
            notas: citaExistente.notas
          };
          
          const userName = `${usuario.nombre} ${usuario.apellido}`;
          
          await mailService.sendAppointmentConfirmationEmail(
            usuario.email,
            appointmentData,
            userName
          );
          
          console.log(`Correo de confirmación de asistencia enviado a ${usuario.email} para la cita ${citaId}`);
        } else {
          console.log(`No se pudo enviar correo: El usuario no tiene email registrado`);
        }
      } catch (emailError) {
        // No fallar la actualización de la cita si hay error al enviar el correo
        console.error('Error al enviar correo de confirmación de asistencia:', emailError);
      }
    }
    
    return await obtenerCita(citaId, userId);
  } catch (error) {
    throw error;
  }
}

// Cancelar cita
async function cancelarCita(citaId, userId) {
  try {
    const citaExistente = await obtenerCita(citaId, userId);
    if (!citaExistente) {
      throw new Error('Cita no encontrada');
    }
    
    if (citaExistente.estado === 'cancelada') {
      throw new Error('La cita ya está cancelada');
    }
    
    // NUEVO: Desvincular bloque de disponibilidad antes de cancelar
    if (citaExistente.medico_id) {
      try {
        await db.query(`
          UPDATE BloquesDisponibilidad
          SET cita_id = NULL, actualizado_en = GETDATE()
          WHERE cita_id = @cita_id
        `, { cita_id: citaId });
        
        console.log(`Bloque desvinculado de la cita cancelada ${citaId}`);
      } catch (bloqueError) {
        console.error('Error al desvincular bloque de cita cancelada:', bloqueError);
      }
    }
    
    await db.query(`
      UPDATE ${TABLA} 
      SET estado = 'cancelada', actualizado_en = GETDATE()
      WHERE id = @cita_id AND usuario_id = @usuario_id
    `, { cita_id: citaId, usuario_id: userId });
    
    // Crear notificación
    await db.query(`
      INSERT INTO Notificaciones (usuario_id, tipo, titulo, contenido, referencia_tipo, referencia_id)
      VALUES (@usuario_id, 'cita', 'Cita cancelada', 'Tu cita ha sido cancelada exitosamente', 'cita', @cita_id)
    `, {
      usuario_id: userId,
      cita_id: citaId
    });
    
    // Enviar correo de cancelación de cita médica
    try {
      // Obtener datos completos del usuario
      const [usuario] = await db.query(
        `SELECT id, nombre, apellido, email FROM Usuarios WHERE id = @usuario_id`,
        { usuario_id: userId }
      );
      
      // Obtener datos completos del médico si existe
      let medico = null;
      if (citaExistente.medico_id) {
        const [medicoEncontrado] = await db.query(
          `SELECT id, nombre, apellido, especialidad FROM Usuarios WHERE id = @medico_id AND role = 'medico'`,
          { medico_id: citaExistente.medico_id }
        );
        
        if (medicoEncontrado) {
          medico = medicoEncontrado;
        }
      }
      
      if (usuario && usuario.email) {
        const appointmentData = {
          fecha_hora: citaExistente.fecha_hora,
          medico_nombre: medico ? `${medico.nombre} ${medico.apellido}` : citaExistente.nombre_medico,
          especialidad: medico ? medico.especialidad : citaExistente.especialidad,
          lugar: citaExistente.lugar || 'Centro Médico nanoMED',
          direccion: citaExistente.direccion || 'José Joaquín Pérez 240, Salamanca',
          duracion: citaExistente.duracion || 30,
          notas: citaExistente.notas
        };
        
        const userName = `${usuario.nombre} ${usuario.apellido}`;
        
        await mailService.sendAppointmentCancellationEmail(
          usuario.email,
          appointmentData,
          userName
        );
        
        console.log(`Correo de cancelación enviado a ${usuario.email} para la cita ${citaId}`);
      } else {
        console.log(`No se pudo enviar correo: El usuario no tiene email registrado`);
      }
    } catch (emailError) {
      // No fallar la cancelación de la cita si hay error al enviar el correo
      console.error('Error al enviar correo de cancelación:', emailError);
    }
    
    return await obtenerCita(citaId, userId);
  } catch (error) {
    throw error;
  }
}

// Obtener horarios disponibles (ACTUALIZADA para usar bloques de disponibilidad)
async function obtenerHorariosDisponibles(filtros = {}) {
  try {
    const { medico_id, fecha, especialidad } = filtros;
    
    // Si no se especifica médico, usar horarios por defecto
    if (!medico_id) {
      // Horarios base por defecto (9:00 a 18:00, cada 30 minutos)
      const horariosBase = [];
      const fechaBase = fecha ? new Date(fecha) : new Date();
      
      for (let hora = 9; hora < 18; hora++) {
        for (let minuto = 0; minuto < 60; minuto += 30) {
          const fechaHora = new Date(fechaBase);
          fechaHora.setHours(hora, minuto, 0, 0);
          horariosBase.push(fechaHora);
        }
      }
      
      // Obtener citas ocupadas
      let queryOcupadas = `
        SELECT fecha_hora 
        FROM ${TABLA} 
        WHERE estado != 'cancelada'
      `;
      
      const params = {};
      
      if (fecha) {
        const fechaInicio = new Date(fecha);
        fechaInicio.setHours(0, 0, 0, 0);
        const fechaFin = new Date(fecha);
        fechaFin.setHours(23, 59, 59, 999);
        
        queryOcupadas += ` AND fecha_hora >= @fecha_inicio AND fecha_hora <= @fecha_fin`;
        params.fecha_inicio = fechaInicio;
        params.fecha_fin = fechaFin;
      }
      
      const citasOcupadas = await db.query(queryOcupadas, params);
      const horariosOcupados = citasOcupadas.map(cita => new Date(cita.fecha_hora).getTime());
      
      // Filtrar horarios disponibles - BLOQUEO ELIMINADO: permitir cualquier horario
      const horariosDisponibles = horariosBase.filter(horario => {
        const tiempoHorario = horario.getTime();
        return !horariosOcupados.includes(tiempoHorario); // Eliminado: && horario > new Date()
      });
      
      return {
        fecha: fecha || fechaBase.toISOString().split('T')[0],
        medico_id: null,
        especialidad,
        tipo_horario: 'por_defecto',
        horarios_disponibles: horariosDisponibles.map(h => ({
          fecha_hora: h.toISOString(),
          hora_formato: h.toLocaleTimeString('es-CL', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        })),
        total_disponibles: horariosDisponibles.length
      };
    }
    
    // Si se especifica médico, SIEMPRE verificar bloques de disponibilidad primero
    const fechaConsulta = fecha || new Date().toISOString().split('T')[0];
    
    // Verificar que el médico existe
    const [medico] = await db.query(
      "SELECT id, nombre, apellido FROM Usuarios WHERE id = @medicoId AND role = 'medico' AND email_verified = 1",
      { medicoId: medico_id }
    );
    
    if (!medico) {
      throw new Error('Médico no encontrado');
    }

    // SIEMPRE verificar si existen bloques de disponibilidad para esta fecha
    const bloquesDisponibilidad = await db.query(`
      SELECT 
        id,
        fecha_hora_inicio,
        fecha_hora_fin,
        disponible,
        motivo_no_disponible,
        cita_id
      FROM BloquesDisponibilidad
      WHERE medico_id = @medicoId
      AND CAST(fecha_hora_inicio AS DATE) = @fecha
      AND disponible = 1
      AND cita_id IS NULL
      ORDER BY fecha_hora_inicio
    `, { medicoId: medico_id, fecha: fechaConsulta });

    // Si hay bloques de disponibilidad configurados, SIEMPRE usarlos
    if (bloquesDisponibilidad.length > 0) {
      const horariosDisponibles = bloquesDisponibilidad.map(bloque => {
        // CORRECCIÓN: Mostrar horas directamente desde UTC sin conversión de zona horaria
        // Las fechas UTC ya representan las horas en Chile correctamente
        const fechaHoraUtc = new Date(bloque.fecha_hora_inicio);
        const horaFormateada = `${fechaHoraUtc.getUTCHours().toString().padStart(2, '0')}:${fechaHoraUtc.getUTCMinutes().toString().padStart(2, '0')}`;
        
        return {
          fecha_hora: bloque.fecha_hora_inicio,
          hora_formato: horaFormateada,
          duracion: Math.round((new Date(bloque.fecha_hora_fin) - fechaHoraUtc) / 60000)
        };
      });

      return {
        fecha: fechaConsulta,
        medico_id,
        especialidad,
        tipo_horario: 'bloques_configurados',
        horarios_disponibles: horariosDisponibles,
        total_disponibles: horariosDisponibles.length,
        mensaje: "Horarios basados en bloques configurados por recepcionista"
      };
    }

    // Si NO hay bloques configurados, retornar mensaje claro
    return {
      fecha: fechaConsulta,
      medico_id,
      especialidad,
      tipo_horario: 'sin_configuracion',
      horarios_disponibles: [],
      total_disponibles: 0,
      mensaje: "No hay bloques de disponibilidad configurados para este médico en esta fecha. Contacte al recepcionista para configurar horarios."
    };

  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    throw error;
  }
}

// Confirmar asistencia a cita
async function confirmarAsistencia(citaId, userId) {
  try {
    const citaExistente = await obtenerCita(citaId, userId);
    if (!citaExistente) {
      throw new Error('Cita no encontrada');
    }
    
    if (citaExistente.estado !== 'programada') {
      throw new Error('Solo se puede confirmar asistencia a citas programadas');
    }
    
    await db.query(`
      UPDATE ${TABLA} 
      SET estado = 'confirmada', actualizado_en = GETDATE()
      WHERE id = @cita_id AND usuario_id = @usuario_id
    `, { cita_id: citaId, usuario_id: userId });
    
    // Crear notificación
    await db.query(`
      INSERT INTO Notificaciones (usuario_id, tipo, titulo, contenido, referencia_tipo, referencia_id)
      VALUES (@usuario_id, 'cita', 'Asistencia confirmada', 'Has confirmado tu asistencia a la cita', 'cita', @cita_id)
    `, {
      usuario_id: userId,
      cita_id: citaId
    });
    
    // Enviar correo de confirmación de asistencia
    try {
      // Obtener datos completos del usuario
      const [usuario] = await db.query(
        `SELECT id, nombre, apellido, email FROM Usuarios WHERE id = @usuario_id`,
        { usuario_id: userId }
      );
      
      // Obtener datos completos del médico si existe
      let medico = null;
      if (citaExistente.medico_id) {
        const [medicoEncontrado] = await db.query(
          `SELECT id, nombre, apellido, especialidad FROM Usuarios WHERE id = @medico_id AND role = 'medico'`,
          { medico_id: citaExistente.medico_id }
        );
        
        if (medicoEncontrado) {
          medico = medicoEncontrado;
        }
      }
      
      if (usuario && usuario.email) {
        const appointmentData = {
          fecha_hora: citaExistente.fecha_hora,
          medico_nombre: medico ? `${medico.nombre} ${medico.apellido}` : citaExistente.nombre_medico,
          especialidad: medico ? medico.especialidad : citaExistente.especialidad,
          lugar: citaExistente.lugar || 'Centro Médico nanoMED',
          direccion: citaExistente.direccion || 'José Joaquín Pérez 240, Salamanca',
          duracion: citaExistente.duracion || 30,
          notas: citaExistente.notas
        };
        
        const userName = `${usuario.nombre} ${usuario.apellido}`;
        
        await mailService.sendAppointmentConfirmationEmail(
          usuario.email,
          appointmentData,
          userName
        );
        
        console.log(`Correo de confirmación de asistencia enviado a ${usuario.email} para la cita ${citaId} (vía confirm endpoint)`);
      } else {
        console.log(`No se pudo enviar correo: El usuario no tiene email registrado`);
      }
    } catch (emailError) {
      // No fallar la confirmación de la cita si hay error al enviar el correo
      console.error('Error al enviar correo de confirmación de asistencia:', emailError);
    }
    
    return await obtenerCita(citaId, userId);
  } catch (error) {
    throw error;
  }
}

// Reprogramar cita
async function reprogramarCita(citaId, userId, nuevaFechaHora) {
  try {
    const citaExistente = await obtenerCita(citaId, userId);
    if (!citaExistente) {
      throw new Error('Cita no encontrada');
    }
    
    if (citaExistente.estado === 'cancelada') {
      throw new Error('No se puede reprogramar una cita cancelada');
    }
    
    // Verificar disponibilidad del nuevo horario
    const [conflicto] = await db.query(`
      SELECT id FROM ${TABLA} 
      WHERE medico_id = @medico_id 
      AND fecha_hora = @nueva_fecha_hora 
      AND estado != 'cancelada'
      AND id != @cita_id
    `, { 
      medico_id: citaExistente.medico_id, 
      nueva_fecha_hora: nuevaFechaHora, 
      cita_id: citaId 
    });
    
    if (conflicto) {
      throw new Error('El nuevo horario no está disponible');
    }
    
    // NUEVO: Gestionar vinculación de bloques en reprogramación
    if (citaExistente.medico_id) {
      try {
        // 1. Desvincular bloque anterior
        await db.query(`
          UPDATE BloquesDisponibilidad
          SET cita_id = NULL, actualizado_en = GETDATE()
          WHERE cita_id = @cita_id
        `, { cita_id: citaId });
        
        // 2. Buscar y vincular nuevo bloque
        const [nuevoBloque] = await db.query(`
          SELECT id FROM BloquesDisponibilidad
          WHERE medico_id = @medico_id
          AND fecha_hora_inicio <= @nueva_fecha_hora
          AND fecha_hora_fin > @nueva_fecha_hora
          AND disponible = 1
          AND cita_id IS NULL
        `, {
          medico_id: citaExistente.medico_id,
          nueva_fecha_hora: nuevaFechaHora
        });
        
        if (nuevoBloque) {
          await db.query(`
            UPDATE BloquesDisponibilidad
            SET cita_id = @cita_id, actualizado_en = GETDATE()
            WHERE id = @bloque_id
          `, {
            cita_id: citaId,
            bloque_id: nuevoBloque.id
          });
          
          console.log(`Cita ${citaId} reprogramada y vinculada con nuevo bloque ${nuevoBloque.id}`);
        } else {
          console.log(`No se encontró bloque disponible para la nueva fecha ${nuevaFechaHora}`);
        }
      } catch (bloqueError) {
        console.error('Error al gestionar bloques en reprogramación:', bloqueError);
      }
    }
    
    await db.query(`
      UPDATE ${TABLA} 
      SET fecha_hora = @nueva_fecha_hora, estado = 'programada', actualizado_en = GETDATE()
      WHERE id = @cita_id AND usuario_id = @usuario_id
    `, { 
      nueva_fecha_hora: nuevaFechaHora, 
      cita_id: citaId, 
      usuario_id: userId 
    });
    
    // Crear notificación
    await db.query(`
      INSERT INTO Notificaciones (usuario_id, tipo, titulo, contenido, referencia_tipo, referencia_id)
      VALUES (@usuario_id, 'cita', 'Cita reprogramada', 'Tu cita ha sido reprogramada exitosamente', 'cita', @cita_id)
    `, {
      usuario_id: userId,
      cita_id: citaId
    });
    
    return await obtenerCita(citaId, userId);
  } catch (error) {
    throw error;
  }
}

module.exports = {
  listarCitas,
  obtenerCita,
  crearCita,
  actualizarCita,
  cancelarCita,
  obtenerHorariosDisponibles,
  confirmarAsistencia,
  reprogramarCita
}; 