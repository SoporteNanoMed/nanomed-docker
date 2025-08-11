const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos de desarrollo
const devConfig = {
  server: process.env.DEV_DB_SERVER,
  user: process.env.DEV_DB_USER,
  password: process.env.DEV_DB_PASSWORD,
  database: process.env.DEV_DB_NAME || 'bddnanomed_DEV',
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
};

// Configuración de la base de datos local
const localConfig = {
  server: 'localhost',
  user: 'sa',
  password: 'YourStrong@Passw0rd',
  database: 'nanomed',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function syncUsers() {
  try {
    console.log('🔄 Iniciando sincronización de usuarios...');
    
    // Conectar a la base de datos de desarrollo
    console.log('📡 Conectando a la base de datos de desarrollo...');
    const devPool = await sql.connect(devConfig);
    
    // Obtener usuarios de desarrollo
    console.log('📥 Exportando usuarios de desarrollo...');
    const devUsers = await devPool.request().query(`
      SELECT 
        nombre, apellido, email, password_hash, telefono, rut,
        fecha_nacimiento, genero, direccion, ciudad, region,
        foto_perfil, creado_en, actualizado_en, email_verified,
        verification_token, reset_token, reset_token_expires,
        role, login_attempts, last_failed_login, mfa_enabled,
        mfa_secret, mfa_token, mfa_token_expires, mfa_code_hash,
        verification_token_expires, especialidad
      FROM Usuarios
      ORDER BY id
    `);
    
    console.log(`✅ Se encontraron ${devUsers.recordset.length} usuarios en desarrollo`);
    
    // Cerrar conexión de desarrollo
    await devPool.close();
    
    // Conectar a la base de datos local
    console.log('🏠 Conectando a la base de datos local...');
    const localPool = await sql.connect(localConfig);
    
    // Limpiar tabla local
    console.log('🧹 Limpiando tabla local...');
    await localPool.request().query('DELETE FROM Usuarios');
    await localPool.request().query('DBCC CHECKIDENT (\'Usuarios\', RESEED, 0)');
    
    // Insertar usuarios en local
    console.log('📤 Insertando usuarios en local...');
    let insertedCount = 0;
    
    for (const user of devUsers.recordset) {
      const insertQuery = `
        INSERT INTO Usuarios (
          nombre, apellido, email, password_hash, telefono, rut,
          fecha_nacimiento, genero, direccion, ciudad, region,
          foto_perfil, creado_en, actualizado_en, email_verified,
          verification_token, reset_token, reset_token_expires,
          role, login_attempts, last_failed_login, mfa_enabled,
          mfa_secret, mfa_token, mfa_token_expires, mfa_code_hash,
          verification_token_expires, especialidad
        ) VALUES (
          @nombre, @apellido, @email, @password_hash, @telefono, @rut,
          @fecha_nacimiento, @genero, @direccion, @ciudad, @region,
          @foto_perfil, @creado_en, @actualizado_en, @email_verified,
          @verification_token, @reset_token, @reset_token_expires,
          @role, @login_attempts, @last_failed_login, @mfa_enabled,
          @mfa_secret, @mfa_token, @mfa_token_expires, @mfa_code_hash,
          @verification_token_expires, @especialidad
        )
      `;
      
      const request = localPool.request();
      
      // Agregar parámetros
      request.input('nombre', sql.VarChar, user.nombre || '');
      request.input('apellido', sql.VarChar, user.apellido || '');
      request.input('email', sql.VarChar, user.email || '');
      request.input('password_hash', sql.NVarChar, user.password_hash || '');
      request.input('telefono', sql.VarChar, user.telefono || '');
      request.input('rut', sql.VarChar, user.rut || '');
      request.input('fecha_nacimiento', sql.Date, user.fecha_nacimiento);
      request.input('genero', sql.VarChar, user.genero || '');
      request.input('direccion', sql.VarChar, user.direccion || '');
      request.input('ciudad', sql.VarChar, user.ciudad || '');
      request.input('region', sql.VarChar, user.region || '');
      request.input('foto_perfil', sql.VarChar, user.foto_perfil);
      request.input('creado_en', sql.DateTime, user.creado_en || new Date());
      request.input('actualizado_en', sql.DateTime, user.actualizado_en || new Date());
      request.input('email_verified', sql.Bit, user.email_verified || false);
      request.input('verification_token', sql.NVarChar, user.verification_token);
      request.input('reset_token', sql.NVarChar, user.reset_token);
      request.input('reset_token_expires', sql.DateTime, user.reset_token_expires);
      request.input('role', sql.NVarChar, user.role || 'user');
      request.input('login_attempts', sql.Int, user.login_attempts || 0);
      request.input('last_failed_login', sql.DateTime, user.last_failed_login);
      request.input('mfa_enabled', sql.Bit, user.mfa_enabled || false);
      request.input('mfa_secret', sql.NVarChar, user.mfa_secret);
      request.input('mfa_token', sql.NVarChar, user.mfa_token);
      request.input('mfa_token_expires', sql.DateTime, user.mfa_token_expires);
      request.input('mfa_code_hash', sql.NVarChar, user.mfa_code_hash);
      request.input('verification_token_expires', sql.DateTime, user.verification_token_expires);
      request.input('especialidad', sql.VarChar, user.especialidad);
      
      await request.query(insertQuery);
      insertedCount++;
      
      if (insertedCount % 10 === 0) {
        console.log(`📊 Progreso: ${insertedCount}/${devUsers.recordset.length} usuarios insertados`);
      }
    }
    
    // Cerrar conexión local
    await localPool.close();
    
    console.log(`✅ Sincronización completada: ${insertedCount} usuarios sincronizados`);
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    process.exit(1);
  }
}

// Ejecutar sincronización
if (require.main === module) {
  syncUsers()
    .then(() => {
      console.log('🎉 Sincronización exitosa');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error:', error);
      process.exit(1);
    });
}

module.exports = { syncUsers };
