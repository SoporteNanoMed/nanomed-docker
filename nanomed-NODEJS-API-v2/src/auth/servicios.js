const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const db = require("../db/sqlserver");
const config = require("../../config");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const { error } = require("../middleware/errors");
const { hashPassword, verifyPassword, sanitizeUserData, needsRehash } = require("../utils/security");
const mailService = require("../utils/mailService");
const TABLA = "Usuarios";

// Generar tokens JWT
function generateTokens(user) {
  // Limpiar datos del usuario antes de generar tokens
  // No incluir datos sensibles
  const userData = {
    id: user.id,
    role: user.role,
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    genero: user.genero,
  };

  const accessToken = jwt.sign(userData, config.app.jwtSecret, {
    expiresIn: config.app.jwtExpiration,
  });

  const refreshToken = jwt.sign(
    { ...userData, isRefresh: true },
    config.app.jwtSecret,
    { expiresIn: config.app.jwtRefreshExpiration }
  );

  return {
    accessToken,
    refreshToken,
    user: userData,
  };
}

async function verifyMFACode(email, mfaCode) {
  try {
    const [user] = await db.unoUsuario(TABLA, { email });

    if (!user) {
      throw error("Usuario no encontrado", 404);
    }

    if (!user.mfa_token || new Date(user.mfa_token_expires) < new Date()) {
      throw error("Token MFA inválido o expirado", 401);
    }

    const codeMatch = await bcrypt.compare(mfaCode, user.mfa_code_hash || "");
    if (!codeMatch) {
      throw error("Código MFA incorrecto", 401);
    }

    // Limpiar datos MFA
    await db.actualizarUsuario(TABLA, {
      id: user.id,
      mfa_token: null,
      mfa_token_expires: null,
      mfa_code_hash: null,
    });

    return generateTokens(user);
  } catch (err) {
    throw err;
  }
}

async function setupMFA(userId) {
  try {
    const [user] = await db.unoUsuario(TABLA, { id: userId });

    if (!user) {
      throw error("Usuario no encontrado", 404);
    }

    // Verificar si MFA ya está configurado
    if (user.mfa_enabled) {
      throw error("MFA ya está habilitado para este usuario", 400);
    }

    // Generar secreto para aplicaciones autenticadoras
    const secret = speakeasy.generateSecret({
      name: `Nanomed:${user.email}`,
      issuer: "Nanomed"
    });

    // Generar código QR
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Guardar el secreto en la base de datos
    await db.actualizarUsuario(TABLA, {
      id: userId,
      mfa_secret: secret.base32,
      mfa_enabled: false // No habilitado hasta que se verifique
    });

    return {
      secret: secret.base32,
      qrCode: qrCodeUrl,
      otpauthUrl: secret.otpauth_url,
      message: "Escanea el código QR con tu aplicación autenticadora"
    };
  } catch (err) {
    throw err;
  }
}

async function enableMFA(userId, token) {
  try {
    const [user] = await db.unoUsuario(TABLA, { id: userId });

    if (!user || !user.mfa_secret) {
      throw error("Configuración MFA no encontrada. Por favor, configure MFA primero", 400);
    }

    if (user.mfa_enabled) {
      throw error("MFA ya está habilitado", 400);
    }

    const verified = speakeasy.totp.verify({
      secret: user.mfa_secret,
      encoding: "base32",
      token: token,
      window: 1 // Permite una ventana de 30 segundos antes/después
    });

    if (!verified) {
      throw error("Código de verificación inválido", 401);
    }

    await db.actualizarUsuario(TABLA, {
      id: userId,
      mfa_enabled: true
    });

    return { 
      message: "MFA habilitado exitosamente",
      mfa_enabled: true
    };
  } catch (err) {
    throw err;
  }
}

async function disableMFA(userId) {
  try {
    const [user] = await db.unoUsuario(TABLA, { id: userId });

    if (!user) {
      throw error("Usuario no encontrado", 404);
    }

    await db.actualizarUsuario(TABLA, {
      id: userId,
      mfa_enabled: false,
      mfa_secret: null,
      mfa_token: null,
      mfa_token_expires: null,
      mfa_code_hash: null
    });

    return { message: "MFA deshabilitado exitosamente" };
  } catch (err) {
    throw err;
  }
}

