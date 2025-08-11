const express = require("express");
const router = express.Router();
const controlador = require("./controlador");
const { verifyToken } = require("../../auth/middlewares");

// Obtener información médica del usuario actual
router.get("/", verifyToken, controlador.obtenerInformacionMedica);

// Actualizar información médica del usuario actual
router.put("/", verifyToken, controlador.actualizarInformacionMedica);

module.exports = router; 