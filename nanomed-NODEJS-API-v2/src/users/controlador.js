const db = require("../db/sqlserver");
const respuesta = require("../red/respuestas");
const { error } = require("../red/errors");
const bcrypt = require("bcrypt");
const azureBlobService = require("../utils/azureBlobService");
const path = require("path");
const fs = require("fs");

const TABLA = "Usuarios";

// Obtener perfil del usuario actual
async function obtenerPerfilUsuario(req, res, next) {
  try {
    console.log("ID de usuario actual:", req.user.id);
    
    const [usuario] = await db.unoUsuario(TABLA, { id: req.user.id });
    
    if (!usuario) {
      return respuesta.error(req, res, "Usuario no encontrado", 404);
    }

    // Eliminar datos sensibles antes de retornar
    delete usuario.password_hash;
    delete usuario.verification_token;
    delete usuario.reset_token;
    delete usuario.reset_token_expires;
    delete usuario.login_attempts;
    delete usuario.last_failed_login;
    delete usuario.mfa_secret;
    delete usuario.mfa_token;
    delete usuario.mfa_token_expires;
    delete usuario.mfa_code_hash;

    // Generar URL temporal para foto de perfil si existe
    if (usuario.foto_perfil) {
      try {
        const downloadUrl = await azureBlobService.getDownloadUrl(
          usuario.foto_perfil,
          azureBlobService.containers.profilePictures,
          60 // 60 minutos
        );
        usuario.foto_perfil_url = downloadUrl;
      } catch (error) {
        console.error('Error generating download URL:', error);
        // Si no se puede generar URL, mantener la ruta original
      }
    }

    respuesta.success(req, res, usuario, 200);
  } catch (err) {
    next(err);
  }
}

// Actualizar perfil del usuario actual
async function actualizarPerfilUsuario(req, res, next) {
  try {
    // No permitir actualizar ciertos campos sensibles
    const datosPermitidos = ["nombre", "apellido", "telefono", "fecha_nacimiento", "genero", "direccion", "ciudad", "region"];
    
    const datosActualizacion = {};
    datosPermitidos.forEach(campo => {
      if (req.body[campo] !== undefined) {
        datosActualizacion[campo] = req.body[campo];
      }
    });

    // Añadir ID del usuario actual
    datosActualizacion.id = req.user.id;

    await db.actualizarUsuario(TABLA, datosActualizacion);
    respuesta.success(req, res, "Perfil actualizado correctamente", 200);
  } catch (err) {
    next(err);
  }
}

// Cambiar contraseña del usuario actual
async function cambiarPasswordUsuario(req, res, next) {
  try {
    const { passwordActual, nuevoPassword } = req.body;

    if (!passwordActual || !nuevoPassword) {
      return respuesta.error(
        req, 
        res, 
        "Se requieren tanto la contraseña actual como la nueva contraseña", 
        400
      );
    }

    const [usuario] = await db.unoUsuario(TABLA, { id: req.user.id });
    
    if (!usuario) {
      return respuesta.error(req, res, "Usuario no encontrado", 404);
    }

    // Verificar contraseña actual
    const passwordCorrecta = await bcrypt.compare(passwordActual, usuario.password_hash);
    
    if (!passwordCorrecta) {
      return respuesta.error(req, res, "Contraseña actual incorrecta", 400);
    }

    // Hash de la nueva contraseña
    const nuevoHash = await bcrypt.hash(nuevoPassword, 10);
    
    // Actualizar contraseña
    await db.actualizarUsuario(TABLA, {
      id: req.user.id,
      password_hash: nuevoHash
    });

    respuesta.success(req, res, "Contraseña actualizada correctamente", 200);
  } catch (err) {
    next(err);
  }
}

