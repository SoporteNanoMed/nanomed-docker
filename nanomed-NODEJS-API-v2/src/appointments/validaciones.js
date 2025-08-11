const { check, validationResult } = require("express-validator");
const { error } = require("../middleware/errors");
const { validarFechaFutura } = require("../utils/dateUtils");

// Validaciones para crear cita
const crearCita = [
  check("medico_id")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("ID de médico inválido"),
  
  check("fecha_hora")
    .notEmpty()
    .withMessage("La fecha y hora son requeridas")
    .isISO8601()
    .withMessage("Formato de fecha inválido")
    .custom((value) => {
      // BLOQUEO ELIMINADO: Permitir agendar en cualquier fecha/hora
      // Solo validar que sea una fecha válida
      const fechaCita = new Date(value);
      if (isNaN(fechaCita.getTime())) {
        throw new Error("Formato de fecha inválido");
      }
      
      return true;
    }),
  
  check("duracion")
    .optional({ checkFalsy: true })
    .isInt({ min: 15, max: 480 })
    .withMessage("La duración debe estar entre 15 y 480 minutos"),
  
  check("lugar")
    .optional({ checkFalsy: true })
    .isLength({ max: 255 })
    .withMessage("El lugar es demasiado largo")
    .trim()
    .escape(),
  
  check("direccion")
    .optional({ checkFalsy: true })
    .isLength({ max: 255 })
    .withMessage("La dirección es demasiado larga")
    .trim()
    .escape(),
  
  check("notas")
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage("Las notas son demasiado largas")
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

// Validaciones para actualizar cita
const actualizarCita = [
  check("fecha_hora")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Formato de fecha inválido")
    .custom((value) => {
      if (!value) return true;
      
      // BLOQUEO ELIMINADO: Permitir actualizar a cualquier fecha/hora
      // Solo validar que sea una fecha válida
      const fechaCita = new Date(value);
      if (isNaN(fechaCita.getTime())) {
        throw new Error("Formato de fecha inválido");
      }
      
      return true;
    }),
  
  check("duracion")
    .optional({ checkFalsy: true })
    .isInt({ min: 15, max: 480 })
    .withMessage("La duración debe estar entre 15 y 480 minutos"),
  
  check("lugar")
    .optional({ checkFalsy: true })
    .isLength({ max: 255 })
    .withMessage("El lugar es demasiado largo")
    .trim()
    .escape(),
  
  check("direccion")
    .optional({ checkFalsy: true })
    .isLength({ max: 255 })
    .withMessage("La dirección es demasiado larga")
    .trim()
    .escape(),
  
  check("notas")
    .optional({ checkFalsy: true })
    .isLength({ max: 1000 })
    .withMessage("Las notas son demasiado largas")
    .trim()
    .escape(),
  
  check("estado")
    .optional({ checkFalsy: true })
    .isIn(["programada", "confirmada", "completada", "cancelada"])
    .withMessage("Estado de cita inválido"),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

// Validaciones para filtros de búsqueda de citas
const filtrosCitas = [
  check("fecha_desde")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Formato de fecha_desde inválido"),
  
  check("fecha_hasta")
    .optional({ checkFalsy: true })
    .isISO8601()
    .withMessage("Formato de fecha_hasta inválido"),
  
  check("estado")
    .optional({ checkFalsy: true })
    .isIn(["programada", "confirmada", "completada", "cancelada"])
    .withMessage("Estado de filtro inválido"),
  
  check("medico_id")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("ID de médico inválido"),
  
  check("paciente_id")
    .optional({ checkFalsy: true })
    .isInt({ min: 1 })
    .withMessage("ID de paciente inválido"),
  
  check("limite")
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 100 })
    .withMessage("El límite debe estar entre 1 y 100"),
  
  check("offset")
    .optional({ checkFalsy: true })
    .isInt({ min: 0 })
    .withMessage("El offset debe ser mayor o igual a 0"),
  
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

// Validación para ID de cita
const validarIdCita = [
  check("id")
    .isInt({ min: 1 })
    .withMessage("ID de cita inválido"),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(error(errors.array()[0].msg, 400));
    }
    next();
  },
];

module.exports = {
  crearCita,
  actualizarCita,
  filtrosCitas,
  validarIdCita
}; 