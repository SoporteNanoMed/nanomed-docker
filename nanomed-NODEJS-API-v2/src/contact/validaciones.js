const { check, validationResult } = require("express-validator");
const { error } = require("../middleware/errors");
const { validarTelefonoChileno } = require("../middleware/sanitization");

// Lista de servicios válidos (debe coincidir con los del frontend)
const serviciosValidos = [
  "Imagenología",
  "Laboratorio", 
  "Telemedicina",
  "Salud Ocupacional",
  "Vacunatorio",
  "Servicio de ambulancia 4x4",
  "Consulta General",
  "Otro"
];

// Validaciones para enviar mensaje de contacto
const validarMensajeContacto = [
  check("nombreApellido")
    .notEmpty()
    .withMessage("El nombre y apellido son requeridos")
    .isLength({ min: 2, max: 200 })
    .withMessage("El nombre y apellido debe tener entre 2 y 200 caracteres")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
    .withMessage("El nombre y apellido solo puede contener letras y espacios")
    .trim()
    .escape(),
    
  check("empresa")
    .optional({ checkFalsy: true })
    .isLength({ max: 200 })
    .withMessage("El nombre de la empresa es demasiado largo (máximo 200 caracteres)")
    .trim()
    .escape(),
    
  check("servicio")
    .notEmpty()
    .withMessage("Debe seleccionar un servicio de interés")
    .isIn(serviciosValidos)
    .withMessage("El servicio seleccionado no es válido")
    .trim()
    .escape(),
    
  check("telefono")
    .notEmpty()
    .withMessage("El teléfono es requerido")
    .custom((value) => {
      if (!validarTelefonoChileno(value)) {
        throw new Error("Número de teléfono chileno inválido. Use el formato +56912345678 o 912345678");
      }
      return true;
    }),
    
  check("email")
    .notEmpty()
    .withMessage("El email es requerido")
    .isEmail()
    .withMessage("Debe proporcionar un email válido")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("El email es demasiado largo"),
    
  check("mensaje")
    .notEmpty()
    .withMessage("El mensaje es requerido")
    .isLength({ min: 10, max: 2000 })
    .withMessage("El mensaje debe tener entre 10 y 2000 caracteres")
    .trim()
    .escape(),

  // Middleware para manejar errores de validación
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Obtener el primer error para mostrarlo
      const firstError = errors.array()[0];
      return next(error(firstError.msg, 400));
    }
    next();
  },
];

module.exports = {
  validarMensajeContacto,
  serviciosValidos
}; 