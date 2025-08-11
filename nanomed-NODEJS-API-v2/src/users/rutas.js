const express = require("express");
const router = express.Router();
const controlador = require("./controlador");
const { verifyToken } = require("../auth/middlewares");
const { profilePictureUpload } = require("../middleware/azureUpload");
const emergencyContactsRoutes = require("./emergency-contacts/rutas");
const medicalInfoRoutes = require("./medical-info/rutas");

// Obtener perfil del usuario actual
router.get("/me", verifyToken, controlador.obtenerPerfilUsuario);

// Actualizar perfil del usuario actual
router.put("/me", verifyToken, controlador.actualizarPerfilUsuario);

// Cambiar contraseña del usuario actual
router.put("/me/password", verifyToken, controlador.cambiarPasswordUsuario);

// Subir/actualizar foto de perfil usando Azure Blob Storage
router.post("/me/profile-picture", 
  verifyToken, 
  profilePictureUpload, 
  controlador.subirFotoPerfil
);

// Eliminar foto de perfil
router.delete("/me/profile-picture", 
  verifyToken, 
  controlador.eliminarFotoPerfil
);

// Endpoint de prueba para subida de archivos
router.post("/test-upload", 
  verifyToken, 
  profilePictureUpload, 
  controlador.probarSubidaArchivo
);

// Diagnóstico de Azure Blob Storage (solo para desarrollo)
router.get("/diagnostic/azure", 
  verifyToken, 
  controlador.diagnosticarAzure
);

// Migrar fotos de perfil existentes a Azure (solo para administradores)
router.post("/migrate-profile-pictures", 
  verifyToken, 
  controlador.migrarFotosPerfil
);

// Rutas de contactos de emergencia
router.use("/me/emergency-contacts", emergencyContactsRoutes);

// Rutas de información médica
router.use("/me/medical-info", medicalInfoRoutes);

module.exports = router; 