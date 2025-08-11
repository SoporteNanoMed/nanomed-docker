const express = require("express");
const router = express.Router();
const controlador = require("./controlador");
const { verifyToken } = require("../../auth/middlewares");

// Obtener contactos de emergencia del usuario actual
router.get("/", verifyToken, controlador.obtenerContactosEmergencia);

// Agregar contacto de emergencia
router.post("/", verifyToken, controlador.agregarContactoEmergencia);

// Actualizar contacto de emergencia
router.put("/:id", verifyToken, controlador.actualizarContactoEmergencia);

// Eliminar contacto de emergencia
router.delete("/:id", verifyToken, controlador.eliminarContactoEmergencia);

module.exports = router; 