const db = require("../db/sqlserver");
const respuesta = require("../red/respuestas");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const TABLA = "Usuarios";

async function todosUsuario() {
  try {
    return await db.todosUsuario(TABLA);
  } catch (err) {
    console.error("Error en controlador.todosUsuario:", err);
    throw err;
  }
}

async function unoUsuario(id) {
  try {
    const usuarios = await db.unoUsuario(TABLA, { id: parseInt(id) });
    
    if (!usuarios || usuarios.length === 0) {
      throw new Error('Usuario no encontrado');
    }
    
    return usuarios[0];
  } catch (err) {
    console.error('Error en controlador.unoUsuario:', err);
    throw err;
  }
}

async function agregarUsuario(data) {
  try {
    return await db.insertarUsuario(TABLA, data);
  } catch (err) {
    console.error("Error en controlador.agregarUsuario:", err);
    throw err;
  }
}

async function actualizarUsuario(data) {
  try {
    return await db.actualizarUsuario(TABLA, data);
  } catch (err) {
    console.error("Error en controlador.actualizarUsuario:", err);
    throw err;
  }
}

async function eliminarUsuario(id) {
  try {
    const usuario = await db.unoUsuario(TABLA, id);
    if (!usuario || usuario.length === 0) {
      throw new Error("Usuario no encontrado");
    }

    const resultado = await db.eliminarUsuario(TABLA, id);
    if (!resultado) {
      throw new Error("No se pudo eliminar el usuario");
    }

    return { success: true, message: "Usuario eliminado correctamente" };
  } catch (err) {
    console.error("Error en controlador.eliminar:", err);
    throw err;
  }
}

async function cambiarPassword(id, passwordActual, nuevoPassword) {
  try {
    const [usuario] = await db.unoUsuario(TABLA, id);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    // Para migración de contraseñas sin hash
    let match = false;
    if (usuario.password_hash === passwordActual) {
      match = true;
    } else {
      // Si no coincide en texto, intenta comparar como hash
      try {
        match = await bcrypt.compare(passwordActual, usuario.password_hash);
      } catch (e) {
        match = false;
      }
    }

    if (!match) {
      throw new Error("La contraseña actual no es correcta");
    }

    const hash = await bcrypt.hash(nuevoPassword, saltRounds);
    await db.actualizarUsuario(TABLA, {
      id: id,
      password_hash: hash,
    });

    return { success: true, message: "Contraseña actualizada correctamente" };
  } catch (err) {
    console.error("Error en controlador.cambiarPassword:", err);
    throw err;
  }
}

async function actualizarFotoPerfil(id, fotoPath) {
  try {
    return await db.actualizarUsuario(TABLA, {
      id: id,
      foto_perfil: fotoPath,
    });
  } catch (err) {
    console.error("Error en controlador.actualizarFotoPerfil:", err);
    throw err;
  }
}

async function eliminarFotoPerfil(id) {
  try {
    const [usuario] = await db.unoUsuario(TABLA, id);
    if (!usuario) {
      throw new Error("Usuario no encontrado");
    }

    if (usuario.foto_perfil) {
      const fs = require("fs");
      const path = require("path");

      try {
        const fullPath = path.join(__dirname, "..", usuario.foto_perfil);
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        console.error("Error al eliminar archivo de foto de perfil:", err);
      }
    }

    return await db.actualizarUsuario(TABLA, {
      id: id,
      foto_perfil: null,
    });
  } catch (err) {
    console.error("Error en controlador.eliminarFotoPerfil:", err);
    throw err;
  }
}

module.exports = {
  todosUsuario,
  unoUsuario,
  agregarUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarPassword,
  actualizarFotoPerfil,
  eliminarFotoPerfil: eliminarFotoPerfil,
};