// Subir/actualizar foto de perfil usando Azure Blob Storage
async function subirFotoPerfil(req, res, next) {
  try {
    console.log(' Iniciando subida de foto de perfil...');
    
    if (!req.azureBlob) {
      console.error(' No se recibió información del blob de Azure');
      return respuesta.error(req, res, "Error en la subida del archivo", 500);
    }

    console.log(`Blob recibido: ${req.azureBlob.blobName}`);
    console.log(` Contenedor: ${req.azureBlob.containerName}`);

    // Eliminar foto anterior si existe
    const [usuario] = await db.unoUsuario(TABLA, { id: req.user.id });
    if (usuario && usuario.foto_perfil) {
      try {
        console.log(`  Eliminando foto anterior: ${usuario.foto_perfil}`);
        // Eliminar archivo anterior de Azure Blob
        await azureBlobService.deleteFile(
          usuario.foto_perfil,
          azureBlobService.containers.profilePictures
        );
        console.log(' Foto anterior eliminada exitosamente');
      } catch (err) {
        console.error("  Error al eliminar archivo de foto anterior de Azure:", err.message);
        // No fallar si no se puede eliminar la foto anterior
      }
    }

    // Actualizar ruta de la foto en la base de datos
    console.log(`Actualizando base de datos con nueva ruta: ${req.azureBlob.blobName}`);
    await db.actualizarUsuario(TABLA, {
      id: req.user.id,
      foto_perfil: req.azureBlob.blobName
    });
    console.log('Base de datos actualizada exitosamente');

    // Generar URL temporal para la respuesta
    console.log(' Generando URL temporal de descarga...');
    const downloadUrl = await azureBlobService.getDownloadUrl(
      req.azureBlob.blobName,
      req.azureBlob.containerName,
      60 // 60 minutos
    );
    console.log('URL temporal generada exitosamente');

    const responseData = {
      message: "Foto de perfil actualizada correctamente",
      fotoUrl: req.azureBlob.blobName,
      downloadUrl: downloadUrl,
      etag: req.azureBlob.etag,
      lastModified: req.azureBlob.lastModified
    };

    console.log(' Subida de foto completada exitosamente');
    respuesta.success(req, res, responseData, 200);
  } catch (err) {
    console.error(' Error en subirFotoPerfil:', err);
    
    // Error más específico según el tipo
    let errorMessage = "Error al actualizar foto de perfil";
    let statusCode = 500;

    if (err.message.includes('database') || err.message.includes('DB')) {
      errorMessage = "Error al actualizar la base de datos";
      statusCode = 500;
    } else if (err.message.includes('Azure') || err.message.includes('Blob')) {
      errorMessage = "Error de conexión con Azure Blob Storage";
      statusCode = 503;
    } else if (err.message.includes('permission') || err.message.includes('access')) {
      errorMessage = "Error de permisos";
      statusCode = 403;
    }

    return respuesta.error(req, res, errorMessage, statusCode);
  }
}

// Eliminar foto de perfil de Azure Blob Storage
async function eliminarFotoPerfil(req, res, next) {
  try {
    const [usuario] = await db.unoUsuario(TABLA, { id: req.user.id });
    
    if (!usuario) {
      return respuesta.error(req, res, "Usuario no encontrado", 404);
    }

    if (usuario.foto_perfil) {
      try {
        // Eliminar archivo de Azure Blob Storage
        await azureBlobService.deleteFile(
          usuario.foto_perfil,
          azureBlobService.containers.profilePictures
        );
      } catch (err) {
        console.error("Error al eliminar archivo de foto de perfil de Azure:", err);
      }
    }

    // Actualizar base de datos
    await db.actualizarUsuario(TABLA, {
      id: req.user.id,
      foto_perfil: null
    });

    respuesta.success(req, res, "Foto de perfil eliminada correctamente", 200);
  } catch (err) {
    next(err);
  }
}

// Migrar fotos de perfil existentes a Azure Blob Storage
async function migrarFotosPerfil(req, res, next) {
  try {
    // Obtener todos los usuarios con fotos de perfil locales
    const usuarios = await db.todosUsuarios(TABLA, { foto_perfil: { $ne: null } });
    
    let migrados = 0;
    let errores = 0;

    for (const usuario of usuarios) {
      if (usuario.foto_perfil && usuario.foto_perfil.startsWith('uploads/profile-pictures/')) {
        try {
          const localPath = path.join(__dirname, "../../", usuario.foto_perfil);
          
          if (fs.existsSync(localPath)) {
            // Migrar a Azure Blob
            const result = await azureBlobService.migrateFromLocal(
              localPath,
              usuario.id,
              azureBlobService.containers.profilePictures
            );

            // Actualizar base de datos con la nueva ruta
            await db.actualizarUsuario(TABLA, {
              id: usuario.id,
              foto_perfil: result.blobName
            });

            migrados++;
            console.log(`Migrado usuario ${usuario.id}: ${usuario.foto_perfil} -> ${result.blobName}`);
          }
        } catch (error) {
          console.error(`Error migrando foto de usuario ${usuario.id}:`, error);
          errores++;
        }
      }
    }

    respuesta.success(
      req,
      res,
      {
        message: "Migración completada",
        migrados: migrados,
        errores: errores,
        total: usuarios.length
      },
      200
    );
  } catch (err) {
    next(err);
  }
}