// Registrar un nuevo usuario
async function registerUser(userData) {
  try {
    // Verificar si el email ya existe
    const existingEmail = await db.unoUsuario(TABLA, { email: userData.email });
    if (existingEmail.length > 0) {
      throw error("El email ya está registrado", 400);
    }

    // Verificar si el RUT ya existe
    if (userData.rut) {
      const existingRut = await db.unoUsuario(TABLA, { rut: userData.rut });
      if (existingRut.length > 0) {
        throw error("El RUT ya está registrado", 400);
      }
    }

    // Hash de la contraseña usando utilidad centralizada
    const hashedPassword = await hashPassword(userData.password);

    // Generar token de verificación con expiración de 24 horas
    const verification_token = uuidv4();
    const verification_token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Validar rol - solo permitir 'user' en registro público
    // Los roles especiales (medico, recepcionista, admin) solo pueden ser asignados por administradores
    const role = 'user'; // Forzar rol de usuario para registro público

    // Crear usuario - solo incluir campos necesarios
    const newUser = {
      nombre: userData.nombre,
      apellido: userData.apellido,
      email: userData.email,
      password_hash: hashedPassword,
      telefono: userData.telefono,
      rut: userData.rut,
      fecha_nacimiento: userData.fecha_nacimiento,
      genero: userData.genero,
      direccion: userData.direccion,
      ciudad: userData.ciudad,
      region: userData.region,
      foto_perfil: userData.foto_perfil,
      email_verified: false,
      verification_token,
      verification_token_expires,
      role: role,
      login_attempts: 0,
      mfa_enabled: false
    };

    // Insertar en la base de datos
    await db.insertarUsuario(TABLA, newUser);

    // Intentar enviar el email de verificación
    try {
      const userName = `${newUser.nombre} ${newUser.apellido}`;
      const info = await mailService.sendVerificationEmail(
        newUser.email,
        verification_token,
        userName
      );

      return {
        message: "Usuario registrado exitosamente. Por favor verifica tu email.",
        email: newUser.email,
        role: role,
        emailStatus: info.status
      };
    } catch (emailError) {
      console.error("Error al enviar email de verificación:", emailError);
      
      // El usuario se registró pero no se pudo enviar el email
      return {
        message: "Usuario registrado exitosamente, pero hubo un problema al enviar el email de verificación. Por favor contacta al soporte.",
        email: newUser.email,
        role: role,
        verification_token // Incluimos el token para verificación manual si es necesario
      };
    }
  } catch (err) {
    // Si el error es de la base de datos, eliminamos el usuario si se creó
    if (err.code === "ER_DUP_ENTRY") {
      throw error("El email o RUT ya está registrado", 400);
    }
    throw err;
  }
}

async function sendMFACode(user, token) {
  // Implementación para enviar el código MFA
  // Podría ser por email, SMS, o generación de código TOTP
  const mfaCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6 dígitos

  // Guardar código en DB (hasheado)
  const hashedCode = await bcrypt.hash(mfaCode, 8);
  await db.actualizarUsuario(TABLA, {
    id: user.id,
    mfa_code_hash: hashedCode,
  });

  // Enviar por email usando Mailgun
  const userName = `${user.nombre} ${user.apellido}`;
  await mailService.sendMFACode(user.email, mfaCode, userName);
}

