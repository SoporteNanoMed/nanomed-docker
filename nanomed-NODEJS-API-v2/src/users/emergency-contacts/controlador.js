const db = require("../../db/sqlserver");
const respuesta = require("../../red/respuestas");
const errors = require("../../red/errors");

const TABLA = "ContactosEmergencia";

// Obtener contactos de emergencia del usuario
async function obtenerContactosEmergencia(req, res, next) {
  try {
    const contactos = await db.todos(TABLA, { usuario_id: req.user.id });
    respuesta.success(req, res, contactos, 200);
  } catch (err) {
    next(err);
  }
}

// Agregar nuevo contacto de emergencia
async function agregarContactoEmergencia(req, res, next) {
  try {
    const { nombre, relacion, telefono } = req.body;
    
    if (!nombre) {
      return respuesta.error(req, res, "El nombre del contacto es requerido", 400);
    }
    
    // Crear objeto contacto
    const contacto = {
      usuario_id: req.user.id,
      nombre,
      relacion,
      telefono
    };
    
    await db.insertar(TABLA, contacto);
    respuesta.success(req, res, "Contacto de emergencia agregado correctamente", 201);
  } catch (err) {
    next(err);
  }
}

// Actualizar contacto de emergencia
async function actualizarContactoEmergencia(req, res, next) {
  try {
    const contactoId = req.params.id;
    const { nombre, relacion, telefono } = req.body;
    
    // Verificar que el contacto existe y pertenece al usuario
    const [contacto] = await db.uno(TABLA, { 
      id: contactoId,
      usuario_id: req.user.id
    });
    
    if (!contacto) {
      return respuesta.error(req, res, "Contacto de emergencia no encontrado", 404);
    }
    
    // Actualizar campos
    const datosActualizacion = {
      id: contactoId,
      usuario_id: req.user.id // Mantener para verificación
    };
    
    if (nombre !== undefined) datosActualizacion.nombre = nombre;
    if (relacion !== undefined) datosActualizacion.relacion = relacion;
    if (telefono !== undefined) datosActualizacion.telefono = telefono;
    
    await db.actualizar(TABLA, datosActualizacion);
    respuesta.success(req, res, "Contacto de emergencia actualizado correctamente", 200);
  } catch (err) {
    next(err);
  }
}

// Eliminar contacto de emergencia
async function eliminarContactoEmergencia(req, res, next) {
  try {
    const contactoId = req.params.id;
    
    // Verificar que el contacto existe y pertenece al usuario
    const [contacto] = await db.uno(TABLA, { 
      id: contactoId,
      usuario_id: req.user.id
    });
    
    if (!contacto) {
      return respuesta.error(req, res, "Contacto de emergencia no encontrado", 404);
    }
    
    // Eliminar contacto
    await db.eliminar(TABLA, { id: contactoId });
    respuesta.success(req, res, "Contacto de emergencia eliminado correctamente", 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  obtenerContactosEmergencia,
  agregarContactoEmergencia,
  actualizarContactoEmergencia,
  eliminarContactoEmergencia
}; 