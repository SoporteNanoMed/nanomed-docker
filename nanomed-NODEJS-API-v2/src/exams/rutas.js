const express = require("express");
const router = express.Router();

// Importar rutas del blob storage
const blobRutas = require("./blobRutas");

// Usar solo rutas del blob storage para la gestión de exámenes
router.use("/", blobRutas);

module.exports = router; 