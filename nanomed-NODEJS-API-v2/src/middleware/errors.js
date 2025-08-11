const logger = require('./logger');

class CustomError extends Error {
  constructor(message, code = 500, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = Number(code) || 500;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

function error(message, code = 500, details = {}) {
  // Asegurarse de que el código sea un número válido
  const numericCode = Number(code);
  const validCode = (!isNaN(numericCode) && numericCode >= 100 && numericCode < 600) 
    ? numericCode 
    : 500;

  const err = new CustomError(message, validCode, details);

  // Log del error
  logger.error(message, { 
    code: err.code,
    details: err.details,
    stack: err.stack
  });

  return err;
}

module.exports = {
  error,
  CustomError
};