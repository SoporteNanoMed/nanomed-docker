const sql = require("mssql");
const config = require("../../config").sqlserver;

let pool;
let poolConnect;

sql.on("error", (err) => {
  console.error("SQL Server Error:", err);
});

async function getConnection() {
  if (!pool) {
    pool = new sql.ConnectionPool(config);
    poolConnect = pool.connect();
  }

  try {
    await poolConnect;
    return pool;
  } catch (err) {
    console.error("Error al conectar a SQL Server:", err);
    throw err;
  }
}

async function query(sqlQuery, params = {}) {
  try {
    const pool = await getConnection();
    const request = pool.request();

    // Agregar parámetros a la consulta
    for (const [key, value] of Object.entries(params)) {
      let paramType;
      switch (typeof value) {
        case 'number':
          paramType = Number.isInteger(value) ? sql.Int : sql.Float;
          break;
        case 'boolean':
          paramType = sql.Bit;
          break;
        case 'object':
          if (value instanceof Date) {
            paramType = sql.DateTime;
          } else {
            paramType = sql.NVarChar;
          }
          break;
        default:
          paramType = sql.NVarChar;
      }
      request.input(key, paramType, value);
    }

    const result = await request.query(sqlQuery);
    return result.recordset;
  } catch (err) {
    console.error("Error en la consulta:", err);
    throw err;
  }
}

// Función genérica para obtener todos los registros de una tabla
async function todos(tabla, filtro = {}) {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    let whereClauses = [];
    
    for (const [key, value] of Object.entries(filtro)) {
      let paramType;
      if (typeof value === 'number') {
        paramType = Number.isInteger(value) ? sql.Int : sql.Float;
      } else {
        paramType = sql.NVarChar;
      }
      
      request.input(key, paramType, value);
      whereClauses.push(`${key} = @${key}`);
    }

    const query = `SELECT * FROM ${tabla} ${
      whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : ''
    }`;
    
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error(`Error en la consulta TODOS para tabla ${tabla}:`, err);
    throw err;
  }
}

// Función específica para usuarios (mantener compatibilidad)
async function todosUsuario(tabla, filtro = {}) {
  return todos(tabla, filtro);
}

// Función genérica para obtener un registro por condiciones
async function uno(tabla, condiciones) {
  try {
    const pool = await getConnection();
    const request = pool.request();

    let whereClauses = [];
    
    for (const [key, value] of Object.entries(condiciones)) {
      let paramType;
      if (key === 'id' || key === 'usuario_id') {
        paramType = sql.Int;
      } else if (typeof value === 'boolean') {
        paramType = sql.Bit;
      } else {
        paramType = sql.NVarChar;
      }
      
      request.input(key, paramType, value);
      whereClauses.push(`${key} = @${key}`);
    }

    const query = `SELECT * FROM ${tabla} ${
      whereClauses.length ? 'WHERE ' + whereClauses.join(' AND ') : ''
    }`;
    
    const result = await request.query(query);
    return result.recordset;
  } catch (err) {
    console.error(`Error en la consulta UNO para tabla ${tabla}:`, err);
    throw err;
  }
}

// Función específica para usuarios (mantener compatibilidad)
async function unoUsuario(tabla, condiciones) {
  return uno(tabla, condiciones);
}

// Función genérica para insertar un registro en cualquier tabla
async function insertar(tabla, data) {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    const columns = [];
    const placeholders = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        columns.push(key);
        placeholders.push(`@${key}`);
        
        let paramType;
        if (key === 'id' || key === 'usuario_id') {
          paramType = sql.Int;
        } else if (typeof value === 'boolean') {
          paramType = sql.Bit;
        } else if (value instanceof Date) {
          paramType = sql.DateTime;
        } else if (typeof value === 'number') {
          paramType = Number.isInteger(value) ? sql.Int : sql.Float;
        } else {
          paramType = sql.NVarChar;
        }
        
        request.input(key, paramType, value);
      }
    }
    
    if (columns.length === 0) {
      throw new Error("No se proporcionaron datos para insertar");
    }
    
    const query = `INSERT INTO ${tabla} (${columns.join(", ")}) VALUES (${placeholders.join(", ")})`;
    const result = await request.query(query);
    
    return result;
  } catch (err) {
    console.error(`Error al insertar en la tabla ${tabla}:`, err);
    throw err;
  }
}

async function insertarUsuario(tabla, data) {
  try {
    const pool = await getConnection();
    const result = await pool
      .request()
      .input("nombre", sql.NVarChar, data.nombre)
      .input("apellido", sql.NVarChar, data.apellido)
      .input("email", sql.NVarChar, data.email)
      .input("password_hash", sql.NVarChar, data.password_hash)
      .input("telefono", sql.NVarChar, data.telefono)
      .input("rut", sql.NVarChar, data.rut)
      .input("fecha_nacimiento", sql.Date, data.fecha_nacimiento)
      .input("genero", sql.NVarChar, data.genero)
      .input("direccion", sql.NVarChar, data.direccion)
      .input("ciudad", sql.NVarChar, data.ciudad)
      .input("region", sql.NVarChar, data.region)
      .input("foto_perfil", sql.NVarChar, data.foto_perfil || null)
      .input("email_verified", sql.Bit, data.email_verified || false)
      .input("verification_token", sql.NVarChar, data.verification_token)
      .input("verification_token_expires", sql.DateTime, data.verification_token_expires)
      .input("role", sql.NVarChar, data.role || 'user')
      .input("login_attempts", sql.Int, data.login_attempts || 0)
      .input("mfa_enabled", sql.Bit, data.mfa_enabled || false)
      .query(`
        INSERT INTO ${tabla} (
          nombre, apellido, email, password_hash, telefono, rut, 
          fecha_nacimiento, genero, direccion, ciudad, region, foto_perfil,
          email_verified, verification_token, verification_token_expires, role, login_attempts, mfa_enabled
        )
        VALUES (
          @nombre, @apellido, @email, @password_hash, @telefono, @rut, 
          @fecha_nacimiento, @genero, @direccion, @ciudad, @region, @foto_perfil,
          @email_verified, @verification_token, @verification_token_expires, @role, @login_attempts, @mfa_enabled
        )`);
    return result;
  } catch (err) {
    console.error("Error al insertar usuario:", err);
    throw err;
  }
}

