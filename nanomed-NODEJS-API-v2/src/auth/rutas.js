const express = require("express");
const router = express.Router();
const controlador = require("./controlador");
const { verifyToken } = require("./middlewares");
const validaciones = require("./validaciones");
const { loginLimiter, registerLimiter, checkAccountLock } = require("./middlewares");
const { validatePasswordStrength } = require("../utils/security");

// Rutas públicas
router.post("/register", 
  registerLimiter,
  validaciones.register, 
  controlador.register
);

router.post("/login",
  loginLimiter,
  checkAccountLock,
  validaciones.login,
  controlador.login
);

router.post("/refresh",
  validaciones.refresh,
  controlador.refresh
);

router.post("/forgot-password",
  loginLimiter,
  validaciones.forgotPassword,
  controlador.forgotPassword
);

router.post("/reset-password",
  loginLimiter,
  validaciones.resetPassword,
  controlador.resetPassword
);

router.get("/verify-email/:token",
  validaciones.verifyEmail,
  controlador.verifyEmail
);

// Ruta de prueba para verificar token sin validaciones
router.get("/test-verify-email/:token",
  controlador.testVerifyEmail
);

router.post("/resend-verification",
  registerLimiter, // Usar el mismo rate limiting que registro
  validaciones.resendVerificationEmail,
  controlador.resendVerificationEmail
);

// Rutas protegidas (requieren autenticación)
router.post("/logout",
  verifyToken,
  controlador.logout
);

router.post("/refresh-token",
  loginLimiter,
  validaciones.refresh,
  controlador.refresh
);

// Rutas MFA
const mfaRouter = express.Router();

// Iniciar configuración MFA (obtener QR/secreto)
mfaRouter.post("/setup",
  verifyToken,
  controlador.setupMFA
);

// Habilitar MFA con código de verificación
mfaRouter.post("/enable",
  verifyToken,
  validaciones.enableMFA,
  controlador.enableMFA
);

mfaRouter.post("/verify",
  loginLimiter,
  validaciones.verifyMFA,
  controlador.verifyMFA
);

mfaRouter.post("/disable",
  verifyToken,
  controlador.disableMFA
);

// Mantener las rutas antiguas por compatibilidad
router.post("/enable-mfa",
  verifyToken,
  validaciones.enableMFA,
  controlador.enableMFA
);

router.post("/verify-mfa",
  loginLimiter,
  validaciones.verifyMFA,
  controlador.verifyMFA
);

router.post("/disable-mfa",
  verifyToken,
  controlador.disableMFA
);

// Montar las rutas MFA en /mfa
router.use("/mfa", mfaRouter);

// POST /api/auth/check-password-strength - Verificar fortaleza de contraseña
router.post("/check-password-strength", async (req, res, next) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        error: true,
        message: "Se requiere una contraseña para verificar"
      });
    }
    
    const result = validatePasswordStrength(password);
    
    res.json({
      error: false,
      data: {
        isValid: result.isValid,
        strength: result.strength,
        score: result.score,
        errors: result.errors,
        suggestions: result.suggestions
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
