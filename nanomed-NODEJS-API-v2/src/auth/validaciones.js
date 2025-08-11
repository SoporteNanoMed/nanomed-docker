const { check, validationResult } = require("express-validator");
const { error } = require("../middleware/errors");
const { validarRUT, validarTelefonoChileno } = require("../middleware/sanitization");

const register = [
  check("nombre").notEmpty().withMessage("El nombre es requerido")
    .isLength({ min: 2, max: 100 }).withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage("El nombre solo puede contener letras y espacios"),
  
  check("apellido").notEmpty().withMessage("El apellido es requerido")
    .isLength({ min: 2, max: 100 }).withMessage("El apellido debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage("El apellido solo puede contener letras y espacios"),
  
  check("email").notEmpty().withMessage("El email es requerido")
    .isEmail().withMessage("Email inválido")
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage("El email es demasiado largo"),
  
  check("password")
    .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage("La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial"),
  
  check("fecha_nacimiento")
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      
      const birthDate = new Date(value);
      if (isNaN(birthDate.getTime())) {
        throw new Error("Fecha de nacimiento inválida");
      }

      const today = new Date();
      const minDate = new Date();
      const maxDate = new Date();
      
      minDate.setFullYear(today.getFullYear() - 120); // Máximo 120 años
      maxDate.setFullYear(today.getFullYear() - 13);  // Mínimo 13 años
      
      if (birthDate > today) {
        throw new Error("La fecha de nacimiento no puede ser futura");
      }

      if (birthDate < minDate || birthDate > maxDate) {
        throw new Error("La edad debe estar entre 13 y 120 años");
      }
      
      return true;
    }),
  
  check("rut")
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      
      if (!validarRUT(value)) {
        throw new Error("El RUT no es válido");
      }
      
      return true;
    }),
  
  check("telefono")
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      
      if (!validarTelefonoChileno(value)) {
        throw new Error("Número de teléfono chileno inválido");
      }
      
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

const login = [
  check("email").isEmail().withMessage("Email inválido"),
  check("password").notEmpty().withMessage("La contraseña es requerida"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

const forgotPassword = [
  check("email").isEmail().withMessage("Email inválido"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

const resetPassword = [
  check("token").notEmpty().withMessage("Token requerido"),
  check("newPassword")
    .isLength({ min: 8 }).withMessage("La contraseña debe tener al menos 8 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage("La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

const verifyMFA = [
  check("email").isEmail().withMessage("Email inválido"),
  check("mfaCode")
    .isLength({ min: 6, max: 6 })
    .withMessage("El código MFA debe tener 6 dígitos"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

const enableMFA = [
  check("token")
    .isLength({ min: 6, max: 6 })
    .withMessage("El token debe tener 6 dígitos"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

const verifyEmail = [
  check("token")
    .notEmpty()
    .withMessage("Token de verificación requerido"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

const resendVerificationEmail = [
  check("email")
    .isEmail()
    .withMessage("Email inválido")
    .normalizeEmail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

const refresh = [
  check("refreshToken")
    .notEmpty()
    .withMessage("El refresh token es requerido"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

module.exports = {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyMFA,
  enableMFA,
  verifyEmail,
  resendVerificationEmail,
  refresh
};