// Iniciar sesión
async function loginUser(email, password) {
  try {
    console.log("Intento de login para email:", email);
    const [user] = await db.unoUsuario(TABLA, { email });

    if (!user) {
      console.log("Usuario no encontrado para email:", email);
      // Registrar intento fallido (para email no existente también)
      await db.actualizarUsuario(TABLA, {
        email,
        login_attempts: (user?.login_attempts || 0) + 1,
        last_failed_login: new Date(),
      });
      throw error("Credenciales inválidas", 401);
    }

    console.log("Usuario encontrado:", {
      email: user.email,
      emailVerified: user.email_verified,
      loginAttempts: user.login_attempts
    });

    const passwordMatch = await verifyPassword(password, user.password_hash);
    console.log("Resultado de verificación de contraseña:", passwordMatch);

    // Verificar si el hash necesita actualización (rehashing)
    if (passwordMatch && needsRehash(user.password_hash)) {
      console.log("Actualizando hash de contraseña para mayor seguridad");
      const newHash = await hashPassword(password);
      await db.actualizarUsuario(TABLA, {
        id: user.id,
        password_hash: newHash,
      });
    }

    if (!passwordMatch) {
      console.log("Contraseña incorrecta para usuario:", user.email);
      // Incrementar intentos fallidos
      await db.actualizarUsuario(TABLA, {
        id: user.id,
        login_attempts: (user.login_attempts || 0) + 1,
        last_failed_login: new Date(),
      });
      throw error("Credenciales inválidas", 401);
    }

    // Resetear contador de intentos fallidos
    await db.actualizarUsuario(TABLA, {
      id: user.id,
      login_attempts: 0,
      last_failed_login: null,
    });

    if (!user.email_verified) {
      throw error("Por favor verifica tu email antes de iniciar sesión", 403);
    }

    // Verificar si requiere MFA
    if (user.mfa_enabled) {
      const mfaToken = uuidv4();
      await db.actualizarUsuario(TABLA, {
        id: user.id,
        mfa_token: mfaToken,
        mfa_token_expires: new Date(Date.now() + 5 * 60 * 1000), // 5 minutos
      });

      // Enviar código MFA (email, SMS, app authenticator)
      await sendMFACode(user, mfaToken);

      return {
        mfaRequired: true,
        message: "Se requiere autenticación de dos factores",
      };
    }

    return generateTokens(user);
  } catch (err) {
    throw err;
  }
}

// Cerrar sesión
async function logoutUser(userId) {
  try {
    // Verificar que el usuario existe
    const [user] = await db.unoUsuario(TABLA, { id: userId });
    if (!user) {
      throw error("Usuario no encontrado", 404);
    }

    // Invalidar todos los tokens de refresco del usuario
    await db.query(`
      UPDATE RefreshTokens 
      SET is_revoked = 1, 
          revoked_at = GETDATE() 
      WHERE user_id = @userId AND is_revoked = 0
    `, { userId });

    // Limpiar tokens MFA si existen
    await db.actualizarUsuario(TABLA, {
      id: userId,
      mfa_token: null,
      mfa_token_expires: null,
      mfa_code_hash: null
    });

    return { 
      message: "Sesión cerrada exitosamente",
      details: "Todos los tokens han sido invalidados"
    };
  } catch (err) {
    console.error("Error en logout:", err);
    throw err;
  }
}

// Refrescar token
async function refreshToken(refreshToken) {
  try {
    const decoded = jwt.verify(refreshToken, config.app.jwtSecret);

    if (!decoded.isRefresh) {
      throw error("Token inválido", 401);
    }

    // Verificar que el usuario aún existe
    const [user] = await db.unoUsuario(TABLA, decoded.id);
    if (!user) {
      throw error("Usuario no encontrado", 404);
    }

    // Generar nuevo token de acceso
    const accessToken = jwt.sign(
      { id: user.id, role: user.role },
      config.app.jwtSecret,
      { expiresIn: config.app.jwtExpiration }
    );

    return { accessToken };
  } catch (err) {
    throw err;
  }
}

// Solicitar restablecimiento de contraseña
async function forgotPassword(email) {
  try {
    const [user] = await db.unoUsuario(TABLA, { email });

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return {
        message:
          "Si el email existe, se ha enviado un enlace para restablecer la contraseña",
      };
    }

    // Generar token de restablecimiento
    const resetToken = uuidv4();
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora

    // Actualizar usuario con token
    await db.actualizarUsuario(TABLA, {
      id: user.id,
      reset_token: resetToken,
      reset_token_expires: resetTokenExpires,
    });

    // Enviar email usando Mailgun
    const userName = `${user.nombre} ${user.apellido}`;
    const info = await mailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      userName
    );

    return {
      message: "Si el email existe, se ha enviado un enlace para restablecer la contraseña",
      emailStatus: info.status
    };
  } catch (err) {
    console.error("Error en forgotPassword:", err);
    throw err;
  }
}

