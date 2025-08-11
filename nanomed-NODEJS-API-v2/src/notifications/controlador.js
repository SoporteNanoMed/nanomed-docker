const db = require("../db/sqlserver");

const TABLA_NOTIFICACIONES = "Notificaciones";
const TABLA_PREFERENCIAS = "PreferenciasNotificacion";

// Listar notificaciones del usuario
async function listarNotificaciones(userId, filtros = {}) {
  try {
    const { limite = 50, offset = 0, leida } = filtros;
    
    let whereClause = "WHERE usuario_id = @userId";
    const params = { userId };
    
    // Filtro por estado de lectura
    if (leida !== undefined) {
      whereClause += " AND leida = @leida";
      params.leida = leida === 'true' || leida === true ? 1 : 0;
    }
    
    // Obtener notificaciones con paginación
    const notificaciones = await db.query(`
      SELECT 
        id,
        usuario_id,
        tipo,
        titulo,
        contenido,
        referencia_tipo,
        referencia_id,
        leida,
        creado_en
      FROM ${TABLA_NOTIFICACIONES}
      ${whereClause}
      ORDER BY creado_en DESC
      OFFSET @offset ROWS
      FETCH NEXT @limite ROWS ONLY
    `, {
      ...params,
      limite: parseInt(limite),
      offset: parseInt(offset)
    });
    
    // Obtener total de notificaciones
    const [{ total }] = await db.query(`
      SELECT COUNT(*) as total
      FROM ${TABLA_NOTIFICACIONES}
      ${whereClause}
    `, params);
    
    // Obtener conteo de no leídas
    const [{ no_leidas }] = await db.query(`
      SELECT COUNT(*) as no_leidas
      FROM ${TABLA_NOTIFICACIONES}
      WHERE usuario_id = @userId AND leida = 0
    `, { userId });
    
    return {
      notificaciones,
      total,
      no_leidas,
      limite: parseInt(limite),
      offset: parseInt(offset)
    };
  } catch (error) {
    throw error;
  }
}

// Marcar notificación como leída
async function marcarComoLeida(notificacionId, userId) {
  try {
    // Verificar que la notificación pertenece al usuario
    const [notificacion] = await db.query(`
      SELECT id FROM ${TABLA_NOTIFICACIONES}
      WHERE id = @notificacionId AND usuario_id = @userId
    `, { notificacionId, userId });
    
    if (!notificacion) {
      throw new Error('Notificación no encontrada');
    }
    
    // Marcar como leída
    await db.query(`
      UPDATE ${TABLA_NOTIFICACIONES}
      SET leida = 1
      WHERE id = @notificacionId AND usuario_id = @userId
    `, { notificacionId, userId });
    
    // Retornar la notificación actualizada
    const [notificacionActualizada] = await db.query(`
      SELECT 
        id,
        usuario_id,
        tipo,
        titulo,
        contenido,
        referencia_tipo,
        referencia_id,
        leida,
        creado_en
      FROM ${TABLA_NOTIFICACIONES}
      WHERE id = @notificacionId
    `, { notificacionId });
    
    return notificacionActualizada;
  } catch (error) {
    throw error;
  }
}

// Marcar todas las notificaciones como leídas
async function marcarTodasComoLeidas(userId) {
  try {
    // Primero contar las notificaciones no leídas
    const [{ no_leidas }] = await db.query(`
      SELECT COUNT(*) as no_leidas
      FROM ${TABLA_NOTIFICACIONES}
      WHERE usuario_id = @userId AND leida = 0
    `, { userId });
    
    // Actualizar las notificaciones
    await db.query(`
      UPDATE ${TABLA_NOTIFICACIONES}
      SET leida = 1
      WHERE usuario_id = @userId AND leida = 0
    `, { userId });
    
    return {
      mensaje: 'Todas las notificaciones han sido marcadas como leídas',
      notificaciones_actualizadas: no_leidas || 0
    };
  } catch (error) {
    throw error;
  }
}

// Eliminar notificación
async function eliminarNotificacion(notificacionId, userId) {
  try {
    // Verificar que la notificación pertenece al usuario
    const [notificacion] = await db.query(`
      SELECT id FROM ${TABLA_NOTIFICACIONES}
      WHERE id = @notificacionId AND usuario_id = @userId
    `, { notificacionId, userId });
    
    if (!notificacion) {
      throw new Error('Notificación no encontrada');
    }
    
    // Eliminar la notificación
    await db.query(`
      DELETE FROM ${TABLA_NOTIFICACIONES}
      WHERE id = @notificacionId AND usuario_id = @userId
    `, { notificacionId, userId });
    
    return {
      mensaje: 'Notificación eliminada exitosamente'
    };
  } catch (error) {
    throw error;
  }
}

