const db = require("../db/sqlserver");
const bcrypt = require("bcrypt");

/**
 * Función para generar un RUT temporal único
 */
function generarRutTemporal(index) {
  // Generar un RUT temporal con formato válido chileno
  // Usamos un número base + index para garantizar unicidad
  const baseNumber = 99000000 + index;
  const rutSinDv = baseNumber.toString();
  
  // Calcular dígito verificador
  let suma = 0;
  let multiplicador = 2;
  
  for (let i = rutSinDv.length - 1; i >= 0; i--) {
    suma += parseInt(rutSinDv[i]) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  
  const resto = suma % 11;
  const dv = resto === 0 ? '0' : resto === 1 ? 'K' : (11 - resto).toString();
  
  return `${rutSinDv}-${dv}`;
}

/**
 * Script de migración para convertir médicos de la tabla Medicos a usuarios con rol 'medico'
 * Este script debe ejecutarse una sola vez para migrar los datos existentes
 */

async function migrarMedicosLegacyAUsuarios() {
  try {
    
    // Obtener todos los médicos de la tabla legacy
    const medicosLegacy = await db.query(`
      SELECT * FROM Medicos WHERE activo = 1
    `);
    
    
    let migrados = 0;
    let errores = 0;
    const erroresDetalle = [];
    
    for (let i = 0; i < medicosLegacy.length; i++) {
      const medico = medicosLegacy[i];
      try {
        // Verificar si ya existe un usuario con este email
        const [usuarioExistente] = await db.unoUsuario("Usuarios", { email: medico.email });
        
        if (usuarioExistente) {
          // Si ya existe, verificar si es médico
          if (usuarioExistente.role === 'medico') {
            continue;
          } else {
            // Actualizar rol a médico
            await db.actualizarUsuario("Usuarios", {
              id: usuarioExistente.id,
              role: 'medico'
            });
            migrados++;
            continue;
          }
        }
        
        // Generar contraseña temporal
        const passwordTemporal = `Temp${Math.random().toString(36).slice(-8)}!`;
        const hashedPassword = await bcrypt.hash(passwordTemporal, 10);
        
        // Generar RUT temporal único
        const rutTemporal = generarRutTemporal(i + 1);
        
        // Crear nuevo usuario médico
        const nuevoUsuario = {
          nombre: medico.nombre,
          apellido: medico.apellido,
          email: medico.email,
          password_hash: hashedPassword,
          telefono: null, // No disponible en tabla legacy
          rut: rutTemporal, // RUT temporal generado
          fecha_nacimiento: null, // No disponible en tabla legacy
          genero: null, // No disponible en tabla legacy
          direccion: null, // No disponible en tabla legacy
          ciudad: null, // No disponible en tabla legacy
          region: null, // No disponible en tabla legacy
          foto_perfil: medico.foto_perfil,
          role: 'medico',
          email_verified: true, // Asumir que están verificados
          login_attempts: 0,
          mfa_enabled: false
        };
        
        // Insertar en la tabla Usuarios
        await db.insertarUsuario("Usuarios", nuevoUsuario);
        
        migrados++;
        
      } catch (error) {
        errores++;
        const errorDetalle = {
          medico: `${medico.nombre} ${medico.apellido} (${medico.email})`,
          error: error.message
        };
        erroresDetalle.push(errorDetalle);
      }
    }
    
    
    if (erroresDetalle.length > 0) {
      console.log("\n DETALLE DE ERRORES:");
      erroresDetalle.forEach((error, index) => {
        console.log(`${index + 1}. ${error.medico}: ${error.error}`);
      });
    }
    
    if (migrados > 0) {
      console.log("\n  IMPORTANTE:");
      console.log("- Los médicos migrados tienen contraseñas temporales mostradas arriba");
      console.log("- Los médicos migrados tienen RUTs temporales que deben actualizar");
      console.log("- Deben cambiar sus contraseñas y RUTs en el primer login");
      console.log("- La tabla Medicos legacy se mantiene intacta para referencia");
      console.log("- Las citas existentes seguirán funcionando con ambas tablas");
    }
    
    return {
      migrados,
      errores,
      erroresDetalle
    };
    
  } catch (error) {
    console.error(" Error crítico durante la migración:", error);
    throw error;
  }
}

/**
 * Función para verificar el estado de la migración
 */
async function verificarEstadoMigracion() {
  try {
    
    // Contar médicos legacy
    const [medicosLegacy] = await db.query(`
      SELECT COUNT(*) as total FROM Medicos WHERE activo = 1
    `);
    
    // Contar usuarios médicos
    const [usuariosMedicos] = await db.query(`
      SELECT COUNT(*) as total FROM Usuarios WHERE role = 'medico'
    `);
    
    // Verificar médicos con emails duplicados
    const emailsDuplicados = await db.query(`
      SELECT m.email, COUNT(*) as total
      FROM Medicos m
      INNER JOIN Usuarios u ON m.email = u.email
      WHERE m.activo = 1
      GROUP BY m.email
      HAVING COUNT(*) > 1
    `);
    
    
    if (emailsDuplicados.length > 0) {
      console.log("\n EMAILS DUPLICADOS ENCONTRADOS:");
      emailsDuplicados.forEach(dup => {
        console.log(`- ${dup.email} (${dup.total} registros)`);
      });
    }
    
    return {
      medicosLegacy: medicosLegacy.total,
      usuariosMedicos: usuariosMedicos.total,
      emailsDuplicados: emailsDuplicados.length
    };
    
  } catch (error) {
    console.error("Error verificando estado de migración:", error);
    throw error;
  }
}

/**
 * Función para revertir la migración (solo usuarios creados por migración)
 */
async function revertirMigracion() {
  try {
    console.log("  INICIANDO REVERSIÓN DE MIGRACIÓN...");
    console.log("Esta operación eliminará usuarios médicos que coincidan con médicos legacy");
    
    // Obtener usuarios médicos que coinciden con médicos legacy
    const usuariosAEliminar = await db.query(`
      SELECT u.id, u.nombre, u.apellido, u.email
      FROM Usuarios u
      INNER JOIN Medicos m ON u.email = m.email
      WHERE u.role = 'medico' AND m.activo = 1
    `);
    
    console.log(` Se eliminarán ${usuariosAEliminar.length} usuarios médicos`);
    
    let eliminados = 0;
    
    for (const usuario of usuariosAEliminar) {
      try {
        // Verificar que no tenga citas como médico en tabla Usuarios
        const [citasComoMedico] = await db.query(`
          SELECT COUNT(*) as total
          FROM CitasMedicas c
          INNER JOIN Usuarios u ON c.medico_id = u.id
          WHERE u.id = @id AND u.role = 'medico'
        `, { id: usuario.id });
        
        if (citasComoMedico.total > 0) {
          console.log(` No se puede eliminar ${usuario.email}: tiene ${citasComoMedico.total} citas asignadas`);
          continue;
        }
        
        await db.eliminarUsuario("Usuarios", usuario.id);
        console.log(`Usuario eliminado: ${usuario.nombre} ${usuario.apellido} (${usuario.email})`);
        eliminados++;
        
      } catch (error) {
        console.error(` Error eliminando usuario ${usuario.email}:`, error.message);
      }
    }
    
    console.log(`\n RESUMEN DE REVERSIÓN:`);
    console.log(`Usuarios eliminados: ${eliminados}`);
    
    return { eliminados };
    
  } catch (error) {
    console.error("Error durante la reversión:", error);
    throw error;
  }
}

/**
 * Función para migrar especialidades de médicos legacy a usuarios
 */
async function migrarEspecialidadesLegacy() {
  try {
    
    // Obtener médicos legacy con especialidades
    const medicosLegacy = await db.query(`
      SELECT id, nombre, apellido, email, especialidad
      FROM Medicos 
      WHERE activo = 1 AND especialidad IS NOT NULL AND especialidad != ''
    `);
    
    
    let actualizados = 0;
    let errores = 0;
    const erroresDetalle = [];
    
    for (const medico of medicosLegacy) {
      try {
        // Buscar usuario correspondiente por email
        const [usuario] = await db.query(`
          SELECT id, nombre, apellido, email, especialidad
          FROM Usuarios 
          WHERE email = @email AND role = 'medico'
        `, { email: medico.email });
        
        if (usuario) {
          // Actualizar especialidad si no tiene o es diferente
          if (!usuario.especialidad || usuario.especialidad !== medico.especialidad) {
            await db.query(`
              UPDATE Usuarios 
              SET especialidad = @especialidad, actualizado_en = GETDATE()
              WHERE id = @id
            `, { 
              especialidad: medico.especialidad,
              id: usuario.id 
            });
            
            actualizados++;
          }
        } else {
          console.log(`Usuario no encontrado para médico legacy: ${medico.email}`);
        }
        
      } catch (error) {
        errores++;
        const errorDetalle = {
          medico: `${medico.nombre} ${medico.apellido} (${medico.email})`,
          error: error.message
        };
        erroresDetalle.push(errorDetalle);
      }
    }
    
    
    if (erroresDetalle.length > 0) {
      console.log("\n DETALLE DE ERRORES:");
      erroresDetalle.forEach((error, index) => {
        console.log(`${index + 1}. ${error.medico}: ${error.error}`);
      });
    }
    
    return {
      actualizados,
      errores,
      erroresDetalle
    };
    
  } catch (error) {
    console.error("💥 Error crítico durante la migración de especialidades:", error);
    throw error;
  }
}

module.exports = {
  migrarMedicosLegacyAUsuarios,
  verificarEstadoMigracion,
  revertirMigracion,
  migrarEspecialidadesLegacy
}; 