// Diagnóstico de configuración de Azure Blob Storage
async function diagnosticarAzure(req, res, next) {
  try {
    console.log(' Iniciando diagnóstico de Azure Blob Storage...');
    
    const diagnostic = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      azureConfig: {
        connectionString: !!process.env.AZURE_STORAGE_CONNECTION_STRING,
        accountName: !!process.env.AZURE_STORAGE_ACCOUNT_NAME,
        accountKey: !!process.env.AZURE_STORAGE_ACCOUNT_KEY,
        containers: {
          profilePictures: process.env.AZURE_STORAGE_CONTAINER_PROFILE_PICTURES || 'profile-pictures',
          exams: process.env.AZURE_STORAGE_CONTAINER_EXAMS || 'exams',
          documents: process.env.AZURE_STORAGE_CONTAINER_DOCUMENTS || 'documents',
          temp: process.env.AZURE_STORAGE_CONTAINER_TEMP || 'temp'
        }
      },
      tests: {}
    };

    // Test 1: Verificar configuración básica
    if (!process.env.AZURE_STORAGE_CONNECTION_STRING) {
      diagnostic.tests.configuration = {
        success: false,
        error: "AZURE_STORAGE_CONNECTION_STRING no está configurada"
      };
    } else {
      diagnostic.tests.configuration = {
        success: true,
        message: "Configuración básica correcta"
      };
    }

    // Test 2: Verificar conexión a Azure
    try {
      const containerClient = azureBlobService.getContainerClient(azureBlobService.containers.profilePictures);
      const exists = await containerClient.exists();
      
      diagnostic.tests.connection = {
        success: true,
        containerExists: exists,
        message: exists ? "Contenedor existe" : "Contenedor no existe (se creará automáticamente)"
      };
    } catch (error) {
      diagnostic.tests.connection = {
        success: false,
        error: error.message
      };
    }

    // Test 3: Probar subida de archivo de prueba
    try {
      const testContent = 'Diagnóstico de Azure Blob Storage';
      const testBuffer = Buffer.from(testContent, 'utf8');
      const testBlobName = `diagnostic-${Date.now()}.txt`;
      
      const uploadResult = await azureBlobService.uploadFile(
        testBuffer,
        testBlobName,
        azureBlobService.containers.profilePictures,
        'text/plain'
      );

      // Eliminar archivo de prueba
      await azureBlobService.deleteFile(
        testBlobName,
        azureBlobService.containers.profilePictures
      );

      diagnostic.tests.upload = {
        success: true,
        message: "Subida y eliminación de archivo de prueba exitosa",
        blobName: testBlobName
      };
    } catch (error) {
      diagnostic.tests.upload = {
        success: false,
        error: error.message
      };
    }

    // Test 4: Verificar generación de URLs
    try {
      const testUrl = await azureBlobService.getDownloadUrl(
        'test-blob.txt',
        azureBlobService.containers.profilePictures,
        1 // 1 minuto
      );
      
      diagnostic.tests.urlGeneration = {
        success: true,
        message: "Generación de URLs temporal exitosa",
        sampleUrl: testUrl.substring(0, 50) + '...'
      };
    } catch (error) {
      diagnostic.tests.urlGeneration = {
        success: false,
        error: error.message
      };
    }

    // Resumen
    const allTestsPassed = Object.values(diagnostic.tests).every(test => test.success);
    diagnostic.summary = {
      allTestsPassed,
      totalTests: Object.keys(diagnostic.tests).length,
      passedTests: Object.values(diagnostic.tests).filter(test => test.success).length
    };

    console.log(' Diagnóstico completado:', diagnostic.summary);

    if (allTestsPassed) {
      respuesta.success(req, res, diagnostic, 200);
    } else {
      respuesta.error(req, res, "Diagnóstico falló", 500, diagnostic);
    }

  } catch (err) {
    console.error(' Error en diagnóstico:', err);
    respuesta.error(req, res, "Error durante el diagnóstico", 500);
  }
}

// Endpoint de prueba para subida de archivos
async function probarSubidaArchivo(req, res, next) {
  try {
    console.log(' Probando subida de archivo...');
    
    const testData = {
      message: "Endpoint de prueba funcionando",
      timestamp: new Date().toISOString(),
      requestInfo: {
        hasFile: !!req.file,
        hasAzureBlob: !!req.azureBlob,
        contentType: req.headers['content-type'],
        contentLength: req.headers['content-length'],
        userAgent: req.headers['user-agent']
      }
    };

    if (req.file) {
      testData.fileInfo = {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
      };
    }

    if (req.azureBlob) {
      testData.azureInfo = {
        blobName: req.azureBlob.blobName,
        containerName: req.azureBlob.containerName,
        url: req.azureBlob.url
      };
    }

    respuesta.success(req, res, testData, 200);
  } catch (err) {
    console.error('❌ Error en prueba de subida:', err);
    respuesta.error(req, res, "Error en prueba de subida", 500);
  }
}

module.exports = {
  obtenerPerfilUsuario,
  actualizarPerfilUsuario,
  cambiarPasswordUsuario,
  subirFotoPerfil,
  eliminarFotoPerfil,
  migrarFotosPerfil,
  diagnosticarAzure,
  probarSubidaArchivo
}; 