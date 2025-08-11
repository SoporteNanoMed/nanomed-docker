const UserRepository = require("../repositories/UserRepository");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../../config");

const userRepository = new UserRepository();

async function register(req, res, next) {
  try {
    const { email, password, name, role = "user" } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: true,
        message: "El correo electrónico ya está registrado",
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      name,
      role,
    });

    res.status(201).json({
      error: false,
      message: "Usuario registrado exitosamente. Por favor verifica tu email.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Buscar usuario por email
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: true,
        message: "Credenciales inválidas",
      });
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: true,
        message: "Credenciales inválidas",
      });
    }

    // Verificar si el usuario está activo
    if (!user.isActive) {
      return res.status(401).json({
        error: true,
        message: "Cuenta deshabilitada",
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.app.jwtSecret,
      { expiresIn: config.app.jwtExpiration }
    );

    // Actualizar último login
    await userRepository.updateLastLogin(user.id);

    res.json({
      error: false,
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    });
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    // En una implementación real, podrías invalidar el token
    // Por ahora, solo devolvemos un mensaje de éxito
    res.json({
      error: false,
      message: "Logout exitoso",
    });
  } catch (err) {
    next(err);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const { token } = req.params;
    
    const success = await userRepository.verifyEmail(token);
    
    if (success) {
      res.json({
        error: false,
        message: "Email verificado exitosamente",
      });
    } else {
      res.status(400).json({
        error: true,
        message: "Token de verificación inválido o expirado",
      });
    }
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "Usuario no encontrado",
      });
    }

    // Generar token de reset
    const resetToken = require("crypto").randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 3600000); // 1 hora

    await userRepository.setResetPasswordToken(email, resetToken, resetExpires);

    // Aquí enviarías el email con el token
    // Por ahora solo devolvemos el token para pruebas
    res.json({
      error: false,
      message: "Se ha enviado un email con instrucciones para resetear la contraseña",
      resetToken, // Solo para desarrollo
    });
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    
    const success = await userRepository.resetPassword(token, newPassword);
    
    if (success) {
      res.json({
        error: false,
        message: "Contraseña actualizada exitosamente",
      });
    } else {
      res.status(400).json({
        error: true,
        message: "Token inválido o expirado",
      });
    }
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
