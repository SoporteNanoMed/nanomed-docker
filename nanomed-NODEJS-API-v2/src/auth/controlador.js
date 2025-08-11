const servicios = require("./servicios");
const { error } = require("../middleware/errors");

async function register(req, res, next) {
  try {
    const result = await servicios.registerUser(req.body);
    res.status(201).json({ message: result.message });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await servicios.loginUser(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const result = await servicios.logoutUser(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body;
    const result = await servicios.refreshToken(refreshToken);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const result = await servicios.forgotPassword(email);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    const result = await servicios.resetPassword(token, newPassword);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params;
    console.log("Token recibido en controlador:", token);
    const result = await servicios.verifyEmail(token);
    res.json(result);
  } catch (err) {
    console.error("Error en controlador verifyEmail:", err);
    next(err);
  }
}

// Función de prueba para verificar token
async function testVerifyEmail(req, res, next) {
  try {
    const { token } = req.params;
    console.log("Token de prueba recibido:", token);
    
    // Buscar usuario por token sin validaciones
    const db = require("../db/sqlserver");
    const result = await db.unoUsuario("Usuarios", { verification_token: token });
    
    console.log("Resultado de búsqueda directa:", result);
    
    if (result && result.length > 0) {
      const user = result[0];
      res.json({
        found: true,
        user: {
          id: user.id,
          email: user.email,
          verification_token: user.verification_token,
          verification_token_expires: user.verification_token_expires,
          email_verified: user.email_verified
        }
      });
    } else {
      res.json({
        found: false,
        message: "Token no encontrado en la base de datos"
      });
    }
  } catch (err) {
    console.error("Error en testVerifyEmail:", err);
    next(err);
  }
}

async function resendVerificationEmail(req, res, next) {
  try {
    const { email } = req.body;
    const result = await servicios.resendVerificationEmail(email);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function enableMFA(req, res, next) {
  try {
    const result = await servicios.enableMFA(req.user.id, req.body.token);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function verifyMFA(req, res, next) {
  try {
    const { email, mfaCode } = req.body;
    const result = await servicios.verifyMFACode(email, mfaCode);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function disableMFA(req, res, next) {
  try {
    const result = await servicios.disableMFA(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function setupMFA(req, res, next) {
  try {
    const result = await servicios.setupMFA(req.user.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  setupMFA,
  enableMFA,
  verifyMFA,
  disableMFA,
  testVerifyEmail
};