// Obtener preferencias de notificación
async function obtenerPreferencias(userId) {
  try {
    let [preferencias] = await db.query(`
      SELECT 
        id,
        usuario_id,
        email_citas,
        email_resultados,
        email_promociones,
        sms_citas,
        sms_resultados
      FROM ${TABLA_PREFERENCIAS}
      WHERE usuario_id = @userId
    `, { userId });
    
    // Si no existen preferencias, crear las predeterminadas
    if (!preferencias) {
      await db.query(`
        INSERT INTO ${TABLA_PREFERENCIAS} (usuario_id)
        VALUES (@userId)
      `, { userId });
      
      [preferencias] = await db.query(`
        SELECT 
          id,
          usuario_id,
          email_citas,
          email_resultados,
          email_promociones,
          sms_citas,
          sms_resultados
        FROM ${TABLA_PREFERENCIAS}
        WHERE usuario_id = @userId
      `, { userId });
    }
    
    // Convertir bits a booleanos
    return {
      id: preferencias.id,
      usuario_id: preferencias.usuario_id,
      email_citas: !!preferencias.email_citas,
      email_resultados: !!preferencias.email_resultados,
      email_promociones: !!preferencias.email_promociones,
      sms_citas: !!preferencias.sms_citas,
      sms_resultados: !!preferencias.sms_resultados
    };
  } catch (error) {
    throw error;
  }
}

// Actualizar preferencias de notificación
async function actualizarPreferencias(userId, nuevasPreferencias) {
  try {
    const {
      email_citas,
      email_resultados,
      email_promociones,
      sms_citas,
      sms_resultados
    } = nuevasPreferencias;
    
    // Verificar si existen preferencias para el usuario
    const [preferenciasExistentes] = await db.query(`
      SELECT id FROM ${TABLA_PREFERENCIAS}
      WHERE usuario_id = @userId
    `, { userId });
    
    if (!preferenciasExistentes) {
      // Crear nuevas preferencias
      await db.query(`
        INSERT INTO ${TABLA_PREFERENCIAS} (
          usuario_id,
          email_citas,
          email_resultados,
          email_promociones,
          sms_citas,
          sms_resultados
        )
        VALUES (
          @userId,
          @email_citas,
          @email_resultados,
          @email_promociones,
          @sms_citas,
          @sms_resultados
        )
      `, {
        userId,
        email_citas: email_citas !== undefined ? (email_citas ? 1 : 0) : 1,
        email_resultados: email_resultados !== undefined ? (email_resultados ? 1 : 0) : 1,
        email_promociones: email_promociones !== undefined ? (email_promociones ? 1 : 0) : 0,
        sms_citas: sms_citas !== undefined ? (sms_citas ? 1 : 0) : 0,
        sms_resultados: sms_resultados !== undefined ? (sms_resultados ? 1 : 0) : 0
      });
    } else {
      // Actualizar preferencias existentes
      const updates = [];
      const params = { userId };
      
      if (email_citas !== undefined) {
        updates.push("email_citas = @email_citas");
        params.email_citas = email_citas ? 1 : 0;
      }
      if (email_resultados !== undefined) {
        updates.push("email_resultados = @email_resultados");
        params.email_resultados = email_resultados ? 1 : 0;
      }
      if (email_promociones !== undefined) {
        updates.push("email_promociones = @email_promociones");
        params.email_promociones = email_promociones ? 1 : 0;
      }
      if (sms_citas !== undefined) {
        updates.push("sms_citas = @sms_citas");
        params.sms_citas = sms_citas ? 1 : 0;
      }
      if (sms_resultados !== undefined) {
        updates.push("sms_resultados = @sms_resultados");
        params.sms_resultados = sms_resultados ? 1 : 0;
      }
      
      if (updates.length > 0) {
        await db.query(`
          UPDATE ${TABLA_PREFERENCIAS}
          SET ${updates.join(", ")}
          WHERE usuario_id = @userId
        `, params);
      }
    }
    
    // Retornar las preferencias actualizadas
    return await obtenerPreferencias(userId);
  } catch (error) {
    throw error;
  }
}

// Función auxiliar para crear notificación (para uso interno)
async function crearNotificacion(datos) {
  try {
    const {
      usuario_id,
      tipo,
      titulo,
      contenido,
      referencia_tipo = null,
      referencia_id = null
    } = datos;
    
    const resultado = await db.query(`
      INSERT INTO ${TABLA_NOTIFICACIONES} (
        usuario_id,
        tipo,
        titulo,
        contenido,
        referencia_tipo,
        referencia_id
      )
      OUTPUT INSERTED.id
      VALUES (
        @usuario_id,
        @tipo,
        @titulo,
        @contenido,
        @referencia_tipo,
        @referencia_id
      )
    `, {
      usuario_id,
      tipo,
      titulo,
      contenido,
      referencia_tipo,
      referencia_id
    });
    
    return resultado[0].id;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  listarNotificaciones,
  marcarComoLeida,
  marcarTodasComoLeidas,
  eliminarNotificacion,
  obtenerPreferencias,
  actualizarPreferencias,
  crearNotificacion
}; 