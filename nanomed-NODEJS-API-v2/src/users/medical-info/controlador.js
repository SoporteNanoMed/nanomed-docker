const db = require("../../db/sqlserver");
const respuesta = require("../../red/respuestas");

const TABLA = "InformacionMedica";

// Obtener información médica del usuario actual
async function obtenerInformacionMedica(req, res, next) {
  try {
    const userId = req.user.id;
    
    // Consultar información médica del usuario
    const [infoMedica] = await db.query(
      `SELECT * FROM ${TABLA} WHERE usuario_id = @id`,
      { id: userId }
    );
    
    if (!infoMedica) {
      return respuesta.success(req, res, { mensaje: "No se encontró información médica para este usuario" }, 200);
    }

    respuesta.success(req, res, infoMedica, 200);
  } catch (err) {
    next(err);
  }
}

// Actualizar información médica del usuario actual
async function actualizarInformacionMedica(req, res, next) {
  try {
    const userId = req.user.id;
    
    // Comprobar si ya existe información médica para este usuario
    const [infoMedicaExistente] = await db.query(
      `SELECT * FROM ${TABLA} WHERE usuario_id = @id`,
      { id: userId }
    );
    
    const datos = {
      usuario_id: userId,
      grupo_sanguineo: req.body.grupo_sanguineo,
      alergias: req.body.alergias,
      medicamentos: req.body.medicamentos,
      condiciones_medicas: req.body.condiciones_medicas,
      actualizado_en: new Date()
    };
    
    if (infoMedicaExistente) {
      // Actualizar registro existente
      await db.query(
        `UPDATE ${TABLA} SET 
         grupo_sanguineo = @grupo_sanguineo,
         alergias = @alergias,
         medicamentos = @medicamentos,
         condiciones_medicas = @condiciones_medicas,
         actualizado_en = @actualizado_en
         WHERE usuario_id = @usuario_id`,
        datos
      );
    } else {
      // Crear nuevo registro
      await db.query(
        `INSERT INTO ${TABLA} (
          usuario_id, grupo_sanguineo, alergias, medicamentos,
          condiciones_medicas, actualizado_en
        ) VALUES (
          @usuario_id, @grupo_sanguineo, @alergias, @medicamentos,
          @condiciones_medicas, @actualizado_en
        )`,
        datos
      );
    }
    
    respuesta.success(req, res, { mensaje: "Información médica actualizada correctamente" }, 200);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  obtenerInformacionMedica,
  actualizarInformacionMedica
}; 