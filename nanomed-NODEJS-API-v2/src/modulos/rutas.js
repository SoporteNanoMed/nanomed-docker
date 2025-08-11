const express = require("express");
const respuesta = require("../red/respuestas");
const controlador = require("./controlador");
const router = express.Router();
const upload = require("../middleware/upload");
const path = require("path");
//const { unoUsuario } = require("../db/sqlserver");
//const { todosUsuario } = require("../db/sqlserver");

router.get("/", listarUsuarios);
router.get("/:id", obtenerUsuario);
router.post("/", agregarUsuario);
router.patch("/:id", actualizarUsuario);
router.delete("/:id", eliminarUsuario);
router.put("/:id/password", cambiarPasswordUsuario);
router.post("/:id/profile-picture", upload.single("foto"), subirFotoPerfil);
router.delete("/:id/profile-picture", eliminarFotoPerfil);

async function listarUsuarios(req, res, next) {
  try {
    const items = await controlador.todosUsuario();
    respuesta.success(req, res, items, 200);
  } catch (err) {
    next(err);
  }
}

async function obtenerUsuario(req, res, next) {
  try {
    const item = await controlador.unoUsuario(req.params.id);
    if (!item) {
      return respuesta.error(req, res, 'Usuario no encontrado', 404);
    }
    respuesta.success(req, res, item, 200);
  } catch (err) {
    next(err);
  }
}

async function agregarUsuario(req, res, next) {
  try {
    await controlador.agregarUsuario(req.body);
    respuesta.success(req, res, "Usuario agregado correctamente", 201);
  } catch (err) {
    next(err);
  }
}

async function actualizarUsuario(req, res, next) {
  try {
    const data = { ...req.body, id: req.params.id };
    await controlador.actualizarUsuario(data);
    respuesta.success(req, res, "Usuario actualizado correctamente", 200);
  } catch (err) {
    next(err);
  }
}

async function eliminarUsuario(req, res, next) {
  try {
    await controlador.eliminarUsuario(req.params.id);
    respuesta.success(req, res, "Usuario eliminado correctamente", 200);
  } catch (err) {
    next(err);
  }
}

async function cambiarPasswordUsuario(req, res, next) {
  try {
    const { passwordActual, nuevoPassword } = req.body;

    if (!passwordActual || !nuevoPassword) {
      throw new Error(
        "Se requieren tanto la contraseña actual como la nueva contraseña"
      );
    }

    await controlador.cambiarPassword(
      req.params.id,
      passwordActual,
      nuevoPassword
    );
    respuesta.success(req, res, "Contraseña actualizada correctamente", 200);
  } catch (err) {
    next(err);
  }
}

async function subirFotoPerfil(req, res, next) {
  try {
    if (!req.file) {
      throw new Error("No se subió ningún archivo");
    }

    const relativePath = path.join(
      "uploads",
      "profile-pictures",
      path.basename(req.file.path)
    );

    await controlador.actualizarFotoPerfil(req.params.id, relativePath);

    respuesta.success(
      req,
      res,
      {
        message: "Foto de perfil actualizada correctamente",
        fotoUrl: relativePath,
      },
      200
    );
  } catch (err) {
    next(err);
  }
}

async function eliminarFotoPerfil(req, res, next) {
  try {
    await controlador.eliminarFotoPerfil(req.params.id);
    respuesta.success(req, res, "Foto de perfil eliminada correctamente", 200);
  } catch (err) {
    next(err);
  }
}

module.exports = router;