// Restablecer contraseña
async function resetPassword(token, newPassword) {
  try {
    // Buscar usuario por token
    const [user] = await db.unoUsuario(TABLA, { reset_token: token });

    if (!user) {
      throw error("Token inválido o expirado", 400);
    }

    // Verificar que el token no haya expirado
    if (new Date(user.reset_token_expires) < new Date()) {
      throw error("Token expirado", 400);
    }

    // Hash de la nueva contraseña usando utilidad centralizada
    const hashedPassword = await hashPassword(newPassword);

    // Actualizar usuario
    await db.actualizarUsuario(TABLA, {
      id: user.id,
      password_hash: hashedPassword,
      reset_token: null,
      reset_token_expires: null,
    });

    return { message: "Contraseña restablecida exitosamente" };
  } catch (err) {
    throw err;
  }
}

// Verificar email
async function verifyEmail(token) {
  try {
    console.log("Intentando verificar email con token:", token);

    // Buscar usuario por token
    const result = await db.unoUsuario(TABLA, { verification_token: token });
    console.log("Resultado de búsqueda:", result);

    if (!result || result.length === 0) {
      console.log("No se encontró usuario con el token proporcionado");
      throw error("Token de verificación inválido o expirado", 400);
    }

    const user = result[0];
    console.log("Usuario encontrado:", {
      id: user.id,
      email: user.email,
      verification_token: user.verification_token,
      verification_token_expires: user.verification_token_expires
    });

    // Verificar si el usuario ya está verificado
    if (user.email_verified) {
      throw error("Este email ya ha sido verificado", 400);
    }

    // Verificar si el token ha expirado
    if (user.verification_token_expires && new Date() > new Date(user.verification_token_expires)) {
      console.log("Token de verificación expirado");
      throw error("El token de verificación ha expirado. Por favor solicita un nuevo email de verificación", 400);
    }

    // Actualizar usuario
    await db.actualizarUsuario(TABLA, {
      id: user.id,
      email_verified: true,
      verification_token: null,
      verification_token_expires: null
    });

    console.log("Email verificado exitosamente para usuario:", user.email);

    return { 
      message: "Email verificado exitosamente. Ya puedes iniciar sesión",
      email: user.email,
      verified_at: new Date().toISOString()
    };
  } catch (err) {
    console.error("Error en verificación de email:", err);
    throw err;
  }
}

// Reenviar email de verificación
async function resendVerificationEmail(email) {
  try {
    console.log("Solicitando reenvío de email de verificación para:", email);

    // Buscar usuario por email
    const [user] = await db.unoUsuario(TABLA, { email });

    if (!user) {
      // Por seguridad, no revelamos si el email existe o no
      return {
        message: "Si el email existe y no está verificado, se ha enviado un nuevo enlace de verificación"
      };
    }

    // Verificar si ya está verificado
    if (user.email_verified) {
      throw error("Este email ya ha sido verificado", 400);
    }

    // Generar nuevo token de verificación
    const verification_token = uuidv4();
    const verification_token_expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Actualizar usuario con nuevo token
    await db.actualizarUsuario(TABLA, {
      id: user.id,
      verification_token,
      verification_token_expires
    });

    // Enviar nuevo email de verificación usando Mailgun
    try {
      const userName = `${user.nombre} ${user.apellido}`;
      const info = await mailService.sendVerificationEmail(
        user.email,
        verification_token,
        userName
      );

      return {
        message: "Se ha enviado un nuevo enlace de verificación a tu email",
        email: user.email,
        emailStatus: info.status
      };
    } catch (emailError) {
      console.error("Error al enviar email de verificación:", emailError);
      throw error("Error al enviar el email de verificación. Por favor intenta más tarde", 500);
    }
  } catch (err) {
    console.error("Error en reenvío de email de verificación:", err);
    throw err;
  }
}

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  verifyMFACode,
  setupMFA,
  enableMFA,
  disableMFA
};
