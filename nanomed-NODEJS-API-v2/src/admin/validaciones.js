const { check, validationResult } = require("express-validator");
const { error } = require("../middleware/errors");
const { validarRUT, validarTelefonoChileno } = require("../middleware/sanitization");

// Validaciones para crear médico
const crearMedico = [
  check("nombre")
    .notEmpty()
    .withMessage("El nombre es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),
  
  check("apellido")
    .notEmpty()
    .withMessage("El apellido es requerido")
    .isLength({ min: 2, max: 100 })
    .withMessage("El apellido debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El apellido solo puede contener letras y espacios"),
  
  check("email")
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Email inválido")
    .normalizeEmail(),
  
  check("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage("La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial"),
  
  check("especialidad")
    .notEmpty()
    .withMessage("La especialidad es requerida")
    .isLength({ min: 2, max: 100 })
    .withMessage("La especialidad debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("La especialidad solo puede contener letras y espacios"),
  
  check("telefono")
    .optional({ checkFalsy: true })
    .isMobilePhone("es-CL")
    .withMessage("Número de teléfono inválido"),
  
  check("rut")
    .optional({ checkFalsy: true })
    .matches(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/)
    .withMessage("Formato de RUT inválido (ej: 12.345.678-9)"),
  
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
      maxDate.setFullYear(today.getFullYear() - 18);  // Mínimo 18 años para médicos
      
      if (birthDate > today) {
        throw new Error("La fecha de nacimiento no puede ser futura");
      }

      if (birthDate < minDate || birthDate > maxDate) {
        throw new Error("La edad debe estar entre 18 y 120 años");
      }
      
      return true;
    }),
  
  check("genero")
    .optional({ checkFalsy: true })
    .isIn(["Masculino", "Femenino", "Otro", "Prefiero no decir"])
    .withMessage("Género inválido"),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

// Validaciones para actualizar usuario
const actualizarUsuario = [
  check("nombre")
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),
  
  check("apellido")
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage("El apellido debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El apellido solo puede contener letras y espacios"),
  
  check("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Email inválido")
    .normalizeEmail(),
  
  check("password")
    .optional({ checkFalsy: true })
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage("La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial"),
  
  check("telefono")
    .optional({ checkFalsy: true })
    .isMobilePhone("es-CL")
    .withMessage("Número de teléfono inválido"),
  
  check("rut")
    .optional({ checkFalsy: true })
    .matches(/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/)
    .withMessage("Formato de RUT inválido (ej: 12.345.678-9)"),
  
  check("role")
    .optional({ checkFalsy: true })
    .isIn(["user", "medico", "admin", "api"])
    .withMessage("Rol inválido"),
  
  check("email_verified")
    .optional({ checkFalsy: true })
    .isBoolean()
    .withMessage("email_verified debe ser un valor booleano"),
  
  check("genero")
    .optional({ checkFalsy: true })
    .isIn(["Masculino", "Femenino", "Otro", "Prefiero no decir"])
    .withMessage("Género inválido"),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

// Validaciones para actualizar médico
const actualizarMedico = [
  check("nombre")
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre solo puede contener letras y espacios"),
  
  check("apellido")
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage("El apellido debe tener entre 2 y 100 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El apellido solo puede contener letras y espacios"),
  
  check("email")
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage("Email inválido")
    .normalizeEmail(),
  
  check("especialidad")
    .optional({ checkFalsy: true })
    .isLength({ min: 2, max: 100 })
    .withMessage("La especialidad debe tener entre 2 y 100 caracteres"),
  
  check("telefono")
    .optional({ checkFalsy: true })
    .isMobilePhone("es-CL")
    .withMessage("Número de teléfono inválido"),
  
  check("activo")
    .optional({ checkFalsy: true })
    .isBoolean()
    .withMessage("activo debe ser un valor booleano"),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

// Validación para parámetros de ID
const validarId = [
  check("id")
    .isInt({ min: 1 })
    .withMessage("ID debe ser un número entero positivo"),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

// Validaciones para filtros de fecha
const validarFiltrosFecha = [
  check("fecha_desde")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("fecha_desde debe ser una fecha válida en formato ISO"),
  
  check("fecha_hasta")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("fecha_hasta debe ser una fecha válida en formato ISO"),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    
    // Validar que fecha_desde sea anterior a fecha_hasta
    if (req.query.fecha_desde && req.query.fecha_hasta) {
      const fechaDesde = new Date(req.query.fecha_desde);
      const fechaHasta = new Date(req.query.fecha_hasta);
      
      if (fechaDesde > fechaHasta) {
        return next(error("fecha_desde debe ser anterior a fecha_hasta", 400));
      }
    }
    
    next();
  },
];

// Validaciones para crear usuarios con roles especiales
const crearUsuarioEspecial = [
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
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

module.exports = {
  crearMedico,
  actualizarUsuario,
  actualizarMedico,
  validarId,
  validarFiltrosFecha,
  crearUsuarioEspecial
}; 