// Función genérica para actualizar cualquier tabla
async function actualizar(tabla, data) {
  try {
    if (!data.id) {
      throw new Error("Se requiere un ID para actualizar");
    }
    
    const pool = await getConnection();
    const request = pool.request().input("id", sql.Int, data.id);

    let updateFields = [];
    
    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id' && value !== undefined) {
        let paramType;
        if (key === 'usuario_id') {
          paramType = sql.Int;
        } else if (typeof value === 'boolean') {
          paramType = sql.Bit;
        } else if (value instanceof Date) {
          paramType = sql.DateTime;
        } else if (typeof value === 'number') {
          paramType = Number.isInteger(value) ? sql.Int : sql.Float;
        } else {
          paramType = sql.NVarChar;
        }
        
        request.input(key, paramType, value);
        updateFields.push(`${key} = @${key}`);
      }
    }

    if (updateFields.length === 0) {
      throw new Error("No se proporcionaron campos para actualizar");
    }

    const query = `UPDATE ${tabla} SET ${updateFields.join(", ")} WHERE id = @id`;
    const result = await request.query(query);

    return result;
  } catch (err) {
    console.error(`Error al actualizar en la tabla ${tabla}:`, err);
    throw err;
  }
}

async function actualizarUsuario(tabla, data) {
  try {
    const pool = await getConnection();
    const request = pool.request().input("id", sql.Int, data.id);

    let updateFields = [];

    // Campos básicos
    const stringFields = ['nombre', 'apellido', 'email', 'password_hash', 'telefono', 
                         'rut', 'genero', 'direccion', 'ciudad', 'region', 'foto_perfil',
                         'verification_token', 'role', 'reset_token', 'mfa_secret', 
                         'mfa_token', 'mfa_code_hash'];
    
    stringFields.forEach(field => {
      if (data[field] !== undefined) {
        request.input(field, sql.NVarChar, data[field]);
        updateFields.push(`${field} = @${field}`);
      }
    });

    // Campos de fecha
    const dateFields = ['fecha_nacimiento', 'verification_token_expires', 'reset_token_expires', 'mfa_token_expires', 'last_failed_login'];
    dateFields.forEach(field => {
      if (data[field] !== undefined) {
        request.input(field, sql.DateTime, data[field]);
        updateFields.push(`${field} = @${field}`);
      }
    });

    // Campos booleanos
    const booleanFields = ['email_verified', 'mfa_enabled'];
    booleanFields.forEach(field => {
      if (data[field] !== undefined) {
        request.input(field, sql.Bit, data[field]);
        updateFields.push(`${field} = @${field}`);
      }
    });

    // Campos numéricos
    const numericFields = ['login_attempts'];
    numericFields.forEach(field => {
      if (data[field] !== undefined) {
        request.input(field, sql.Int, data[field]);
        updateFields.push(`${field} = @${field}`);
      }
    });

    if (updateFields.length === 0) {
      throw new Error("No se proporcionaron campos para actualizar");
    }

    const query = `UPDATE ${tabla} SET ${updateFields.join(", ")} WHERE id = @id`;
    const result = await request.query(query);

    return result;
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    throw err;
  }
}

async function agregarUsuario(tabla, data) {
  if (data && data.id) {
    return actualizarUsuario(tabla, data);
  } else {
    return insertarUsuario(tabla, data);
  }
}

// Función genérica para eliminar un registro de cualquier tabla
async function eliminar(tabla, filtro) {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    let whereClauses = [];
    
    for (const [key, value] of Object.entries(filtro)) {
      let paramType;
      if (key === 'id' || key === 'usuario_id') {
        paramType = sql.Int;
      } else {
        paramType = sql.NVarChar;
      }
      
      request.input(key, paramType, value);
      whereClauses.push(`${key} = @${key}`);
    }
    
    if (whereClauses.length === 0) {
      throw new Error("Se requiere al menos una condición para eliminar");
    }
    
    const query = `DELETE FROM ${tabla} WHERE ${whereClauses.join(' AND ')}`;
    const result = await request.query(query);

    return result.rowsAffected[0] > 0;
  } catch (err) {
    console.error(`Error al eliminar en la tabla ${tabla}:`, err);
    throw err;
  }
}

async function eliminarUsuario(tabla, id) {
  return eliminar(tabla, { id });
}

module.exports = {
  todosUsuario,
  unoUsuario,
  insertarUsuario,
  actualizarUsuario,
  eliminarUsuario,
  query,
  todos,
  uno,
  insertar,
  actualizar,
  eliminar
};
