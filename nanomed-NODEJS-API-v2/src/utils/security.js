const bcrypt = require("bcrypt");
const config = require("../../config");

/**
 * Hashea una contraseña usando bcrypt con salt rounds configurables
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} - Hash de la contraseña
 */
async function hashPassword(password) {
  try {
    if (!password || typeof password !== 'string') {
      throw new Error('La contraseña debe ser una cadena de texto válida');
    }

    if (password.length < config.security.passwordMinLength) {
      throw new Error(`La contraseña debe tener al menos ${config.security.passwordMinLength} caracteres`);
    }

    if (password.length > config.security.passwordMaxLength) {
      throw new Error(`La contraseña no puede tener más de ${config.security.passwordMaxLength} caracteres`);
    }

    const saltRounds = config.security.bcryptSaltRounds;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    return hashedPassword;
  } catch (error) {
    console.error('Error al hashear contraseña:', error);
    throw error;
  }
}

/**
 * Verifica una contraseña contra su hash
 * @param {string} password - Contraseña en texto plano
 * @param {string} hash - Hash almacenado
 * @returns {Promise<boolean>} - True si la contraseña coincide
 */
async function verifyPassword(password, hash) {
  try {
    if (!password || !hash) {
      return false;
    }

    if (typeof password !== 'string' || typeof hash !== 'string') {
      return false;
    }

    const isMatch = await bcrypt.compare(password, hash);
    return isMatch;
  } catch (error) {
    console.error('Error al verificar contraseña:', error);
    return false;
  }
}

/**
 * Valida la fortaleza de una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {Object} - Resultado de la validación
 */
function validatePasswordStrength(password) {
  const result = {
    isValid: true,
    errors: [],
    score: 0,
    suggestions: []
  };

  if (!password || typeof password !== 'string') {
    result.isValid = false;
    result.errors.push('La contraseña es requerida');
    return result;
  }

  // Longitud mínima
  if (password.length < config.security.passwordMinLength) {
    result.isValid = false;
    result.errors.push(`La contraseña debe tener al menos ${config.security.passwordMinLength} caracteres`);
  } else {
    result.score += 1;
  }

  // Longitud máxima
  if (password.length > config.security.passwordMaxLength) {
    result.isValid = false;
    result.errors.push(`La contraseña no puede tener más de ${config.security.passwordMaxLength} caracteres`);
  }

  // Mayúsculas
  if (!/[A-Z]/.test(password)) {
    result.isValid = false;
    result.errors.push('La contraseña debe contener al menos una letra mayúscula');
  } else {
    result.score += 1;
  }

  // Minúsculas
  if (!/[a-z]/.test(password)) {
    result.isValid = false;
    result.errors.push('La contraseña debe contener al menos una letra minúscula');
  } else {
    result.score += 1;
  }

  // Números
  if (!/\d/.test(password)) {
    result.isValid = false;
    result.errors.push('La contraseña debe contener al menos un número');
  } else {
    result.score += 1;
  }

  // Caracteres especiales
  if (!/[@$!%*?&]/.test(password)) {
    result.isValid = false;
    result.errors.push('La contraseña debe contener al menos un carácter especial (@$!%*?&)');
  } else {
    result.score += 1;
  }

  // Verificaciones adicionales de seguridad
  
  // Patrones comunes débiles
  const weakPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i,
    /welcome/i,
    /monkey/i,
    /dragon/i
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      result.score -= 1;
      result.suggestions.push('Evita usar patrones comunes o palabras predecibles');
      break;
    }
  }

  // Caracteres repetidos
  if (/(.)\1{2,}/.test(password)) {
    result.score -= 1;
    result.suggestions.push('Evita repetir el mismo carácter más de 2 veces seguidas');
  }

  // Secuencias
  if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password) ||
      /(?:012|123|234|345|456|567|678|789)/.test(password)) {
    result.score -= 1;
    result.suggestions.push('Evita usar secuencias de letras o números');
  }

  // Bonus por longitud extra
  if (password.length >= 12) {
    result.score += 1;
  }
  if (password.length >= 16) {
    result.score += 1;
  }

  // Bonus por variedad de caracteres especiales
  const specialChars = password.match(/[@$!%*?&]/g);
  if (specialChars && specialChars.length >= 2) {
    result.score += 1;
  }

  // Determinar nivel de fortaleza
  if (result.score >= 6) {
    result.strength = 'Muy fuerte';
  } else if (result.score >= 4) {
    result.strength = 'Fuerte';
  } else if (result.score >= 2) {
    result.strength = 'Moderada';
  } else {
    result.strength = 'Débil';
  }

  return result;
}

/**
 * Genera una contraseña segura aleatoria
 * @param {number} length - Longitud de la contraseña (por defecto 16)
 * @returns {string} - Contraseña generada
 */
function generateSecurePassword(length = 16) {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '@$!%*?&';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  
  let password = '';
  
  // Asegurar al menos un carácter de cada tipo
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Completar con caracteres aleatorios
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Mezclar la contraseña
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

/**
 * Limpia datos sensibles de un objeto usuario
 * @param {Object} user - Objeto usuario
 * @returns {Object} - Usuario sin datos sensibles
 */
function sanitizeUserData(user) {
  if (!user || typeof user !== 'object') {
    return user;
  }

  const sensitiveFields = [
    'password_hash',
    'verification_token',
    'reset_token',
    'reset_token_expires',
    'mfa_secret',
    'mfa_token',
    'mfa_token_expires',
    'mfa_code_hash'
  ];

  const sanitized = { ...user };
  
  sensitiveFields.forEach(field => {
    delete sanitized[field];
  });

  return sanitized;
}

/**
 * Verifica si un hash de contraseña necesita ser actualizado
 * @param {string} hash - Hash actual
 * @returns {boolean} - True si necesita actualización
 */
function needsRehash(hash) {
  try {
    // bcrypt incluye información sobre el costo en el hash
    // Si el costo actual es menor al configurado, necesita rehash
    const currentRounds = parseInt(hash.split('$')[2]);
    return currentRounds < config.security.bcryptSaltRounds;
  } catch (error) {
    // Si no se puede parsear el hash, probablemente necesita actualización
    return true;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generateSecurePassword,
  sanitizeUserData,
  needsRehash
}; 