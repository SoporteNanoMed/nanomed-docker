const { check, validationResult } = require("express-validator");
const { error } = require("../middleware/errors");
const { validarRUT, validarTelefonoChileno } = require("../middleware/sanitization");

// Validaciones para actualizar perfil de usuario
const actualizarPerfil = [
  check("nombre")
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios")
    .trim()
    .escape(),
  
  check("apellido")
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage("El apellido debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El apellido solo puede contener letras y espacios")
    .trim()
    .escape(),
  
  check("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Email inválido")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("El email es demasiado largo"),
  
  check("telefono")
    .optional({ checkFalsy: true })
    .custom((value) => {
      if (!value) return true;
      
      if (!validarTelefonoChileno(value)) {
        throw new Error("Número de teléfono chileno inválido");
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
  
  check("fecha_nacimiento")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Fecha de nacimiento inválida")
    .custom((value) => {
      if (!value) return true;
      
      const birthDate = new Date(value);
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
  
  check("genero")
    .optional({ checkFalsy: true })
    .isIn(["Masculino", "Femenino", "Otro", "Prefiero no decir"])
    .withMessage("Género inválido"),
  
  check("direccion")
    .optional({ checkFalsy: true })
    .isLength({ max: 255 })
    .withMessage("La dirección es demasiado larga")
    .trim()
    .escape(),
  
  check("ciudad")
    .optional({ checkFalsy: true })
    .isLength({ max: 100 })
    .withMessage("La ciudad es demasiado larga")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("La ciudad solo puede contener letras y espacios")
    .trim()
    .escape(),
  
  check("region")
    .optional({ checkFalsy: true })
    .isLength({ max: 100 })
    .withMessage("La región es demasiado larga")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("La región solo puede contener letras y espacios")
    .trim()
    .escape(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

// Validaciones para cambiar contraseña
const cambiarPassword = [
  check("currentPassword")
    .notEmpty()
    .withMessage("La contraseña actual es requerida"),
  
  check("newPassword")
    .isLength({ min: 8, max: 128 })
    .withMessage("La nueva contraseña debe tener entre 8 y 128 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage("La nueva contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial"),
  
  check("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Las contraseñas no coinciden");
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

// Validaciones para información médica
const actualizarInfoMedica = [
  check("grupo_sanguineo")
    .optional({ checkFalsy: true })
    .isIn(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"])
    .withMessage("Grupo sanguíneo inválido"),
  
  check("alergias")
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage("El campo alergias es demasiado largo")
    .trim()
    .escape(),
  
  check("medicamentos")
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage("El campo medicamentos es demasiado largo")
    .trim()
    .escape(),
  
  check("condiciones_medicas")
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage("El campo condiciones médicas es demasiado largo")
    .trim()
    .escape(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

// Validaciones para contacto de emergencia
const contactoEmergencia = [
  check("nombre")
    .notEmpty()
    .withMessage("El nombre del contacto es requerido")
    .isLength({ min: 2, max: 200 })
    .withMessage("El nombre debe tener entre 2 y 200 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios")
    .trim()
    .escape(),
  
  check("relacion")
    .optional({ checkFalsy: true })
    .isLength({ max: 100 })
    .withMessage("La relación es demasiado larga")
    .trim()
    .escape(),
  
  check("telefono")
    .notEmpty()
    .withMessage("El teléfono del contacto es requerido")
    .custom((value) => {
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

module.exports = {
  actualizarPerfil,
  cambiarPassword,
  actualizarInfoMedica,
  contactoEmergencia
}; 